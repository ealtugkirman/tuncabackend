import { v2 as cloudinary } from 'cloudinary'

// Configure Cloudinary
if (process.env.CLOUDINARY_URL) {
  // Use CLOUDINARY_URL if available (format: cloudinary://api_key:api_secret@cloud_name)
  console.log('Using CLOUDINARY_URL for configuration')
  cloudinary.config({
    secure: true
  })
} else {
  // Use individual environment variables
  console.log('Using individual Cloudinary environment variables')
  console.log('Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME ? 'Set' : 'Missing')
  console.log('API Key:', process.env.CLOUDINARY_API_KEY ? 'Set' : 'Missing')
  console.log('API Secret:', process.env.CLOUDINARY_API_SECRET ? 'Set' : 'Missing')
  
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  })
}

export { cloudinary }

// Helper function to upload image to Cloudinary
export const uploadToCloudinary = async (
  file: Buffer,
  folder: string = 'tunca-law',
  publicId?: string
): Promise<{ url: string; publicId: string }> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        public_id: publicId,
        resource_type: 'auto',
        quality: 'auto',
        fetch_format: 'auto',
      },
      (error, result) => {
        if (error) {
          reject(error)
        } else if (result) {
          resolve({
            url: result.secure_url,
            publicId: result.public_id,
          })
        } else {
          reject(new Error('Upload failed'))
        }
      }
    )

    uploadStream.end(file)
  })
}

// Helper function to delete image from Cloudinary
export const deleteFromCloudinary = async (publicId: string): Promise<void> => {
  try {
    await cloudinary.uploader.destroy(publicId)
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error)
    throw error
  }
}

// Helper function to transform image URL
export const getTransformedImageUrl = (
  url: string,
  transformations: Record<string, any> = {}
): string => {
  const defaultTransformations = {
    quality: 'auto',
    fetch_format: 'auto',
    ...transformations,
  }

  return cloudinary.url(url, defaultTransformations)
}
