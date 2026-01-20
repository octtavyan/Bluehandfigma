import React from 'react';
import { Link } from 'react-router';

interface ProductCardProps {
  product: any; // Can be Product or Painting
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  // Check if it's a painting from CMS (has 'sizes' array) or old product format
  const isPainting = product.sizes && Array.isArray(product.sizes);
  
  // Use medium quality for list view (better quality, still optimized)
  const imageUrl = isPainting 
    ? (product.imageUrls?.medium || product.imageUrl || product.image)
    : product.image;
  const title = isPainting ? product.name : product.title;
  const minPrice = isPainting 
    ? Math.min(...product.sizes.map((s: any) => s.price))
    : product.price;
  
  return (
    <Link
      to={`/product/${product.id}`}
      className="group block bg-white rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300 border border-gray-200"
    >
      <div className="aspect-[3/4] overflow-hidden bg-gray-100">
        <img
          src={imageUrl}
          alt={title}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      {/* Mobile: Show minimal info */}
      <div className="p-2 sm:p-4">
        <h3 className="text-gray-900 mb-1 line-clamp-1 sm:line-clamp-2 text-xs sm:text-base">{title}</h3>
        <p className="text-[10px] sm:text-xs text-gray-400 mb-1">ID: {product.id}</p>
        {/* Hide subcategory on mobile */}
        {isPainting && product.subcategory && (
          <p className="text-xs sm:text-sm text-gray-500 mb-2 hidden sm:block">{product.subcategory}</p>
        )}
        <div className="flex items-center justify-between">
          <span className="text-[#6994FF] text-xs sm:text-base">de la {minPrice.toFixed(2)} lei</span>
        </div>
      </div>
    </Link>
  );
};