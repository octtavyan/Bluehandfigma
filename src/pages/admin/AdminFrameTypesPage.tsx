import React, { useState } from 'react';
import { Plus, Edit2, Trash2, ToggleLeft, ToggleRight, GripVertical, Info } from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { useAdmin, FrameType } from '../../context/AdminContext';

export const AdminFrameTypesPage: React.FC = () => {
  const { frameTypes, addFrameType, updateFrameType, deleteFrameType } = useAdmin();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingFrameType, setEditingFrameType] = useState<FrameType | null>(null);
  const [frameTypeForm, setFrameTypeForm] = useState<Partial<FrameType>>({
    name: '',
    isActive: true,
    order: 0,
  });

  const handleAddFrameType = async () => {
    if (!frameTypeForm.name) {
      alert('Te rugăm să completezi numele');
      return;
    }

    // Calculate next order number
    const maxOrder = frameTypes.length > 0 
      ? Math.max(...frameTypes.map(f => f.order || 0))
      : 0;

    await addFrameType({
      name: frameTypeForm.name,
      isActive: frameTypeForm.isActive !== false,
      order: maxOrder + 1,
    });

    setShowAddModal(false);
    setFrameTypeForm({
      name: '',
      isActive: true,
      order: 0,
    });
  };

  const handleEditFrameType = async () => {
    if (editingFrameType && frameTypeForm) {
      await updateFrameType(editingFrameType.id, frameTypeForm);
      setEditingFrameType(null);
      setFrameTypeForm({
        name: '',
        isActive: true,
        order: 0,
      });
    }
  };

  const handleDeleteFrameType = async (frameTypeId: string) => {
    if (window.confirm('Ești sigur că vrei să ștergi acest tip de ramă?')) {
      await deleteFrameType(frameTypeId);
    }
  };

  const openEditModal = (frameType: FrameType) => {
    setEditingFrameType(frameType);
    setFrameTypeForm(frameType);
  };

  const toggleFrameTypeActive = async (frameType: FrameType) => {
    await updateFrameType(frameType.id, { isActive: !frameType.isActive });
  };

  // Sort frame types by order
  const sortedFrameTypes = [...frameTypes].sort((a, b) => (a.order || 0) - (b.order || 0));

  return (
    <AdminLayout>
      <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl text-gray-900 mb-2">Tipuri de Rame</h1>
          <p className="text-sm sm:text-base text-gray-600">Definește tipurile de rame disponibile</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center justify-center space-x-2 px-4 sm:px-6 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Adaugă Tip Ramă</span>
        </button>
      </div>

      {/* Info Box */}
      <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
        <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-gray-700">
          <strong>Notă:</strong> Aici definești doar tipurile de rame (ex: Alba, Neagra, Lemn Natural). 
          Prețurile se setează per dimensiune în secțiunea <strong>Dimensiuni Canvas</strong>.
        </div>
      </div>

      {/* Frame Types - Mobile Card View */}
      <div className="block lg:hidden space-y-3">
        {sortedFrameTypes.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
            <p className="text-gray-500">Niciun tip de ramă definit</p>
          </div>
        ) : (
          sortedFrameTypes.map((frameType) => (
            <div
              key={frameType.id}
              className={`bg-white rounded-lg border ${
                frameType.isActive ? 'border-gray-200' : 'border-gray-300 opacity-50'
              } p-4`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-gray-900">{frameType.name}</h3>
                    {!frameType.isActive && (
                      <span className="text-xs px-2 py-1 bg-gray-200 text-gray-600 rounded">
                        Inactiv
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-600">
                    Ordine: {frameType.order || 0}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => toggleFrameTypeActive(frameType)}
                    className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                    title={frameType.isActive ? 'Dezactivează' : 'Activează'}
                  >
                    {frameType.isActive ? (
                      <ToggleRight className="w-5 h-5 text-green-500" />
                    ) : (
                      <ToggleLeft className="w-5 h-5" />
                    )}
                  </button>
                  <button
                    onClick={() => openEditModal(frameType)}
                    className="p-2 text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteFrameType(frameType.id)}
                    className="p-2 text-red-600 hover:text-red-800 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Frame Types - Desktop Table View */}
      <div className="hidden lg:block bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">
                  Ordine
                </th>
                <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">
                  Nume Tip Ramă
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
              {sortedFrameTypes.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                    Niciun tip de ramă definit
                  </td>
                </tr>
              ) : (
                sortedFrameTypes.map((frameType) => (
                  <tr
                    key={frameType.id}
                    className={`hover:bg-gray-50 ${
                      !frameType.isActive ? 'opacity-50 bg-gray-50' : ''
                    }`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-sm text-gray-900">
                        <GripVertical className="w-4 h-4 text-gray-400" />
                        {frameType.order || 0}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{frameType.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => toggleFrameTypeActive(frameType)}
                        className="inline-flex items-center"
                        title={frameType.isActive ? 'Dezactivează' : 'Activează'}
                      >
                        {frameType.isActive ? (
                          <ToggleRight className="w-6 h-6 text-green-500" />
                        ) : (
                          <ToggleLeft className="w-6 h-6 text-gray-400" />
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => openEditModal(frameType)}
                          className="p-2 text-blue-600 hover:text-blue-800 transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteFrameType(frameType.id)}
                          className="p-2 text-red-600 hover:text-red-800 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {(showAddModal || editingFrameType) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl text-gray-900 mb-4">
              {editingFrameType ? 'Editează Tip Ramă' : 'Adaugă Tip Ramă'}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-700 mb-1">
                  Nume Tip Ramă *
                </label>
                <input
                  type="text"
                  value={frameTypeForm.name || ''}
                  onChange={(e) =>
                    setFrameTypeForm({ ...frameTypeForm, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="ex: Alba, Neagra, Lemn Natural"
                />
              </div>

              {editingFrameType && (
                <div>
                  <label className="block text-sm text-gray-700 mb-1">
                    Ordine Afișare
                  </label>
                  <input
                    type="number"
                    value={frameTypeForm.order || 0}
                    onChange={(e) =>
                      setFrameTypeForm({
                        ...frameTypeForm,
                        order: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="0"
                  />
                </div>
              )}

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={frameTypeForm.isActive !== false}
                  onChange={(e) =>
                    setFrameTypeForm({ ...frameTypeForm, isActive: e.target.checked })
                  }
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="isActive" className="ml-2 text-sm text-gray-700">
                  Activ
                </label>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="text-sm text-gray-600">
                  <strong>Notă:</strong> Prețurile pentru acest tip de ramă se setează în 
                  secțiunea <strong>Dimensiuni Canvas</strong>, deoarece fiecare dimensiune 
                  poate avea un preț diferit pentru aceeași ramă.
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingFrameType(null);
                  setFrameTypeForm({
                    name: '',
                    isActive: true,
                    order: 0,
                  });
                }}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Anulează
              </button>
              <button
                onClick={editingFrameType ? handleEditFrameType : handleAddFrameType}
                className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
              >
                {editingFrameType ? 'Salvează' : 'Adaugă'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};
