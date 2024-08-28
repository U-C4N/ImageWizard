"use client"


import React, { useState, useEffect, useCallback, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Upload, Image as ImageIcon, Type, Wand2, Eraser, X, ZoomIn, ZoomOut, Sun, Moon, Droplet, Wind, Grid, Layers, Download, Github, Twitter } from 'lucide-react'
import { Progress } from "@/components/ui/progress"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import imageCompression from 'browser-image-compression'

interface ConvertedImage {
  format: string;
  src: string;
  size: number;
  compressionRatio: number;
}

export default function Component() {
  const [originalImage, setOriginalImage] = useState<File | null>(null)
  const [originalPreview, setOriginalPreview] = useState<string>('')
  const [originalSize, setOriginalSize] = useState<number>(0)
  const [convertedImages, setConvertedImages] = useState<ConvertedImage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [progress, setProgress] = useState<number>(0)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<string>('convert')
  const [asciiArt, setAsciiArt] = useState<string>('')
  const [isColorAscii, setIsColorAscii] = useState<boolean>(true)
  const [pixelSize, setPixelSize] = useState<number>(2)
  const [pixelatedImage, setPixelatedImage] = useState<string>('')
  const [pixelLevel, setPixelLevel] = useState<number>(10)
  const [pixelShape, setPixelShape] = useState<'square' | 'circle' | 'triangle'>('square')
  const [isRainbow, setIsRainbow] = useState<boolean>(false)
  const [removedBgImage, setRemovedBgImage] = useState<string>('')
  const [effectImage, setEffectImage] = useState<string>('')
  const [selectedEffect, setSelectedEffect] = useState<string>('none')
  const [effectIntensity, setEffectIntensity] = useState<number>(50)
  const [brightness, setBrightness] = useState<number>(100)
  const [contrast, setContrast] = useState<number>(100)
  const [saturation, setSaturation] = useState<number>(100)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (originalImage) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setOriginalPreview(reader.result as string)
      }
      reader.readAsDataURL(originalImage)
      setOriginalSize(originalImage.size / (1024 * 1024)) // Convert to MB
    }
  }, [originalImage])

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        setError("File size exceeds the 10MB limit. Please choose a smaller file.")
        return
      }
      setError(null)
      setOriginalImage(file)
      setActiveTab('convert')
      setAsciiArt('') // Clear previous ASCII art
      setPixelatedImage('') // Clear previous pixelated image
      setRemovedBgImage('') // Clear previous removed bg image
      setEffectImage('') // Clear previous effect image
    }
  }

  const convertAndCompressImage = async () => {
    if (!originalImage) return
    setIsLoading(true)
    setProgress(0)
    setConvertedImages([])
    const formats = ['JPG', 'WEBP', 'PNG']
    const converted: ConvertedImage[] = []

    for (let index = 0; index < formats.length; index++) {
      const format = formats[index]
      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
        fileType: `image/${format.toLowerCase()}`,
        onProgress: (p: number) => setProgress((prevProgress) => Math.max(prevProgress, (index * 33) + p / 3)),
      }

      try {
        const compressedFile = await imageCompression(originalImage, options)
        const reader = new FileReader()
        reader.onload = (e) => {
          const originalSize = originalImage.size / (1024 * 1024)
          const compressedSize = compressedFile.size / (1024 * 1024)
          const compressionRatio = ((originalSize - compressedSize) / originalSize) * 100

          converted.push({
            format,
            src: e.target?.result as string,
            size: compressedSize,
            compressionRatio
          })

          if (converted.length === formats.length) {
            setConvertedImages(converted)
            setIsLoading(false)
            setProgress(100)
          }
        }
        reader.readAsDataURL(compressedFile)
      } catch (error) {
        console.error(`Error converting to ${format} format:`, error)
        setError(`Failed to convert to ${format} format. Please try again.`)
      }
    }
  }

  const handleASCII = useCallback(async () => {
    if (!originalImage) {
      setError("Please upload an image first.")
      return
    }
    setError(null)
    setIsLoading(true)
    setProgress(0)

    try {
      const img = new Image()
      img.src = originalPreview
      await new Promise((resolve, reject) => {
        img.onload = resolve
        img.onerror = reject
      })

      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        throw new Error("Could not create canvas context")
      }

      const scaleFactor = 0.1 // Increased for better quality
      canvas.width = img.width * scaleFactor
      canvas.height = img.height * scaleFactor
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const ascii = isColorAscii ? convertToColorASCII(imageData) : convertToASCII(imageData)

      setAsciiArt(ascii)
      setIsLoading(false)
      setProgress(100)
    } catch (error) {
      console.error("Error in ASCII conversion:", error)
      setError("Failed to convert image to ASCII. Please try again.")
      setIsLoading(false)
    }
  }, [originalImage, originalPreview, isColorAscii])

  const convertToASCII = (imageData: ImageData): string => {
    const ascii = '@%#*+=-:. '
    let result = ''
    for (let i = 0; i < imageData.height; i += 2) {
      for (let j = 0; j < imageData.width; j++) {
        const idx = (i * imageData.width + j) * 4
        const avg = (imageData.data[idx] + imageData.data[idx + 1] + imageData.data[idx + 2]) / 3
        const charIdx = Math.floor((avg / 255) * (ascii.length - 1))
        result += ascii[charIdx]
      }
      result += '\n'
    }
    return result
  }

  const convertToColorASCII = (imageData: ImageData): string => {
    const ascii = '@#*+=-:. '
    let result = ''
    for (let i = 0; i < imageData.height; i += 2) {
      for (let j = 0; j < imageData.width; j++) {
        const idx = (i * imageData.width + j) * 4
        const r = imageData.data[idx]
        const g = imageData.data[idx + 1]
        const b = imageData.data[idx + 2]
        const avg = (r + g + b) / 3
        const charIdx = Math.floor((avg / 255) * (ascii.length - 1))
        result += `<span style="color: rgb(${r},${g},${b})">${ascii[charIdx]}</span>`
      }
      result += '<br>'
    }
    return result
  }

  const handlePixelate = useCallback(() => {
    if (!originalImage || !canvasRef.current) return
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const img = new Image()
    img.src = originalPreview
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
          }
        }
      }

      setPixelatedImage(canvas.toDataURL())
    }
  }, [originalImage, originalPreview, pixelLevel, pixelShape, isRainbow])

  const handleRemoveBg = useCallback(() => {
    if (!originalImage || !canvasRef.current) return
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const img = new Image()
    img.src = originalPreview
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
  }, [originalImage, originalPreview])

  const applyEffect = useCallback(() => {
    if (!originalImage || !canvasRef.current) return
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const img = new Image()
    img.src = originalPreview
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
  }, [originalImage, originalPreview, selectedEffect, effectIntensity, brightness, contrast, saturation])

  const handleRemoveImage = () => {
    setOriginalImage(null)
    setOriginalPreview('')
    setOriginalSize(0)
    setConvertedImages([])
    setAsciiArt('')
    setPixelatedImage('')
    setRemovedBgImage('')
    setEffectImage('')
    setActiveTab('convert')
    setError(null)
  }

  const handleDownload = (imageData: string, fileName: string) => {
    const link = document.createElement('a')
    link.href = imageData
    link.download = fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="bg-black text-white p-6 rounded-t-lg">
        <h1 className="text-3xl font-bold">ImageWizard</h1>
      </div>
      <Card className="rounded-t-none">
        <CardContent className="p-6">
          <div className="space-y-6">
            {!originalImage ? (
              <div className="flex items-center justify-center w-full">
                <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition duration-300 ease-in-out">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-10 h-10 mb-3 text-gray-400" />
                    <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                    <p className="text-xs text-gray-500">PNG, JPG or GIF (MAX. 10MB)</p>
                  </div>
                  <Input id="dropzone-file" type="file" className="hidden" onChange={handleImageUpload} accept="image/*" />
                </label>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Original Image</p>
                    <p className="text-xs text-gray-500">Size: {originalSize.toFixed(2)} MB</p>
                  </div>
                  <Button variant="outline" size="icon" onClick={handleRemoveImage}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex justify-center">
                  <img src={originalPreview} alt="Original" className="max-w-full h-auto max-h-64 rounded-lg shadow-md" />
                </div>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="convert">Convert</TabsTrigger>
                    <TabsTrigger value="pixel">Pixel</TabsTrigger>
                    <TabsTrigger value="ascii">ASCII</TabsTrigger>
                    <TabsTrigger value="effects">Effects</TabsTrigger>
                    <TabsTrigger value="removebg">Remove BG</TabsTrigger>
                  </TabsList>
                  <TabsContent value="convert">
                    <Button onClick={convertAndCompressImage} className="w-full">Convert and Compress</Button>
                    {convertedImages.length > 0 && (
                      <div className="space-y-4 mt-4">
                        <h3 className="text-lg font-semibold">Converted Images</h3>
                        {convertedImages.map((image, index) => (
                          <div key={index} className="flex items-center justify-between bg-white border border-gray-200 rounded-lg p-3 hover:shadow-md transition duration-300 ease-in-out">
                            <div className="flex items-center space-x-3">
                              <img src={image.src} alt={`Converted ${image.format}`} className="w-12 h-12 object-cover rounded" />
                              <div>
                                <span className="font-medium">{image.format}</span>
                                <p className="text-sm text-gray-500">{image.size.toFixed(2)} MB</p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-4">
                              <span className={`text-sm ${image.compressionRatio > 0 ? 'text-green-500' : 'text-red-500'}`}>
                                {image.compressionRatio > 0 ? '↓' : '↑'} {Math.abs(image.compressionRatio).toFixed(0)}%
                              </span>
                              <Button
                                asChild
                                variant="outline"
                                size="sm"
                                className="text-blue-600 border-blue-600 hover:bg-blue-50 transition duration-300 ease-in-out"
                              >
                                <a href={image.src} download={`converted.${image.format.toLowerCase()}`}>
                                  Download
                                </a>
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </TabsContent>
                  <TabsContent value="pixel">
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
                        <Select value={pixelShape} onValueChange={(value: 'square' | 'circle' | 'triangle') => setPixelShape(value)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="square">Square</SelectItem>
                            <SelectItem value="circle">Circle</SelectItem>
                            <SelectItem value="triangle">Triangle</SelectItem>
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
                          <img src={pixelatedImage} alt="Pixelated" className="max-w-full h-auto rounded-lg shadow-md" />
                          <Button onClick={() => handleDownload(pixelatedImage, 'pixelated.png')} className="mt-2">
                            <Download className="w-4 h-4 mr-2" />
                            Download Pixelated Image
                          </Button>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                  <TabsContent value="ascii">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <Button onClick={handleASCII} className="w-full mr-2">Convert to ASCII Art</Button>
                        <Button onClick={() => setIsColorAscii(!isColorAscii)} variant="outline">
                          {isColorAscii ? 'Switch to B&W' : 'Switch to Color'}
                        </Button>
                      </div>
                      {asciiArt && (
                        <>
                          <div className="flex items-center space-x-2">
                            <ZoomOut className="w-4 h-4" />
                            <Slider
                              value={[pixelSize]}
                              onValueChange={(value) => setPixelSize(value[0])}
                              min={1}
                              max={10}
                              step={1}
                              className="w-full"
                            />
                            <ZoomIn className="w-4 h-4" />
                          </div>
                          <div className="bg-gray-100 p-4 rounded-lg overflow-auto max-h-96">
                            <pre 
                              className="font-mono" 
                              style={{
                                color: isColorAscii ? 'inherit' : 'black',
                                fontSize: `${pixelSize}px`,
                                lineHeight: `${pixelSize}px`
                              }} 
                              dangerouslySetInnerHTML={{__html: asciiArt}}
                            ></pre>
                          </div>
                          <Button onClick={() => handleDownload(`data:text/plain;charset=utf-8,${encodeURIComponent(asciiArt)}`, 'ascii_art.txt')}>
                            <Download className="w-4 h-4 mr-2" />
                            Download ASCII Art
                          </Button>
                        </>
                      )}
                    </div>
                  </TabsContent>
                  <TabsContent value="effects">
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
                          <img src={effectImage} alt="Effect Applied" className="max-w-full h-auto rounded-lg shadow-md" />
                          <Button onClick={() => handleDownload(effectImage, 'effect_applied.png')} className="mt-2">
                            <Download className="w-4 h-4 mr-2" />
                            Download Effect Applied Image
                          </Button>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                  <TabsContent value="removebg">
                    <div className="space-y-4">
                      <Button onClick={handleRemoveBg} className="w-full">Remove Background</Button>
                      {removedBgImage && (
                        <div className="flex flex-col items-center bg-gray-100 rounded-lg p-4 mt-4">
                          <img src={removedBgImage} alt="Background Removed" className="max-w-full h-auto rounded-lg shadow-md" />
                          <Button onClick={() => handleDownload(removedBgImage, 'background_removed.png')} className="mt-2">
                            <Download className="w-4 h-4 mr-2" />
                            Download Background Removed Image
                          </Button>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            )}
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                <strong className="font-bold">Error: </strong>
                <span className="block sm:inline">{error}</span>
              </div>
            )}
            {isLoading && (
              <div className="space-y-2">
                <Progress value={progress} className="w-full" />
                <p className="text-center text-sm text-gray-500">Processing... {progress.toFixed(0)}%</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      <footer className="mt-8 text-center text-sm text-gray-500">
        <p>© 2024 ImageWizard</p>
        <div className="flex justify-center space-x-4 mt-2">
          <a href="https://github.com/U-C4N" target="_blank" rel="noopener noreferrer">
            <Github className="w-5 h-5 text-gray-400 hover:text-gray-600 transition-colors" />
          </a>
          <a href="https://x.com/UEdizaslan" target="_blank" rel="noopener noreferrer">
            <Twitter className="w-5 h-5 text-gray-400 hover:text-gray-600 transition-colors" />
          </a>
          <a href="https://discord.gg/NV96ckR9" target="_blank" rel="noopener noreferrer">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-gray-400 hover:text-gray-600 transition-colors">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              <path d="M16 10.34c-.73-.73-1.73-1.18-2.83-1.18-2.21 0-4 1.79-4 4s1.79 4 4 4c1.1 0 2.1-.45 2.83-1.18"></path>
            </svg>
          </a>
        </div>
      </footer>
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  )
}
