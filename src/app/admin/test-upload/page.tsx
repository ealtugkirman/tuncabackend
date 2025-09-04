'use client'

import { useState } from 'react'
import ImageUpload from '@/components/ImageUpload'

export default function TestUploadPage() {
  const [imageUrl, setImageUrl] = useState('')
  const [publicId, setPublicId] = useState('')

  const handleImageChange = (url: string, publicId?: string) => {
    setImageUrl(url)
    setPublicId(publicId || '')
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Cloudinary Upload Test</h1>
      
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold mb-4">Image Upload</h2>
          <ImageUpload
            value={imageUrl}
            onChange={handleImageChange}
            folder="test"
            className="w-full"
          />
        </div>

        {imageUrl && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Upload Results:</h3>
            <div className="space-y-2 text-sm">
              <div>
                <strong>URL:</strong>
                <br />
                <code className="bg-white p-2 rounded border block mt-1 break-all">
                  {imageUrl}
                </code>
              </div>
              <div>
                <strong>Public ID:</strong>
                <br />
                <code className="bg-white p-2 rounded border block mt-1">
                  {publicId}
                </code>
              </div>
            </div>
          </div>
        )}

        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">Instructions:</h3>
          <ol className="list-decimal list-inside space-y-1 text-sm">
            <li>Make sure you have set up your Cloudinary environment variables</li>
            <li>Click or drag an image to upload</li>
            <li>Check the results below</li>
            <li>Images will be uploaded to the "test" folder in Cloudinary</li>
          </ol>
        </div>
      </div>
    </div>
  )
}
