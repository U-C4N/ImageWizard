"use client"

import React, { useState, useEffect, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Download } from 'lucide-react'

interface AsciiArtProps {
  originalImage: string
}

export function AsciiArt({ originalImage }: AsciiArtProps) {
  const [asciiArt, setAsciiArt] = useState<string>('')
  const [fontSize, setFontSize] = useState<number>(10)
  const [isColor, setIsColor] = useState<boolean>(false)
  const [outputWidth, setOutputWidth] = useState<number>(80)
  const [outputHeight, setOutputHeight] = useState<number>(40)
  const workerRef = useRef<Worker | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Worker' in window) {
      workerRef.current = new Worker(new URL('../public/ascii-worker.js', import.meta.url))
      workerRef.current.onmessage = (e: MessageEvent<string>) => {
        setAsciiArt(e.data)
      }
    }

    return () => {
      workerRef.current?.terminate()
    }
  }, [])

  const generateAsciiArt = () => {
    if (workerRef.current && originalImage && canvasRef.current) {
      const img = new Image()
      img.onload = () => {
        const canvas = canvasRef.current!
        canvas.width = img.width
        canvas.height = img.height
        const ctx = canvas.getContext('2d')
        if (ctx) {
          ctx.drawImage(img, 0, 0)
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
          workerRef.current!.postMessage({
            imageData: imageData.data,
            width: canvas.width,
            height: canvas.height,
            isColor,
            outputWidth,
            outputHeight
          })
        }
      }
      img.src = originalImage
    }
  }

  const handleDownload = () => {
    const element = document.createElement("a")
    const file = new Blob([asciiArt], {type: 'text/plain'})
    element.href = URL.createObjectURL(file)
    element.download = "ascii_art.txt"
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Label htmlFor="fontSize">Font Size:</Label>
        <Slider
          id="fontSize"
          min={6}
          max={24}
          step={1}
          value={[fontSize]}
          onValueChange={(value) => setFontSize(value[0])}
          className="w-[200px]"
        />
        <span>{fontSize}px</span>
      </div>
      <div className="flex items-center space-x-2">
        <Label htmlFor="outputWidth">Width:</Label>
        <Slider
          id="outputWidth"
          min={20}
          max={200}
          step={1}
          value={[outputWidth]}
          onValueChange={(value) => setOutputWidth(value[0])}
          className="w-[200px]"
        />
        <span>{outputWidth} chars</span>
      </div>
      <div className="flex items-center space-x-2">
        <Label htmlFor="outputHeight">Height:</Label>
        <Slider
          id="outputHeight"
          min={10}
          max={100}
          step={1}
          value={[outputHeight]}
          onValueChange={(value) => setOutputHeight(value[0])}
          className="w-[200px]"
        />
        <span>{outputHeight} lines</span>
      </div>
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="isColor"
          checked={isColor}
          onChange={(e) => setIsColor(e.target.checked)}
        />
        <Label htmlFor="isColor">Color</Label>
      </div>
      <Button onClick={generateAsciiArt}>Generate ASCII Art</Button>
      {asciiArt && (
        <div className="mt-4">
          <pre
            style={{
              fontSize: `${fontSize}px`,
              lineHeight: '1',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-all',
            }}
            dangerouslySetInnerHTML={{ __html: asciiArt }}
          />
          <Button onClick={handleDownload} className="mt-2">
            <Download className="w-4 h-4 mr-2" />
            Download ASCII Art
          </Button>
        </div>
      )}
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  )
}