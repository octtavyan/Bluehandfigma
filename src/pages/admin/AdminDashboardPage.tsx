import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { ShoppingCart, Users, DollarSign, TrendingUp, AlertCircle, CheckCircle, Clock, Package } from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { useAdmin, OrderStatus } from '../../context/AdminContext';
import { CacheService, CACHE_KEYS } from '../../lib/cacheService';
import { NotificationSettings } from '../../components/admin/NotificationSettings';

export const AdminDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { orders, clients, currentUser, refreshData, paintings, blogPosts } = useAdmin();
  const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'week' | 'month' | 'all'>('all');

  // Force fresh data load on mount (clear cache)
  useEffect(() => {
    const loadFreshData = async () => {
      CacheService.invalidate(CACHE_KEYS.ORDERS);
      CacheService.invalidate(CACHE_KEYS.CLIENTS);
      await refreshData();
    };

    loadFreshData();
  }, []); // Run once on mount

  // Get today's date at midnight for comparison
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const stats = {
    newOrders: orders.filter(o => o.status === 'new').length,
    queueOrders: orders.filter(o => o.status === 'queue').length,
    inProduction: orders.filter(o => o.status === 'in-production').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    returned: orders.filter(o => o.status === 'returned').length,
    closed: orders.filter(o => o.status === 'closed').length,
    totalClients: clients.length,
    totalToday: orders.filter(o => {
      const orderDate = new Date(o.orderDate);
      orderDate.setHours(0, 0, 0, 0);
      return orderDate.getTime() === today.getTime() && o.status !== 'closed';
    }).reduce((sum, order) => sum + order.totalPrice, 0),
  };

  // Filter recent orders based on user role
  let recentOrdersFiltered = orders;
  if (currentUser?.role === 'production') {
    recentOrdersFiltered = orders.filter(o => 
      o.status === 'in-production' || 
      o.status === 'delivered' || 
      o.status === 'returned' || 
      o.status === 'closed'
    );
  }
  const recentOrders = recentOrdersFiltered.slice(0, 5);

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

  return (
    <AdminLayout>
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl text-gray-900 mb-2">Dashboard</h1>
        <p className="text-sm sm:text-base text-gray-600">Bine ai venit, {currentUser?.fullName}!</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 sm:gap-6 mb-6 sm:mb-8">
        {/* Show "Comenzi Noi" only for non-production users */}
        {currentUser?.role !== 'production' && (
          <button 
            onClick={() => navigate('/admin/orders?status=new')}
            className="bg-white rounded-lg p-4 sm:p-6 border-2 border-gray-200 hover:shadow-lg transition-all hover:border-blue-300 text-left"
          >
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
              </div>
              <span className="text-2xl sm:text-3xl text-blue-600">{stats.newOrders}</span>
            </div>
            <h3 className="text-base sm:text-lg text-gray-900 mb-1">Comenzi Noi</h3>
            <p className="text-xs sm:text-sm text-gray-600">Necesită procesare</p>
          </button>
        )}

        {/* Show "În Așteptare" only for non-production users */}
        {currentUser?.role !== 'production' && (
          <button 
            onClick={() => navigate('/admin/orders?status=queue')}
            className="bg-white rounded-lg p-4 sm:p-6 border-2 border-gray-200 hover:shadow-lg transition-all hover:border-purple-300 text-left"
          >
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
              </div>
              <span className="text-2xl sm:text-3xl text-purple-600">{stats.queueOrders}</span>
            </div>
            <h3 className="text-base sm:text-lg text-gray-900 mb-1">În Așteptare</h3>
            <p className="text-xs sm:text-sm text-gray-600">Validare account</p>
          </button>
        )}

        <button 
          onClick={() => navigate('/admin/orders?status=in-production')}
          className="bg-white rounded-lg p-4 sm:p-6 border-2 border-gray-200 hover:shadow-lg transition-all hover:border-yellow-300 text-left"
        >
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Package className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-600" />
            </div>
            <span className="text-2xl sm:text-3xl text-yellow-600">{stats.inProduction}</span>
          </div>
          <h3 className="text-base sm:text-lg text-gray-900 mb-1">În Producție</h3>
          <p className="text-xs sm:text-sm text-gray-600">Se lucrează acum</p>
        </button>

        <button 
          onClick={() => navigate('/admin/orders?status=delivered')}
          className="bg-white rounded-lg p-4 sm:p-6 border-2 border-gray-200 hover:shadow-lg transition-all hover:border-green-300 text-left"
        >
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
            </div>
            <span className="text-2xl sm:text-3xl text-green-600">{stats.delivered}</span>
          </div>
          <h3 className="text-base sm:text-lg text-gray-900 mb-1">Livrate</h3>
          <p className="text-xs sm:text-sm text-gray-600">Comenzi finalizate</p>
        </button>

        {/* Show Returnat and Închis only for production users */}
        {currentUser?.role === 'production' && (
          <>
            <button 
              onClick={() => navigate('/admin/orders?status=returned')}
              className="bg-white rounded-lg p-4 sm:p-6 border-2 border-gray-200 hover:shadow-lg transition-all hover:border-red-300 text-left"
            >
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />
                </div>
                <span className="text-2xl sm:text-3xl text-red-600">{stats.returned}</span>
              </div>
              <h3 className="text-base sm:text-lg text-gray-900 mb-1">Returnat</h3>
              <p className="text-xs sm:text-sm text-gray-600">Comenzi returnate</p>
            </button>

            <button 
              onClick={() => navigate('/admin/orders?status=closed')}
              className="bg-white rounded-lg p-4 sm:p-6 border-2 border-gray-200 hover:shadow-lg transition-all hover:border-gray-300 text-left"
            >
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" />
                </div>
                <span className="text-2xl sm:text-3xl text-gray-600">{stats.closed}</span>
              </div>
              <h3 className="text-base sm:text-lg text-gray-900 mb-1">Închis</h3>
              <p className="text-xs sm:text-sm text-gray-600">Comenzi închise</p>
            </button>
          </>
        )}

        <div 
          onClick={() => navigate('/admin/clients')}
          className="bg-white rounded-lg p-4 sm:p-6 border-2 border-gray-200 hover:shadow-lg transition-shadow cursor-pointer"
        >
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-100 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" />
            </div>
            <span className="text-2xl sm:text-3xl text-gray-600">{stats.totalClients}</span>
          </div>
          <h3 className="text-base sm:text-lg text-gray-900 mb-1">Clienți Totali</h3>
          <p className="text-xs sm:text-sm text-gray-600">Bază de clienți</p>
        </div>

        {/* Total Astazi - Only visible for full-admin and account-manager */}
        {currentUser?.role !== 'production' && (
          <button 
            onClick={() => {
              const todayStr = today.toISOString().split('T')[0];
              navigate(`/admin/orders?date=${todayStr}`);
            }}
            className="bg-white rounded-lg p-4 sm:p-6 border-2 border-gray-200 hover:shadow-lg transition-all hover:border-[#86C2FF] text-left"
          >
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#86C2FF]/20 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-[#86C2FF]" />
              </div>
              <span className="text-2xl sm:text-3xl text-[#86C2FF]">{stats.totalToday.toFixed(2)}</span>
            </div>
            <h3 className="text-base sm:text-lg text-gray-900 mb-1">Total Astazi</h3>
            <p className="text-xs sm:text-sm text-gray-600">Lei</p>
          </button>
        )}
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-lg border-2 border-gray-200 overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg sm:text-xl text-gray-900">Comenzi Recente</h2>
          <button
            onClick={() => navigate('/admin/orders')}
            className="text-sm text-yellow-600 hover:text-yellow-700"
          >
            <span className="hidden sm:inline">Vezi Toate →</span>
            <span className="sm:hidden">Toate →</span>
          </button>
        </div>

        {/* Mobile: Card View */}
        <div className="block lg:hidden divide-y divide-gray-200">
          {recentOrders.length === 0 ? (
            <div className="px-4 py-8 text-center text-gray-500 text-sm">
              Nu există comenzi încă
            </div>
          ) : (
            recentOrders.map((order) => (
              <div
                key={order.id}
                onClick={() => navigate(`/admin/orders/${order.id}`)}
                className="p-4 hover:bg-gray-50 active:bg-gray-100 transition-colors cursor-pointer"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-sm text-gray-900 mb-1">#{order.id.slice(-8)}</p>
                    <p className="text-sm text-gray-600">{order.clientName}</p>
                  </div>
                  <span className={`status-badge inline-flex px-2 py-1 text-xs rounded-full ${getStatusColor(order.status)}`}>
                    {getStatusLabel(order.status)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-600">
                  <span>{new Date(order.orderDate).toLocaleDateString('ro-RO')}</span>
                  <span className="text-gray-900">{order.totalPrice.toFixed(2)} lei</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Desktop: Table View */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase tracking-wider">ID Comandă</th>
                <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase tracking-wider">Client</th>
                <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase tracking-wider">Data</th>
                <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase tracking-wider">Total</th>
                <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    Nu există comenzi încă
                  </td>
                </tr>
              ) : (
                recentOrders.map((order) => (
                  <tr 
                    key={order.id} 
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => navigate(`/admin/orders/${order.id}`)}
                  >
                    <td className="px-6 py-4 text-sm text-gray-900">#{order.id.slice(-8)}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{order.clientName}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(order.orderDate).toLocaleDateString('ro-RO')}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{order.totalPrice.toFixed(2)} lei</td>
                    <td className="px-6 py-4">
                      <span className={`status-badge inline-flex px-3 py-1 text-xs rounded-full ${getStatusColor(order.status)}`}>
                        {getStatusLabel(order.status)}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Notification Settings */}
      {currentUser?.role === 'full-admin' && (
        <div className="mt-6">
          <NotificationSettings />
        </div>
      )}
    </AdminLayout>
  );
};