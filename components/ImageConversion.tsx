"use client"

import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"

interface ImageConversionProps {
  originalImage: File | null;
}

export function ImageConversion({ originalImage }: ImageConversionProps) {
  const [convertedImage, setConvertedImage] = useState<string | null>(null)
  const [format, setFormat] = useState<string>('png')

  const handleConvert = () => {
    if (!originalImage) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          const dataUrl = canvas.toDataURL(`image/${format}`);
          setConvertedImage(dataUrl);
        }
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(originalImage);
  };

  const handleDownload = () => {
    if (convertedImage) {
      const link = document.createElement('a');
      link.href = convertedImage;
      link.download = `converted_image.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-4">
        <Label htmlFor="format-select">Convert to:</Label>
        <Select value={format} onValueChange={setFormat}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select format" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="png">PNG</SelectItem>
            <SelectItem value="jpeg">JPEG</SelectItem>
            <SelectItem value="webp">WebP</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button onClick={handleConvert} disabled={!originalImage}>Convert</Button>
      {convertedImage && (
        <div className="mt-4">
          <img src={convertedImage} alt="Converted" className="max-w-full h-auto" />
          <Button onClick={handleDownload} className="mt-2">Download Converted Image</Button>
        </div>
      )}
    </div>
  )
}
