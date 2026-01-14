import React, { useState } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { useAdmin } from '../../context/AdminContext';
import { Plus, Edit2, Trash2, Save, X } from 'lucide-react';
import { ResendTestPanel } from '../../components/admin/ResendTestPanel';
import { NotificationSettings } from '../../components/admin/NotificationSettings';
import { DatabaseManagement } from '../../components/admin/DatabaseManagement';
import { FanCourierSettings } from '../../components/admin/FanCourierSettings';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AdminUsersContent } from '../../components/admin/AdminUsersContent';
import { SQLSchemaViewer } from '../../components/SQLSchemaViewer';
import { SupabaseDebugPanel } from '../../components/SupabaseDebugPanel';
import { Database } from 'lucide-react';

export const AdminSettingsPage: React.FC = () => {
  const { currentUser, categories, subcategories, addCategory, updateCategory, deleteCategory, addSubcategory, updateSubcategory, deleteSubcategory } = useAdmin();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const defaultTab = searchParams.get('tab') || 'categories';
  
  // Categories state
  const [addingCategory, setAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editCategoryValue, setEditCategoryValue] = useState('');
  
  // Subcategories state
  const [addingSubcategory, setAddingSubcategory] = useState(false);
  const [newSubcategoryName, setNewSubcategoryName] = useState('');
  const [editingSubcategory, setEditingSubcategory] = useState<string | null>(null);
  const [editSubcategoryValue, setEditSubcategoryValue] = useState('');

  const isFullAdmin = currentUser?.role === 'full-admin';

  // Category handlers
  const handleAddCategory = async () => {
    if (newCategoryName.trim()) {
      await addCategory(newCategoryName.trim());
      setNewCategoryName('');
      setAddingCategory(false);
    }
  };

  const startEditCategory = (categoryId: string, currentName: string) => {
    setEditingCategory(categoryId);
    setEditCategoryValue(currentName);
  };

  const handleUpdateCategory = async (categoryId: string) => {
    if (editCategoryValue.trim()) {
      await updateCategory(categoryId, editCategoryValue.trim());
      setEditingCategory(null);
      setEditCategoryValue('');
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (window.confirm('Sigur doriți să ștergeți această categorie?')) {
      await deleteCategory(categoryId);
    }
  };

  // Subcategory handlers
  const handleAddSubcategory = async () => {
    if (newSubcategoryName.trim()) {
      await addSubcategory(newSubcategoryName.trim());
      setNewSubcategoryName('');
      setAddingSubcategory(false);
    }
  };

  const startEditSubcategory = (subcategoryId: string, currentName: string) => {
    setEditingSubcategory(subcategoryId);
    setEditSubcategoryValue(currentName);
  };

  const handleUpdateSubcategory = async (subcategoryId: string) => {
    if (editSubcategoryValue.trim()) {
      await updateSubcategory(subcategoryId, editSubcategoryValue.trim());
      setEditingSubcategory(null);
      setEditSubcategoryValue('');
    }
  };

  const handleDeleteSubcategory = async (subcategoryId: string) => {
    if (window.confirm('Sigur doriți să ștergeți acest stil?')) {
      await deleteSubcategory(subcategoryId);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl text-gray-900">Setări</h1>
          <p className="text-gray-600 mt-1">Gestionează categoriile, stilurile și integrările</p>
        </div>

        <Tabs defaultValue={defaultTab} className="w-full">
          <TabsList className={`grid w-full ${isFullAdmin ? 'grid-cols-5' : 'grid-cols-3'}`}>
            <TabsTrigger value="categories">Categorii & Stiluri</TabsTrigger>
            <TabsTrigger value="email">Configurare Email</TabsTrigger>
            <TabsTrigger value="fancourier">FAN Courier AWB</TabsTrigger>
            {isFullAdmin && (
              <>
                <TabsTrigger value="users">Utilizatori</TabsTrigger>
                <TabsTrigger value="database">Database Management</TabsTrigger>
              </>
            )}
          </TabsList>

          <TabsContent value="categories" className="space-y-8 mt-6">
            {/* Main Categories Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg text-gray-900">Categorii Principale</h2>
                    <p className="text-sm text-gray-500 mt-1">{categories.length} categori{categories.length === 1 ? 'e' : 'i'}</p>
                  </div>
                  <button
                    onClick={() => setAddingCategory(true)}
                    className="inline-flex items-center px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Adaugă Categorie
                  </button>
                </div>
              </div>

              <div className="divide-y divide-gray-100">
                {/* Add New Category */}
                {addingCategory && (
                  <div className="p-4 bg-yellow-50">
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleAddCategory();
                          if (e.key === 'Escape') {
                            setAddingCategory(false);
                            setNewCategoryName('');
                          }
                        }}
                        placeholder="Nume categorie nouă..."
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                        autoFocus
                      />
                      <button
                        onClick={handleAddCategory}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      >
                        <Save className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => {
                          setAddingCategory(false);
                          setNewCategoryName('');
                        }}
                        className="p-2 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Categories List */}
                {categories.map((category) => {
                  const isEditing = editingCategory === category.id;

                  return (
                    <div key={category.id} className="p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between">
                        {isEditing ? (
                          <div className="flex items-center space-x-2 flex-1">
                            <input
                              type="text"
                              value={editCategoryValue}
                              onChange={(e) => setEditCategoryValue(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleUpdateCategory(category.id);
                                if (e.key === 'Escape') {
                                  setEditingCategory(null);
                                  setEditCategoryValue('');
                                }
                              }}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                              autoFocus
                            />
                            <button
                              onClick={() => handleUpdateCategory(category.id)}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            >
                              <Save className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => {
                                setEditingCategory(null);
                                setEditCategoryValue('');
                              }}
                              className="p-2 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
                            >
                              <X className="w-5 h-5" />
                            </button>
                          </div>
                        ) : (
                          <>
                            <h3 className="text-gray-900">{category.name}</h3>
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => startEditCategory(category.id, category.name)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteCategory(category.id)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}

                {categories.length === 0 && !addingCategory && (
                  <div className="p-8 text-center text-gray-500">
                    Nu există categorii. Adaugă prima categorie!
                  </div>
                )}
              </div>
            </div>

            {/* Subcategories Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg text-gray-900">Stil</h2>
                    <p className="text-sm text-gray-500 mt-1">{subcategories.length} stiluri</p>
                  </div>
                  <button
                    onClick={() => setAddingSubcategory(true)}
                    className="inline-flex items-center px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Adaugă Stil
                  </button>
                </div>
              </div>

              <div className="divide-y divide-gray-100">
                {/* Add New Subcategory */}
                {addingSubcategory && (
                  <div className="p-4 bg-yellow-50">
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={newSubcategoryName}
                        onChange={(e) => setNewSubcategoryName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleAddSubcategory();
                          if (e.key === 'Escape') {
                            setAddingSubcategory(false);
                            setNewSubcategoryName('');
                          }
                        }}
                        placeholder="Nume stil nou..."
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                        autoFocus
                      />
                      <button
                        onClick={handleAddSubcategory}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      >
                        <Save className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => {
                          setAddingSubcategory(false);
                          setNewSubcategoryName('');
                        }}
                        className="p-2 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Subcategories List */}
                {subcategories.map((subcategory) => {
                  const isEditing = editingSubcategory === subcategory.id;

                  return (
                    <div key={subcategory.id} className="p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between">
                        {isEditing ? (
                          <div className="flex items-center space-x-2 flex-1">
                            <input
                              type="text"
                              value={editSubcategoryValue}
                              onChange={(e) => setEditSubcategoryValue(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleUpdateSubcategory(subcategory.id);
                                if (e.key === 'Escape') {
                                  setEditingSubcategory(null);
                                  setEditSubcategoryValue('');
                                }
                              }}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                              autoFocus
                            />
                            <button
                              onClick={() => handleUpdateSubcategory(subcategory.id)}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            >
                              <Save className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => {
                                setEditingSubcategory(null);
                                setEditSubcategoryValue('');
                              }}
                              className="p-2 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
                            >
                              <X className="w-5 h-5" />
                            </button>
                          </div>
                        ) : (
                          <>
                            <h3 className="text-gray-900">{subcategory.name}</h3>
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => startEditSubcategory(subcategory.id, subcategory.name)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteSubcategory(subcategory.id)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}

                {subcategories.length === 0 && !addingSubcategory && (
                  <div className="p-8 text-center text-gray-500">
                    Nu există stiluri. Adaugă primul stil!
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="email" className="space-y-8 mt-6">
            <ResendTestPanel />
            <NotificationSettings />
          </TabsContent>

          <TabsContent value="fancourier" className="space-y-8 mt-6">
            <FanCourierSettings />
          </TabsContent>

          {isFullAdmin && (
            <>
              <TabsContent value="users" className="space-y-8 mt-6">
                <AdminUsersContent />
              </TabsContent>

              <TabsContent value="database" className="space-y-8 mt-6">
                <div className="mb-6">
                  <h2 className="text-xl text-gray-900 mb-2 flex items-center gap-3">
                    <Database className="w-6 h-6 text-blue-600" />
                    Database Management
                  </h2>
                  <p className="text-gray-600">
                    Gestionează baza de date Supabase, monitorizează utilizarea și optimizează performanța.
                  </p>
                </div>

                {/* Consolidated Database Management */}
                <DatabaseManagement />

                {/* Connection Status & SQL Schema */}
                <div className="mt-8 space-y-6">
                  <SupabaseDebugPanel />
                  <SQLSchemaViewer />
                </div>
              </TabsContent>
            </>
          )}
        </Tabs>
      </div>
    </AdminLayout>
  );
};