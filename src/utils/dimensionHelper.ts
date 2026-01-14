/**
 * Helper to swap dimensions based on painting orientation
 */

export function getDisplayDimensions(
  width: number,
  height: number,
  orientation?: 'portrait' | 'landscape' | 'square'
): { width: number; height: number; displayText: string } {
  // If no orientation is specified or it's square, return as is
  if (!orientation || orientation === 'square' || width === height) {
    return {
      width,
      height,
      displayText: `${width}×${height} cm`
    };
  }

  // For portrait: ensure height > width
  if (orientation === 'portrait') {
    if (width > height) {
      // Swap dimensions
      return {
        width: height,
        height: width,
        displayText: `${height}×${width} cm`
      };
    }
    return {
      width,
      height,
      displayText: `${width}×${height} cm`
    };
  }

  // For landscape: ensure width > height
  if (orientation === 'landscape') {
    if (height > width) {
      // Swap dimensions
      return {
        width: height,
        height: width,
        displayText: `${height}×${width} cm`
      };
    }
    return {
      width,
      height,
      displayText: `${width}×${height} cm`
    };
  }

  // Default fallback
  return {
    width,
    height,
    displayText: `${width}×${height} cm`
  };
}

/**
 * Get orientation label text in Romanian
 */
export function getOrientationLabel(orientation?: 'portrait' | 'landscape' | 'square'): string {
  switch (orientation) {
    case 'portrait':
      return 'Portret (vertical)';
    case 'landscape':
      return 'Peisaj (orizontal)';
    case 'square':
      return 'Pătrat';
    default:
      return '';
  }
}
