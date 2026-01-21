import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { Search, Filter, Download, Eye, Trash2, CheckSquare, Square, MessageSquare } from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { useAdmin, OrderStatus } from '../../context/AdminContext';
import { toast } from 'sonner@2.0.3';
import { StatusChangeModal } from '../../components/admin/StatusChangeModal';
import { projectId, publicAnonKey } from '../../utils/supabase/info';

export const AdminOrdersPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { orders, deleteOrder, currentUser, refreshData, getTotalNotesCount, getUnreadNotesCount, updateOrderStatus } = useAdmin();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus[]>([]);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<{ id: string; currentStatus: OrderStatus; newStatus: OrderStatus } | null>(null);
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [bulkStatusModalOpen, setBulkStatusModalOpen] = useState(false);
  const [bulkNewStatus, setBulkNewStatus] = useState<OrderStatus | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 15;

  // Apply filter from URL query parameter
  useEffect(() => {
    const statusFromUrl = searchParams.get('status');
    if (statusFromUrl && (statusFromUrl === 'new' || statusFromUrl === 'queue' || statusFromUrl === 'in-production' || statusFromUrl === 'delivered' || statusFromUrl === 'returned' || statusFromUrl === 'closed')) {
      setStatusFilter([statusFromUrl as OrderStatus]);
    }
  }, [searchParams]);

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.clientEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter.length === 0 || statusFilter.includes(order.status);

    // Date filter from URL
    const dateFromUrl = searchParams.get('date');
    let matchesDate = true;
    if (dateFromUrl) {
      const filterDate = new Date(dateFromUrl);
      filterDate.setHours(0, 0, 0, 0);
      const orderDate = new Date(order.orderDate);
      orderDate.setHours(0, 0, 0, 0);
      matchesDate = orderDate.getTime() === filterDate.getTime();
    }

    // Role-based filtering
    if (currentUser?.role === 'production') {
      // Production sees only: in-production, delivered, returned, closed
      const matchesRole = order.status === 'in-production' || order.status === 'delivered' || order.status === 'returned' || order.status === 'closed';
      return matchesSearch && matchesStatus && matchesDate && matchesRole;
    }
    
    // Account manager and full-admin see all orders
    return matchesSearch && matchesStatus && matchesDate;
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedOrders = filteredOrders.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800';
      case 'queue': return 'bg-purple-100 text-purple-800';
      case 'in-production': return 'bg-yellow-100 text-yellow-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'returned': return 'bg-red-100 text-red-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'new': return 'Nou';
      case 'queue': return 'În Așteptare';
      case 'in-production': return 'În Producție';
      case 'delivered': return 'Livrat';
      case 'returned': return 'Returnat';
      case 'closed': return 'Închis';
      default: return status;
    }
  };

  const handleStatusChange = async (orderId: string, currentStatus: OrderStatus, newStatus: OrderStatus) => {
    // Statuses that require a reason/note: 'queue', 'returned', 'closed'
    const requiresReason = newStatus === 'queue' || newStatus === 'returned' || newStatus === 'closed';
    
    if (requiresReason) {
      // Show modal for statuses requiring a reason
      setSelectedOrder({ id: orderId, currentStatus, newStatus });
      setStatusModalOpen(true);
    } else {
      // Update directly for simple status changes (new, in-production, delivered)
      updateOrderStatus(orderId, newStatus, '', currentUser?.fullName);
      
      // If status is changing to "delivered", send shipped confirmation email
      if (newStatus === 'delivered') {
        await sendShippedEmail(orderId);
      }
    }
  };
  
  // Helper function to send shipped confirmation email
  const sendShippedEmail = async (orderId: string) => {
    try {
      const order = orders.find(o => o.id === orderId);
      if (!order || !order.clientEmail || !order.orderNumber) {
        toast.error('Eroare: Date comandă incomplete');
        return;
      }
      
      const emailResponse = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-bbc0c500/email/send-shipped-confirmation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({
          orderNumber: order.orderNumber,
          customerName: order.clientName,
          customerEmail: order.clientEmail,
        }),
      });
      
      const responseData = await emailResponse.json();
      
      if (!emailResponse.ok) {
        throw new Error(responseData.error || 'Email sending failed');
      }
      
      toast.success('Email de confirmare livrare trimis!');
    } catch (error) {
      console.error('Failed to send shipped confirmation email:', error);
      toast.error(`Eroare la trimiterea emailului: ${error instanceof Error ? error.message : 'Eroare necunoscută'}`);
    }
  };

  const confirmStatusChange = async (reason: string) => {
    if (selectedOrder) {
      updateOrderStatus(selectedOrder.id, selectedOrder.newStatus, reason, currentUser?.fullName);
      
      // If status is changing to "delivered", send shipped confirmation email
      if (selectedOrder.newStatus === 'delivered') {
        await sendShippedEmail(selectedOrder.id);
      }
      
      setStatusModalOpen(false);
      setSelectedOrder(null);
    }
  };

  const handleBulkStatusChange = async (newStatus: OrderStatus) => {
    // Statuses that require a reason/note: 'queue', 'returned', 'closed'
    const requiresReason = newStatus === 'queue' || newStatus === 'returned' || newStatus === 'closed';
    
    if (requiresReason) {
      // Show modal for statuses requiring a reason
      setBulkNewStatus(newStatus);
      setBulkStatusModalOpen(true);
    } else {
      // Update directly for simple status changes (new, in-production, delivered)
      for (const orderId of selectedOrders) {
        updateOrderStatus(orderId, newStatus, '', currentUser?.fullName);
        
        // If status is changing to "delivered", send shipped confirmation email
        if (newStatus === 'delivered') {
          await sendShippedEmail(orderId);
        }
      }
      setSelectedOrders([]);
    }
  };

  const confirmBulkStatusChange = async (reason: string) => {
    if (bulkNewStatus && selectedOrders.length > 0) {
      for (const orderId of selectedOrders) {
        updateOrderStatus(orderId, bulkNewStatus, reason, currentUser?.fullName);
        
        // If status is changing to "delivered", send shipped confirmation email
        if (bulkNewStatus === 'delivered') {
          await sendShippedEmail(orderId);
        }
      }
      setBulkStatusModalOpen(false);
      setBulkNewStatus(null);
      setSelectedOrders([]);
    }
  };

  const toggleOrderSelection = (orderId: string) => {
    if (selectedOrders.includes(orderId)) {
      setSelectedOrders(selectedOrders.filter(id => id !== orderId));
    } else {
      setSelectedOrders([...selectedOrders, orderId]);
    }
  };

  const isOrderSelected = (orderId: string) => {
    return selectedOrders.includes(orderId);
  };

  const toggleSelectAll = () => {
    if (selectedOrders.length === filteredOrders.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(filteredOrders.map(order => order.id));
    }
  };

  const isAllSelected = selectedOrders.length === filteredOrders.length && filteredOrders.length > 0;

  const handleBulkDeleteConfirm = async () => {
    try {
      // Delete all selected orders
      for (const orderId of selectedOrders) {
        await deleteOrder(orderId);
      }
      toast.success(`${selectedOrders.length} ${selectedOrders.length === 1 ? 'comandă ștearsă' : 'comenzi șterse'} cu succes`);
      setSelectedOrders([]);
      setShowDeleteModal(false);
    } catch (error) {
      console.error('Error deleting orders:', error);
      toast.error('Eroare la ștergerea comenzilor');
    }
  };

  return (
    <AdminLayout>
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl text-gray-900 mb-2">Comenzi</h1>
        <p className="text-sm sm:text-base text-gray-600">Gestionează toate comenzile din sistem</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border-2 border-gray-200 p-4 sm:p-6 mb-4 sm:mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Caută după client, email sau ID..."
              className="w-full pl-12 pr-4 py-3 text-sm sm:text-base border-2 border-gray-300 rounded-lg focus:border-yellow-500 focus:outline-none"
            />
          </div>

          <div className="relative">
            <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            {/* Desktop: single select */}
            <select
              value={statusFilter.length === 1 ? statusFilter[0] : 'all'}
              onChange={(e) => {
                if (e.target.value === 'all') {
                  setStatusFilter([]);
                } else {
                  setStatusFilter([e.target.value as OrderStatus]);
                }
              }}
              className="hidden md:block w-full pl-12 pr-4 py-3 text-sm sm:text-base border-2 border-gray-300 rounded-lg focus:border-yellow-500 focus:outline-none appearance-none"
            >
              <option value="all">Toate Statusurile</option>
              {currentUser?.role !== 'production' && (
                <>
                  <option value="new">Nou</option>
                  <option value="queue">În Așteptare</option>
                </>
              )}
              <option value="in-production">În Producție</option>
              <option value="delivered">Livrat</option>
              <option value="returned">Returnat</option>
              <option value="closed">Închis</option>
            </select>

            {/* Mobile: tap to open filter modal */}
            <button
              type="button"
              onClick={() => setShowFilterModal(true)}
              className="md:hidden w-full pl-12 pr-4 py-3 text-sm border-2 border-gray-300 rounded-lg focus:border-yellow-500 focus:outline-none appearance-none text-left bg-white"
            >
              {statusFilter.length === 0 ? 'Toate Statusurile' : `${statusFilter.length} status(uri) selectate`}
            </button>
          </div>
        </div>
      </div>

      {/* Orders - Mobile Card View */}
      <div className="block lg:hidden space-y-3">
        {/* Mobile Bulk Actions Bar */}
        {selectedOrders.length > 0 && (
          <div className="sticky top-0 z-10 bg-yellow-50 border-2 border-yellow-500 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-gray-900">
                {selectedOrders.length} {selectedOrders.length === 1 ? 'comandă selectată' : 'comenzi selectate'}
              </p>
              <button
                onClick={() => setSelectedOrders([])}
                className="text-sm text-yellow-600 hover:text-yellow-700"
              >
                Deselectează
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {currentUser?.role !== 'production' && (
                <>
                  <button
                    onClick={() => {
                      setBulkNewStatus('queue');
                      setBulkStatusModalOpen(true);
                    }}
                    className="px-3 py-2 bg-yellow-100 text-yellow-800 text-xs rounded-lg hover:bg-yellow-200 transition-colors"
                  >
                    → În Așteptare
                  </button>
                  <button
                    onClick={() => {
                      setBulkNewStatus('in-production');
                      setBulkStatusModalOpen(true);
                    }}
                    className="px-3 py-2 bg-orange-100 text-orange-800 text-xs rounded-lg hover:bg-orange-200 transition-colors"
                  >
                    → În Producție
                  </button>
                </>
              )}
              <button
                onClick={() => {
                  setBulkNewStatus('delivered');
                  setBulkStatusModalOpen(true);
                }}
                className="px-3 py-2 bg-green-100 text-green-800 text-xs rounded-lg hover:bg-green-200 transition-colors"
              >
                → Livrat
              </button>
              <button
                onClick={() => {
                  setBulkNewStatus('closed');
                  setBulkStatusModalOpen(true);
                }}
                className="px-3 py-2 bg-gray-100 text-gray-800 text-xs rounded-lg hover:bg-gray-200 transition-colors"
              >
                → Închis
              </button>
              {currentUser?.role === 'full-admin' && (
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="px-3 py-2 bg-red-500 text-white text-xs rounded-lg hover:bg-red-600 transition-colors col-span-2"
                >
                  🗑️ Șterge Selectate
                </button>
              )}
            </div>
          </div>
        )}

        {/* Select All Button */}
        {filteredOrders.length > 0 && (
          <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3 border border-gray-200">
            <button
              onClick={toggleSelectAll}
              className="flex items-center space-x-2 text-sm text-gray-700"
            >
              {isAllSelected ? (
                <CheckSquare className="w-5 h-5 text-yellow-600" />
              ) : (
                <Square className="w-5 h-5 text-gray-400" />
              )}
              <span>
                {isAllSelected ? 'Deselectează tot' : 'Selectează tot'}
              </span>
            </button>
            <span className="text-xs text-gray-500">
              {filteredOrders.length} {filteredOrders.length === 1 ? 'comandă' : 'comenzi'}
            </span>
          </div>
        )}

        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-lg border-2 border-gray-200 p-8 text-center text-gray-500 text-sm">
            Nu s-au găsit comenzi
          </div>
        ) : (
          paginatedOrders.map((order) => (
            <div
              key={order.id}
              className={`bg-white rounded-lg border-2 transition-all ${
                isOrderSelected(order.id)
                  ? 'border-yellow-500 bg-yellow-50'
                  : 'border-gray-200'
              }`}
            >
              <div className="p-4">
                <div className="flex items-start space-x-3">
                  {/* Checkbox */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleOrderSelection(order.id);
                    }}
                    className="flex-shrink-0 mt-1"
                  >
                    {isOrderSelected(order.id) ? (
                      <CheckSquare className="w-5 h-5 text-yellow-600" />
                    ) : (
                      <Square className="w-5 h-5 text-gray-400" />
                    )}
                  </button>

                  {/* Order Info - Clickable */}
                  <div 
                    className="flex-1 cursor-pointer"
                    onClick={() => navigate(`/admin/orders/${order.id}`)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="text-sm text-gray-900 mb-1">#{order.orderNumber || order.id.slice(-8)}</p>
                        <p className="text-sm text-gray-600">{order.clientName}</p>
                        <p className="text-xs text-gray-500 mt-1">{order.clientEmail}</p>
                      </div>
                      <div className="flex flex-col items-end space-y-1">
                        <span className={`status-badge inline-flex px-2 py-1 text-xs rounded-full ${getStatusColor(order.status)}`}>
                          {getStatusLabel(order.status)}
                        </span>
                        {getTotalNotesCount(order.id) > 0 && (
                          <div 
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/admin/orders/${order.id}#notes`);
                            }}
                            className={`flex items-center space-x-1 px-2 py-0.5 rounded-full text-xs cursor-pointer hover:opacity-80 transition-opacity ${
                              getUnreadNotesCount(order.id) > 0 
                                ? 'bg-blue-500 text-white' 
                                : 'bg-gray-300 text-gray-700'
                            }`}
                            title={
                              getUnreadNotesCount(order.id) > 0
                                ? `${getUnreadNotesCount(order.id)} note necitite`
                                : `${getTotalNotesCount(order.id)} note citite`
                            }
                          >
                            <MessageSquare className="w-3 h-3" />
                            <span>{getTotalNotesCount(order.id)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-3 text-xs">
                      <div>
                        <p className="text-gray-500 mb-1">Data</p>
                        <p className="text-gray-900">{new Date(order.orderDate).toLocaleDateString('ro-RO', { day: '2-digit', month: 'short' })}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 mb-1">Tablouri</p>
                        <p className="text-gray-900">{order.canvasItems.length}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 mb-1">Total</p>
                        <p className={`${order.status === 'returned' ? 'text-red-600' : 'text-gray-900'}`}>
                          {order.status === 'returned' ? '-' : ''}{order.totalPrice.toFixed(2)} lei
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Orders Table - Desktop */}
      <div className="hidden lg:block bg-white rounded-lg border-2 border-gray-200 overflow-hidden">
        {/* Bulk Actions Toolbar */}
        {selectedOrders.length > 0 && (
          <div className="bg-yellow-50 border-b-2 border-yellow-200 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <CheckSquare className="w-5 h-5 text-yellow-600" />
              <span className="text-sm text-gray-900">
                <strong>{selectedOrders.length}</strong> {selectedOrders.length === 1 ? 'comandă selectată' : 'comenzi selectate'}
              </span>
              <button
                onClick={() => setSelectedOrders([])}
                className="text-sm text-gray-600 hover:text-gray-900 underline"
              >
                Deselectează tot
              </button>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600 mr-2">Schimbă status în:</span>
              {currentUser?.role !== 'production' && (
                <>
                  <button
                    onClick={() => handleBulkStatusChange('new')}
                    className="px-3 py-1.5 bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200 transition-colors text-sm"
                  >
                    Nou
                  </button>
                  <button
                    onClick={() => handleBulkStatusChange('queue')}
                    className="px-3 py-1.5 bg-purple-100 text-purple-800 rounded-lg hover:bg-purple-200 transition-colors text-sm"
                  >
                    În Așteptare
                  </button>
                </>
              )}
              <button
                onClick={() => handleBulkStatusChange('in-production')}
                className="px-3 py-1.5 bg-yellow-100 text-yellow-800 rounded-lg hover:bg-yellow-200 transition-colors text-sm"
              >
                În Producție
              </button>
              <button
                onClick={() => handleBulkStatusChange('delivered')}
                className="px-3 py-1.5 bg-green-100 text-green-800 rounded-lg hover:bg-green-200 transition-colors text-sm"
              >
                Livrat
              </button>
              <button
                onClick={() => handleBulkStatusChange('returned')}
                className="px-3 py-1.5 bg-red-100 text-red-800 rounded-lg hover:bg-red-200 transition-colors text-sm"
              >
                Returnat
              </button>
              <button
                onClick={() => handleBulkStatusChange('closed')}
                className="px-3 py-1.5 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition-colors text-sm"
              >
                Închis
              </button>
              {currentUser?.role === 'full-admin' && (
                <>
                  <span className="text-gray-300 mx-2">|</span>
                  <button
                    onClick={() => setShowDeleteModal(true)}
                    className="px-3 py-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm flex items-center space-x-1"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Șterge</span>
                  </button>
                </>
              )}
            </div>
          </div>
        )}
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left w-12">
                  <button
                    onClick={toggleSelectAll}
                    className="text-gray-600 hover:text-gray-900 focus:outline-none"
                  >
                    {isAllSelected ? (
                      <CheckSquare className="w-5 h-5" />
                    ) : (
                      <Square className="w-5 h-5" />
                    )}
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase tracking-wider">ID Comandă</th>
                <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase tracking-wider">Client</th>
                <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase tracking-wider">Data</th>
                <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase tracking-wider">Tablouri</th>
                <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase tracking-wider">Total</th>
                <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase tracking-wider">Acțiuni</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-8 text-center text-gray-500">
                    Nu s-au găsit comenzi
                  </td>
                </tr>
              ) : (
                paginatedOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleOrderSelection(order.id);
                        }}
                        className="text-gray-600 hover:text-gray-900 focus:outline-none"
                      >
                        {isOrderSelected(order.id) ? (
                          <CheckSquare className="w-5 h-5 text-yellow-600" />
                        ) : (
                          <Square className="w-5 h-5" />
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div className="flex items-center space-x-2">
                        <span>#{order.orderNumber || order.id.slice(-8)}</span>
                        {getTotalNotesCount(order.id) > 0 && (
                          <div 
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/admin/orders/${order.id}#notes`);
                            }}
                            className={`flex items-center space-x-1 px-1.5 py-0.5 rounded-full text-xs cursor-pointer hover:opacity-80 transition-opacity ${
                              getUnreadNotesCount(order.id) > 0 
                                ? 'bg-blue-500 text-white' 
                                : 'bg-gray-300 text-gray-700'
                            }`}
                            title={
                              getUnreadNotesCount(order.id) > 0
                                ? `${getUnreadNotesCount(order.id)} note necitite`
                                : `${getTotalNotesCount(order.id)} note citite`
                            }
                          >
                            <MessageSquare className="w-3 h-3" />
                            <span>{getTotalNotesCount(order.id)}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{order.clientName}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{order.clientEmail}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(order.orderDate).toLocaleDateString('ro-RO')}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{order.canvasItems.length}</td>
                    <td className={`px-6 py-4 text-sm ${order.status === 'returned' ? 'text-red-600' : 'text-gray-900'}`}>
                      {order.status === 'returned' ? '-' : ''}{order.totalPrice.toFixed(2)} lei
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={order.status}
                        onChange={(e) => {
                          e.stopPropagation();
                          const newStatus = e.target.value as OrderStatus;
                          // Only open modal if status is actually changing
                          if (newStatus !== order.status) {
                            handleStatusChange(order.id, order.status, newStatus);
                          }
                          // Reset select to current status to prevent UI glitch
                          e.target.value = order.status;
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className={`status-badge inline-flex px-3 py-1 text-xs rounded-full border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-yellow-500 ${getStatusColor(order.status)}`}
                      >
                        {currentUser?.role !== 'production' && (
                          <>
                            <option value="new" style={{ backgroundColor: '#dbeafe', color: '#1e40af' }}>Nou</option>
                            <option value="queue" style={{ backgroundColor: '#f3e8ff', color: '#6b21a8' }}>În Așteptare</option>
                          </>
                        )}
                        <option value="in-production" style={{ backgroundColor: '#fef3c7', color: '#92400e' }}>În Producție</option>
                        <option value="delivered" style={{ backgroundColor: '#d1fae5', color: '#065f46' }}>Livrat</option>
                        <option value="returned" style={{ backgroundColor: '#fee2e2', color: '#991b1b' }}>Returnat</option>
                        <option value="closed" style={{ backgroundColor: '#f3f4f6', color: '#1f2937' }}>Închis</option>
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => navigate(`/admin/orders/${order.id}`)}
                          className="inline-flex items-center space-x-2 px-3 py-1.5 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors text-sm"
                        >
                          <Eye className="w-4 h-4" />
                          <span>Vezi</span>
                        </button>
                        {/* Delete button - only for full-admin */}
                        {currentUser?.role === 'full-admin' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (window.confirm(`Sigur vrei să ștergi comanda #${order.id.slice(-8)}? Această acțiune nu poate fi anulată.`)) {
                                deleteOrder(order.id);
                                toast.success('Comandă ștearsă cu succes');
                              }
                            }}
                            className="inline-flex items-center space-x-1 px-3 py-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
                            title="Șterge comandă"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-gray-50 px-6 py-4 flex items-center justify-between">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Anterior
            </button>
            <div className="text-sm text-gray-700">
              Pagina {currentPage} din {totalPages}
            </div>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Următor
            </button>
          </div>
        )}
      </div>

      {/* Status Change Modal */}
      <StatusChangeModal
        isOpen={statusModalOpen}
        onClose={() => setStatusModalOpen(false)}
        onConfirm={confirmStatusChange}
        currentStatus={selectedOrder?.currentStatus}
        newStatus={selectedOrder?.newStatus}
      />

      {/* Bulk Status Change Modal */}
      <StatusChangeModal
        isOpen={bulkStatusModalOpen}
        onClose={() => {
          setBulkStatusModalOpen(false);
          setBulkNewStatus(null);
        }}
        onConfirm={confirmBulkStatusChange}
        currentStatus={undefined}
        newStatus={bulkNewStatus}
        isBulk={true}
        bulkCount={selectedOrders.length}
      />

      {/* Mobile Filter Modal */}
      {showFilterModal && (
        <div 
          className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-end md:items-center justify-center z-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowFilterModal(false);
            }
          }}
        >
          <div className="bg-white rounded-t-2xl md:rounded-2xl w-full md:max-w-md md:mx-4 max-h-[80vh] overflow-auto">
            <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg text-gray-900">Filtrare Status</h3>
              <p className="text-sm text-gray-600 mt-1">Selectează unul sau mai multe statusuri</p>
            </div>
            
            <div className="p-6 space-y-3">
              {/* Select All */}
              <label className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={statusFilter.length === 0}
                  onChange={() => setStatusFilter([])}
                  className="w-5 h-5 text-yellow-500 border-gray-300 rounded focus:ring-yellow-500"
                />
                <span className="text-gray-900">Toate Statusurile</span>
              </label>

              {currentUser?.role !== 'production' && (
                <>
                  <label className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={statusFilter.includes('new')}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setStatusFilter([...statusFilter, 'new']);
                        } else {
                          setStatusFilter(statusFilter.filter(s => s !== 'new'));
                        }
                      }}
                      className="w-5 h-5 text-yellow-500 border-gray-300 rounded focus:ring-yellow-500"
                    />
                    <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor('new')}`}>
                      Nou
                    </span>
                  </label>

                  <label className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={statusFilter.includes('queue')}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setStatusFilter([...statusFilter, 'queue']);
                        } else {
                          setStatusFilter(statusFilter.filter(s => s !== 'queue'));
                        }
                      }}
                      className="w-5 h-5 text-yellow-500 border-gray-300 rounded focus:ring-yellow-500"
                    />
                    <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor('queue')}`}>
                      În Așteptare
                    </span>
                  </label>
                </>
              )}

              <label className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={statusFilter.includes('in-production')}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setStatusFilter([...statusFilter, 'in-production']);
                    } else {
                      setStatusFilter(statusFilter.filter(s => s !== 'in-production'));
                    }
                  }}
                  className="w-5 h-5 text-yellow-500 border-gray-300 rounded focus:ring-yellow-500"
                />
                <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor('in-production')}`}>
                  În Producție
                </span>
              </label>

              <label className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={statusFilter.includes('delivered')}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setStatusFilter([...statusFilter, 'delivered']);
                    } else {
                      setStatusFilter(statusFilter.filter(s => s !== 'delivered'));
                    }
                  }}
                  className="w-5 h-5 text-yellow-500 border-gray-300 rounded focus:ring-yellow-500"
                />
                <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor('delivered')}`}>
                  Livrat
                </span>
              </label>

              <label className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={statusFilter.includes('returned')}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setStatusFilter([...statusFilter, 'returned']);
                    } else {
                      setStatusFilter(statusFilter.filter(s => s !== 'returned'));
                    }
                  }}
                  className="w-5 h-5 text-yellow-500 border-gray-300 rounded focus:ring-yellow-500"
                />
                <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor('returned')}`}>
                  Returnat
                </span>
              </label>

              <label className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={statusFilter.includes('closed')}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setStatusFilter([...statusFilter, 'closed']);
                    } else {
                      setStatusFilter(statusFilter.filter(s => s !== 'closed'));
                    }
                  }}
                  className="w-5 h-5 text-yellow-500 border-gray-300 rounded focus:ring-yellow-500"
                />
                <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor('closed')}`}>
                  Închis
                </span>
              </label>
            </div>

            <div className="sticky bottom-0 bg-white px-6 py-4 border-t border-gray-200 flex space-x-3">
              <button
                onClick={() => {
                  setStatusFilter([]);
                  setShowFilterModal(false);
                }}
                className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Resetează
              </button>
              <button
                onClick={() => setShowFilterModal(false)}
                className="flex-1 px-4 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
              >
                Aplică Filtru
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Orders Confirmation Modal */}
      {showDeleteModal && (
        <div 
          className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowDeleteModal(false);
            }
          }}
        >
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl text-gray-900 mb-4">Șterge Comenzi</h3>
            
            <div className="mb-6">
              <p className="text-sm text-gray-700 mb-4">
                Ești sigur că vrei să ștergi <strong>{selectedOrders.length}</strong> {selectedOrders.length === 1 ? 'comandă' : 'comenzi'}?
              </p>
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-800">
                  ⚠️ <strong>Atenție:</strong> Această acțiune este permanentă și nu poate fi anulată. Toate datele asociate comenzilor vor fi șterse definitiv.
                </p>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Anulează
              </button>
              <button
                onClick={handleBulkDeleteConfirm}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                Șterge {selectedOrders.length} {selectedOrders.length === 1 ? 'Comandă' : 'Comenzi'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};