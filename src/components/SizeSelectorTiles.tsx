import React from 'react';
import { CanvasSize } from '../context/AdminContext';

interface SizeSelectorTilesProps {
  sizes: CanvasSize[];
  selectedSizeId: string;
  onSizeSelect: (sizeId: string) => void;
  showPrices?: boolean;
  orientation?: 'portrait' | 'landscape' | 'square';
}

export const SizeSelectorTiles: React.FC<SizeSelectorTilesProps> = ({
  sizes,
  selectedSizeId,
  onSizeSelect,
  showPrices = true,
  orientation
}) => {
  // Helper function to get display dimensions based on orientation
  const getDisplayDimensions = (width: number, height: number, orientation?: 'portrait' | 'landscape' | 'square') => {
    if (!orientation) {
      return `${width}×${height} cm`;
    }

    // For portrait orientation, ensure height > width
    if (orientation === 'portrait') {
      if (height > width) {
        return `${width}×${height} cm`;
      } else {
        return `${height}×${width} cm`;
      }
    }
    
    // For landscape orientation, ensure width > height
    if (orientation === 'landscape') {
      if (width > height) {
        return `${width}×${height} cm`;
      } else {
        return `${height}×${width} cm`;
      }
    }
    
    // For square orientation, both dimensions should be equal
    if (orientation === 'square') {
      return `${width}×${width} cm`;
    }

    return `${width}×${height} cm`;
  };

  const activeSizes = sizes.filter(s => s.isActive);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {activeSizes.map(size => {
        const sizePrice = showPrices ? size.price * (1 - size.discount / 100) : null;
        const isSelected = selectedSizeId === size.id;
        const displayText = getDisplayDimensions(size.width, size.height, orientation);
        
        return (
          <button
            key={size.id}
            type="button"
            onClick={() => onSizeSelect(size.id)}
            className={`px-3 py-3 border-2 rounded-lg transition-all ${
              isSelected
                ? 'border-[#6994FF] bg-[#6994FF]/10 shadow-md'
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <div className="text-sm text-gray-900">
              {displayText}
            </div>
            {showPrices && sizePrice !== null && (
              <div className="flex items-center justify-center gap-1 mt-1">
                <span className={`text-sm ${isSelected ? 'text-[#6994FF]' : 'text-gray-600'}`}>
                  {sizePrice.toFixed(2)} lei
                </span>
                {size.discount > 0 && (
                  <span className="text-xs text-red-500">
                    -{size.discount}%
                  </span>
                )}
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
};
