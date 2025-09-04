# Cloudinary Setup Guide

This guide will help you set up Cloudinary for image upload and management in the Tunca Law Admin Panel.

## 1. Create a Cloudinary Account

1. Go to [cloudinary.com](https://cloudinary.com)
2. Sign up for a free account
3. Verify your email address

## 2. Get Your Cloudinary Credentials

1. Log in to your Cloudinary dashboard
2. Go to the "Dashboard" section
3. Copy the following values:
   - **Cloud Name**
   - **API Key**
   - **API Secret**

## 3. Set Up Environment Variables

1. Copy your `.env.example` to `.env.local`:
   ```bash
   cp env.example .env.local
   ```

2. Add your Cloudinary credentials to `.env.local`:
   ```env
   # Cloudinary
   CLOUDINARY_CLOUD_NAME="your-cloud-name"
   CLOUDINARY_API_KEY="your-api-key"
   CLOUDINARY_API_SECRET="your-api-secret"
   ```

## 4. Test the Integration

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Go to the admin panel: `http://localhost:3001/admin`

3. Navigate to "Upload Test" in the sidebar

4. Try uploading an image to test the integration

## 5. Features

### Image Upload Component
- **Drag & Drop**: Drag images directly onto the upload area
- **Click to Upload**: Click the upload area to select files
- **File Validation**: Supports JPEG, PNG, WebP, GIF (max 5MB)
- **Preview**: Shows uploaded image with remove option
- **Loading States**: Shows loading indicator during upload

### Cloudinary Integration
- **Automatic Optimization**: Images are automatically optimized for web
- **Responsive Images**: Cloudinary provides responsive image URLs
- **Folder Organization**: Images are organized in folders (lawyers, events, announcements, etc.)
- **Public ID Management**: Each image gets a unique public ID for management

### API Endpoints
- `POST /api/upload/cloudinary` - Upload image to Cloudinary
- `DELETE /api/upload/cloudinary` - Delete image from Cloudinary

## 6. Usage in Forms

The `ImageUpload` component is already integrated into:
- **Lawyers Form**: Profile photos
- **Events Form**: Event images
- **Announcements Form**: Announcement images

### Example Usage:
```tsx
import ImageUpload from '@/components/ImageUpload'

<ImageUpload
  value={imageUrl}
  onChange={(url, publicId) => {
    setValue('image', url)
    setValue('imagePublicId', publicId || '')
  }}
  folder="lawyers"
  className="w-full"
/>
```

## 7. Database Schema

The database has been updated to store both image URLs and Cloudinary public IDs:

```prisma
model Lawyer {
  image         String?  // Cloudinary URL
  imagePublicId String?  // Cloudinary Public ID
  // ... other fields
}
```

## 8. Image Management

### Uploading Images
1. Images are automatically uploaded to Cloudinary when selected
2. URLs and public IDs are stored in the database
3. Images are organized in folders based on content type

### Deleting Images
1. When a record is deleted, the associated Cloudinary image can be deleted
2. Use the public ID to delete images from Cloudinary
3. The delete API endpoint handles this automatically

### Image Optimization
- **Quality**: Auto-optimized for web
- **Format**: Auto-converted to best format (WebP, AVIF, etc.)
- **Size**: Responsive sizing available
- **Transformation**: Can be transformed on-the-fly

## 9. Troubleshooting

### Common Issues:

1. **"Upload failed" error**
   - Check your environment variables
   - Verify Cloudinary credentials
   - Check file size (max 5MB)

2. **"Invalid file type" error**
   - Only JPEG, PNG, WebP, GIF are supported
   - Check file extension

3. **Images not displaying**
   - Check if the URL is valid
   - Verify Cloudinary account is active
   - Check network connectivity

### Debug Steps:
1. Check browser console for errors
2. Verify environment variables are loaded
3. Test with the upload test page
4. Check Cloudinary dashboard for uploaded images

## 10. Production Considerations

### Security:
- API keys are server-side only
- Upload endpoint requires authentication
- File type and size validation

### Performance:
- Images are CDN-delivered
- Automatic optimization
- Lazy loading support

### Cost:
- Free tier: 25GB storage, 25GB bandwidth
- Pay-as-you-go pricing for higher usage
- Monitor usage in Cloudinary dashboard

## 11. Advanced Features

### Image Transformations:
```javascript
// Resize image
const resizedUrl = cloudinary.url(publicId, {
  width: 300,
  height: 200,
  crop: 'fill'
})

// Apply filters
const filteredUrl = cloudinary.url(publicId, {
  effect: 'blur:300'
})
```

### Batch Operations:
- Upload multiple images
- Delete multiple images
- Transform multiple images

This setup provides a robust, scalable image management solution for the Tunca Law Admin Panel.
