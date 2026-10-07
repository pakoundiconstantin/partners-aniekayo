import { useEffect, useState } from 'react'

const normalizedLogoCache = new Map<string, Promise<string>>()

function normalizeLogo(source: string): Promise<string> {
  const cached = normalizedLogoCache.get(source)
  if (cached) return cached

  const normalized = new Promise<string>((resolve) => {
    const image = new Image()
    image.crossOrigin = 'anonymous'
    image.onload = () => {
      const sourceCanvas = document.createElement('canvas')
      sourceCanvas.width = image.naturalWidth
      sourceCanvas.height = image.naturalHeight
      const sourceContext = sourceCanvas.getContext('2d', { willReadFrequently: true })
      if (!sourceContext) return resolve(source)
      sourceContext.drawImage(image, 0, 0)

      try {
        const { data, width, height } = sourceContext.getImageData(0, 0, sourceCanvas.width, sourceCanvas.height)
        let left = width
        let top = height
        let right = -1
        let bottom = -1

        for (let y = 0; y < height; y += 1) {
          for (let x = 0; x < width; x += 1) {
            const pixel = (y * width + x) * 4
            const isVisible = data[pixel + 3] > 24
              && 765 - data[pixel] - data[pixel + 1] - data[pixel + 2] > 28
            if (!isVisible) continue
            left = Math.min(left, x)
            top = Math.min(top, y)
            right = Math.max(right, x)
            bottom = Math.max(bottom, y)
          }
        }

        if (right < left || bottom < top) return resolve(source)

        const padding = Math.max(2, Math.round(Math.max(right - left + 1, bottom - top + 1) * 0.04))
        left = Math.max(0, left - padding)
        top = Math.max(0, top - padding)
        right = Math.min(width - 1, right + padding)
        bottom = Math.min(height - 1, bottom + padding)

        const targetCanvas = document.createElement('canvas')
        targetCanvas.width = 96
        targetCanvas.height = 96
        const targetContext = targetCanvas.getContext('2d')
        if (!targetContext) return resolve(source)

        const cropWidth = right - left + 1
        const cropHeight = bottom - top + 1
        const scale = Math.min(80 / cropWidth, 80 / cropHeight)
        const drawWidth = cropWidth * scale
        const drawHeight = cropHeight * scale
        targetContext.drawImage(
          image,
          left,
          top,
          cropWidth,
          cropHeight,
          (targetCanvas.width - drawWidth) / 2,
          (targetCanvas.height - drawHeight) / 2,
          drawWidth,
          drawHeight,
        )
        resolve(targetCanvas.toDataURL('image/png'))
      } catch {
        resolve(source)
      }
    }
    image.onerror = () => resolve(source)
    image.src = source
  })

  normalizedLogoCache.set(source, normalized)
  return normalized
}

export function NormalizedLogo({ source, name, loading = 'lazy' }: { source: string; name: string; loading?: 'eager' | 'lazy' }) {
  const [displaySource, setDisplaySource] = useState(source)

  useEffect(() => {
    let active = true
    void normalizeLogo(source).then((normalized) => {
      if (active) setDisplaySource(normalized)
    })
    return () => {
      active = false
    }
  }, [source])

  return <img src={displaySource} alt={name} loading={loading} />
}
