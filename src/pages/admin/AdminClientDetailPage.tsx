import React from 'react';
import { useParams, useNavigate } from 'react-router';
import { ArrowLeft, Mail, Phone, MapPin, Calendar, DollarSign, Package, Eye, Building2, Edit2, X, Check } from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { useAdmin } from '../../context/AdminContext';

export const AdminClientDetailPage: React.FC = () => {
  const { clientId } = useParams<{ clientId: string }>();
  const navigate = useNavigate();
  const { clients, getClientOrders } = useAdmin();
  const [isEditingCompany, setIsEditingCompany] = React.useState(false);
  const [companyData, setCompanyData] = React.useState({
    companyName: '',
    cui: '',
    regCom: '',
    companyCounty: '',
    companyCity: '',
    companyAddress: '',
  });
  
  const client = clients.find(c => c.id === clientId);
  const clientOrders = client ? getClientOrders(client.id) : [];

  // Find the most recent order with company information
  const companyOrder = clientOrders
    .filter(order => order.personType === 'juridica')
    .sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime())[0];

  // Initialize company data from the order
  React.useEffect(() => {
    if (companyOrder) {
      setCompanyData({
        companyName: companyOrder.companyName || '',
        cui: companyOrder.cui || '',
        regCom: companyOrder.regCom || '',
        companyCounty: companyOrder.companyCounty || '',
        companyCity: companyOrder.companyCity || '',
        companyAddress: companyOrder.companyAddress || '',
      });
    }
  }, [companyOrder]);

  const handleSaveCompany = () => {
    // TODO: Implement update functionality
    // This would update all orders with personType === 'juridica' for this client
    setIsEditingCompany(false);
  };

  const handleCancelEdit = () => {
    // Reset to original data
    if (companyOrder) {
      setCompanyData({
        companyName: companyOrder.companyName || '',
        cui: companyOrder.cui || '',
        regCom: companyOrder.regCom || '',
        companyCounty: companyOrder.companyCounty || '',
        companyCity: companyOrder.companyCity || '',
        companyAddress: companyOrder.companyAddress || '',
      });
    }
    setIsEditingCompany(false);
  };

  if (!client) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <p className="text-gray-600 mb-4">Clientul nu a fost găsit</p>
          <button
            onClick={() => navigate('/admin/clients')}
            className="px-6 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
          >
            Înapoi la Clienți
          </button>
        </div>
      </AdminLayout>
    );
  }

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
        <button
          onClick={() => navigate('/admin/clients')}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Înapoi la Clienți</span>
        </button>
        
        <h1 className="text-2xl sm:text-3xl text-gray-900 mb-2">{client.fullName}</h1>
        <p className="text-sm sm:text-base text-gray-600">
          Client înregistrat din {new Date(client.registeredDate).toLocaleDateString('ro-RO')}
        </p>
      </div>

      {/* Client Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-4 sm:mb-6">
        <div className="bg-white rounded-lg p-4 sm:p-6 border-2 border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <Package className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-600" />
            <span className="text-2xl sm:text-3xl text-yellow-600">{client.totalOrders}</span>
          </div>
          <p className="text-xs sm:text-sm text-gray-600">Comenzi Totale</p>
        </div>

        <div className="bg-white rounded-lg p-4 sm:p-6 border-2 border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
            <span className="text-2xl sm:text-3xl text-green-600">{client.totalSpent.toFixed(2)}</span>
          </div>
          <p className="text-xs sm:text-sm text-gray-600">Lei Cheltuiți</p>
        </div>

        <div className="bg-white rounded-lg p-4 sm:p-6 border-2 border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
            <span className="text-2xl sm:text-3xl text-blue-600">
              {client.totalOrders > 0 ? Math.round(client.totalSpent / client.totalOrders) : 0}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-gray-600">Valoare Medie</p>
        </div>

        <div className="bg-white rounded-lg p-4 sm:p-6 border-2 border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <Calendar className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600" />
            <span className="text-2xl sm:text-3xl text-purple-600">
              {Math.floor((Date.now() - new Date(client.registeredDate).getTime()) / (1000 * 60 * 60 * 24))}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-gray-600">Zile Client</p>
        </div>
      </div>

      {/* Client Contact Info */}
      <div className="bg-white rounded-lg border-2 border-gray-200 p-4 sm:p-6 mb-4 sm:mb-6">
        <h3 className="text-base sm:text-lg text-gray-900 mb-4">Informații Contact</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <div className="flex items-start space-x-3">
            <Mail className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs sm:text-sm text-gray-600">Email</p>
              <p className="text-sm sm:text-base text-gray-900">{client.email}</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <Phone className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs sm:text-sm text-gray-600">Telefon</p>
              <p className="text-sm sm:text-base text-gray-900">{client.phone}</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <MapPin className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs sm:text-sm text-gray-600">Adresă</p>
              <p className="text-sm sm:text-base text-gray-900">{client.address}</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <MapPin className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs sm:text-sm text-gray-600">Oraș</p>
              <p className="text-sm sm:text-base text-gray-900">{client.city}</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <MapPin className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs sm:text-sm text-gray-600">Județ</p>
              <p className="text-sm sm:text-base text-gray-900">{client.county || '-'}</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <MapPin className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs sm:text-sm text-gray-600">Cod Poștal</p>
              <p className="text-sm sm:text-base text-gray-900">{client.postalCode}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Company Info - Only show if client has ordered as juridica */}
      {companyOrder && (
        <div className="bg-white rounded-lg border-2 border-gray-200 p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base sm:text-lg text-gray-900">Informații Companie</h3>
            {!isEditingCompany && (
              <button
                onClick={() => setIsEditingCompany(true)}
                className="inline-flex items-center space-x-2 px-3 py-1.5 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors text-sm">
                <Edit2 className="w-4 h-4" />
                <span>Editează</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div className="flex items-start space-x-3">
              <Building2 className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-xs sm:text-sm text-gray-600">Nume Companie</p>
                {isEditingCompany ? (
                  <input
                    type="text"
                    value={companyData.companyName}
                    onChange={(e) => setCompanyData({ ...companyData, companyName: e.target.value })}
                    className="w-full text-sm sm:text-base text-gray-900 border-2 border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  />
                ) : (
                  <p className="text-sm sm:text-base text-gray-900">{companyData.companyName || '-'}</p>
                )}
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Building2 className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-xs sm:text-sm text-gray-600">CUI</p>
                {isEditingCompany ? (
                  <input
                    type="text"
                    value={companyData.cui}
                    onChange={(e) => setCompanyData({ ...companyData, cui: e.target.value })}
                    className="w-full text-sm sm:text-base text-gray-900 border-2 border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  />
                ) : (
                  <p className="text-sm sm:text-base text-gray-900">{companyData.cui || '-'}</p>
                )}
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Building2 className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-xs sm:text-sm text-gray-600">Reg. Com.</p>
                {isEditingCompany ? (
                  <input
                    type="text"
                    value={companyData.regCom}
                    onChange={(e) => setCompanyData({ ...companyData, regCom: e.target.value })}
                    className="w-full text-sm sm:text-base text-gray-900 border-2 border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  />
                ) : (
                  <p className="text-sm sm:text-base text-gray-900">{companyData.regCom || '-'}</p>
                )}
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <MapPin className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-xs sm:text-sm text-gray-600">Județ</p>
                {isEditingCompany ? (
                  <input
                    type="text"
                    value={companyData.companyCounty}
                    onChange={(e) => setCompanyData({ ...companyData, companyCounty: e.target.value })}
                    className="w-full text-sm sm:text-base text-gray-900 border-2 border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  />
                ) : (
                  <p className="text-sm sm:text-base text-gray-900">{companyData.companyCounty || '-'}</p>
                )}
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <MapPin className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-xs sm:text-sm text-gray-600">Oraș</p>
                {isEditingCompany ? (
                  <input
                    type="text"
                    value={companyData.companyCity}
                    onChange={(e) => setCompanyData({ ...companyData, companyCity: e.target.value })}
                    className="w-full text-sm sm:text-base text-gray-900 border-2 border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  />
                ) : (
                  <p className="text-sm sm:text-base text-gray-900">{companyData.companyCity || '-'}</p>
                )}
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <MapPin className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-xs sm:text-sm text-gray-600">Adresă Sediu</p>
                {isEditingCompany ? (
                  <textarea
                    value={companyData.companyAddress}
                    onChange={(e) => setCompanyData({ ...companyData, companyAddress: e.target.value })}
                    rows={2}
                    className="w-full text-sm sm:text-base text-gray-900 border-2 border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-yellow-500 resize-none"
                  />
                ) : (
                  <p className="text-sm sm:text-base text-gray-900">{companyData.companyAddress || '-'}</p>
                )}
              </div>
            </div>
          </div>

          {isEditingCompany && (
            <div className="mt-4 flex items-center space-x-2">
              <button
                onClick={handleSaveCompany}
                className="inline-flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm">
                <Check className="w-4 h-4" />
                <span>Salvează</span>
              </button>
              <button
                onClick={handleCancelEdit}
                className="inline-flex items-center space-x-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm">
                <X className="w-4 h-4" />
                <span>Anulează</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Order History */}
      <div className="bg-white rounded-lg border-2 border-gray-200 overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-gray-200">
          <h2 className="text-lg sm:text-xl text-gray-900">Istoric Comenzi ({clientOrders.length})</h2>
        </div>

        {/* Mobile: Card View */}
        <div className="block lg:hidden divide-y divide-gray-200">
          {clientOrders.length === 0 ? (
            <div className="px-4 py-8 text-center text-gray-500 text-sm">
              Nu există comenzi pentru acest client
            </div>
          ) : (
            clientOrders.map((order) => (
              <div
                key={order.id}
                onClick={() => navigate(`/admin/orders/${order.id}`)}
                className="p-4 hover:bg-gray-50 active:bg-gray-100 transition-colors cursor-pointer"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-sm text-gray-900 mb-1">#{order.id.slice(-8)}</p>
                    <p className="text-xs text-gray-600">{new Date(order.orderDate).toLocaleDateString('ro-RO')}</p>
                  </div>
                  <span className={`status-badge inline-flex px-2 py-1 text-xs rounded-full ${getStatusColor(order.status)}`}>
                    {getStatusLabel(order.status)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600">{order.canvasItems.length} tablouri</span>
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
                <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase tracking-wider">Data</th>
                <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase tracking-wider">Tablouri</th>
                <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase tracking-wider">Total</th>
                <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase tracking-wider">Acțiuni</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {clientOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    Nu există comenzi pentru acest client
                  </td>
                </tr>
              ) : (
                clientOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">#{order.id.slice(-8)}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(order.orderDate).toLocaleDateString('ro-RO')}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{order.canvasItems.length}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{order.totalPrice.toFixed(2)} lei</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-3 py-1 text-xs rounded-full ${getStatusColor(order.status)}`}>
                        {getStatusLabel(order.status)}
                      </span>
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
    </AdminLayout>
  );
};