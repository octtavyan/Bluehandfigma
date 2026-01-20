import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router';
import { SlidersHorizontal } from 'lucide-react';
import { ProductCard } from '../components/ProductCard';

interface PaintingSize {
  sizeId: string;
  sizeName: string;
  price: number;
}

interface Painting {
  id: string;
  name: string;
  category: string;
  subcategory: string;
  description: string;
  imageUrl: string;
  sizes: PaintingSize[];
  createdAt: string;
}

export const ProductsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [sortBy, setSortBy] = useState('featured');
  const [showFilters, setShowFilters] = useState(false);
  const [paintings, setPaintings] = useState<Painting[]>([]);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('');

  const category = searchParams.get('category');
  const searchQuery = searchParams.get('search');

  useEffect(() => {
    loadPaintings();
  }, []);

  const loadPaintings = () => {
    const stored = localStorage.getItem('paintings');
    if (stored) {
      setPaintings(JSON.parse(stored));
    }
  };

  // Get unique categories and subcategories
  const categories = useMemo(() => {
    const cats = new Set(paintings.map(p => p.category));
    return Array.from(cats);
  }, [paintings]);

  const subcategories = useMemo(() => {
    const subs = new Set(paintings.map(p => p.subcategory));
    return Array.from(subs);
  }, [paintings]);

  const filteredProducts = useMemo(() => {
    let filtered = [...paintings];

    if (category) {
      filtered = filtered.filter(p => p.category.toLowerCase() === category.toLowerCase());
    }

    if (selectedSubcategory) {
      filtered = filtered.filter(p => p.subcategory === selectedSubcategory);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        p =>
          p.id.toLowerCase().includes(query) ||
          p.name.toLowerCase().includes(query) ||
          p.category.toLowerCase().includes(query) ||
          p.subcategory.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query)
      );
    }

    if (sortBy === 'price-asc') {
      filtered.sort((a, b) => {
        const minPriceA = Math.min(...a.sizes.map(s => s.price));
        const minPriceB = Math.min(...b.sizes.map(s => s.price));
        return minPriceA - minPriceB;
      });
    } else if (sortBy === 'price-desc') {
      filtered.sort((a, b) => {
        const maxPriceA = Math.max(...a.sizes.map(s => s.price));
        const maxPriceB = Math.max(...b.sizes.map(s => s.price));
        return maxPriceB - maxPriceA;
      });
    }

    return filtered;
  }, [paintings, category, searchQuery, sortBy, selectedSubcategory]);

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Category Tiles Section */}
        {!category && !searchQuery && (
          <div className="mb-12">
            <h2 className="text-2xl text-gray-900 mb-6">Descoperă pe Camere</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {[
                { name: 'Living', image: 'https://images.unsplash.com/photo-1667584523543-d1d9cc828a15?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBsaXZpbmclMjByb29tJTIwaW50ZXJpb3J8ZW58MXx8fHwxNzY1ODA1MTkyfDA&ixlib=rb-4.1.0&q=80&w=1080' },
                { name: 'Dormitor', image: 'https://images.unsplash.com/photo-1611095459865-47682ae3c41c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb3p5JTIwYmVkcm9vbSUyMGludGVyaW9yfGVufDF8fHx8MTc2NTcyMDYwMHww&ixlib=rb-4.1.0&q=80&w=1080' },
                { name: 'Sufragerie', image: 'https://images.unsplash.com/photo-1758977405163-f2595de08dfe?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbGVnYW50JTIwZGluaW5nJTIwcm9vbXxlbnwxfHx8fDE3NjU4MzI4MTl8MA&ixlib=rb-4.1.0&q=80&w=1080' },
                { name: 'Bucătărie', image: 'https://images.unsplash.com/photo-1610177534644-34d881503b83?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBraXRjaGVuJTIwaW50ZXJpb3J8ZW58MXx8fHwxNzY1NzIzNDA0fDA&ixlib=rb-4.1.0&q=80&w=1080' },
                { name: 'Birou', image: 'https://images.unsplash.com/photo-1614598389565-8d56eddd2f48?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxob21lJTIwb2ZmaWNlJTIwd29ya3NwYWNlfGVufDF8fHx8MTc2NTcyMDczMHww&ixlib=rb-4.1.0&q=80&w=1080' },
                { name: 'Baie', image: 'https://images.unsplash.com/photo-1595515106705-257fa2d62381?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBiYXRocm9vbSUyMGludGVyaW9yfGVufDF8fHx8MTc2NTc3MDgxNXww&ixlib=rb-4.1.0&q=80&w=1080' },
              ].map((cat) => (
                <button
                  key={cat.name}
                  onClick={() => setSelectedSubcategory(selectedSubcategory === cat.name ? '' : cat.name)}
                  className={`group relative overflow-hidden rounded-xl aspect-square transition-all ${
                    selectedSubcategory === cat.name 
                      ? 'ring-4 ring-yellow-500 shadow-xl' 
                      : 'hover:shadow-lg'
                  }`}
                >
                  <img
                    src={cat.image}
                    alt={cat.name}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <h3 className="text-white text-center">{cat.name}</h3>
                  </div>
                  {selectedSubcategory === cat.name && (
                    <div className="absolute top-2 right-2 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-gray-900 mb-2">
              {category ? category.charAt(0).toUpperCase() + category.slice(1) : 'Toate Produsele'}
            </h1>
            <p className="text-gray-600">{filteredProducts.length} {filteredProducts.length === 1 ? 'tablou găsit' : 'tablouri găsite'}</p>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span className="hidden sm:inline">Filtre</span>
            </button>

            <div className="relative">
              <label htmlFor="sort-select" className="sr-only">Sort by:</label>
              <select
                id="sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6994FF] bg-white hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <option value="featured">Recomandate</option>
                <option value="price-asc">Preț crescător</option>
                <option value="price-desc">Preț descrescător</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {showFilters && (
          <div className="bg-gray-50 rounded-lg p-6 mb-8">
            <h3 className="text-gray-900 mb-4">Filtre</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-gray-700 mb-2">Preț Minim</label>
                <input
                  type="number"
                  placeholder="0 lei"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Preț Maxim</label>
                <input
                  type="number"
                  placeholder="1000 lei"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Dimensiune</label>
                <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500">
                  <option value="">Toate dimensiunile</option>
                  <option value="30x40">30×40 cm</option>
                  <option value="40x60">40×60 cm</option>
                  <option value="60x80">60×80 cm</option>
                  <option value="80x120">80×120 cm</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {filteredProducts.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-xl text-gray-600">Nu am găsit produse care să corespundă criteriilor tale.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4 lg:gap-6">
            {filteredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        <div className="flex items-center justify-center mt-12 space-x-2">
          <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            Anterior
          </button>
          <button className="px-4 py-2 bg-yellow-500 text-white rounded-lg">1</button>
          <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            2
          </button>
          <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            3
          </button>
          <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            Următorul
          </button>
        </div>
      </div>
    </div>
  );
};