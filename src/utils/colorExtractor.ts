/**
 * Utility to extract dominant color from an image
 */

// Predefined filter colors that we support
export const FILTER_COLORS = [
  { name: 'red', hex: '#EF4444', rgb: [239, 68, 68] },
  { name: 'orange', hex: '#F97316', rgb: [249, 115, 22] },
  { name: 'yellow', hex: '#EAB308', rgb: [234, 179, 8] },
  { name: 'green', hex: '#10B981', rgb: [16, 185, 129] },
  { name: 'blue', hex: '#3B82F6', rgb: [59, 130, 246] },
  { name: 'purple', hex: '#A855F7', rgb: [168, 85, 247] },
  { name: 'pink', hex: '#EC4899', rgb: [236, 72, 153] },
  { name: 'brown', hex: '#92400E', rgb: [146, 64, 14] },
  { name: 'black', hex: '#000000', rgb: [0, 0, 0] },
  { name: 'white', hex: '#FFFFFF', rgb: [255, 255, 255] },
  { name: 'gray', hex: '#6B7280', rgb: [107, 114, 128] },
  { name: 'beige', hex: '#D4A373', rgb: [212, 163, 115] },
];

/**
 * Calculate color distance using Euclidean distance
 */
function colorDistance(rgb1: number[], rgb2: number[]): number {
  return Math.sqrt(
    Math.pow(rgb1[0] - rgb2[0], 2) +
    Math.pow(rgb1[1] - rgb2[1], 2) +
    Math.pow(rgb1[2] - rgb2[2], 2)
  );
}

/**
 * Find the closest predefined filter color to an RGB value
 */
function findClosestFilterColor(rgb: number[]): string {
  let minDistance = Infinity;
  let closestColor = FILTER_COLORS[0].name;

  for (const color of FILTER_COLORS) {
    const distance = colorDistance(rgb, color.rgb);
    if (distance < minDistance) {
      minDistance = distance;
      closestColor = color.name;
    }
  }

  return closestColor;
}

/**
 * Extract dominant color from base64 image string
 */
export async function extractDominantColor(base64Image: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = () => {
      // Create canvas to analyze the image
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        resolve('blue'); // Default fallback
        return;
      }

      // Resize to smaller dimensions for faster processing
      const maxSize = 100;
      const scale = Math.min(maxSize / img.width, maxSize / img.height);
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;

      // Draw image
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // Get image data
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      // Count color frequencies (simplified color quantization)
      const colorCounts: { [key: string]: number } = {};
      
      // Sample every few pixels for performance
      const step = 4;
      for (let i = 0; i < data.length; i += step * 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const a = data[i + 3];

        // Skip transparent or near-transparent pixels
        if (a < 128) continue;

        // Skip very light (near-white) and very dark (near-black) pixels
        const brightness = (r + g + b) / 3;
        if (brightness > 240 || brightness < 15) continue;

        // Quantize color to reduce variation
        const quantizedR = Math.round(r / 32) * 32;
        const quantizedG = Math.round(g / 32) * 32;
        const quantizedB = Math.round(b / 32) * 32;

        const colorKey = `${quantizedR},${quantizedG},${quantizedB}`;
        colorCounts[colorKey] = (colorCounts[colorKey] || 0) + 1;
      }

      // Find most common color
      let maxCount = 0;
      let dominantRGB = [128, 128, 128]; // Default gray

      for (const [colorKey, count] of Object.entries(colorCounts)) {
        if (count > maxCount) {
          maxCount = count;
          dominantRGB = colorKey.split(',').map(Number);
        }
      }

      // Map to closest filter color
      const filterColor = findClosestFilterColor(dominantRGB);
      resolve(filterColor);
    };

    img.onerror = () => {
      console.error('Failed to load image for color extraction');
      resolve('blue'); // Default fallback
    };

    img.crossOrigin = 'anonymous'; // Handle CORS
    img.src = base64Image;
  });
}
