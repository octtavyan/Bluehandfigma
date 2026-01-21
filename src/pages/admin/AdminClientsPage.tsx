import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Search, Edit2, Eye, Trash2, CheckSquare, Square } from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { useAdmin, Client } from '../../context/AdminContext';
import { CacheService, CACHE_KEYS } from '../../lib/cacheService';

export const AdminClientsPage: React.FC = () => {
  const navigate = useNavigate();
  const { clients, getClientOrders, updateClient, deleteClient, deleteOrder, currentUser, refreshData } = useAdmin();
  const [searchTerm, setSearchTerm] = useState('');
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [editForm, setEditForm] = useState<Partial<Client>>({});
  const [selectedClients, setSelectedClients] = useState<Set<string>>(new Set());
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [clientsToDelete, setClientsToDelete] = useState<Client[]>([]);
  const [clientsWithOrders, setClientsWithOrders] = useState<Map<string, number>>(new Map());
  const [deleteOrders, setDeleteOrders] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 15;

  // Force fresh client data load on mount (clear cache)
  useEffect(() => {
    const loadFreshClients = async () => {
      CacheService.invalidate(CACHE_KEYS.CLIENTS);
      await refreshData();
    };
    loadFreshClients();
  }, []); // Run once on mount

  const filteredClients = clients.filter(client =>
    client.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.phone.includes(searchTerm)
  );

  // Pagination calculations
  const totalPages = Math.ceil(filteredClients.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedClients = filteredClients.slice(startIndex, endIndex);

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEditClick = (client: Client) => {
    setEditingClient(client);
    setEditForm(client);
  };

  const handleSaveClient = () => {
    if (editingClient && editForm) {
      updateClient(editingClient.id, editForm);
      setEditingClient(null);
      setEditForm({});
      alert('Clientul a fost actualizat cu succes!');
    }
  };

  const handleSelectClient = (clientId: string) => {
    const newSelectedClients = new Set(selectedClients);
    if (newSelectedClients.has(clientId)) {
      newSelectedClients.delete(clientId);
    } else {
      newSelectedClients.add(clientId);
    }
    setSelectedClients(newSelectedClients);
  };

  const handleSelectAll = () => {
    if (selectedClients.size === filteredClients.length) {
      // Deselect all
      setSelectedClients(new Set());
    } else {
      // Select all
      const allClientIds = new Set(filteredClients.map(client => client.id));
      setSelectedClients(allClientIds);
    }
  };

  const isAllSelected = filteredClients.length > 0 && selectedClients.size === filteredClients.length;

  const handleDeleteClick = () => {
    const selectedClientIds = Array.from(selectedClients);
    const clientsToDelete = clients.filter(client => selectedClientIds.includes(client.id));
    const clientsWithOrders = new Map<string, number>();
    clientsToDelete.forEach(client => {
      const clientOrders = getClientOrders(client.id);
      if (clientOrders.length > 0) {
        clientsWithOrders.set(client.id, clientOrders.length);
      }
    });
    setClientsToDelete(clientsToDelete);
    setClientsWithOrders(clientsWithOrders);
    setDeleteOrders(false); // Reset checkbox
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = () => {
    clientsToDelete.forEach(client => {
      if (deleteOrders) {
        const clientOrders = getClientOrders(client.id);
        clientOrders.forEach(order => deleteOrder(order.id));
      }
      deleteClient(client.id);
    });
    setShowDeleteModal(false);
    setSelectedClients(new Set());
    setDeleteOrders(false);
  };

  return (
    <AdminLayout>
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl text-gray-900 mb-2">Clienți</h1>
        <p className="text-sm sm:text-base text-gray-600">Gestionează baza de clienți</p>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg border-2 border-gray-200 p-4 sm:p-6 mb-4 sm:mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Caută după nume, email sau telefon..."
            className="w-full pl-12 pr-4 py-3 text-sm sm:text-base border-2 border-gray-300 rounded-lg focus:border-yellow-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Delete Button - Desktop only, full-admin only */}
      {selectedClients.size > 0 && currentUser?.role === 'full-admin' && (
        <div className="hidden lg:block mb-4">
          <button
            onClick={handleDeleteClick}
            disabled={selectedClients.size === 0}
            className="inline-flex items-center space-x-2 px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            <Trash2 className="w-5 h-5" />
            <span>Șterge Clienți Selectați ({selectedClients.size})</span>
          </button>
        </div>
      )}

      {/* Clients - Mobile Card View */}
      <div className="block lg:hidden space-y-3">
        {filteredClients.length === 0 ? (
          <div className="bg-white rounded-lg border-2 border-gray-200 p-8 text-center text-gray-500 text-sm">
            Nu s-au găsit clienți
          </div>
        ) : (
          filteredClients.map((client) => {
            const clientOrders = getClientOrders(client.id);
            return (
              <div
                key={client.id}
                className="bg-white rounded-lg border-2 border-gray-200 p-4"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-base text-gray-900 mb-1">{client.fullName}</h3>
                    <p className="text-xs text-gray-500">{client.email}</p>
                    <p className="text-xs text-gray-500">{client.phone}</p>
                  </div>
                  <button
                    onClick={() => handleEditClick(client)}
                    className="p-2 text-gray-600 hover:text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-3 text-xs">
                  <div>
                    <p className="text-gray-500 mb-1">Comenzi</p>
                    <p className="text-gray-900">{clientOrders.length}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 mb-1">Total Cheltuit</p>
                    <p className="text-gray-900">{client.totalSpent.toFixed(2)} lei</p>
                  </div>
                </div>
                <button
                  onClick={() => navigate(`/admin/clients/${client.id}`)}
                  className="w-full px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors flex items-center justify-center space-x-2 text-sm"
                >
                  <Eye className="w-4 h-4" />
                  <span>Vezi Detalii ({clientOrders.length} comenzi)</span>
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* Clients Table - Desktop */}
      <div className="hidden lg:block bg-white rounded-lg border-2 border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                {/* Show checkbox column only for full-admin */}
                {currentUser?.role === 'full-admin' && (
                  <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase tracking-wider">
                    <button
                      onClick={handleSelectAll}
                      className="p-2 text-gray-600 hover:text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                      title={isAllSelected ? "Deselectează Toate" : "Selectează Toate"}
                    >
                      {isAllSelected ? (
                        <CheckSquare className="w-4 h-4" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </button>
                  </th>
                )}
                <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase tracking-wider">Nume</th>
                <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase tracking-wider">Telefon</th>
                <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase tracking-wider">Comenzi</th>
                <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase tracking-wider">Total Cheltuit</th>
                <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase tracking-wider">Înregistrat</th>
                <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase tracking-wider">Acțiuni</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedClients.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                    Nu s-au găsit clienți
                  </td>
                </tr>
              ) : (
                paginatedClients.map((client) => {
                  const clientOrders = getClientOrders(client.id);
                  return (
                    <tr key={client.id} className="hover:bg-gray-50">
                      {/* Show checkbox column only for full-admin */}
                      {currentUser?.role === 'full-admin' && (
                        <td className="px-6 py-4 text-sm text-gray-900">
                          <button
                            onClick={() => handleSelectClient(client.id)}
                            className="p-2 text-gray-600 hover:text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                          >
                            {selectedClients.has(client.id) ? (
                              <CheckSquare className="w-4 h-4" />
                            ) : (
                              <Square className="w-4 h-4" />
                            )}
                          </button>
                        </td>
                      )}
                      <td className="px-6 py-4 text-sm text-gray-900">{client.fullName}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{client.email}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{client.phone}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{clientOrders.length}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{client.totalSpent.toFixed(2)} lei</td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(client.registeredDate).toLocaleDateString('ro-RO')}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => navigate(`/admin/clients/${client.id}`)}
                            className="inline-flex items-center space-x-1 px-3 py-1.5 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors text-sm"
                          >
                            <Eye className="w-4 h-4" />
                            <span>Vezi ({clientOrders.length})</span>
                          </button>
                          <button
                            onClick={() => handleEditClick(client)}
                            className="p-2 text-gray-600 hover:text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
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
        {/* Pagination */}
        <div className="bg-gray-50 px-6 py-3 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Pagina {currentPage} din {totalPages}
          </div>
          <div className="space-x-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Înapoi
            </button>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-1 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Înainte
            </button>
          </div>
        </div>
      </div>

      {/* Edit Client Modal */}
      {editingClient && (
        <div 
          className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setEditingClient(null);
              setEditForm({
                fullName: '',
                email: '',
                phone: '',
                address: '',
              });
            }
          }}
        >
          <div 
            className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl text-gray-900 mb-6">Editează Client</h3>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm text-gray-700 mb-2">Nume Complet</label>
                <input
                  type="text"
                  value={editForm.fullName || ''}
                  onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-yellow-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={editForm.email || ''}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-yellow-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-2">Telefon</label>
                <input
                  type="tel"
                  value={editForm.phone || ''}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-yellow-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-2">Adresă</label>
                <input
                  type="text"
                  value={editForm.address || ''}
                  onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-yellow-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-700 mb-2">Oraș</label>
                  <input
                    type="text"
                    value={editForm.city || ''}
                    onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-yellow-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-2">Cod Poștal</label>
                  <input
                    type="text"
                    value={editForm.postalCode || ''}
                    onChange={(e) => setEditForm({ ...editForm, postalCode: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-yellow-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setEditingClient(null);
                  setEditForm({});
                }}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Anulează
              </button>
              <button
                onClick={handleSaveClient}
                className="flex-1 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
              >
                Salvează Modificările
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Clients Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl text-gray-900 mb-6">Șterge Clienți</h3>
            
            <div className="space-y-4 mb-6">
              <p className="text-sm text-gray-700">Ești sigur că vrei să ștergi clienții selectați?</p>
              {clientsWithOrders.size > 0 && (
                <div className="space-y-2">
                  <p className="text-sm text-gray-700">Clienții următori au comenzi:</p>
                  {Array.from(clientsWithOrders.entries()).map(([clientId, orderCount]) => (
                    <div key={clientId} className="flex items-center space-x-2">
                      <p className="text-sm text-gray-700">{clients.find(client => client.id === clientId)?.fullName}</p>
                      <p className="text-sm text-gray-700">({orderCount} comenzi)</p>
                    </div>
                  ))}
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={deleteOrders}
                      onChange={(e) => setDeleteOrders(e.target.checked)}
                      className="w-4 h-4 text-yellow-500 bg-gray-100 border-gray-300 rounded focus:ring-yellow-500 focus:ring-2"
                    />
                    <label className="block text-sm text-gray-700">Șterge și comenziile acestora</label>
                  </div>
                </div>
              )}
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Anulează
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                Șterge
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};