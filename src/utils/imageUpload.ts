import { cloudinaryService } from '../services/cloudinaryService';

/**
 * Uploads a base64 image to Cloudinary
 * @param base64Image - Base64 encoded image string
 * @param fileName - Desired file name (for logging purposes)
 * @returns Public URL of the uploaded image
 */
export async function uploadImageToStorage(base64Image: string, fileName: string): Promise<string> {
  try {
    console.log(`📤 Uploading ${fileName} to Cloudinary...`);
    
    // Upload directly to Cloudinary using base64
    const url = await cloudinaryService.uploadFromDataUrl(base64Image, 'personalized-orders');
    
    console.log(`✅ ${fileName} uploaded:`, url);
    return url;
  } catch (error) {
    console.error(`❌ Image upload error (${fileName}):`, error);
    throw error;
  }
}

/**
 * Uploads both original and cropped images for a personalized canvas
 * @param originalImage - Original base64 image
 * @param croppedImage - Cropped base64 image
 * @param index - Image index for unique naming
 * @returns Object with original and cropped URLs
 */
export async function uploadPersonalizedImages(
  originalImage: string,
  croppedImage: string,
  index: number
): Promise<{ originalUrl: string; croppedUrl: string }> {
  try {
    console.log(`📤 Uploading personalized images ${index + 1}...`);
    
    // Upload both images in parallel
    const [originalUrl, croppedUrl] = await Promise.all([
      uploadImageToStorage(originalImage, `original-${index}.jpg`),
      uploadImageToStorage(croppedImage, `cropped-${index}.jpg`),
    ]);
    
    console.log(`✅ Images uploaded successfully:`, { originalUrl, croppedUrl });
    
    return { originalUrl, croppedUrl };
  } catch (error) {
    console.error('❌ Failed to upload personalized images:', error);
    throw error;
  }
}