import { useAdmin } from '../context/AdminContext';

export interface SizeOption {
  width: number;
  height: number;
  price: number;
  discount: number;
  finalPrice: number;
}

export const useSizes = () => {
  const { sizes } = useAdmin();

  // Get only active sizes
  const activeSizes = sizes.filter(size => size.isActive);

  // Convert to size options with final price calculated
  const sizeOptions: SizeOption[] = activeSizes.map(size => ({
    width: size.width,
    height: size.height,
    price: size.price,
    discount: size.discount,
    finalPrice: size.discount > 0 ? size.price * (1 - size.discount / 100) : size.price,
  }));

  // Sort by area (width * height)
  sizeOptions.sort((a, b) => (a.width * a.height) - (b.width * b.height));

  // Get price for specific dimensions
  const getPriceForSize = (width: number, height: number): number | undefined => {
    const size = activeSizes.find(s => s.width === width && s.height === height);
    if (!size) return undefined;
    return size.discount > 0 ? size.price * (1 - size.discount / 100) : size.price;
  };

  // Get size details by dimensions
  const getSizeDetails = (width: number, height: number): SizeOption | undefined => {
    return sizeOptions.find(s => s.width === width && s.height === height);
  };

  return {
    sizeOptions,
    getPriceForSize,
    getSizeDetails,
  };
};
