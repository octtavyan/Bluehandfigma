import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { 
  ArrowLeft, Package, User, MapPin, CreditCard, Calendar, 
  Truck, FileText, Download, Eye, X, ExternalLink, Mail, Phone,
  CheckCircle, AlertCircle, Clock, XCircle, ChevronDown, ChevronUp,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { useAdmin, OrderStatus } from '../../context/AdminContext';
import { projectId, publicAnonKey } from '../../utils/supabase/info';
import { ordersService, canvasSizesService, frameTypesService } from '../../lib/supabaseDataService';

interface Order {
  id: string;
  orderNumber: string;
  orderDate: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  address: string;
  city: string;
  county: string;
  postalCode: string;
  totalPrice: number;
  paymentMethod: string;
  paymentStatus: string;
  deliveryStatus: string;
  notes?: string;
  canvasItems: CanvasItem[];
  personType?: 'fizica' | 'juridica';
  companyName?: string;
  companyAddress?: string;
  companyCity?: string;
  companyCounty?: string;
  cui?: string;
  regCom?: string;
  invoiceUrl?: string;
  // FGO Invoice fields
  fgoInvoiceNumber?: string;
  fgoInvoiceSerie?: string;
  fgoInvoiceLink?: string;
  fgoInvoiceGeneratedAt?: string;
}

interface CanvasItem {
  type: 'personalized' | 'regular';
  paintingId?: string;
  paintingTitle?: string;
  size: string;
  orientation?: string;
  price: number;
  frameType?: string;
  croppedImage?: string;
  originalImage?: string;
  image?: string;
  printType?: string;
  unsplashUrl?: string; // Unsplash artist page link
}

interface Size {
  id: string;
  width: number;
  height: number;
  price: number;
  discount?: number;
  framePrices?: {
    [key: string]: {
      price: number;
      discount: number;
    };
  };
}

interface FrameType {
  id: string;
  name: string;
}

const statusConfig = {
  payment: {
    unpaid: { label: 'Neplătit', color: 'text-yellow-600' },
    paid: { label: 'Plătit', color: 'text-green-600' },
    cod: { label: 'Plata la Livrare', color: 'text-blue-600' },
    failed: { label: 'Eșuată', color: 'text-red-600' }
  },
  delivery: {
    new: { label: 'Nou', color: 'text-blue-600' },
    queue: { label: 'În Așteptare', color: 'text-yellow-600' },
    'in-production': { label: 'În Producție', color: 'text-orange-600' },
    delivered: { label: 'Livrat', color: 'text-green-600' },
    returned: { label: 'Returnat', color: 'text-red-600' },
    closed: { label: 'Închis', color: 'text-gray-600' }
  }
};

// Helper function to get available statuses based on user role
const getAvailableStatuses = (userRole: string | undefined): OrderStatus[] => {
  if (userRole === 'production') {
    // Production manager sees: in-production, delivered, returned, closed
    return ['in-production', 'delivered', 'returned', 'closed'];
  }
  // Account manager and full-admin see all statuses
  return ['new', 'queue', 'in-production', 'delivered', 'returned', 'closed'];
};

export default function AdminOrderDetailPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { currentUser, refreshData, updateOrderStatus } = useAdmin();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [showPaymentDropdown, setShowPaymentDropdown] = useState(false);
  const [showDeliveryDropdown, setShowDeliveryDropdown] = useState(false);
  const [sizes, setSizes] = useState<Size[]>([]);
  const [frameTypes, setFrameTypes] = useState<FrameType[]>([]);
  const [invoiceUrl, setInvoiceUrl] = useState<string | null>(null);
  const [invoiceLoading, setInvoiceLoading] = useState(false);
  const [internalNotes, setInternalNotes] = useState('');

  useEffect(() => {
    fetchOrder();
    fetchSizes();
    fetchFrameTypes();
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      if (!orderId) {
        throw new Error('Order ID is missing');
      }
      
      const data = await ordersService.getById(orderId);
      
      if (!data) {
        throw new Error('Order not found');
      }
      

      
      // Transform the data to match the component's expected format
      const transformedOrder = {
        id: data.id,
        orderNumber: data.orderNumber || '',
        orderDate: data.createdAt,
        clientName: data.customerName,
        clientEmail: data.customerEmail,
        clientPhone: data.customerPhone || '',
        address: data.deliveryAddress || '',
        city: data.deliveryCity || '',
        county: data.deliveryCounty || '',
        postalCode: data.deliveryPostalCode || '',
        totalPrice: data.total,
        paymentMethod: data.paymentMethod || 'card',
        paymentStatus: data.paymentStatus || 'pending',
        deliveryStatus: data.status || 'pending',
        notes: data.notes || '',
        canvasItems: data.items || [],
        personType: data.personType,
        companyName: data.companyName,
        companyAddress: data.companyAddress,
        companyCity: data.companyCity,
        companyCounty: data.companyCounty,
        cui: data.cui,
        regCom: data.regCom,
        invoiceUrl: data.invoiceUrl,
        fgoInvoiceNumber: data.fgoInvoiceNumber,
        fgoInvoiceSerie: data.fgoInvoiceSerie,
        fgoInvoiceLink: data.fgoInvoiceLink,
        fgoInvoiceGeneratedAt: data.fgoInvoiceGeneratedAt
      };
      
      setOrder(transformedOrder);
      setInternalNotes(transformedOrder.notes);
      
      // Load invoice URL from database if it exists
      // Prioritize FGO invoice if available
      if (data.fgoInvoiceLink) {
        setInvoiceUrl(data.fgoInvoiceLink);
      } else if (data.invoiceUrl) {
        setInvoiceUrl(data.invoiceUrl);
      } else {
        setInvoiceUrl(null);
      }
    } catch (error) {
      console.error('Error fetching order:', error);
      toast.error('Eroare la încărcarea comenzii');
    } finally {
      setLoading(false);
    }
  };

  const fetchInvoiceUrl = async (orderNumber: string) => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-bbc0c500/invoices/${orderNumber}`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.cloudinaryUrl) {
          setInvoiceUrl(data.cloudinaryUrl);
        }
      }
    } catch (error) {
      console.error('Error fetching invoice:', error);
    }
  };

  const fetchSizes = async () => {
    try {
      const data = await canvasSizesService.getAll();
      setSizes(data);
    } catch (error) {
      console.error('Error fetching sizes:', error);
    }
  };

  const fetchFrameTypes = async () => {
    try {
      const data = await frameTypesService.getAll();
      setFrameTypes(data);
    } catch (error) {
      console.error('Error fetching frame types:', error);
    }
  };

  const getFrameTypeById = (id: string) => {
    return frameTypes.find(f => f.id === id);
  };

  const regenerateInvoice = async () => {
    if (!order || !orderId) return;
    
    setInvoiceLoading(true);
    try {
      // Generate invoice
      const invoiceData = {
        orderNumber: order.orderNumber,
        orderDate: order.orderDate,
        customerName: order.clientName,
        customerEmail: order.clientEmail,
        customerPhone: order.clientPhone,
        customerAddress: order.address || '',
        customerCity: order.city || '',
        customerCounty: order.county || '',
        customerPostalCode: order.postalCode || '',
        total: order.totalPrice,
        deliveryPrice: 0,
        items: order.canvasItems.map(item => {
          return {
            name: item.type === 'personalized' ? 'Tablou Personalizat' : item.paintingTitle || 'Tablou',
            paintingTitle: item.type === 'personalized' ? 'Tablou Personalizat' : item.paintingTitle || 'Tablou',
            size: item.size || 'N/A',
            orientation: item.orientation || '',
            quantity: 1,
            price: item.price, // Use the actual item price (includes VAT)
            total: item.price  // Total is same as price for quantity=1
          };
        }),
        billingName: order.personType === 'juridica' ? order.companyName : order.clientName,
        billingAddress: order.personType === 'juridica' 
          ? `${order.companyAddress || ''}, ${order.companyCity || ''}, ${order.companyCounty || ''}`.trim()
          : `${order.address || ''}, ${order.city || ''}, ${order.county || ''}${order.postalCode ? ', ' + order.postalCode : ''}`.trim(),
        billingCUI: order.cui || '',
        billingRegCom: order.regCom || '',
        // Include FGO invoice details if they exist
        fgoInvoiceNumber: order.fgoInvoiceNumber || undefined,
        fgoInvoiceSerie: order.fgoInvoiceSerie || undefined
      };
      
      const generateResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-bbc0c500/invoice/generate`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(invoiceData)
        }
      );
      
      console.log('📡 Invoice generation response status:', generateResponse.status);
      
      if (!generateResponse.ok) {
        const errorText = await generateResponse.text();
        console.error('❌ Invoice generation error response:', errorText);
        throw new Error(`Failed to generate invoice: ${generateResponse.status} - ${errorText}`);
      }
      
      const result = await generateResponse.json();
      
      if (result.success && result.invoiceNumber) {
        // Invoice is stored in KV
        setInvoiceUrl('generated');
        
        // Save flag to database
        await ordersService.update(orderId, { invoiceUrl: 'generated' });
        toast.success('Factura a fost regenerată și sincronizată cu succes!');
      } else {
        console.error('❌ Invoice generation failed:', result);
        toast.error('Eroare la generarea facturii');
      }
    } catch (error) {
      console.error('❌ Error generating invoice:', error);
      toast.error(error instanceof Error ? error.message : 'Eroare la generarea facturii');
    } finally {
      setInvoiceLoading(false);
    }
  };

  const updateStatus = async (type: 'payment' | 'delivery', newStatus: string) => {
    try {
      if (!orderId) return;
      
      // For delivery status changes, use AdminContext's updateOrderStatus function
      // This will handle stock decrement when status is "delivered"
      if (type === 'delivery') {
        // Call AdminContext's updateOrderStatus which handles stock decrement
        await updateOrderStatus(orderId, newStatus as OrderStatus, undefined, currentUser?.fullName);
        
        toast.success('Status livrare actualizat!');
        
        // If delivery status changed to "delivered", generate invoice (if doesn't exist) and send email
        if (newStatus === 'delivered' && order) {
          let generatedInvoiceUrl = invoiceUrl; // Use existing invoice if available
          
          // Only generate invoice if one doesn't exist
          if (!generatedInvoiceUrl) {
            try {
              const invoiceResponse = await fetch(
                `https://${projectId}.supabase.co/functions/v1/make-server-bbc0c500/invoice/generate`,
                {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${publicAnonKey}`,
                  },
                  body: JSON.stringify({
                    orderNumber: order.orderNumber,
                    orderDate: order.orderDate,
                    customerName: order.clientName,
                    customerEmail: order.clientEmail,
                    customerPhone: order.clientPhone,
                    customerAddress: order.address || '',
                    customerCity: order.city || '',
                    customerCounty: order.county || '',
                    customerPostalCode: order.postalCode || '',
                    total: order.totalPrice,
                    deliveryPrice: 0,
                    items: order.canvasItems.map(item => ({
                      name: item.type === 'personalized' ? 'Tablou Personalizat' : item.paintingTitle || 'Tablou',
                      paintingTitle: item.type === 'personalized' ? 'Tablou Personalizat' : item.paintingTitle || 'Tablou',
                      size: item.size || 'N/A',
                      orientation: item.orientation || '',
                      quantity: 1,
                      price: item.price,
                      total: item.price
                    })),
                    billingName: order.personType === 'juridica' ? order.companyName : order.clientName,
                    billingAddress: order.personType === 'juridica' 
                      ? `${order.companyAddress || ''}, ${order.companyCity || ''}, ${order.companyCounty || ''}`.trim()
                      : `${order.address || ''}, ${order.city || ''}, ${order.county || ''}${order.postalCode ? ', ' + order.postalCode : ''}`.trim(),
                    billingCUI: order.cui || '',
                    billingRegCom: order.regCom || ''
                  })
                }
              );
              
              const invoiceData = await invoiceResponse.json();
              
              if (invoiceData.success && invoiceData.invoiceNumber) {
                // Invoice is stored in KV
                setInvoiceUrl('generated');
                
                // Save flag to database
                await ordersService.update(orderId, { invoiceUrl: 'generated' });
                toast.success('📄 Factură generată și salvată!');
              }
            } catch (error) {
              console.error('❌ Error generating invoice:', error);
              toast.error('Eroare la generarea facturii');
            }
          }
          
          // Send shipped confirmation email with invoice
          try {
            const emailResponse = await fetch(
              `https://${projectId}.supabase.co/functions/v1/make-server-bbc0c500/email/send-shipped-confirmation`,
              {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${publicAnonKey}`,
                },
                body: JSON.stringify({
                  orderNumber: order.orderNumber,
                  customerName: order.clientName,
                  customerEmail: order.clientEmail,
                  invoiceUrl: generatedInvoiceUrl,
                  orderData: order, // Pass full order data for PDF generation
                }),
              }
            );
            
            if (emailResponse.ok) {
              toast.success('📧 Email de confirmare livrare trimis!');
            }
          } catch (error) {
            console.error('❌ Error sending email:', error);
            toast.error('Eroare la trimiterea emailului');
          }
        }
      } else {
        // For payment status, use direct database update (no stock impact)
        const updateData = { paymentStatus: newStatus };
        
        const success = await ordersService.update(orderId, updateData);
        
        if (!success) {
          console.error('❌ Failed to update order status in database');
          toast.error('Eroare la actualizarea statusului în baza de date');
          return;
        }
        
        toast.success('Status plată actualizat!');
      }
      
      // Refresh order data from database
      await fetchOrder();
      
      // Refresh global context data so Orders page and Dashboard show updated status
      await refreshData();
      
      setShowPaymentDropdown(false);
      setShowDeliveryDropdown(false);
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Eroare la actualizarea statusului');
    }
  };

  const saveNotes = async () => {
    try {
      if (!orderId) return;
      
      await ordersService.update(orderId, { notes: internalNotes });
      toast.success('Notițele au fost salvate!');
      fetchOrder();
    } catch (error) {
      console.error('Error saving notes:', error);
      toast.error('Eroare la salvarea notițelor');
    }
  };

  const downloadImage = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
      toast.success('Imagine descărcată!');
    } catch (error) {
      console.error('Error downloading image:', error);
      toast.error('Eroare la descărcarea imaginii');
    }
  };

  const viewInvoice = async () => {
    if (!order) return;
    
    try {
      // Fetch invoice HTML from server
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-bbc0c500/invoice/${order.orderNumber}`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );
      
      if (!response.ok) {
        toast.error('Factura nu a fost găsită');
        return;
      }
      
      const data = await response.json();
      
      if (!data.success || !data.invoice || !data.invoice.html) {
        toast.error('Factura nu conține HTML');
        return;
      }
      
      // Open new window and write HTML directly
      const newWindow = window.open('', '_blank');
      if (!newWindow) {
        toast.error('Vă rugăm să permiteți pop-up-urile pentru acest site');
        return;
      }
      
      newWindow.document.write(data.invoice.html);
      newWindow.document.close();
      
    } catch (error) {
      console.error('❌ Error viewing invoice:', error);
      toast.error('Eroare la afișarea facturii');
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-blue-500 mb-4"></div>
            <p className="text-gray-600">Se încarcă comanda...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!order) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Comandă negăsită</h2>
            <p className="text-gray-600 mb-4">Comanda solicitată nu a putut fi găsită.</p>
            <button
              onClick={() => navigate('/admin/orders')}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Înapoi la comenzi
            </button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div>
        {/* Header */}
        <div className="mb-4">
          <button
            onClick={() => navigate('/admin/orders')}
            className="flex items-center space-x-1 text-gray-600 hover:text-gray-900 mb-3 transition-colors text-xs sm:text-sm"
          >
            <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>Înapoi la Comenzi</span>
          </button>
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h1 className="text-2xl sm:text-3xl text-gray-900">Comandă {order.orderNumber}</h1>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">
                <Calendar className="w-3 h-3 sm:w-3.5 sm:h-3.5 inline mr-1" />
                Creat la {new Date(order.orderDate).toLocaleDateString('ro-RO', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric'
                })}, la {new Date(order.orderDate).toLocaleTimeString('ro-RO', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
              {order.fgoInvoiceSerie && order.fgoInvoiceNumber && (
                <p className="text-xs sm:text-sm text-green-600 mt-1 font-medium">
                  <FileText className="w-3 h-3 sm:w-3.5 sm:h-3.5 inline mr-1" />
                  Factură fiscală: {order.fgoInvoiceSerie}-{order.fgoInvoiceNumber}
                </p>
              )}
            </div>
            
            <div className="flex gap-2">
              {invoiceUrl ? (
                <>
                  <button
                    onClick={viewInvoice}
                    className="px-3 py-1.5 sm:px-4 sm:py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-xs sm:text-sm flex items-center gap-1.5"
                  >
                    <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    {order.fgoInvoiceLink ? 'Vezi Factură FGO' : 'Vezi Factură'}
                  </button>
                  <button
                    onClick={regenerateInvoice}
                    disabled={invoiceLoading}
                    className="px-3 py-1.5 sm:px-4 sm:py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors text-xs sm:text-sm flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${invoiceLoading ? 'animate-spin' : ''}`} />
                    {invoiceLoading ? 'Se regenerează...' : 'Regenerează'}
                  </button>
                </>
              ) : (
                <button
                  onClick={regenerateInvoice}
                  disabled={invoiceLoading}
                  className="px-3 py-1.5 sm:px-4 sm:py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-xs sm:text-sm flex items-center gap-1.5 disabled:opacity-50"
                >
                  <FileText className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${invoiceLoading ? 'animate-spin' : ''}`} />
                  {invoiceLoading ? 'Se generează...' : 'Generează Factură'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Status Cards Row */}
        <div className="grid grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {/* Payment Status */}
          <div className="bg-white rounded-lg p-4 sm:p-6 border-2 border-gray-200">
            <h3 className="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-3">Status Plată</h3>
            <div className="relative">
              <button
                onClick={() => currentUser?.role !== 'production' && setShowPaymentDropdown(!showPaymentDropdown)}
                disabled={currentUser?.role === 'production'}
                className={`w-full flex items-center justify-between px-3 py-2 bg-gray-50 rounded border border-gray-200 transition-colors ${
                  currentUser?.role === 'production' 
                    ? 'cursor-not-allowed opacity-60' 
                    : 'hover:bg-gray-100 cursor-pointer'
                }`}
              >
                <span className={`text-xs sm:text-sm ${statusConfig.payment[order.paymentStatus as keyof typeof statusConfig.payment]?.color || 'text-gray-600'}`}>
                  {statusConfig.payment[order.paymentStatus as keyof typeof statusConfig.payment]?.label || order.paymentStatus}
                </span>
                <ChevronDown className={`w-4 h-4 text-gray-400 ${currentUser?.role === 'production' ? 'opacity-50' : ''}`} />
              </button>
              {showPaymentDropdown && currentUser?.role !== 'production' && (
                <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg">
                  {Object.entries(statusConfig.payment).map(([key, config]) => (
                    <button
                      key={key}
                      onClick={() => updateStatus('payment', key)}
                      className="w-full text-left px-3 py-2 hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg text-xs sm:text-sm"
                    >
                      {config.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Delivery Status - Renamed to Status Comandă */}
          <div className="bg-white rounded-lg p-4 sm:p-6 border-2 border-gray-200">
            <h3 className="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-3">Status Comandă</h3>
            <div className="relative">
              <button
                onClick={() => setShowDeliveryDropdown(!showDeliveryDropdown)}
                className="w-full flex items-center justify-between px-3 py-2 bg-gray-50 rounded border border-gray-200 hover:bg-gray-100 transition-colors"
              >
                <span className={`text-xs sm:text-sm ${statusConfig.delivery[order.deliveryStatus as keyof typeof statusConfig.delivery]?.color || 'text-gray-600'}`}>
                  {statusConfig.delivery[order.deliveryStatus as keyof typeof statusConfig.delivery]?.label || order.deliveryStatus}
                </span>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </button>
              {showDeliveryDropdown && (
                <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg">
                  {getAvailableStatuses(currentUser?.role).map((statusKey) => {
                    const config = statusConfig.delivery[statusKey as keyof typeof statusConfig.delivery];
                    return (
                      <button
                        key={statusKey}
                        onClick={() => updateStatus('delivery', statusKey)}
                        className="w-full text-left px-3 py-2 hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg text-xs sm:text-sm"
                      >
                        {config.label}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Info Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {/* Customer Info */}
          <div className="bg-white rounded-lg border-2 border-gray-200 p-4 sm:p-6">
            <div className="flex items-center gap-2 mb-3 sm:mb-4">
              <User className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500" />
              <h3 className="text-base sm:text-lg text-gray-900">Informații Client</h3>
            </div>
            <div className="space-y-2 text-xs sm:text-sm">
              <div>
                <p className="text-gray-600">Nume</p>
                <p className="text-gray-900">{order.clientName}</p>
              </div>
              <div>
                <p className="text-gray-600">Email</p>
                <p className="text-gray-900 break-all">{order.clientEmail}</p>
              </div>
              <div>
                <p className="text-gray-600">Telefon</p>
                <p className="text-gray-900">{order.clientPhone}</p>
              </div>
            </div>
          </div>

          {/* Delivery Info */}
          <div className="bg-white rounded-lg border-2 border-gray-200 p-4 sm:p-6">
            <div className="flex items-center gap-2 mb-3 sm:mb-4">
              <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500" />
              <h3 className="text-base sm:text-lg text-gray-900">Informații Livrare</h3>
            </div>
            <div className="space-y-2 text-xs sm:text-sm">
              <div>
                <p className="text-gray-600">Adresă</p>
                <p className="text-gray-900">{order.address}</p>
              </div>
              <div>
                <p className="text-gray-600">Oraș</p>
                <p className="text-gray-900">{order.city}</p>
              </div>
              <div>
                <p className="text-gray-600">Județ</p>
                <p className="text-gray-900">{order.county}</p>
              </div>
              {order.postalCode && (
                <div>
                  <p className="text-gray-600">Cod Poștal</p>
                  <p className="text-gray-900">{order.postalCode}</p>
                </div>
              )}
              <div className="pt-2 border-t border-gray-200">
                <p className="text-gray-600">Modalitate Livrare</p>
                <p className="text-gray-900">Standard (2-4 Zile)</p>
              </div>
            </div>
          </div>

          {/* Payment Info */}
          <div className="bg-white rounded-lg border-2 border-gray-200 p-4 sm:p-6">
            <div className="flex items-center gap-2 mb-3 sm:mb-4">
              <CreditCard className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500" />
              <h3 className="text-base sm:text-lg text-gray-900">Informații Plată</h3>
            </div>
            <div className="space-y-2 text-xs sm:text-sm">
              <div>
                <p className="text-gray-600">Metodă plată</p>
                <p className="text-gray-900 capitalize">{order.paymentMethod}</p>
              </div>
              <div>
                <p className="text-gray-600">Total Comandă</p>
                <p className="text-blue-500 font-semibold text-2xl sm:text-3xl">{(order.totalPrice || 0).toFixed(2)} lei</p>
              </div>
            </div>
          </div>

          {/* Invoice Info */}
          <div className="bg-white rounded-lg border-2 border-gray-200 p-4 sm:p-6">
            <div className="flex items-center gap-2 mb-3 sm:mb-4">
              <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500" />
              <h3 className="text-base sm:text-lg text-gray-900">Date Facturare</h3>
            </div>
            <div className="space-y-2 text-xs sm:text-sm">
              <div>
                <p className="text-gray-600">Tip Client</p>
                <p className="text-gray-900 capitalize">{order.personType === 'fizica' ? 'Persoană Fizică' : 'Persoană Juridică'}</p>
              </div>
              {order.personType === 'juridica' && (
                <>
                  <div>
                    <p className="text-gray-600">Nume</p>
                    <p className="text-gray-900">{order.companyName}</p>
                  </div>
                  {order.cui && (
                    <div>
                      <p className="text-gray-600">CUI</p>
                      <p className="text-gray-900">{order.cui}</p>
                    </div>
                  )}
                  {order.regCom && (
                    <div>
                      <p className="text-gray-600">Reg. Com.</p>
                      <p className="text-gray-900">{order.regCom}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-gray-600">Telefon</p>
                    <p className="text-gray-900">{order.clientPhone}</p>
                  </div>
                  <div className="pt-2 border-t border-gray-200">
                    <p className="text-gray-600">Adresă Facturare</p>
                    <p className="text-gray-900">{order.companyAddress}, {order.companyCity}, {order.companyCounty}</p>
                  </div>
                </>
              )}
              {order.personType === 'fizica' && (
                <>
                  <div>
                    <p className="text-gray-600">Nume</p>
                    <p className="text-gray-900">{order.clientName}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Email</p>
                    <p className="text-gray-900 break-all">{order.clientEmail}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Telefon</p>
                    <p className="text-gray-900">{order.clientPhone}</p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Products Section */}
        <div className="bg-white rounded-lg border-2 border-gray-200 p-4 sm:p-6 mb-6 sm:mb-8">
          <div className="flex items-center gap-2 mb-4 sm:mb-6">
            <Package className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500" />
            <h3 className="text-base sm:text-lg text-gray-900">Produse Comandate ({order.canvasItems.length})</h3>
          </div>
          
          <div className="space-y-4 max-w-2xl">
            {order.canvasItems.map((item, index) => {
              // Find size data by matching the formatted size string (stored as "30×40 cm")
              const sizeData = sizes.find(s => `${s.width}×${s.height} cm` === item.size);
              const frameTypeData = item.frameType ? getFrameTypeById(item.frameType) : null;
              
              // Calculate the actual price if item.price is 0 or missing
              let displayPrice = item.price || 0;
              
              if (displayPrice === 0 && sizeData) {
                // Recalculate base price from size data
                displayPrice = sizeData.discount > 0 
                  ? sizeData.price * (1 - sizeData.discount / 100)
                  : sizeData.price;
                
                // Add frame price if applicable
                if (item.frameType && sizeData.framePrices && item.frameType in sizeData.framePrices) {
                  const framePriceData = sizeData.framePrices[item.frameType];
                  const framePrice = framePriceData.discount > 0 
                    ? framePriceData.price * (1 - framePriceData.discount / 100)
                    : framePriceData.price;
                  displayPrice += framePrice;
                }
              }

              if (item.type === 'personalized') {
                return (
                  <div key={index} className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-sm font-medium text-gray-900 mb-3">{item.paintingTitle || 'Tablou Personalizat'}</p>
                    
                    <div className="flex gap-3">
                      <div 
                        className="w-16 h-16 bg-white rounded-lg overflow-hidden flex-shrink-0 border border-blue-300 cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => {
                          setPreviewImage(item.croppedImage);
                          setShowPreviewModal(true);
                        }}
                      >
                        <img 
                          src={item.croppedImage} 
                          alt="Tablou Personalizat"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <FileText className="w-4 h-4 text-blue-600" />
                          <span className="text-xs font-medium text-blue-600">Tip Print</span>
                        </div>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between gap-4">
                            <span className="text-gray-600 text-xs">Print Type:</span>
                            <span className="text-gray-900 font-medium text-xs">{item.printType || 'Print Canvas'}</span>
                          </div>
                          <div className="flex justify-between gap-4">
                            <span className="text-gray-600 text-xs">Dimensiune:</span>
                            <span className="text-gray-900 font-medium text-xs">{item.size}</span>
                          </div>
                          <div className="flex justify-between gap-4 pt-1 border-t border-blue-200">
                            <span className="text-gray-600 text-xs">Preț:</span>
                            <span className="text-blue-600 font-bold text-sm">{displayPrice.toFixed(2)} lei</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 mt-3 pt-3 border-t border-blue-200">
                      <button
                        onClick={() => downloadImage(item.originalImage || item.croppedImage, `original-${index}.jpg`)}
                        className="flex-1 px-3 py-1.5 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors text-xs flex items-center justify-center gap-1"
                      >
                        <Download className="w-3 h-3" />
                        Descarcă Imagine
                      </button>
                      <button
                        onClick={() => {
                          setPreviewImage(item.croppedImage);
                          setShowPreviewModal(true);
                        }}
                        className="flex-1 px-3 py-1.5 bg-white border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors text-xs flex items-center justify-center gap-1"
                      >
                        <Eye className="w-3 h-3" />
                        Vezi Cropped
                      </button>
                    </div>
                  </div>
                );
              }

              return (
                <div key={index} className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                  <p className="text-sm font-medium text-gray-900 mb-3">{item.paintingTitle}</p>
                  
                  <div className="flex gap-3">
                    <div className="w-16 h-16 bg-white rounded-lg overflow-hidden flex-shrink-0">
                      <img 
                        src={item.image} 
                        alt={item.paintingTitle}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <FileText className="w-4 h-4 text-purple-600" />
                        <span className="text-xs font-medium text-purple-600">Tip Print</span>
                      </div>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between gap-4">
                          <span className="text-gray-600 text-xs">Print Type:</span>
                          <span className="text-gray-900 font-medium text-xs">{item.printType || 'Print Canvas'}</span>
                        </div>
                        <div className="flex justify-between gap-4">
                          <span className="text-gray-600 text-xs">Dimensiune:</span>
                          <span className="text-gray-900 font-medium text-xs">{item.size}</span>
                        </div>
                        <div className="flex justify-between gap-4 pt-1 border-t border-purple-200">
                          <span className="text-gray-600 text-xs">Preț:</span>
                          <span className="text-purple-600 font-bold text-sm">{displayPrice.toFixed(2)} lei</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 mt-3 pt-3 border-t border-purple-200">
                    <button
                      onClick={() => downloadImage(item.image, `painting-${index}.jpg`)}
                      className="flex-1 px-3 py-1.5 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors text-xs flex items-center justify-center gap-1"
                    >
                      <Download className="w-3 h-3" />
                      Descarcă Imagine
                    </button>
                    {item.unsplashUrl ? (
                      <a
                        href={item.unsplashUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 px-3 py-1.5 bg-white border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors text-xs flex items-center justify-center gap-1"
                      >
                        <ExternalLink className="w-3 h-3" />
                        Vezi Original
                      </a>
                    ) : (
                      <a
                        href={item.image}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 px-3 py-1.5 bg-white border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors text-xs flex items-center justify-center gap-1"
                      >
                        <ExternalLink className="w-3 h-3" />
                        Vezi Original
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Total */}
          <div className="flex justify-end items-center gap-4 mt-6 pt-4 border-t border-gray-200">
            <span className="text-sm text-gray-600">Total Produse:</span>
            <span className="text-xl font-bold text-blue-500">{(order.totalPrice || 0).toFixed(2)} lei</span>
          </div>
        </div>

        {/* Internal Notes */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="w-5 h-5 text-blue-500" />
            <h3 className="text-base font-medium text-gray-900">Notițe Interne</h3>
          </div>
          <textarea
            value={internalNotes}
            onChange={(e) => setInternalNotes(e.target.value)}
            placeholder="Scrie o notă pentru această comandă..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-sm"
            rows={4}
          />
          <div className="mt-4">
            <button
              onClick={saveNotes}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
            >
              Actuați Notă
            </button>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {showPreviewModal && (
        <div 
          className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowPreviewModal(false)}
        >
          <div 
            className="relative max-w-4xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowPreviewModal(false)}
              className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors bg-black/20 rounded-full p-2"
            >
              <X className="w-6 h-6" />
            </button>
            <img 
              src={previewImage} 
              alt="Preview" 
              className="w-full h-auto rounded-lg shadow-2xl"
            />
          </div>
        </div>
      )}
    </AdminLayout>
  );
}