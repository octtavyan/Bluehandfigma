import { projectId, publicAnonKey } from './supabase/info';

/**
 * Uploads a base64 image to Supabase Storage
 * @param base64Image - Base64 encoded image string
 * @param fileName - Desired file name
 * @returns Public URL of the uploaded image
 */
export async function uploadImageToStorage(base64Image: string, fileName: string): Promise<string> {
  try {
    // Convert base64 to blob
    const response = await fetch(base64Image);
    const blob = await response.blob();
    
    // Create FormData
    const formData = new FormData();
    formData.append('file', blob, fileName);
    formData.append('path', `personalized/${Date.now()}-${fileName}`);
    
    // Upload to server
    const uploadResponse = await fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-bbc0c500/storage/upload`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: formData,
      }
    );
    
    if (!uploadResponse.ok) {
      const errorData = await uploadResponse.json();
      throw new Error(`Upload failed: ${errorData.error || 'Unknown error'}`);
    }
    
    const result = await uploadResponse.json();
    
    if (!result.success || !result.url) {
      throw new Error('Upload succeeded but no URL returned');
    }
    
    return result.url;
  } catch (error) {
    console.error('❌ Image upload error:', error);
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
