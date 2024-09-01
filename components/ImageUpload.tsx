import React from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Upload } from 'lucide-react'

interface ImageUploadProps {
  onImageUpload: (file: File) => void
}

export function ImageUpload({ onImageUpload }: ImageUploadProps) {
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        alert("File size exceeds the 10MB limit. Please choose a smaller file.")
        return
      }
      onImageUpload(file)
    }
  }

  return (
    <div className="flex items-center justify-center w-full">
      <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-bray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600">
        <div className="flex flex-col items-center justify-center pt-5 pb-6">
          <Upload className="w-10 h-10 mb-3 text-gray-400" />
          <p className="mb-2 text-sm text-gray-500 dark:text-gray-400"><span className="font-semibold">Click to upload</span> or drag and drop</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">PNG, JPG or GIF (MAX. 10MB)</p>
        </div>
        <Input id="dropzone-file" type="file" className="hidden" onChange={handleImageUpload} accept="image/*" />
      </label>
    </div>
  )
}