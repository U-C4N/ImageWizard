"use client"

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Sun, Moon, Upload, Github, Twitter } from 'lucide-react'
import { ImageUpload } from './ImageUpload'
import { ImageConversion } from './ImageConversion'
import { AsciiArt } from './AsciiArt'
import { Pixelation } from './Pixelation'
import { BackgroundRemoval } from './BackgroundRemoval'
import { Effects } from './Effects'

export default function ImageWizard() {
  const [originalImage, setOriginalImage] = useState<File | null>(null)
  const [originalPreview, setOriginalPreview] = useState<string>('')
  const [activeTab, setActiveTab] = useState<string>('upload')
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false)

  const handleImageUpload = (file: File) => {
    setOriginalImage(file)
    const reader = new FileReader()
    reader.onloadend = () => {
      setOriginalPreview(reader.result as string)
    }
    reader.readAsDataURL(file)
    setActiveTab('convert')
  }

  const resetImage = () => {
    setOriginalImage(null)
    setOriginalPreview('')
    setActiveTab('upload')
  }

  return (
    <div className={`w-full max-w-4xl mx-auto p-4 ${isDarkMode ? 'dark' : ''}`}>
      <Card className="overflow-hidden">
        <CardHeader className="bg-primary text-primary-foreground">
          <div className="flex justify-between items-center">
            <CardTitle className="text-3xl font-bold">ImageWizard</CardTitle>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setIsDarkMode(!isDarkMode)}
              aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
            >
              {isDarkMode ? <Sun className="h-[1.2rem] w-[1.2rem]" /> : <Moon className="h-[1.2rem] w-[1.2rem]" />}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full justify-start bg-muted/50 p-0 rounded-none">
              <TabsTrigger value="upload" disabled={!!originalImage}>Upload</TabsTrigger>
              <TabsTrigger value="convert" disabled={!originalImage}>Convert</TabsTrigger>
              <TabsTrigger value="pixel" disabled={!originalImage}>Pixel</TabsTrigger>
              <TabsTrigger value="ascii" disabled={!originalImage}>ASCII</TabsTrigger>
              <TabsTrigger value="effects" disabled={!originalImage}>Effects</TabsTrigger>
              <TabsTrigger value="removebg" disabled={!originalImage}>Remove BG</TabsTrigger>
            </TabsList>
            <div className="p-6">
              {originalImage && (
                <div className="mb-6 flex justify-between items-center">
                  <img
                    src={originalPreview}
                    alt="Original"
                    className="max-w-full h-auto max-h-64 rounded-lg shadow-md"
                  />
                  <Button variant="outline" onClick={resetImage}>
                    <Upload className="mr-2 h-4 w-4" /> Upload New Image
                  </Button>
                </div>
              )}
              <TabsContent value="upload">
                <ImageUpload onImageUpload={handleImageUpload} />
              </TabsContent>
              <TabsContent value="convert">
                <ImageConversion originalImage={originalImage} />
              </TabsContent>
              <TabsContent value="pixel">
                <Pixelation originalImage={originalPreview} />
              </TabsContent>
              <TabsContent value="ascii">
                <AsciiArt originalImage={originalPreview} />
              </TabsContent>
              <TabsContent value="effects">
                <Effects originalImage={originalPreview} />
              </TabsContent>
              <TabsContent value="removebg">
                <BackgroundRemoval originalImage={originalPreview} />
              </TabsContent>
            </div>
          </Tabs>
        </CardContent>
      </Card>
      <footer className="mt-8 text-center text-sm text-muted-foreground">
        <p>© 2024 ImageWizard. All rights reserved.</p>
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
    </div>
  )
}
