const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function generateFavicons() {
  const sourceImage = path.join(__dirname, '..', 'public', 'icon-512.png');
  
  if (!fs.existsSync(sourceImage)) {
    console.error('Source image not found at', sourceImage);
    process.exit(1);
  }

  console.log('Generating true icons from:', sourceImage);

  // 1. app/icon.png (192x192 PNG)
  await sharp(sourceImage)
    .resize(192, 192)
    .ensureAlpha()
    .png()
    .toFile(path.join(__dirname, '..', 'app', 'icon.png'));
  console.log('✅ Created app/icon.png (192x192 PNG)');

  // 2. app/apple-icon.png (180x180 PNG)
  await sharp(sourceImage)
    .resize(180, 180)
    .ensureAlpha()
    .png()
    .toFile(path.join(__dirname, '..', 'app', 'apple-icon.png'));
  console.log('✅ Created app/apple-icon.png (180x180 PNG)');

  // 3. public/icon.png (192x192 PNG)
  await sharp(sourceImage)
    .resize(192, 192)
    .ensureAlpha()
    .png()
    .toFile(path.join(__dirname, '..', 'public', 'icon.png'));
  console.log('✅ Created public/icon.png (192x192 PNG)');

  // 4. Generate standard 32-bit RGBA BMP DIB ICO (compatible with all Rust image-rs & browser decoders)
  const icoBuffer = await createStandardIco(sourceImage, [32, 48]);
  fs.writeFileSync(path.join(__dirname, '..', 'app', 'favicon.ico'), icoBuffer);
  fs.writeFileSync(path.join(__dirname, '..', 'public', 'favicon.ico'), icoBuffer);
  console.log('✅ Created app/favicon.ico & public/favicon.ico (Standard 32-bit RGBA ICO)');
}

async function createStandardIco(srcPath, sizes = [32, 48]) {
  const images = [];

  for (const size of sizes) {
    const raw = await sharp(srcPath)
      .resize(size, size)
      .ensureAlpha()
      .raw()
      .toBuffer(); // raw RGBA buffer

    // Convert raw RGBA to 32-bit BGRA bottom-up DIB BMP format (standard ICO format)
    const dibHeaderSize = 40;
    const pixelArraySize = size * size * 4;
    const maskRowSize = Math.floor((size + 31) / 32) * 4;
    const maskSize = maskRowSize * size;
    const totalImageSize = dibHeaderSize + pixelArraySize + maskSize;

    const imgBuffer = Buffer.alloc(totalImageSize);

    // BITMAPINFOHEADER
    imgBuffer.writeUInt32LE(dibHeaderSize, 0);       // biSize
    imgBuffer.writeInt32LE(size, 4);                 // biWidth
    imgBuffer.writeInt32LE(size * 2, 8);             // biHeight (doubled for ICO XOR + AND masks)
    imgBuffer.writeUInt16LE(1, 12);                  // biPlanes
    imgBuffer.writeUInt16LE(32, 14);                 // biBitCount (32-bit RGBA)
    imgBuffer.writeUInt32LE(0, 16);                  // biCompression (BI_RGB)
    imgBuffer.writeUInt32LE(pixelArraySize + maskSize, 20); // biSizeImage
    imgBuffer.writeInt32LE(0, 24);                   // biXPelsPerMeter
    imgBuffer.writeInt32LE(0, 28);                   // biYPelsPerMeter
    imgBuffer.writeUInt32LE(0, 32);                  // biClrUsed
    imgBuffer.writeUInt32LE(0, 36);                  // biClrImportant

    // Write pixels bottom-up BGRA
    let destOffset = dibHeaderSize;
    for (let y = size - 1; y >= 0; y--) {
      for (let x = 0; x < size; x++) {
        const srcOffset = (y * size + x) * 4;
        const r = raw[srcOffset];
        const g = raw[srcOffset + 1];
        const b = raw[srcOffset + 2];
        const a = raw[srcOffset + 3];

        imgBuffer[destOffset] = b;     // B
        imgBuffer[destOffset + 1] = g; // G
        imgBuffer[destOffset + 2] = r; // R
        imgBuffer[destOffset + 3] = a; // A
        destOffset += 4;
      }
    }

    // Mask is all zeros (transparent via 32-bit alpha channel)
    // imgBuffer is already zero-filled for the mask section

    images.push({
      width: size,
      height: size,
      data: imgBuffer,
    });
  }

  // ICO header: 6 bytes
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // Reserved
  header.writeUInt16LE(1, 2); // Type (1 = ICO)
  header.writeUInt16LE(images.length, 4); // Count

  const dirEntries = [];
  let offset = 6 + images.length * 16;

  for (const img of images) {
    const entry = Buffer.alloc(16);
    entry.writeUInt8(img.width >= 256 ? 0 : img.width, 0);   // Width
    entry.writeUInt8(img.height >= 256 ? 0 : img.height, 1); // Height
    entry.writeUInt8(0, 2);                                  // Colors (0 if >= 8bpp)
    entry.writeUInt8(0, 3);                                  // Reserved
    entry.writeUInt16LE(1, 4);                               // Color planes
    entry.writeUInt16LE(32, 6);                              // Bits per pixel
    entry.writeUInt32LE(img.data.length, 8);                 // Size in bytes
    entry.writeUInt32LE(offset, 12);                         // Offset
    dirEntries.push(entry);
    offset += img.data.length;
  }

  return Buffer.concat([
    header,
    ...dirEntries,
    ...images.map(img => img.data),
  ]);
}

generateFavicons().catch(err => {
  console.error('Error generating favicons:', err);
  process.exit(1);
});
