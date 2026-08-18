const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');

// Exact Classic Original Gavel (High-Precision Vector)
const classicGavelSvg = `
<svg width="512" height="512" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- Deep Navy Squircle Container -->
  <rect width="512" height="512" rx="112" fill="#002147"/>

  <!-- Solid Golden Gavel (Iconic Classic) -->
  <!-- Left Cap -->
  <path d="M168 116 C158 116, 150 126, 150 140 L150 208 C150 222, 158 232, 168 232 L198 232 L198 116 Z" fill="#F4B400"/>

  <!-- Left Ring -->
  <rect x="204" y="128" width="16" height="92" rx="2" fill="#F4B400"/>

  <!-- Main Block -->
  <rect x="224" y="128" width="64" height="92" rx="4" fill="#F4B400"/>

  <!-- Right Ring -->
  <rect x="292" y="140" width="16" height="68" rx="2" fill="#F4B400"/>

  <!-- Right Cap -->
  <rect x="312" y="128" width="36" height="92" rx="6" fill="#F4B400"/>

  <!-- Handle Collar -->
  <path d="M236 220 L276 220 L270 240 L242 240 Z" fill="#F4B400"/>

  <!-- Handle Tapered Shaft -->
  <path d="M248 240 L264 240 L274 416 L238 416 Z" fill="#F4B400"/>

  <!-- Handle Base Pommel -->
  <rect x="230" y="416" width="52" height="18" rx="6" fill="#F4B400"/>
</svg>
`;

async function generateFavicons() {
  console.log('Generating Classic Golden Gavel icons and favicons...');

  const svgBuffer = Buffer.from(classicGavelSvg);

  // 1. public/icon-512.png (512x512)
  await sharp(svgBuffer)
    .resize(512, 512)
    .png()
    .toFile(path.join(rootDir, 'public', 'icon-512.png'));
  console.log('✅ Created public/icon-512.png');

  // 2. public/icon-512-maskable.png (512x512 with safe area margin)
  await sharp(svgBuffer)
    .resize(420, 420)
    .extend({
      top: 46,
      bottom: 46,
      left: 46,
      right: 46,
      background: { r: 0, g: 33, b: 71, alpha: 1 }
    })
    .png()
    .toFile(path.join(rootDir, 'public', 'icon-512-maskable.png'));
  console.log('✅ Created public/icon-512-maskable.png');

  // 3. public/icon-192.png (192x192)
  await sharp(svgBuffer)
    .resize(192, 192)
    .png()
    .toFile(path.join(rootDir, 'public', 'icon-192.png'));
  console.log('✅ Created public/icon-192.png');

  // 4. public/icon-192-maskable.png (192x192 with safe area margin)
  await sharp(svgBuffer)
    .resize(158, 158)
    .extend({
      top: 17,
      bottom: 17,
      left: 17,
      right: 17,
      background: { r: 0, g: 33, b: 71, alpha: 1 }
    })
    .png()
    .toFile(path.join(rootDir, 'public', 'icon-192-maskable.png'));
  console.log('✅ Created public/icon-192-maskable.png');

  // 5. public/icon.png (192x192)
  await sharp(svgBuffer)
    .resize(192, 192)
    .png()
    .toFile(path.join(rootDir, 'public', 'icon.png'));
  console.log('✅ Created public/icon.png');

  // 6. app/icon.png (192x192)
  await sharp(svgBuffer)
    .resize(192, 192)
    .png()
    .toFile(path.join(rootDir, 'app', 'icon.png'));
  console.log('✅ Created app/icon.png');

  // 7. app/apple-icon.png (180x180)
  await sharp(svgBuffer)
    .resize(180, 180)
    .png()
    .toFile(path.join(rootDir, 'app', 'apple-icon.png'));
  console.log('✅ Created app/apple-icon.png');

  // 8. Multi-resolution 32-bit RGBA BMP DIB ICO (16, 32, 48)
  const icoBuffer = await createStandardIco(svgBuffer, [16, 32, 48]);
  fs.writeFileSync(path.join(rootDir, 'app', 'favicon.ico'), icoBuffer);
  fs.writeFileSync(path.join(rootDir, 'public', 'favicon.ico'), icoBuffer);
  console.log('✅ Created app/favicon.ico & public/favicon.ico (Multi-resolution 16/32/48 ICO)');
}

async function createStandardIco(svgBuffer, sizes = [16, 32, 48]) {
  const images = [];

  for (const size of sizes) {
    const raw = await sharp(svgBuffer)
      .resize(size, size)
      .ensureAlpha()
      .raw()
      .toBuffer();

    const dibHeaderSize = 40;
    const pixelArraySize = size * size * 4;
    const maskRowSize = Math.floor((size + 31) / 32) * 4;
    const maskSize = maskRowSize * size;
    const totalImageSize = dibHeaderSize + pixelArraySize + maskSize;

    const imgBuffer = Buffer.alloc(totalImageSize);

    // BITMAPINFOHEADER
    imgBuffer.writeUInt32LE(dibHeaderSize, 0);
    imgBuffer.writeInt32LE(size, 4);
    imgBuffer.writeInt32LE(size * 2, 8); // doubled for ICO XOR + AND masks
    imgBuffer.writeUInt16LE(1, 12);
    imgBuffer.writeUInt16LE(32, 14);     // 32-bit RGBA
    imgBuffer.writeUInt32LE(0, 16);      // BI_RGB
    imgBuffer.writeUInt32LE(pixelArraySize + maskSize, 20);
    imgBuffer.writeInt32LE(0, 24);
    imgBuffer.writeInt32LE(0, 28);
    imgBuffer.writeUInt32LE(0, 32);
    imgBuffer.writeUInt32LE(0, 36);

    // Write pixels bottom-up BGRA
    let destOffset = dibHeaderSize;
    for (let y = size - 1; y >= 0; y--) {
      for (let x = 0; x < size; x++) {
        const srcOffset = (y * size + x) * 4;
        const r = raw[srcOffset];
        const g = raw[srcOffset + 1];
        const b = raw[srcOffset + 2];
        const a = raw[srcOffset + 3];

        imgBuffer[destOffset] = b;
        imgBuffer[destOffset + 1] = g;
        imgBuffer[destOffset + 2] = r;
        imgBuffer[destOffset + 3] = a;
        destOffset += 4;
      }
    }

    images.push({
      width: size,
      height: size,
      data: imgBuffer,
    });
  }

  // ICO header: 6 bytes
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(images.length, 4);

  const dirEntries = [];
  let offset = 6 + images.length * 16;

  for (const img of images) {
    const entry = Buffer.alloc(16);
    entry.writeUInt8(img.width >= 256 ? 0 : img.width, 0);
    entry.writeUInt8(img.height >= 256 ? 0 : img.height, 1);
    entry.writeUInt8(0, 2);
    entry.writeUInt8(0, 3);
    entry.writeUInt16LE(1, 4);
    entry.writeUInt16LE(32, 6);
    entry.writeUInt32LE(img.data.length, 8);
    entry.writeUInt32LE(offset, 12);
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
