import React, { useState } from 'react';
import { X, Plus, Trash2, Upload } from 'lucide-react';
import { useAdmin, CategoryData, SubcategoryData } from '../../context/AdminContext';
import { SizeSelectorTiles } from '../SizeSelectorTiles';

interface AddPaintingModalProps {
  onClose: () => void;
  categories: CategoryData[];
  subcategories: SubcategoryData[];
  showNewCategoryInput: boolean;
  newCategory: string;
  setShowNewCategoryInput: (show: boolean) => void;
  setNewCategory: (value: string) => void;
  showNewSubcategoryInput: boolean;
  newSubcategory: string;
  setShowNewSubcategoryInput: (show: boolean) => void;
  setNewSubcategory: (value: string) => void;
}

interface FrameType {
  id: string;
  name: string;
  order: number;
}

export const AddPaintingModal: React.FC<AddPaintingModalProps> = ({
  onClose,
  categories,
  subcategories,
  showNewCategoryInput,
  newCategory,
  setShowNewCategoryInput,
  setNewCategory,
  showNewSubcategoryInput,
  newSubcategory,
  setShowNewSubcategoryInput,
  setNewSubcategory
}) => {
  const { addPainting, addCategory, addSubcategory, sizes, frameTypes: adminFrameTypes } = useAdmin();
  // Map admin frame types to the local interface format
  const frameTypes = adminFrameTypes.filter(f => f.isActive).map(f => ({
    id: f.id,
    name: f.name,
    order: f.order
  }));
  
  const initialFormData = {
    title: '',
    category: '',
    subcategory: '',
    description: '',
    image: '',
    discount: 0,
    isBestseller: false,
    isActive: true,
    orientation: 'portrait' as 'portrait' | 'landscape' | 'square',
    dominantColor: 'Albastru',
    availableSizes: [] as string[], // SIMPLIFIED: Just array of size IDs
    printTypes: [] as ('Print Hartie' | 'Print Canvas')[],
    frameTypesByPrintType: {
      'Print Hartie': [] as string[],
      'Print Canvas': [] as string[]
    }
  };

  const [formData, setFormData] = useState(initialFormData);

  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // Check if form has changes
  const hasChanges = JSON.stringify(formData) !== JSON.stringify(initialFormData);

  // Handle outside click
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      if (hasChanges) {
        if (window.confirm('Aveți modificări nesalvate. Doriți să închideți fără a salva?')) {
          onClose();
        }
      } else {
        onClose();
      }
    }
  };

  // Handle ESC key
  React.useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (hasChanges) {
          if (window.confirm('Aveți modificări nesalvate. Doriți să închideți fără a salva?')) {
            onClose();
          }
        } else {
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [hasChanges, onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.category || !formData.image) {
      alert('Vă rugăm să completați toate câmpurile obligatorii');
      return;
    }

    if (formData.printTypes.length === 0) {
      alert('Vă rugăm să selectați cel puțin un tip de print');
      return;
    }

    if (formData.availableSizes.length === 0) {
      alert('Vă rugăm să adăugați cel puțin o dimensiune');
      return;
    }

    // Calculate base price from minimum size price
    const basePrice = Math.min(...formData.availableSizes.map(sizeId => {
      const size = sizes.find(s => s.id === sizeId);
      return size ? size.price : 0;
    }));

    addPainting({
      ...formData,
      price: basePrice,
      stock: 0
    });
    
    onClose();
  };

  const handleAddCategory = async () => {
    if (newCategory.trim()) {
      await addCategory(newCategory.trim());
      setFormData({ ...formData, category: newCategory.trim() });
      setNewCategory('');
      setShowNewCategoryInput(false);
    }
  };

  const handleAddSubcategory = async () => {
    if (newSubcategory.trim()) {
      await addSubcategory(newSubcategory.trim());
      setFormData({ ...formData, subcategory: newSubcategory.trim() });
      setNewSubcategory('');
      setShowNewSubcategoryInput(false);
    }
  };

  const handleAddSize = () => {
    if (selectedSizeId && sizePrice) {
      const selectedSize = sizes.find(size => size.id === selectedSizeId);
      if (!selectedSize) return;
      
      // Reverse dimensions if landscape orientation
      const isLandscape = formData.orientation === 'landscape';
      const sizeName = isLandscape 
        ? `${selectedSize.height}×${selectedSize.width} cm`
        : `${selectedSize.width}×${selectedSize.height} cm`;
      
      const sizeToAdd: PaintingSize = {
        sizeId: selectedSizeId,
        sizeName: sizeName,
        price: parseFloat(sizePrice)
      };
      
      setFormData({
        ...formData,
        sizes: [...formData.sizes, sizeToAdd]
      });
      
      setSelectedSizeId('');
      setSizePrice('');
    }
  };

  const handleRemoveSize = (index: number) => {
    setFormData({
      ...formData,
      sizes: formData.sizes.filter((_, i) => i !== index)
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const imageUrl = event.target?.result as string;
      setFormData({ ...formData, image: imageUrl });
      setIsUploadingImage(false);
    };
    reader.onerror = () => {
      alert('Eroare la încărcarea imaginii');
      setIsUploadingImage(false);
    };
    reader.readAsDataURL(file);
  };

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

  return (
    <div className="fixed inset-0 bg-black/30 flex items-start sm:items-center justify-center z-50 overflow-y-auto" onClick={handleBackdropClick}>
      <div className="bg-white rounded-lg w-full max-w-4xl m-4 my-8 shadow-2xl flex flex-col max-h-[calc(100vh-2rem)]">
        {/* Fixed Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 flex-shrink-0">
          <h3 className="text-lg sm:text-xl text-gray-900">Adaugă Print Nou</h3>
          <button onClick={onClose} className="p-2 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto overflow-x-hidden flex-1 p-4 sm:p-6">
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6 pb-4">
            {/* Title */}
            <div>
              <label className="block text-sm text-gray-700 mb-2">Titlu *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                placeholder="Ex: Peisaj de Munte"
                required
              />
            </div>

            {/* Category and Subcategory */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-700 mb-2">Categorie *</label>
                {!showNewCategoryInput ? (
                  <div className="flex gap-2">
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                      required
                    >
                      <option value="">Selectează categorie</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.name}>{cat.name}</option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => setShowNewCategoryInput(true)}
                      className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                      placeholder="Nume categorie nouă"
                    />
                    <button
                      type="button"
                      onClick={handleAddCategory}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      Adaugă
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowNewCategoryInput(false)}
                      className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-2">Stil</label>
                {!showNewSubcategoryInput ? (
                  <div className="flex gap-2">
                    <select
                      value={formData.subcategory}
                      onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
                      className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                    >
                      <option value="">Selectează stil</option>
                      {subcategories.map((sub) => (
                        <option key={sub.id} value={sub.name}>{sub.name}</option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => setShowNewSubcategoryInput(true)}
                      className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newSubcategory}
                      onChange={(e) => setNewSubcategory(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddSubcategory();
                        }
                      }}
                      placeholder="Stil nou..."
                      className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleAddSubcategory}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      Adaugă
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowNewSubcategoryInput(false)}
                      className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm text-gray-700 mb-2">Descriere</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                rows={3}
                placeholder="Descriere tablou..."
              />
            </div>

            {/* Image URL */}
            <div>
              <label className="block text-sm text-gray-700 mb-2">URL Imagine *</label>
              <div className="flex gap-3 mb-3">
                <input
                  type="url"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  placeholder="https://..."
                  required
                />
                <label className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors cursor-pointer flex items-center gap-2">
                  <Upload className="w-5 h-5" />
                  <span>{isUploadingImage ? 'Se încarcă...' : 'Încarcă'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={isUploadingImage}
                  />
                </label>
              </div>
              {formData.image && (
                <div className="mt-3 relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={formData.image}
                    alt="Preview"
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23ddd" width="100" height="100"/%3E%3Ctext fill="%23999" x="50%" y="50%" text-anchor="middle" dy=".3em"%3EEroare%3C/text%3E%3C/svg%3E';
                    }}
                  />
                </div>
              )}
            </div>

            {/* Print Types Section */}
            <div>
              <label className="block text-sm text-gray-700 mb-2">Tipuri de Print *</label>
              <div className="grid grid-cols-2 gap-3">
                {['Print Canvas', 'Print Hartie'].map((type) => {
                  const isSelected = formData.printTypes.includes(type as 'Print Canvas' | 'Print Hartie');
                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => {
                        const newPrintTypes = isSelected
                          ? formData.printTypes.filter(t => t !== type)
                          : [...formData.printTypes, type as 'Print Canvas' | 'Print Hartie'];
                        
                        // Auto-populate all frame types for the selected print types
                        const allFrameTypeIds = frameTypes.map(ft => ft.id);
                        const newFrameTypesByPrintType: Record<string, string[]> = {};
                        newPrintTypes.forEach(printType => {
                          newFrameTypesByPrintType[printType] = allFrameTypeIds;
                        });
                        
                        setFormData({
                          ...formData,
                          printTypes: newPrintTypes,
                          frameTypesByPrintType: newFrameTypesByPrintType
                        });
                      }}
                      className={`px-4 py-3 border-2 rounded-lg transition-all text-center ${
                        isSelected
                          ? 'border-[#6994FF] bg-[#6994FF]/5 text-[#6994FF]'
                          : 'border-gray-200 bg-white hover:border-gray-300 text-gray-700'
                      }`}
                    >
                      <div className="font-medium">{type}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Orientation Selector */}
            <div>
              <label className="block text-sm text-gray-700 mb-2">Orientare *</label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, orientation: 'portrait' })}
                  className={`flex flex-col items-center justify-center p-4 border-2 rounded-lg transition-colors ${
                    formData.orientation === 'portrait'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-300 hover:border-gray-400 text-gray-700'
                  }`}
                >
                  <div className="w-12 h-16 border-2 border-current rounded mb-2"></div>
                  <span className="text-sm font-medium">Portrait</span>
                  <span className="text-xs text-gray-500">(vertical)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, orientation: 'landscape' })}
                  className={`flex flex-col items-center justify-center p-4 border-2 rounded-lg transition-colors ${
                    formData.orientation === 'landscape'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-300 hover:border-gray-400 text-gray-700'
                  }`}
                >
                  <div className="w-16 h-12 border-2 border-current rounded mb-2"></div>
                  <span className="text-sm font-medium">Landscape</span>
                  <span className="text-xs text-gray-500">(orizontal)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, orientation: 'square' })}
                  className={`flex flex-col items-center justify-center p-4 border-2 rounded-lg transition-colors ${
                    formData.orientation === 'square'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-300 hover:border-gray-400 text-gray-700'
                  }`}
                >
                  <div className="w-14 h-14 border-2 border-current rounded mb-2"></div>
                  <span className="text-sm font-medium">Square</span>
                  <span className="text-xs text-gray-500">(pătrat)</span>
                </button>
              </div>
            </div>

            {/* Color Selector */}
            <div>
              <label className="block text-sm text-gray-700 mb-2">Culoare Dominantă *</label>
              <div className="grid grid-cols-6 gap-3">
                {colorOptions.map((colorOption) => (
                  <button
                    key={colorOption.name}
                    type="button"
                    onClick={() => setFormData({ ...formData, dominantColor: colorOption.name })}
                    className={`flex flex-col items-center gap-2 p-3 border-2 rounded-lg transition-all ${
                      formData.dominantColor === colorOption.name
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-400'
                    }`}
                  >
                    <div
                      className="w-10 h-10 rounded-full border-2 border-gray-300"
                      style={{ backgroundColor: colorOption.color }}
                    ></div>
                    <span className="text-xs text-gray-700">{colorOption.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Sizes Section */}
            <div>
              <label className="block text-sm text-gray-700 mb-2">Dimensiuni Disponibile *</label>
              
              {/* All Dimensions Grid - Shows all sizes with default prices */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                {sizes.filter(s => s.isActive).map(size => {
                  // Reverse dimensions if landscape orientation
                  const isLandscape = formData.orientation === 'landscape';
                  const displayText = isLandscape 
                    ? `${size.height}×${size.width} cm`
                    : `${size.width}×${size.height} cm`;
                  const isSelected = formData.availableSizes.includes(size.id);
                  
                  return (
                    <button
                      key={size.id}
                      type="button"
                      onClick={() => {
                        if (isSelected) {
                          setFormData({
                            ...formData,
                            availableSizes: formData.availableSizes.filter(s => s !== size.id)
                          });
                        } else {
                          setFormData({
                            ...formData,
                            availableSizes: [...formData.availableSizes, size.id]
                          });
                        }
                      }}
                      className={`px-3 py-4 border-2 rounded-lg transition-all text-center ${
                        isSelected
                          ? 'border-[#6994FF] bg-[#6994FF]/5'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      <div className={`text-sm mb-1 ${isSelected ? 'text-[#6994FF]' : 'text-gray-900'}`}>
                        {displayText}
                      </div>
                      <div className={`text-xs ${isSelected ? 'text-[#6994FF]' : 'text-gray-600'}`}>
                        {size.price.toFixed(2)} lei
                      </div>
                    </button>
                  );
                })}
              </div>

              <p className="text-xs text-gray-500 mt-3">
                Click pe o dimensiune pentru a o selecta/deselecta. Prețurile și discounturile sunt gestionate în secțiunea Dimensiuni.
              </p>
            </div>

            {/* Checkboxes */}
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isBestseller}
                  onChange={(e) => setFormData({ ...formData, isBestseller: e.target.checked })}
                  className="w-4 h-4 text-blue-500 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                />
                <span className="text-sm text-gray-700">Bestseller</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 text-blue-500 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                />
                <span className="text-sm text-gray-700">Activ</span>
              </label>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Anulează
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Adaugă Tablou
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};