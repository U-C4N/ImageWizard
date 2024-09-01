"use client"

import React, { useState, useCallback, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Download } from 'lucide-react'

interface EffectsProps {
  originalImage: string
}

export function Effects({ originalImage }: EffectsProps) {
  const [effectImage, setEffectImage] = useState<string>('')
  const [selectedEffect, setSelectedEffect] = useState<string>('none')
  const [effectIntensity, setEffectIntensity] = useState<number>(50)
  const [brightness, setBrightness] = useState<number>(100)
  const [contrast, setContrast] = useState<number>(100)
  const [saturation, setSaturation] = useState<number>(100)
  const [compareSlider, setCompareSlider] = useState<number>(50)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const applyEffect = useCallback(() => {
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

      // Apply selected effect
      switch (selectedEffect) {
        case 'grayscale':
          for (let i = 0; i < data.length; i += 4) {
            const avg = (data[i] + data[i + 1] + data[i + 2]) / 3
            data[i] = data[i + 1] = data[i + 2] = avg
          }
          break
        case 'sepia':
          for (let i = 0; i < data.length; i += 4) {
            const r = data[i]
            const g = data[i + 1]
            const b = data[i + 2]
            data[i] = Math.min(255, (r * 0.393) + (g * 0.769) + (b * 0.189))
            data[i + 1] = Math.min(255, (r * 0.349) + (g * 0.686) + (b * 0.168))
            data[i + 2] = Math.min(255, (r * 0.272) + (g * 0.534) + (b * 0.131))
          }
          break
        case 'invert':
          for (let i = 0; i < data.length; i += 4) {
            data[i] = 255 - data[i]
            data[i + 1] = 255 - data[i + 1]
            data[i + 2] = 255 - data[i + 2]
          }
          break
        case 'blur':
          ctx.filter = `blur(${effectIntensity / 10}px)`
          ctx.drawImage(img, 0, 0, img.width, img.height)
          break
        case 'brightness':
          for (let i = 0; i < data.length; i += 4) {
            data[i] = Math.min(255, data[i] * (brightness / 100))
            data[i + 1] = Math.min(255, data[i + 1] * (brightness / 100))
            data[i + 2] = Math.min(255, data[i + 2] * (brightness / 100))
          }
          break
        case 'contrast':
          const factor = (259 * (contrast + 255)) / (255 * (259 - contrast))
          for (let i = 0; i < data.length; i += 4) {
            data[i] = Math.min(255, factor * (data[i] - 128) + 128)
            data[i + 1] = Math.min(255, factor * (data[i + 1] - 128) + 128)
            data[i + 2] = Math.min(255, factor * (data[i + 2] - 128) + 128)
          }
          break
        case 'saturation':
          for (let i = 0; i < data.length; i += 4) {
            const gray = 0.2989 * data[i] + 0.5870 * data[i + 1] + 0.1140 * data[i + 2]
            data[i] = Math.min(255, gray + (data[i] - gray) * (saturation / 100))
            data[i + 1] = Math.min(255, gray + (data[i + 1] - gray) * (saturation / 100))
            data[i + 2] = Math.min(255, gray + (data[i + 2] - gray) * (saturation / 100))
          }
          break
        default:
          break
      }

      // Put the modified image data back to the canvas
      if (selectedEffect !== 'blur') {
        ctx.putImageData(imageData, 0, 0)
      }

      setEffectImage(canvas.toDataURL())
    }
  }, [originalImage, selectedEffect, effectIntensity, brightness, contrast, saturation])

  const handleDownload = () => {
    const link = document.createElement('a')
    link.href = effectImage
    link.download = 'effect_applied.png'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="space-y-4">
      <Select value={selectedEffect} onValueChange={setSelectedEffect}>
        <SelectTrigger>
          <SelectValue placeholder="Select an effect" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="grayscale">Grayscale</SelectItem>
          <SelectItem value="sepia">Sepia</SelectItem>
          <SelectItem value="invert">Invert</SelectItem>
          <SelectItem value="blur">Blur</SelectItem>
          <SelectItem value="brightness">Brightness</SelectItem>
          <SelectItem value="contrast">Contrast</SelectItem>
          <SelectItem value="saturation">Saturation</SelectItem>
        </SelectContent>
      </Select>
      {selectedEffect === 'blur' && (
        <div className="flex items-center space-x-2">
          <Label>Blur Intensity:</Label>
          <Slider
            value={[effectIntensity]}
            onValueChange={(value) => setEffectIntensity(value[0])}
            min={0}
            max={100}
            step={1}
            className="w-full"
          />
        </div>
      )}
      {selectedEffect === 'brightness' && (
        <div className="flex items-center space-x-2">
          <Label>Brightness:</Label>
          <Slider
            value={[brightness]}
            onValueChange={(value) => setBrightness(value[0])}
            min={0}
            max={200}
            step={1}
            className="w-full"
          />
        </div>
      )}
      {selectedEffect === 'contrast' && (
        <div className="flex items-center space-x-2">
          <Label>Contrast:</Label>
          <Slider
            value={[contrast]}
            onValueChange={(value) => setContrast(value[0])}
            min={0}
            max={200}
            step={1}
            className="w-full"
          />
        </div>
      )}
      {selectedEffect === 'saturation' && (
        <div className="flex items-center space-x-2">
          <Label>Saturation:</Label>
          <Slider
            value={[saturation]}
            onValueChange={(value) => setSaturation(value[0])}
            min={0}
            max={200}
            step={1}
            className="w-full"
          />
        </div>
      )}
      <Button onClick={applyEffect} className="w-full">Apply Effect</Button>
      {effectImage && (
        <div className="flex flex-col items-center mt-4">
          <div className="relative w-full h-64">
            <img src={originalImage} alt="Original" className="absolute top-0 left-0 w-full h-full object-contain" />
            <img
              src={effectImage}
              alt="Effect Applied"
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
            Download Effect Applied Image
          </Button>
        </div>
      )}
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  )
}