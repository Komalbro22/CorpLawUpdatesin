/**
 * Optimizes an image client-side:
 * 1. Converts to WebP format.
 * 2. Downscales if exceeds max width (e.g., 1200px) to keep files lightweight.
 * 3. Compresses with target quality.
 * Returns: { file: File, originalSize: number, optimizedSize: number, savingsPercent: number }
 */
export async function optimizeImageClientSide(
  file: File,
  maxWidth = 1200,
  quality = 0.8
): Promise<{
  file: File
  originalSize: number
  optimizedSize: number
  savingsPercent: number
}> {
  // If it's a GIF or SVGs, skip compression to preserve animation/vector behavior
  if (file.type === 'image/gif' || file.type.includes('svg')) {
    return {
      file,
      originalSize: file.size,
      optimizedSize: file.size,
      savingsPercent: 0,
    }
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = (event) => {
      const img = new Image()
      img.src = event.target?.result as string
      img.onload = () => {
        const canvas = document.createElement('canvas')
        let width = img.width
        let height = img.height

        // Downscale proportionally if exceeds max width
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width)
          width = maxWidth
        }

        canvas.width = width
        canvas.height = height

        const ctx = canvas.getContext('2d')
        if (!ctx) {
          reject(new Error('Failed to get 2d context'))
          return
        }

        ctx.drawImage(img, 0, 0, width, height)

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to compress to WebP'))
              return
            }

            // Create a new File from the blob
            const optimizedName = file.name.replace(/\.[^/.]+$/, "") + '.webp'
            const optimizedFile = new File([blob], optimizedName, {
              type: 'image/webp',
              lastModified: Date.now(),
            })

            const originalSize = file.size
            const optimizedSize = optimizedFile.size
            const savingsPercent = Math.round(
              ((originalSize - optimizedSize) / originalSize) * 100
            )

            resolve({
              file: optimizedFile,
              originalSize,
              optimizedSize,
              savingsPercent: savingsPercent > 0 ? savingsPercent : 0,
            })
          },
          'image/webp',
          quality
        )
      }
      img.onerror = (err) => reject(err)
    }
    reader.onerror = (err) => reject(err)
  })
}
