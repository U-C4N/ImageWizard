import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import imageCompression from 'browser-image-compression'
import { Download } from 'lucide-react'
import Image from 'next/image'

interface ConvertedImage {
  format: string;
  src: string;
  size: number;
  compressionRatio: number;
}

interface ImageConversionProps {
  originalImage: File | null
}

export function ImageConversion({ originalImage }: ImageConversionProps) {
  const [convertedImages, setConvertedImages] = useState<ConvertedImage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [progress, setProgress] = useState<number>(0)

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
        setIsLoading(false)
      }
    }
  }

  return (
    <div className="space-y-4">
      <Button onClick={convertAndCompressImage} className="w-full">Convert and Compress</Button>
      {isLoading && (
        <div className="space-y-2">
          <Progress value={progress} className="w-full" />
          <p className="text-center text-sm text-gray-500 dark:text-gray-400">Processing... {progress.toFixed(0)}%</p>
        </div>
      )}
      {convertedImages.length > 0 && (
        <div className="space-y-4 mt-4">
          <h3 className="text-lg font-semibold">Converted Images</h3>
          {convertedImages.map((image, index) => (
            <div key={index} className="flex items-center justify-between bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 hover:shadow-md transition duration-300 ease-in-out">
              <div className="flex items-center space-x-3">
                <Image
                  src={image.src}
                  alt={`Converted ${image.format}`}
                  width={48}
                  height={48}
                  className="object-cover rounded"
                />
                <div>
                  <span className="font-medium">{image.format}</span>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{image.size.toFixed(2)} MB</p>
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
                  className="text-blue-600 border-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:border-blue-400 dark:hover:bg-blue-900 transition duration-300 ease-in-out"
                >
                  <a href={image.src} download={`converted.${image.format.toLowerCase()}`}>
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </a>
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
