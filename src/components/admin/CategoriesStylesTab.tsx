import React, { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { Tag, Plus, Pencil, Trash2, Palette } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

export const CategoriesStylesTab: React.FC = () => {
  const { categories, subcategories, addCategory, updateCategory, deleteCategory, addSubcategory, updateSubcategory, deleteSubcategory } = useAdmin();
  
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showStyleModal, setShowStyleModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [editingStyle, setEditingStyle] = useState<any>(null);
  const [categoryName, setCategoryName] = useState('');
  const [styleName, setStyleName] = useState('');

  // Sort categories and subcategories alphabetically
  const sortedCategories = [...categories].sort((a, b) => a.name.localeCompare(b.name, 'ro'));
  const sortedSubcategories = [...subcategories].sort((a, b) => a.name.localeCompare(b.name, 'ro'));

  // Category Management
  const handleOpenCategoryModal = (category?: any) => {
    if (category) {
      setEditingCategory(category);
      setCategoryName(category.name);
    } else {
      setEditingCategory(null);
      setCategoryName('');
    }
    setShowCategoryModal(true);
  };

  const handleCloseCategoryModal = () => {
    setShowCategoryModal(false);
    setEditingCategory(null);
    setCategoryName('');
  };

  const handleSaveCategory = async () => {
    if (!categoryName.trim()) {
      toast.error('Introdu un nume pentru categorie');
      return;
    }

    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, categoryName.trim());
      } else {
        await addCategory(categoryName.trim());
      }
      handleCloseCategoryModal();
    } catch (error) {
      console.error('Error saving category:', error);
      // Error already shown by AdminContext
    }
  };

  const handleDeleteCategory = async (category: any) => {
    if (!confirm(`Sigur vrei să ștergi categoria "${category.name}"?`)) {
      return;
    }

    try {
      await deleteCategory(category.id);
    } catch (error) {
      console.error('Error deleting category:', error);
      // Error already shown by AdminContext
    }
  };

  // Style Management
  const handleOpenStyleModal = (style?: any) => {
    if (style) {
      setEditingStyle(style);
      setStyleName(style.name);
    } else {
      setEditingStyle(null);
      setStyleName('');
    }
    setShowStyleModal(true);
  };

  const handleCloseStyleModal = () => {
    setShowStyleModal(false);
    setEditingStyle(null);
    setStyleName('');
  };

  const handleSaveStyle = async () => {
    if (!styleName.trim()) {
      toast.error('Introdu un nume pentru stil');
      return;
    }

    try {
      if (editingStyle) {
        await updateSubcategory(editingStyle.id, styleName.trim());
      } else {
        await addSubcategory(styleName.trim());
      }
      handleCloseStyleModal();
    } catch (error) {
      console.error('Error saving style:', error);
      // Error already shown by AdminContext
    }
  };

  const handleDeleteStyle = async (style: any) => {
    if (!confirm(`Sigur vrei să ștergi stilul "${style.name}"?`)) {
      return;
    }

    try {
      await deleteSubcategory(style.id);
    } catch (error) {
      console.error('Error deleting style:', error);
      // Error already shown by AdminContext
    }
  };

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.name : 'Unknown';
  };

  return (
    <div className="bg-white rounded-lg border-2 border-gray-200 p-6">
      {/* Categories Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Tag className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h2 className="text-xl text-gray-900">Categorii</h2>
              <p className="text-sm text-gray-600">{categories.length} categorii active</p>
            </div>
          </div>
          <button
            onClick={() => handleOpenCategoryModal()}
            className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Adaugă Categorie</span>
          </button>
        </div>

        <div className="border border-gray-200 rounded-lg overflow-hidden">
          {sortedCategories.map((category, index) => (
            <div
              key={category.id}
              className={`flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors ${
                index !== sortedCategories.length - 1 ? 'border-b border-gray-200' : ''
              }`}
            >
              <span className="text-gray-900">{category.name}</span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleOpenCategoryModal(category)}
                  className="p-1.5 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                  title="Editează"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteCategory(category)}
                  className="p-1.5 text-red-600 hover:bg-red-100 rounded transition-colors"
                  title="Șterge"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {categories.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Tag className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <p>Nicio categorie adăugată încă</p>
          </div>
        )}
      </div>

      {/* Styles Section */}
      <div className="pt-6 border-t border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Palette className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl text-gray-900">Stiluri Artistice</h2>
              <p className="text-sm text-gray-600">{subcategories.length} stiluri active</p>
            </div>
          </div>
          <button
            onClick={() => handleOpenStyleModal()}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Adaugă Stil</span>
          </button>
        </div>

        <div className="border border-gray-200 rounded-lg overflow-hidden">
          {sortedSubcategories.map((style, index) => (
            <div
              key={style.id}
              className={`flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors ${
                index !== sortedSubcategories.length - 1 ? 'border-b border-gray-200' : ''
              }`}
            >
              <span className="text-gray-900">{style.name}</span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleOpenStyleModal(style)}
                  className="p-1.5 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                  title="Editează"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteStyle(style)}
                  className="p-1.5 text-red-600 hover:bg-red-100 rounded transition-colors"
                  title="Șterge"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {subcategories.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Palette className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <p>Niciun stil adăugat încă</p>
          </div>
        )}
      </div>

      {/* Category Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900">
                {editingCategory ? 'Editează Categorie' : 'Adaugă Categorie Nouă'}
              </h3>
            </div>

            <div className="p-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nume Categorie *
              </label>
              <input
                type="text"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                placeholder="Ex: Abstract, Peisaj, Portret..."
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSaveCategory();
                  }
                }}
              />
            </div>

            <div className="flex items-center space-x-3 p-6 border-t border-gray-200">
              <button
                type="button"
                onClick={handleCloseCategoryModal}
                className="flex-1 px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Anulează
              </button>
              <button
                onClick={handleSaveCategory}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                {editingCategory ? 'Actualizează' : 'Adaugă'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Style Modal */}
      {showStyleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900">
                {editingStyle ? 'Editează Stil' : 'Adaugă Stil Nou'}
              </h3>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nume Stil *
                </label>
                <input
                  type="text"
                  value={styleName}
                  onChange={(e) => setStyleName(e.target.value)}
                  placeholder="Ex: Minimalist, Vintage, Modern..."
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSaveStyle();
                    }
                  }}
                />
              </div>
            </div>

            <div className="flex items-center space-x-3 p-6 border-t border-gray-200">
              <button
                type="button"
                onClick={handleCloseStyleModal}
                className="flex-1 px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Anulează
              </button>
              <button
                onClick={handleSaveStyle}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {editingStyle ? 'Actualizează' : 'Adaugă'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};