import React, { useState, useCallback, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Download } from 'lucide-react'

interface PixelationProps {
  originalImage: string
}

export function Pixelation({ originalImage }: PixelationProps) {
  const [pixelatedImage, setPixelatedImage] = useState<string>('')
  const [pixelLevel, setPixelLevel] = useState<number>(10)
  const [pixelShape, setPixelShape] = useState<'square' | 'circle' | 'triangle' | 'mosaic'>('square')
  const [isRainbow, setIsRainbow] = useState<boolean>(false)
  const [compareSlider, setCompareSlider] = useState<number>(50)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const handlePixelate = useCallback(() => {
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

      // Pixelate
      const pixelSize = Math.max(1, Math.floor(Math.min(img.width, img.height) / pixelLevel))
      for (let y = 0; y < img.height; y += pixelSize) {
        for (let x = 0; x < img.width; x += pixelSize) {
          const pixelData = ctx.getImageData(x, y, 1, 1).data
          let fillStyle = `rgb(${pixelData[0]},${pixelData[1]},${pixelData[2]})`
          
          if (isRainbow) {
            const hue = (x + y) % 360
            fillStyle = `hsl(${hue}, 100%, 50%)`
          }
          
          ctx.fillStyle = fillStyle

          switch (pixelShape) {
            case 'square':
              ctx.fillRect(x, y, pixelSize, pixelSize)
              break
            case 'circle':
              ctx.beginPath()
              ctx.arc(x + pixelSize / 2, y + pixelSize / 2, pixelSize / 2, 0, Math.PI * 2)
              ctx.fill()
              break
            case 'triangle':
              ctx.beginPath()
              ctx.moveTo(x + pixelSize / 2, y)
              ctx.lineTo(x + pixelSize, y + pixelSize)
              ctx.lineTo(x, y + pixelSize)
              ctx.closePath()
              ctx.fill()
              break
            case 'mosaic':
              const mosaicSize = pixelSize * 2
              const avgColor = ctx.getImageData(x, y, mosaicSize, mosaicSize)
              let r = 0, g = 0, b = 0, count = 0
              for (let i = 0; i < avgColor.data.length; i += 4) {
                r += avgColor.data[i]
                g += avgColor.data[i + 1]
                b += avgColor.data[i + 2]
                count++
              }
              ctx.fillStyle = `rgb(${r/count},${g/count},${b/count})`
              ctx.fillRect(x, y, mosaicSize, mosaicSize)
              break
          }
        }
      }

      setPixelatedImage(canvas.toDataURL())
    }
  }, [originalImage, pixelLevel, pixelShape, isRainbow])

  const handleDownload = () => {
    const link = document.createElement('a')
    link.href = pixelatedImage
    link.download = 'pixelated.png'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Label>Pixel Level:</Label>
        <Slider
          value={[pixelLevel]}
          onValueChange={(value) => setPixelLevel(value[0])}
          min={5}
          max={100}
          step={1}
          className="w-full"
        />
      </div>
      <div className="flex items-center space-x-2">
        <Label>Pixel Shape:</Label>
        <Select value={pixelShape} onValueChange={(value: 'square' | 'circle' | 'triangle' | 'mosaic') => setPixelShape(value)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="square">Square</SelectItem>
            <SelectItem value="circle">Circle</SelectItem>
            <SelectItem value="triangle">Triangle</SelectItem>
            <SelectItem value="mosaic">Mosaic</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center space-x-2">
        <Label>Rainbow Mode:</Label>
        <Switch checked={isRainbow} onCheckedChange={setIsRainbow} />
      </div>
      <Button onClick={handlePixelate} className="w-full">Pixelate Image</Button>
      {pixelatedImage && (
        <div className="flex flex-col items-center mt-4">
          <div className="relative w-full h-64">
            <img src={originalImage} alt="Original" className="absolute top-0 left-0 w-full h-full object-contain" />
            <img
              src={pixelatedImage}
              alt="Pixelated"
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
            Download Pixelated Image
          </Button>
        </div>
      )}
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  )
}