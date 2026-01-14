import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { useAdmin, OrderStatus } from '../../context/AdminContext';
import { Download, TrendingUp, DollarSign, ShoppingCart, Calendar, Eye } from 'lucide-react';
import { CacheService, CACHE_KEYS } from '../../lib/cacheService';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const { useState, useEffect, useMemo } = React;

type DateFilter = 'today' | 'week' | 'month' | 'year' | 'custom' | 'all';

export const AdminFinancialsPage: React.FC = () => {
  const navigate = useNavigate();
  const { orders, currentUser, refreshData } = useAdmin();
  
  // Force fresh data load on mount (clear cache)
  useEffect(() => {
    const loadFreshData = async () => {
      console.log('🔄 AdminFinancialsPage: Clearing orders cache and forcing fresh load...');
      CacheService.invalidate(CACHE_KEYS.ORDERS);
      await refreshData();
      console.log('✅ AdminFinancialsPage: Fresh financial data loaded');
    };
    loadFreshData();
  }, []); // Run once on mount

  const [dateFilter, setDateFilter] = useState<DateFilter>('today');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // Filter orders by date
  const filteredOrders = useMemo(() => {
    const now = new Date();
    
    return orders.filter(order => {
      const orderDate = new Date(order.orderDate);
      
      switch (dateFilter) {
        case 'today':
          return orderDate.toDateString() === now.toDateString();
        
        case 'week':
          const weekAgo = new Date(now);
          weekAgo.setDate(weekAgo.getDate() - 7);
          return orderDate >= weekAgo;
        
        case 'month':
          return orderDate.getMonth() === selectedMonth && orderDate.getFullYear() === selectedYear;
        
        case 'year':
          return orderDate.getFullYear() === selectedYear;
        
        case 'custom':
          if (customStartDate && customEndDate) {
            const start = new Date(customStartDate);
            const end = new Date(customEndDate);
            end.setHours(23, 59, 59, 999); // Include full end date
            return orderDate >= start && orderDate <= end;
          }
          return true;
        
        case 'all':
        default:
          return true;
      }
    });
  }, [orders, dateFilter, selectedMonth, selectedYear, customStartDate, customEndDate]);

  // Calculate financial metrics with order status breakdown
  const financialMetrics = useMemo(() => {
    let totalIncome = 0;
    let returnedAmount = 0;
    
    // Breakdown by status
    let newOrdersIncome = 0;
    let newOrdersCount = 0;
    let inProductionIncome = 0;
    let inProductionCount = 0;
    let deliveredIncome = 0;
    let deliveredCount = 0;

    filteredOrders.forEach(order => {
      if (order.status === 'returned') {
        returnedAmount += order.totalPrice;
      } else if (order.status === 'new') {
        newOrdersIncome += order.totalPrice;
        newOrdersCount++;
        totalIncome += order.totalPrice;
      } else if (order.status === 'in-production' || order.status === 'queue') {
        inProductionIncome += order.totalPrice;
        inProductionCount++;
        totalIncome += order.totalPrice;
      } else if (order.status === 'delivered') {
        deliveredIncome += order.totalPrice;
        deliveredCount++;
        totalIncome += order.totalPrice;
      } else if (order.status !== 'closed') {
        totalIncome += order.totalPrice;
      }
    });

    const netIncome = totalIncome - returnedAmount;
    const returnedCount = filteredOrders.filter(o => o.status === 'returned').length;

    return {
      totalIncome,
      returnedAmount,
      netIncome,
      newOrdersIncome,
      newOrdersCount,
      inProductionIncome,
      inProductionCount,
      deliveredIncome,
      deliveredCount,
      returnedCount,
      totalOrders: filteredOrders.length,
    };
  }, [filteredOrders]);

  // Prepare chart data - Daily income over period
  const dailyIncomeData = useMemo(() => {
    const incomeByDate: { [key: string]: { date: string; income: number; returned: number; orders: number } } = {};
    
    filteredOrders.forEach(order => {
      const dateKey = new Date(order.orderDate).toLocaleDateString('ro-RO');
      
      if (!incomeByDate[dateKey]) {
        incomeByDate[dateKey] = { date: dateKey, income: 0, returned: 0, orders: 0 };
      }
      
      if (order.status === 'returned') {
        incomeByDate[dateKey].returned += order.totalPrice;
      } else if (order.status !== 'closed') {
        incomeByDate[dateKey].income += order.totalPrice;
      }
      
      incomeByDate[dateKey].orders += 1;
    });

    return Object.values(incomeByDate).sort((a, b) => {
      const dateA = new Date(a.date.split('.').reverse().join('-'));
      const dateB = new Date(b.date.split('.').reverse().join('-'));
      return dateA.getTime() - dateB.getTime();
    });
  }, [filteredOrders]);

  // Status distribution for pie chart
  const statusDistribution = useMemo(() => {
    const distribution: { [key: string]: number } = {
      'Livrat': 0,
      'În Producție': 0,
      'În Așteptare': 0,
      'Nou': 0,
      'Returnat': 0,
    };

    filteredOrders.forEach(order => {
      if (order.status === 'delivered') distribution['Livrat']++;
      else if (order.status === 'in-production') distribution['În Producție']++;
      else if (order.status === 'queue') distribution['În Așteptare']++;
      else if (order.status === 'new') distribution['Nou']++;
      else if (order.status === 'returned') distribution['Returnat']++;
    });

    return Object.entries(distribution)
      .filter(([_, value]) => value > 0)
      .map(([name, value]) => ({ name, value }));
  }, [filteredOrders]);

  // Map status names to colors matching the status badges
  const getStatusChartColor = (statusName: string) => {
    switch (statusName) {
      case 'Livrat': return '#10b981'; // green
      case 'În Producție': return '#eab308'; // yellow
      case 'În Așteptare': return '#8b5cf6'; // purple
      case 'Nou': return '#3b82f6'; // blue
      case 'Returnat': return '#ef4444'; // red
      default: return '#6b7280'; // gray
    }
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

  const exportToCSV = () => {
    const headers = ['ID Comandă', 'Client', 'Email', 'Data', 'Status', 'Total (lei)', 'Tablouri'];
    const rows = filteredOrders.map(order => [
      `#${order.id.slice(-8)}`,
      order.clientName,
      order.clientEmail,
      new Date(order.orderDate).toLocaleDateString('ro-RO'),
      getStatusLabel(order.status),
      order.status === 'returned' ? `-${order.totalPrice.toFixed(2)}` : order.totalPrice.toFixed(2),
      order.canvasItems.length,
    ]);

    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `financials_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Generate year options (last 5 years + current)
  const yearOptions = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 6 }, (_, i) => currentYear - i);
  }, []);

  const monthNames = ['Ian', 'Feb', 'Mar', 'Apr', 'Mai', 'Iun', 'Iul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl text-gray-900">Financiare</h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1">Rapoarte financiare și analiză venituri</p>
          </div>
          <button
            onClick={exportToCSV}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg border-2 border-gray-200 p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Calendar className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg text-gray-900">Filtre Perioadă</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Quick Filter */}
            <div>
              <label className="block text-sm text-gray-700 mb-2">Filtrare Rapidă</label>
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value as DateFilter)}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-yellow-500 focus:outline-none"
              >
                <option value="all">Toate Perioadele</option>
                <option value="today">Astăzi</option>
                <option value="week">Ultimele 7 Zile</option>
                <option value="month">Lună Specifică</option>
                <option value="year">An Specific</option>
                <option value="custom">Perioadă Personalizată</option>
              </select>
            </div>

            {/* Month/Year Selector */}
            {(dateFilter === 'month' || dateFilter === 'year') && (
              <>
                {dateFilter === 'month' && (
                  <div>
                    <label className="block text-sm text-gray-700 mb-2">Luna</label>
                    <select
                      value={selectedMonth}
                      onChange={(e) => setSelectedMonth(Number(e.target.value))}
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-yellow-500 focus:outline-none"
                    >
                      {monthNames.map((month, index) => (
                        <option key={index} value={index}>{month}</option>
                      ))}
                    </select>
                  </div>
                )}
                <div>
                  <label className="block text-sm text-gray-700 mb-2">Anul</label>
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(Number(e.target.value))}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-yellow-500 focus:outline-none"
                  >
                    {yearOptions.map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
              </>
            )}

            {/* Custom Date Range */}
            {dateFilter === 'custom' && (
              <>
                <div>
                  <label className="block text-sm text-gray-700 mb-2">Data Start</label>
                  <input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-yellow-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-2">Data Sfârșit</label>
                  <input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-yellow-500 focus:outline-none"
                  />
                </div>
              </>
            )}
          </div>
        </div>

        {/* Financial Summary Cards - Single Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Income with Returns Math */}
          <div className="bg-white rounded-lg border-2 border-gray-300 p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-700">Venit Total</p>
              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-gray-600" />
              </div>
            </div>
            <p className="text-2xl text-gray-900 mb-1">{financialMetrics.netIncome.toFixed(2)} lei</p>
            <p className="text-xs text-gray-500">
              {financialMetrics.totalIncome.toFixed(2)} - {financialMetrics.returnedAmount.toFixed(2)} = {financialMetrics.netIncome.toFixed(2)}
            </p>
          </div>

          {/* New Orders + In Production Combined */}
          <div className="bg-white rounded-lg border-2 border-purple-300 p-6 bg-purple-50">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-purple-800">Noi + În Producție</p>
              <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                <span className="text-purple-800 text-sm font-semibold">
                  {financialMetrics.newOrdersCount + financialMetrics.inProductionCount}
                </span>
              </div>
            </div>
            <p className="text-2xl text-purple-900 mb-1">
              {(financialMetrics.newOrdersIncome + financialMetrics.inProductionIncome).toFixed(2)} lei
            </p>
            <p className="text-xs text-purple-700">În proces</p>
          </div>

          {/* Delivered Orders */}
          <div className="bg-white rounded-lg border-2 border-green-300 p-6 bg-green-50">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-green-800">Livrate</p>
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                <span className="text-green-800 text-sm font-semibold">{financialMetrics.deliveredCount}</span>
              </div>
            </div>
            <p className="text-2xl text-green-900 mb-1">{financialMetrics.deliveredIncome.toFixed(2)} lei</p>
            <p className="text-xs text-green-700">Finalizate</p>
          </div>

          {/* Returns */}
          <div className="bg-white rounded-lg border-2 border-red-300 p-6 bg-red-50">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-red-800">Retururi</p>
              <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                <span className="text-red-800 text-sm font-semibold">{financialMetrics.returnedCount}</span>
              </div>
            </div>
            <p className="text-2xl text-red-900 mb-1">-{financialMetrics.returnedAmount.toFixed(2)} lei</p>
            <p className="text-xs text-red-700">Comenzi returnate</p>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Daily Income Chart */}
          <div className="bg-white rounded-lg border-2 border-gray-200 p-6">
            <h3 className="text-lg text-gray-900 mb-4">Venituri pe Zile</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dailyIncomeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="income" fill="#10b981" name="Venit" />
                <Bar dataKey="returned" fill="#ef4444" name="Returnat" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Status Distribution */}
          <div className="bg-white rounded-lg border-2 border-gray-200 p-6">
            <h3 className="text-lg text-gray-900 mb-4">Distribuție Statusuri</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getStatusChartColor(entry.name)} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-lg border-2 border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg text-gray-900">Comenzi Detaliate</h3>
            <p className="text-sm text-gray-600 mt-1">{filteredOrders.length} comenzi în perioada selectată</p>
          </div>

          {/* Mobile Card View */}
          <div className="block lg:hidden divide-y divide-gray-200">
            {filteredOrders.length === 0 ? (
              <div className="p-8 text-center text-gray-500 text-sm">
                Nu există comenzi în perioada selectată
              </div>
            ) : (
              filteredOrders.map(order => (
                <div key={order.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="text-sm text-gray-900 mb-1">#{order.id.slice(-8)}</p>
                      <p className="text-sm text-gray-600">{order.clientName}</p>
                      <p className="text-xs text-gray-500 mt-1">{order.clientEmail}</p>
                    </div>
                    <span className={`status-badge px-2 py-1 text-xs rounded-full ${getStatusColor(order.status)}`}>
                      {getStatusLabel(order.status)}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-xs mb-3">
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
                  <button
                    onClick={() => navigate(`/admin/orders/${order.id}`)}
                    className="w-full px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors text-sm flex items-center justify-center space-x-2"
                  >
                    <Eye className="w-4 h-4" />
                    <span>Vezi Detalii</span>
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Desktop Table */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase tracking-wider">Client</th>
                  <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase tracking-wider">Data</th>
                  <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase tracking-wider">Tablouri</th>
                  <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase tracking-wider">Total</th>
                  <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase tracking-wider">Acțiuni</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                      Nu există comenzi în perioada selectată
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map(order => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900">#{order.id.slice(-8)}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{order.clientName}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{order.clientEmail}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(order.orderDate).toLocaleDateString('ro-RO')}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`status-badge px-3 py-1 text-xs rounded-full ${getStatusColor(order.status)}`}>
                          {getStatusLabel(order.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">{order.canvasItems.length}</td>
                      <td className={`px-6 py-4 text-sm ${order.status === 'returned' ? 'text-red-600' : 'text-gray-900'}`}>
                        {order.status === 'returned' ? '-' : ''}{order.totalPrice.toFixed(2)} lei
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => navigate(`/admin/orders/${order.id}`)}
                          className="inline-flex items-center space-x-2 px-3 py-1.5 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors text-sm"
                        >
                          <Eye className="w-4 h-4" />
                          <span>Vezi</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};