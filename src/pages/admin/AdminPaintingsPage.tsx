import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Edit2, Trash2, Package, Eye, EyeOff, Star, Grid, List, Download, Copy, Image as ImageIcon, FileText, Frame } from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { useAdmin, CanvasPainting } from '../../context/AdminContext';
import { AddPaintingModal } from '../../components/admin/AddPaintingModal';
import { EditPaintingModal } from '../../components/admin/EditPaintingModal';
import { CacheService, CACHE_KEYS } from '../../lib/cacheService';

export const AdminPaintingsPage: React.FC = () => {
  const { 
    paintings, 
    categories, 
    subcategories,
    deletePainting, 
    updatePainting,
    addPainting,
    addCategory,
    addSubcategory,
    currentUser,
    refreshData
  } = useAdmin();
  
  // Color options matching the modal
  const colorOptions = [
    { name: 'Roșu', color: '#EF4444' },
    { name: 'Portocaliu', color: '#F97316' },
    { name: 'Galben', color: '#EAB308' },
    { name: 'Verde', color: '#22C55E' },
    { name: 'Albastru', color: '#3B82F6' },
    { name: 'Mov', color: '#A855F7' },
    { name: 'Roz', color: '#EC4899' },
    { name: 'Maro', color: '#92400E' },
    { name: 'Negru', color: '#000000' },
    { name: 'Alb', color: '#FFFFFF' },
    { name: 'Gri', color: '#6B7280' },
    { name: 'Bej', color: '#D4C5B9' },
  ];
  
  // Helper function to get color hex from name
  const getColorHex = (colorName?: string) => {
    const colorOption = colorOptions.find(c => c.name === colorName);
    return colorOption?.color || '#E5E7EB'; // Default to gray if not found
  };
  
  // Force fresh data load on mount (clear cache)
  useEffect(() => {
    const loadFreshData = async () => {
      CacheService.invalidate(CACHE_KEYS.PAINTINGS);
      await refreshData();
    };
    loadFreshData();
  }, []); // Run once on mount

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingPainting, setEditingPainting] = useState<CanvasPainting | null>(null);
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [showNewSubcategoryInput, setShowNewSubcategoryInput] = useState(false);
  const [newSubcategory, setNewSubcategory] = useState('');

  const handleOpenAddModal = () => {
    setIsAddModalOpen(true);
  };

  const handleCloseAddModal = () => {
    setIsAddModalOpen(false);
    setShowNewCategoryInput(false);
    setNewCategory('');
    setShowNewSubcategoryInput(false);
    setNewSubcategory('');
  };

  const handleOpenEditModal = (painting: CanvasPainting) => {
    setEditingPainting(painting);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditingPainting(null);
    setShowNewCategoryInput(false);
    setNewCategory('');
    setShowNewSubcategoryInput(false);
    setNewSubcategory('');
  };

  const handleDelete = (paintingId: string) => {
    if (window.confirm('Sigur doriți să ștergeți acest tablou?')) {
      deletePainting(paintingId);
    }
  };

  const handleToggleBestseller = (paintingId: string) => {
    updatePainting(paintingId, { isBestseller: !paintings.find(p => p.id === paintingId)?.isBestseller });
  };

  const handleToggleActive = (paintingId: string) => {
    updatePainting(paintingId, { isActive: !paintings.find(p => p.id === paintingId)?.isActive });
  };

  const handleDuplicate = (paintingId: string) => {
    const painting = paintings.find(p => p.id === paintingId);
    if (painting) {
      // Calculate base price from minimum size price
      const basePrice = painting.sizes && painting.sizes.length > 0 
        ? Math.min(...painting.sizes.map((s: any) => s.price))
        : painting.price || 0;

      // Create a duplicate with "(Copy)" appended to the title
      addPainting({
        title: `${painting.title} (Copy)`,
        category: painting.category,
        subcategory: painting.subcategory || '',
        description: painting.description || '',
        image: painting.image,
        sizes: painting.sizes || [],
        discount: painting.discount || 0,
        isBestseller: false, // Don't copy bestseller status
        isActive: false, // Set as inactive by default
        orientation: painting.orientation || 'portrait',
        dominantColor: painting.dominantColor || '',
        price: basePrice,
        createdAt: new Date().toISOString()
      });
    }
  };

  // Filter paintings
  const filteredPaintings = paintings.filter(painting => {
    const matchesSearch = painting.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         painting.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || painting.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-gray-900 mb-2">Tablouri Canvas</h1>
            <p className="text-gray-600">Gestionează colecția de tablouri canvas</p>
          </div>
          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-2 px-4 py-2 bg-[#86C2FF] text-white rounded-lg hover:bg-[#6FB0EE] transition-colors"
          >
            <Plus className="w-5 h-5" />
            Adaugă Tablou
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Caută tablouri..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#86C2FF] focus:border-transparent"
              />
            </div>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#86C2FF] focus:border-transparent"
            >
              <option value="all">Toate Categoriile</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.name}>{cat.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Paintings Grid */}
        {filteredPaintings.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <ImageIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-gray-900 mb-2">Niciun tablou găsit</h3>
            <p className="text-gray-600 mb-6">
              {searchQuery || selectedCategory !== 'all'
                ? 'Încercați să schimbați filtrele de căutare'
                : 'Începeți prin a adăuga primul tablou'}
            </p>
            {!searchQuery && selectedCategory === 'all' && (
              <button
                onClick={handleOpenAddModal}
                className="px-6 py-2 bg-[#86C2FF] text-white rounded-lg hover:bg-[#6FB0EE] transition-colors"
              >
                Adaugă Primul Tablou
              </button>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-6 py-3 text-xs text-gray-600 uppercase tracking-wider">Imagine</th>
                    <th className="text-left px-6 py-3 text-xs text-gray-600 uppercase tracking-wider">Titlu</th>
                    <th className="text-left px-6 py-3 text-xs text-gray-600 uppercase tracking-wider">Categorie</th>
                    <th className="text-left px-6 py-3 text-xs text-gray-600 uppercase tracking-wider">Tipuri de Print</th>
                    <th className="text-left px-6 py-3 text-xs text-gray-600 uppercase tracking-wider">Culoare</th>
                    <th className="text-left px-6 py-3 text-xs text-gray-600 uppercase tracking-wider">Status</th>
                    <th className="text-left px-6 py-3 text-xs text-gray-600 uppercase tracking-wider">Acțiuni</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredPaintings.map((painting) => {
                    // Use availableSizes instead of sizes
                    const sizeCount = painting.availableSizes?.length || 0;
                    
                    return (
                      <tr key={painting.id} className="hover:bg-gray-50 transition-colors">
                        {/* Image */}
                        <td className="px-6 py-4">
                          <div className="relative w-20 h-20 bg-gray-100 rounded overflow-hidden">
                            <img
                              src={painting.imageUrls?.thumbnail || painting.image}
                              alt={painting.title}
                              loading="lazy"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </td>

                        {/* Title */}
                        <td className="px-6 py-4">
                          <div>
                            <h3 className="text-sm text-gray-900 mb-1">{painting.title}</h3>
                            <p className="text-xs text-gray-500 line-clamp-2">{painting.description || 'Stingerea superiror in oras ginirea acestora si apoi'}</p>
                          </div>
                        </td>

                        {/* Category */}
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-1">
                            <span className="text-sm text-blue-600">{painting.category}</span>
                            {painting.subcategory && (
                              <span className="text-xs text-gray-500">{painting.subcategory}</span>
                            )}
                          </div>
                        </td>

                        {/* Print Types */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {/* Canvas Icon */}
                            <div
                              className={`flex items-center gap-1 ${ 
                                painting.printTypes?.includes('Print Canvas')
                                  ? 'text-blue-600'
                                  : 'text-gray-300'
                              }`}
                              title="Print Canvas"
                            >
                              <Frame className="w-5 h-5" />
                            </div>
                            
                            {/* Hartie (Paper) Icon */}
                            <div
                              className={`flex items-center gap-1 ${ 
                                painting.printTypes?.includes('Print Hartie')
                                  ? 'text-amber-600'
                                  : 'text-gray-300'
                              }`}
                              title="Print Hartie"
                            >
                              <FileText className="w-5 h-5" />
                            </div>
                          </div>
                        </td>

                        {/* Color */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-4 h-4 rounded-full"
                              style={{ backgroundColor: getColorHex(painting.dominantColor) }}
                            />
                            <span className="text-sm text-gray-500">{painting.dominantColor || 'Necunoscut'}</span>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs ${
                            painting.isActive 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {painting.isActive ? 'Activ' : 'Inactiv'}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                const link = document.createElement('a');
                                link.href = painting.imageUrls?.original || painting.image;
                                link.download = `${painting.title}-${painting.id}.jpg`;
                                link.click();
                              }}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Descarcă"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                            
                            <button
                              onClick={() => handleToggleBestseller(painting.id)}
                              className={`p-2 rounded-lg transition-colors ${
                                painting.isBestseller
                                  ? 'text-yellow-600 hover:bg-yellow-50'
                                  : 'text-gray-400 hover:bg-gray-50'
                              }`}
                              title="Bestseller"
                            >
                              <Star className={`w-4 h-4 ${painting.isBestseller ? 'fill-current' : ''}`} />
                            </button>

                            <button
                              onClick={() => handleToggleActive(painting.id)}
                              className={`p-2 rounded-lg transition-colors ${
                                painting.isActive
                                  ? 'text-green-600 hover:bg-green-50'
                                  : 'text-gray-400 hover:bg-gray-50'
                              }`}
                              title="Activează/Dezactivează"
                            >
                              {painting.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                            </button>

                            <button
                              onClick={() => handleDuplicate(painting.id)}
                              className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                              title="Duplică"
                            >
                              <Copy className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => handleOpenEditModal(painting)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Editează"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => handleDelete(painting.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Șterge"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-3">
              {filteredPaintings.map((painting) => {
                const sizeCount = painting.availableSizes?.length || 0;

                return (
                  <div key={painting.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                    <div className="flex gap-3 p-3">
                      {/* Larger Image */}
                      <div className="relative w-24 h-24 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                        <img
                          src={painting.imageUrls?.thumbnail || painting.image}
                          alt={painting.title}
                          loading="lazy"
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm text-gray-900 mb-1 truncate">{painting.title}</h3>
                        <p className="text-xs text-gray-500 line-clamp-2 mb-2">{painting.description || 'Fără descriere'}</p>
                        
                        {/* Info Grid */}
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-blue-600">{painting.category}</span>
                            {painting.subcategory && (
                              <span className="text-gray-500 ml-1">/ {painting.subcategory}</span>
                            )}
                          </div>
                          
                          {/* Print Types Icons */}
                          <div className="flex items-center gap-2">
                            <Frame
                              className={`w-4 h-4 ${ 
                                painting.printTypes?.includes('Print Canvas')
                                  ? 'text-blue-600'
                                  : 'text-gray-300'
                              }`}
                              title="Print Canvas"
                            />
                            <FileText
                              className={`w-4 h-4 ${ 
                                painting.printTypes?.includes('Print Hartie')
                                  ? 'text-amber-600'
                                  : 'text-gray-300'
                              }`}
                              title="Print Hartie"
                            />
                          </div>
                          
                          {/* Color */}
                          <div className="flex items-center gap-1.5">
                            <div
                              className="w-3 h-3 rounded-full flex-shrink-0"
                              style={{ backgroundColor: getColorHex(painting.dominantColor) }}
                            />
                            <span className="text-gray-500 truncate">{painting.dominantColor || 'N/A'}</span>
                          </div>
                          
                          {/* Status */}
                          <div>
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${
                              painting.isActive 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {painting.isActive ? 'Activ' : 'Inactiv'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons - 2 Rows */}
                    <div className="border-t border-gray-100 p-2 bg-gray-50">
                      <div className="grid grid-cols-3 gap-1 mb-1">
                        <button
                          onClick={() => {
                            const link = document.createElement('a');
                            link.href = painting.imageUrls?.original || painting.image;
                            link.download = `${painting.title}-${painting.id}.jpg`;
                            link.click();
                          }}
                          className="flex items-center justify-center gap-1 px-2 py-1.5 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded transition-colors text-xs"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Descarcă</span>
                        </button>
                        
                        <button
                          onClick={() => handleToggleBestseller(painting.id)}
                          className={`flex items-center justify-center gap-1 px-2 py-1.5 rounded transition-colors text-xs ${
                            painting.isBestseller
                              ? 'text-yellow-700 bg-yellow-50 hover:bg-yellow-100'
                              : 'text-gray-600 bg-gray-100 hover:bg-gray-200'
                          }`}
                        >
                          <Star className={`w-3.5 h-3.5 ${painting.isBestseller ? 'fill-current' : ''}`} />
                          <span>Best</span>
                        </button>

                        <button
                          onClick={() => handleToggleActive(painting.id)}
                          className={`flex items-center justify-center gap-1 px-2 py-1.5 rounded transition-colors text-xs ${
                            painting.isActive
                              ? 'text-green-700 bg-green-50 hover:bg-green-100'
                              : 'text-gray-600 bg-gray-100 hover:bg-gray-200'
                          }`}
                        >
                          {painting.isActive ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                          <span>{painting.isActive ? 'Activ' : 'Inactiv'}</span>
                        </button>
                      </div>

                      <div className="grid grid-cols-3 gap-1">
                        <button
                          onClick={() => handleDuplicate(painting.id)}
                          className="flex items-center justify-center gap-1 px-2 py-1.5 text-purple-600 bg-purple-50 hover:bg-purple-100 rounded transition-colors text-xs"
                        >
                          <Copy className="w-3.5 h-3.5" />
                          <span>Duplică</span>
                        </button>

                        <button
                          onClick={() => handleOpenEditModal(painting)}
                          className="flex items-center justify-center gap-1 px-2 py-1.5 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded transition-colors text-xs"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          <span>Editează</span>
                        </button>

                        <button
                          onClick={() => handleDelete(painting.id)}
                          className="flex items-center justify-center gap-1 px-2 py-1.5 text-red-600 bg-red-50 hover:bg-red-100 rounded transition-colors text-xs"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Șterge</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Add Modal */}
        {isAddModalOpen && (
          <AddPaintingModal
            onClose={handleCloseAddModal}
            categories={categories}
            subcategories={subcategories}
            showNewCategoryInput={showNewCategoryInput}
            newCategory={newCategory}
            setShowNewCategoryInput={setShowNewCategoryInput}
            setNewCategory={setNewCategory}
            showNewSubcategoryInput={showNewSubcategoryInput}
            newSubcategory={newSubcategory}
            setShowNewSubcategoryInput={setShowNewSubcategoryInput}
            setNewSubcategory={setNewSubcategory}
          />
        )}

        {/* Edit Modal */}
        {isEditModalOpen && editingPainting && (
          <EditPaintingModal
            painting={editingPainting}
            onClose={handleCloseEditModal}
            categories={categories}
            subcategories={subcategories}
            showNewCategoryInput={showNewCategoryInput}
            newCategory={newCategory}
            setShowNewCategoryInput={setShowNewCategoryInput}
            setNewCategory={setNewCategory}
            showNewSubcategoryInput={showNewSubcategoryInput}
            newSubcategory={newSubcategory}
            setShowNewSubcategoryInput={setShowNewSubcategoryInput}
            setNewSubcategory={setNewSubcategory}
          />
        )}
      </div>
    </AdminLayout>
  );
};