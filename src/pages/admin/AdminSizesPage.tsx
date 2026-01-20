import React, { useState } from 'react';
import { Plus, Edit2, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { useAdmin, CanvasSize } from '../../context/AdminContext';

export const AdminSizesPage: React.FC = () => {
  const { sizes, frameTypes, addSize, updateSize, deleteSize } = useAdmin();
  const [showModal, setShowModal] = useState(false);
  const [editingSize, setEditingSize] = useState<CanvasSize | null>(null);
  const [isMigrating, setIsMigrating] = useState(false);
  
  const [sizeForm, setSizeForm] = useState<Partial<CanvasSize>>({
    width: 0,
    height: 0,
    price: 0,
    discount: 0,
    isActive: true,
    supportsPrintCanvas: true,
    supportsPrintHartie: true,
    framePrices: {},
  });

  const handleOpenAddModal = () => {
    // Initialize with default frame prices
    const defaultFramePrices: Record<string, { price: number; discount: number; availableForCanvas: boolean; availableForPrint: boolean }> = {};
    frameTypes.forEach(ft => {
      defaultFramePrices[ft.id] = { price: 0, discount: 0, availableForCanvas: true, availableForPrint: true };
    });
    
    setSizeForm({
      width: 0,
      height: 0,
      price: 0,
      discount: 0,
      isActive: true,
      supportsPrintCanvas: true,
      supportsPrintHartie: true,
      framePrices: defaultFramePrices,
    });
    setEditingSize(null);
    setShowModal(true);
  };

  const handleOpenEditModal = (size: CanvasSize) => {
    console.log('📝 [AdminSizesPage] Opening edit modal with size:', {
      id: size.id,
      dimensions: `${size.width}×${size.height}`,
      supportsPrintCanvas: size.supportsPrintCanvas,
      supportsPrintHartie: size.supportsPrintHartie,
    });
    
    // Initialize frame prices for all frame types
    const framePrices: Record<string, { price: number; discount: number; availableForCanvas: boolean; availableForPrint: boolean }> = {};
    frameTypes.forEach(ft => {
      const existingFramePrice = size.framePrices?.[ft.id];
      framePrices[ft.id] = {
        price: existingFramePrice?.price || 0,
        discount: existingFramePrice?.discount || 0,
        // Default to true if not set (backwards compatibility)
        availableForCanvas: existingFramePrice?.availableForCanvas !== false,
        availableForPrint: existingFramePrice?.availableForPrint !== false,
      };
    });
    
    setSizeForm({
      ...size,
      supportsPrintCanvas: size.supportsPrintCanvas !== false, // Default to true if not set
      supportsPrintHartie: size.supportsPrintHartie !== false, // Default to true if not set
      framePrices,
    });
    setEditingSize(size);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!sizeForm.width || !sizeForm.height || sizeForm.price === undefined) {
      alert('Te rugăm să completezi dimensiunile și prețul');
      return;
    }

    console.log('💾 [AdminSizesPage] Saving size with form data:', {
      supportsPrintCanvas: sizeForm.supportsPrintCanvas,
      supportsPrintHartie: sizeForm.supportsPrintHartie,
      convertedCanvas: sizeForm.supportsPrintCanvas === true,
      convertedHartie: sizeForm.supportsPrintHartie === true,
    });

    try {
      if (editingSize) {
        // Update existing size
        await updateSize(editingSize.id, {
          width: sizeForm.width,
          height: sizeForm.height,
          price: sizeForm.price,
          discount: sizeForm.discount || 0,
          isActive: sizeForm.isActive !== false,
          supportsPrintCanvas: sizeForm.supportsPrintCanvas === true, // Explicit boolean
          supportsPrintHartie: sizeForm.supportsPrintHartie === true, // Explicit boolean
          framePrices: sizeForm.framePrices || {},
        });
      } else {
        // Add new size
        await addSize({
          width: sizeForm.width!,
          height: sizeForm.height!,
          price: sizeForm.price!,
          discount: sizeForm.discount || 0,
          isActive: sizeForm.isActive !== false,
          supportsPrintCanvas: sizeForm.supportsPrintCanvas === true, // Explicit boolean
          supportsPrintHartie: sizeForm.supportsPrintHartie === true, // Explicit boolean
          framePrices: sizeForm.framePrices || {},
        });
      }

      setShowModal(false);
      setEditingSize(null);
      setSizeForm({
        width: 0,
        height: 0,
        price: 0,
        discount: 0,
        isActive: true,
        supportsPrintCanvas: true,
        supportsPrintHartie: true,
        framePrices: {},
      });
    } catch (error) {
      console.error('❌ Error saving size:', error);
      alert('Eroare la salvare. Te rugăm să încerci din nou.');
    }
  };

  const handleDeleteSize = async (sizeId: string) => {
    if (window.confirm('Ești sigur că vrei să ștergi această dimensiune?')) {
      await deleteSize(sizeId);
    }
  };

  const toggleSizeActive = async (size: CanvasSize) => {
    await updateSize(size.id, { isActive: !size.isActive });
  };

  const calculateFinalPrice = (price: number, discount: number) => {
    return discount > 0 ? price * (1 - discount / 100) : price;
  };

  const updateFramePrice = (frameTypeId: string, field: 'price' | 'discount' | 'availableForCanvas' | 'availableForPrint', value: number | boolean) => {
    setSizeForm(prev => ({
      ...prev,
      framePrices: {
        ...prev.framePrices,
        [frameTypeId]: {
          ...(prev.framePrices?.[frameTypeId] || { price: 0, discount: 0, availableForCanvas: true, availableForPrint: true }),
          [field]: value,
        },
      },
    }));
  };

  // Sort sizes by dimensions
  const sortedSizes = [...sizes].sort((a, b) => {
    const areaA = a.width * a.height;
    const areaB = b.width * b.height;
    return areaA - areaB;
  });

  // Get active frame types sorted by order
  const activeFrameTypes = frameTypes
    .filter(ft => ft.isActive)
    .sort((a, b) => (a.order || 0) - (b.order || 0));

  return (
    <AdminLayout>
      <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl text-gray-900 mb-2">Dimensiuni & Prețuri</h1>
          <p className="text-sm sm:text-base text-gray-600">Gestionează dimensiunile, prețurile canvas-urilor și ramelor</p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="inline-flex items-center justify-center space-x-2 px-4 sm:px-6 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Adaugă Dimensiune</span>
        </button>
      </div>

      {/* Sizes - Mobile Card View */}
      <div className="block lg:hidden space-y-3">
        {sortedSizes.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
            <p className="text-gray-500">Nicio dimensiune definită</p>
          </div>
        ) : (
          sortedSizes.map((size) => {
            const finalPrice = calculateFinalPrice(size.price, size.discount);
            const hasDiscount = size.discount > 0;

            return (
              <div
                key={size.id}
                className={`bg-white rounded-lg border ${
                  size.isActive ? 'border-gray-200' : 'border-gray-300 opacity-50'
                } p-4`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-gray-900">{size.width} × {size.height} cm</h3>
                      {!size.isActive && (
                        <span className="text-xs px-2 py-1 bg-gray-200 text-gray-600 rounded">
                          Inactiv
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => toggleSizeActive(size)}
                      className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                      title={size.isActive ? 'Dezactivează' : 'Activează'}
                    >
                      {size.isActive ? (
                        <ToggleRight className="w-5 h-5 text-green-500" />
                      ) : (
                        <ToggleLeft className="w-5 h-5" />
                      )}
                    </button>
                    <button
                      onClick={() => handleOpenEditModal(size)}
                      className="p-2 text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteSize(size.id)}
                      className="p-2 text-red-600 hover:text-red-800 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-100">
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Preț Bază</div>
                    <div className="text-gray-900">{size.price.toFixed(2)} lei</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Discount</div>
                    <div className={hasDiscount ? 'text-red-600' : 'text-gray-900'}>
                      {size.discount}%
                    </div>
                  </div>
                  <div className="col-span-2">
                    <div className="text-xs text-gray-500 mb-1">Preț Final</div>
                    <div className="text-lg text-blue-600">
                      {finalPrice.toFixed(2)} lei
                      {hasDiscount && (
                        <span className="ml-2 text-sm line-through text-gray-400">
                          {size.price.toFixed(2)} lei
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Sizes - Desktop Table View */}
      <div className="hidden lg:block bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">
                  Dimensiune
                </th>
                <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">
                  Preț Bază
                </th>
                <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">
                  Discount
                </th>
                <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">
                  Preț Final
                </th>
                <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs text-gray-500 uppercase tracking-wider">
                  Acțiuni
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {sortedSizes.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    Nicio dimensiune definită
                  </td>
                </tr>
              ) : (
                sortedSizes.map((size) => {
                  const finalPrice = calculateFinalPrice(size.price, size.discount);
                  const hasDiscount = size.discount > 0;

                  return (
                    <tr
                      key={size.id}
                      className={`hover:bg-gray-50 ${
                        !size.isActive ? 'opacity-50 bg-gray-50' : ''
                      }`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{size.width} × {size.height} cm</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{size.price.toFixed(2)} lei</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-sm ${hasDiscount ? 'text-red-600' : 'text-gray-900'}`}>
                          {size.discount}%
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-blue-600">
                          {finalPrice.toFixed(2)} lei
                          {hasDiscount && (
                            <div className="text-xs line-through text-gray-400">
                              {size.price.toFixed(2)} lei
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => toggleSizeActive(size)}
                          className="inline-flex items-center"
                          title={size.isActive ? 'Dezactivează' : 'Activează'}
                        >
                          {size.isActive ? (
                            <ToggleRight className="w-6 h-6 text-green-500" />
                          ) : (
                            <ToggleLeft className="w-6 h-6 text-gray-400" />
                          )}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleOpenEditModal(size)}
                            className="p-2 text-blue-600 hover:text-blue-800 transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteSize(size.id)}
                            className="p-2 text-red-600 hover:text-red-800 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Unified Modal - Edit/Add Size + Frame Prices */}
      {showModal && (
        <div 
          className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          onClick={(e) => {
            // Close modal when clicking on backdrop
            if (e.target === e.currentTarget) {
              setShowModal(false);
              setEditingSize(null);
              setSizeForm({
                width: 0,
                height: 0,
                price: 0,
                discount: 0,
                isActive: true,
                supportsPrintCanvas: true,
                supportsPrintHartie: true,
                framePrices: {},
              });
            }
          }}
        >
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6">
              <h2 className="text-xl text-gray-900 mb-6">
                {editingSize ? 'Editează Dimensiune' : 'Adaugă Dimensiune'}
              </h2>

              {/* Size Details Section */}
              <div className="space-y-4 mb-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">
                      Lățime (cm) *
                    </label>
                    <input
                      type="number"
                      value={sizeForm.width || ''}
                      onChange={(e) =>
                        setSizeForm({ ...sizeForm, width: parseFloat(e.target.value) || 0 })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="ex: 50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">
                      Înălțime (cm) *
                    </label>
                    <input
                      type="number"
                      value={sizeForm.height || ''}
                      onChange={(e) =>
                        setSizeForm({ ...sizeForm, height: parseFloat(e.target.value) || 0 })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="ex: 70"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">
                      Preț Bază (lei) *
                    </label>
                    <input
                      type="number"
                      value={sizeForm.price || ''}
                      onChange={(e) =>
                        setSizeForm({
                          ...sizeForm,
                          price: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      step="0.01"
                      min="0"
                      placeholder="ex: 176.66"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-700 mb-1">
                      Discount (%)
                    </label>
                    <input
                      type="number"
                      value={sizeForm.discount || 0}
                      onChange={(e) =>
                        setSizeForm({
                          ...sizeForm,
                          discount: parseInt(e.target.value) || 0,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      min="0"
                      max="100"
                    />
                  </div>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={sizeForm.isActive !== false}
                    onChange={(e) =>
                      setSizeForm({ ...sizeForm, isActive: e.target.checked })
                    }
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="isActive" className="ml-2 text-sm text-gray-700">
                    Activ
                  </label>
                </div>

                {/* Print Type Support */}
                <div>
                  <label className="block text-sm text-gray-700 mb-2">
                    Tipuri de Print Suportate
                  </label>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="supportsPrintCanvas"
                        checked={sizeForm.supportsPrintCanvas !== false}
                        onChange={(e) =>
                          setSizeForm({ ...sizeForm, supportsPrintCanvas: e.target.checked })
                        }
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <label htmlFor="supportsPrintCanvas" className="ml-2 text-sm text-gray-700">
                        Disponibil pentru Print Canvas
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="supportsPrintHartie"
                        checked={sizeForm.supportsPrintHartie !== false}
                        onChange={(e) =>
                          setSizeForm({ ...sizeForm, supportsPrintHartie: e.target.checked })
                        }
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <label htmlFor="supportsPrintHartie" className="ml-2 text-sm text-gray-700">
                        Disponibil pentru Print Hartie
                      </label>
                    </div>
                  </div>
                </div>

                {sizeForm.price && sizeForm.discount ? (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="text-sm text-gray-600 mb-1">Preț Final:</div>
                    <div className="text-lg text-blue-600">
                      {calculateFinalPrice(
                        sizeForm.price,
                        sizeForm.discount || 0
                      ).toFixed(2)}{' '}
                      lei
                      {sizeForm.discount > 0 && (
                        <span className="ml-2 text-sm line-through text-gray-400">
                          {sizeForm.price.toFixed(2)} lei
                        </span>
                      )}
                    </div>
                  </div>
                ) : null}
              </div>

              {/* Frame Prices Section */}
              {activeFrameTypes.length > 0 && (
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-lg text-gray-900 mb-4">
                    Prețuri Rame - {sizeForm.width} × {sizeForm.height} cm
                  </h3>

                  <div className="space-y-4">
                    {activeFrameTypes.map((frameType) => {
                      const framePricing = sizeForm.framePrices?.[frameType.id] || { price: 0, discount: 0, availableForCanvas: true, availableForPrint: true };
                      const finalFramePrice = calculateFinalPrice(framePricing.price, framePricing.discount);
                      
                      return (
                        <div key={frameType.id} className="bg-gray-50 rounded-lg p-4">
                          <h4 className="text-gray-900 mb-3">{frameType.name}</h4>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm text-gray-700 mb-1">
                                Preț Ramă (lei)
                              </label>
                              <input
                                type="number"
                                value={framePricing.price || 0}
                                onChange={(e) =>
                                  updateFramePrice(frameType.id, 'price', parseFloat(e.target.value) || 0)
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                step="0.01"
                                min="0"
                              />
                            </div>

                            <div>
                              <label className="block text-sm text-gray-700 mb-1">
                                Discount (%)
                              </label>
                              <input
                                type="number"
                                value={framePricing.discount || 0}
                                onChange={(e) =>
                                  updateFramePrice(frameType.id, 'discount', parseInt(e.target.value) || 0)
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                min="0"
                                max="100"
                              />
                            </div>
                          </div>

                          {/* Availability Checkboxes */}
                          <div className="mt-3 flex items-center gap-6">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={framePricing.availableForCanvas !== false}
                                onChange={(e) =>
                                  updateFramePrice(frameType.id, 'availableForCanvas', e.target.checked)
                                }
                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                              />
                              <span className="text-sm text-gray-700">Disponibil pentru Canvas</span>
                            </label>
                            
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={framePricing.availableForPrint !== false}
                                onChange={(e) =>
                                  updateFramePrice(frameType.id, 'availableForPrint', e.target.checked)
                                }
                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                              />
                              <span className="text-sm text-gray-700">Disponibil pentru Print</span>
                            </label>
                          </div>

                          {framePricing.price > 0 && (
                            <div className="mt-3 text-sm text-gray-600">
                              Preț Final Ramă: <span className="text-blue-600">{finalFramePrice.toFixed(2)} lei</span>
                              {framePricing.discount > 0 && (
                                <span className="ml-2 line-through text-gray-400">
                                  {framePricing.price.toFixed(2)} lei
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    setShowModal(false);
                    setEditingSize(null);
                    setSizeForm({
                      width: 0,
                      height: 0,
                      price: 0,
                      discount: 0,
                      isActive: true,
                      framePrices: {},
                    });
                  }}
                  className="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Anulează
                </button>
                <button
                  onClick={handleSave}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Salvează
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};