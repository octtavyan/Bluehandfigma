// Image Optimization Statistics Badge
// Shows compression stats for optimized images in the CMS

import React from 'react';
import { ImageIcon, CheckCircle2, Zap } from 'lucide-react';

interface ImageOptimizationBadgeProps {
  hasOptimizedImages: boolean;
  className?: string;
}

export const ImageOptimizationBadge: React.FC<ImageOptimizationBadgeProps> = ({ 
  hasOptimizedImages, 
  className = '' 
}) => {
  if (!hasOptimizedImages) {
    return null;
  }

  return (
    <div className={`inline-flex items-center gap-1.5 px-2 py-1 bg-green-50 text-green-700 rounded text-xs ${className}`}>
      <Zap className="w-3 h-3" />
      <span>Optimizat</span>
    </div>
  );
};

interface OptimizationStatsProps {
  totalImages: number;
  optimizedImages: number;
  estimatedSavings?: number; // in MB
}

export const OptimizationStats: React.FC<OptimizationStatsProps> = ({
  totalImages,
  optimizedImages,
  estimatedSavings = 0
}) => {
  const optimizationPercentage = totalImages > 0 
    ? Math.round((optimizedImages / totalImages) * 100)
    : 0;

  return (
    <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-green-500 rounded-lg">
          <ImageIcon className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-medium text-gray-900 mb-2">
            Optimizare Imagini
          </h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Imagini optimizate:</span>
              <span className="font-medium text-gray-900">
                {optimizedImages} / {totalImages}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${optimizationPercentage}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-green-600 font-medium">
                {optimizationPercentage}% optimizat
              </span>
              {estimatedSavings > 0 && (
                <span className="text-gray-500">
                  ~{estimatedSavings.toFixed(1)} MB economisiți
                </span>
              )}
            </div>
          </div>
          
          {optimizationPercentage < 100 && (
            <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
              <p className="flex items-center gap-1">
                <span>💡</span>
                <span>
                  Încarcă din nou imaginile vechi pentru a le optimiza automat
                </span>
              </p>
            </div>
          )}
          
          {optimizationPercentage === 100 && (
            <div className="mt-3 flex items-center gap-1.5 text-xs text-green-700">
              <CheckCircle2 className="w-4 h-4" />
              <span>Toate imaginile sunt optimizate!</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const OptimizationTooltip: React.FC = () => {
  return (
    <div className="text-xs text-gray-600 space-y-1">
      <p className="font-medium text-gray-900 mb-2">Optimizare Automată:</p>
      <ul className="space-y-1 list-disc list-inside">
        <li>Thumbnail (400px) pentru liste</li>
        <li>Medium (1200px) pentru detalii</li>
        <li>Original comprimat pentru download</li>
      </ul>
      <p className="mt-2 text-green-600 font-medium">
        → 70-90% mai puțin trafic
      </p>
    </div>
  );
};
