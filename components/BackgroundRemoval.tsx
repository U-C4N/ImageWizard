import React, { useState, useCallback, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Download } from 'lucide-react'

interface BackgroundRemovalProps {
  originalImage: string
}

export function BackgroundRemoval({ originalImage }: BackgroundRemovalProps) {
  const [removedBgImage, setRemovedBgImage] = useState<string>('')
  const [compareSlider, setCompareSlider] = useState<number>(50)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const handleRemoveBg = useCallback(() => {
    if (!originalImage || !canvasRef.current) return
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const img = new Image()
    img.src = originalImage
    img.onload = () => {
      canvas.width = img.width
      canvas.height = img.height

      // Draw the original image
      ctx.drawImage(img, 0, 0, img.width, img.height)

      // Get image data
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const data = imageData.data

      // Improved background removal (using a simple edge detection)
      const threshold = 20 // Adjust this value to fine-tune the background removal
      for (let y = 0; y < canvas.height; y++) {
        for (let x = 0; x < canvas.width; x++) {
          const idx = (y * canvas.width + x) * 4
          const r = data[idx]
          const g = data[idx + 1]
          const b = data[idx + 2]

          // Check surrounding pixels
          let isBorder = false
          for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
              if (dx === 0 && dy === 0) continue
              const nx = x + dx
              const ny = y + dy
              if (nx < 0 || nx >= canvas.width || ny < 0 || ny >= canvas.height) continue
              const nidx = (ny * canvas.width + nx) * 4
              const nr = data[nidx]
              const ng = data[nidx + 1]
              const nb = data[nidx + 2]
              if (Math.abs(r - nr) > threshold || Math.abs(g - ng) > threshold || Math.abs(b - nb) > threshold) {
                isBorder = true
                break
              }
            }
            if (isBorder) break
          }

          // If not a border pixel, make it transparent
          if (!isBorder) {
            data[idx + 3] = 0 // Set alpha to 0
          }
        }
      }

      // Put the modified image data back to the canvas
      ctx.putImageData(imageData, 0, 0)

      setRemovedBgImage(canvas.toDataURL())
    }
  }, [originalImage])

  const handleDownload = () => {
    const link = document.createElement('a')
    link.href = removedBgImage
    link.download = 'background_removed.png'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="space-y-4">
      <Button onClick={handleRemoveBg} className="w-full">Remove Background</Button>
      {removedBgImage && (
        <div className="flex flex-col items-center mt-4">
          <div className="relative w-full h-64">
            <img src={originalImage} alt="Original" className="absolute top-0 left-0 w-full h-full object-contain" />
            <img
              src={removedBgImage}
              alt="Background Removed"
              className="absolute top-0 left-0 w-full h-full object-contain"
              style={{ clipPath: `inset(0 ${100 - compareSlider}% 0 0)` }}
            />
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-white"
              style={{ left: `${compareSlider}%` }}
            />
          </div>
          <Slider
            value={[compareSlider]}
            onValueChange={(value) => setCompareSlider(value[0])}
            min={0}
            max={100}
            step={1}
            className="w-full mt-2"
          />
          <Button onClick={handleDownload} className="mt-2">
            <Download className="w-4 h-4 mr-2" />
            Download Background Removed Image
          </Button>
        </div>
      )}
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  )
}