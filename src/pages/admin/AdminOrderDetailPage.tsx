import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import { ArrowLeft, Package, User, MapPin, Phone, Mail, Calendar, CreditCard, MessageSquare, X, CheckCircle, Download, Eye, ExternalLink, History, Check, XCircle, FileText } from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { useAdmin, OrderStatus } from '../../context/AdminContext';
import type { OrderNote } from '../../context/AdminContext';
import { projectId, publicAnonKey } from '../../utils/supabase/info';
import { toast } from 'sonner';

export const AdminOrderDetailPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { orders, updateOrderStatus, updateOrderNotes, currentUser, sizes, addOrderNote, markNoteAsRead, closeOrderNote, getUnreadNotesCount, loadOrderDetails, paintings, getFrameTypeById } = useAdmin();
  
  const order = orders.find(o => o.id === orderId);
  const [notes, setNotes] = useState(order?.notes || '');
  const [detailsLoaded, setDetailsLoaded] = useState(false);
  const isLoadingDetails = useRef(false);
  
  // Load full order details (including items) when page loads
  useEffect(() => {
    if (orderId && order && !isLoadingDetails.current && !detailsLoaded) {
      isLoadingDetails.current = true;
      
      loadOrderDetails(orderId).then(() => {
        setDetailsLoaded(true);
        isLoadingDetails.current = false;
      }).catch(() => {
        isLoadingDetails.current = false;
      });
    }
  }, [orderId]); // Only run when orderId changes - do not include order or detailsLoaded to prevent re-runs
  const [newNoteText, setNewNoteText] = useState('');
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState<OrderStatus>('new');
  const [statusReason, setStatusReason] = useState('');
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  // Scroll to notes section if hash is present
  useEffect(() => {
    if (window.location.hash === '#notes') {
      // Small delay to ensure the page is rendered
      setTimeout(() => {
        const notesSection = document.getElementById('notes-section');
        if (notesSection) {
          notesSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
  }, []);

  if (!order) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <p className="text-gray-600 mb-4">Comanda nu a fost găsită</p>
          <button
            onClick={() => navigate('/admin/orders')}
            className="px-6 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
          >
            Înapoi la Comenzi
          </button>
        </div>
      </AdminLayout>
    );
  }
  
  // DEBUG: Log order delivery info
  console.log('📋 Order delivery info:', {
    address: order.address,
    city: order.city,
    county: order.county,
    postalCode: order.postalCode,
    deliveryMethod: order.deliveryMethod
  });

  const handleSaveNotes = () => {
    updateOrderNotes(order.id, notes);
    alert('Notițele au fost salvate!');
  };

  const handleOpenStatusModal = async (status: OrderStatus) => {
    // Statuses that require a reason/note: 'queue', 'returned', 'closed'
    const requiresReason = status === 'queue' || status === 'returned' || status === 'closed';
    
    if (requiresReason) {
      // Show modal for statuses requiring a reason
      setNewStatus(status);
      setShowStatusModal(true);
    } else {
      // Update directly for simple status changes (new, in-production, delivered)
      updateOrderStatus(order.id, status, '', currentUser?.fullName || 'Unknown');
      
      // If status is changing to "delivered", send shipped confirmation email
      if (status === 'delivered') {
        await sendShippedEmail();
      }
    }
  };
  
  // Helper function to send shipped confirmation email
  const sendShippedEmail = async () => {
    try {
      if (!order.clientEmail || !order.orderNumber) {
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
  
  // Handle status change with modal (for statuses that require a reason)
  const handleStatusChange = async (reason: string) => {
    // Update order status
    updateOrderStatus(order.id, newStatus, reason, currentUser?.fullName || 'Unknown');
    
    // If status is changing to "delivered", send shipped confirmation email
    if (newStatus === 'delivered') {
      await sendShippedEmail();
    }
    
    // Close modal
    setShowStatusModal(false);
  };

  const getAvailableStatuses = (): OrderStatus[] => {
    if (currentUser?.role === 'full-admin') {
      return ['new', 'queue', 'in-production', 'delivered', 'returned', 'closed'];
    } else if (currentUser?.role === 'account-manager') {
      if (order.status === 'new') {
        return ['queue', 'closed'];
      } else if (order.status === 'queue') {
        return ['in-production', 'closed'];
      }
    } else if (currentUser?.role === 'production') {
      if (order.status === 'in-production') {
        return ['delivered', 'returned'];
      }
    }
    return [];
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

  const downloadImage = (imageUrl: string, fileName: string) => {
    // Open image in a new tab so user can view or download
    window.open(imageUrl, '_blank', 'noopener,noreferrer');
  };

  const availableStatuses = getAvailableStatuses();

  return (
    <AdminLayout>
      <div className="mb-8">
        <button
          onClick={() => navigate('/admin/orders')}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Înapoi la Comenzi</span>
        </button>
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl text-gray-900 mb-2">Comandă #{order.orderNumber || order.id.slice(-8)}</h1>
            <p className="text-gray-600">
              Creată la {new Date(order.orderDate).toLocaleString('ro-RO')}
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <span className={`status-badge px-4 py-2 rounded-full text-sm ${getStatusColor(order.status)}`}>
              {getStatusLabel(order.status)}
            </span>
            
            {availableStatuses.length > 0 && (
              <button
                onClick={() => {
                  setNewStatus(availableStatuses[0]); // Set to first available status
                  setShowStatusModal(true);
                }}
                className="px-6 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
              >
                Schimbă Status
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
        {/* Client Info */}
        <div className="bg-white rounded-lg border-2 border-gray-200 p-6">
          <h3 className="text-lg text-gray-900 mb-4 flex items-center space-x-2">
            <User className="w-5 h-5 text-yellow-600" />
            <span>Informații Client</span>
          </h3>
          <div className="space-y-3 text-sm">
            <div>
              <p className="text-gray-600">Nume</p>
              <p className="text-gray-900">{order.clientName}</p>
            </div>
            <div>
              <p className="text-gray-600">Email</p>
              <p className="text-gray-900">{order.clientEmail}</p>
            </div>
            <div>
              <p className="text-gray-600">Telefon</p>
              <p className="text-gray-900">{order.clientPhone}</p>
            </div>
          </div>
        </div>

        {/* Delivery Info - Always shows delivery address */}
        <div className="bg-white rounded-lg border-2 border-gray-200 p-6">
          <h3 className="text-lg text-gray-900 mb-4 flex items-center space-x-2">
            <MapPin className="w-5 h-5 text-yellow-600" />
            <span>Informații Livrare</span>
          </h3>
          <div className="space-y-3 text-sm">
            <div>
              <p className="text-gray-600">Adresă</p>
              <p className="text-gray-900">{order.address || '-'}</p>
            </div>
            <div>
              <p className="text-gray-600">Oraș</p>
              <p className="text-gray-900">{order.city || '-'}</p>
            </div>
            <div>
              <p className="text-gray-600">Județ</p>
              <p className="text-gray-900">{order.county || '-'}</p>
            </div>
            <div>
              <p className="text-gray-600">Cod Poștal</p>
              <p className="text-gray-900">{order.postalCode || '-'}</p>
            </div>
            <div>
              <p className="text-gray-600">Metodă Livrare</p>
              <p className="text-gray-900 capitalize">
                {order.deliveryMethod === 'express' && 'Express (1-4 ore)'}
                {order.deliveryMethod === 'standard' && 'Standard (24-48 ore)'}
                {order.deliveryMethod === 'economic' && 'Economic (3-4 zile)'}
              </p>
            </div>
          </div>
        </div>

        {/* Payment Info */}
        <div className="bg-white rounded-lg border-2 border-gray-200 p-6">
          <h3 className="text-lg text-gray-900 mb-4 flex items-center space-x-2">
            <CreditCard className="w-5 h-5 text-yellow-600" />
            <span>Informații Plată</span>
          </h3>
          <div className="space-y-3 text-sm">
            <div>
              <p className="text-gray-600">Metodă Plată</p>
              <p className="text-gray-900">
                {order.paymentMethod === 'card' ? 'Card Bancar' : 'Ramburs'}
              </p>
            </div>
            <div>
              <p className="text-gray-600">Total Comandă</p>
              <p className="text-2xl text-yellow-600">{order.totalPrice.toFixed(2)} lei</p>
            </div>
          </div>
        </div>

        {/* Invoice Data - Shows billing info based on person type */}
        <div className={`rounded-lg border-2 p-6 ${
          order.personType === 'juridica' 
            ? 'bg-blue-50 border-blue-200' 
            : 'bg-white border-gray-200'
        }`}>
          <h3 className="text-lg text-gray-900 mb-4 flex items-center space-x-2">
            <FileText className={`w-5 h-5 ${order.personType === 'juridica' ? 'text-blue-600' : 'text-yellow-600'}`} />
            <span>Date Facturare</span>
          </h3>
          
          {order.personType === 'juridica' && order.companyName ? (
            // Company billing info (company headquarters)
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-gray-600">Tip Client</p>
                <p className="text-gray-900">Persoană Juridică</p>
              </div>
              <div>
                <p className="text-gray-600">Nume Companie</p>
                <p className="text-gray-900">{order.companyName}</p>
              </div>
              <div>
                <p className="text-gray-600">CUI</p>
                <p className="text-gray-900">{order.cui || '-'}</p>
              </div>
              <div>
                <p className="text-gray-600">Reg. Com.</p>
                <p className="text-gray-900">{order.regCom || '-'}</p>
              </div>
              <div>
                <p className="text-gray-600">Adresă Facturare</p>
                <p className="text-gray-900">
                  {[order.companyAddress, order.companyCity, order.companyCounty].filter(Boolean).join(', ') || '-'}
                </p>
              </div>
            </div>
          ) : (
            // Individual billing info (same as delivery for fizica)
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-gray-600">Tip Client</p>
                <p className="text-gray-900">Persoană Fizică</p>
              </div>
              <div>
                <p className="text-gray-600">Nume</p>
                <p className="text-gray-900">{order.clientName}</p>
              </div>
              <div>
                <p className="text-gray-600">Email</p>
                <p className="text-gray-900">{order.clientEmail}</p>
              </div>
              <div>
                <p className="text-gray-600">Telefon</p>
                <p className="text-gray-900">{order.clientPhone}</p>
              </div>
              <div>
                <p className="text-gray-600">Adresă Facturare</p>
                <p className="text-gray-900">
                  {[order.address, order.city, order.county, order.postalCode].filter(Boolean).join(', ') || '-'}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Canvas Items */}
      <div className="bg-white rounded-lg border-2 border-gray-200 p-6 mb-6">
        <h3 className="text-lg text-gray-900 mb-4 flex items-center space-x-2">
          <Package className="w-5 h-5 text-yellow-600" />
          <span>Produse Comandate ({order.canvasItems.length})</span>
        </h3>
        
        {/* Card View for Products - No horizontal scroll */}
        <div className="space-y-4">
          {order.canvasItems.filter(item => item.type !== 'placeholder').map((item, index) => {
            if (item.type === 'personalized') {
              // Personalized Canvas Card
              return (
                <div key={index} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex flex-col sm:flex-row gap-4">
                    {/* Image */}
                    <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 border-2 border-yellow-500">
                      <img 
                        src={item.croppedImage} 
                        alt={`Tablou Personalizat ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-start justify-between gap-2 mb-4">
                        <div className="flex-1">
                          <p className="text-sm text-gray-900 mb-2">Tablou Personalizat</p>
                          <p className="text-xs text-[#86C2FF]">Personalizat • Previzualizare Cropping</p>
                        </div>
                        <div className="flex-shrink-0">
                          <p className="text-lg text-gray-900">{item.price.toFixed(2)} lei</p>
                        </div>
                      </div>
                      
                      {/* Info Tiles */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                        {/* Dimension & Orientation Tile */}
                        <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                          <div className="flex items-center space-x-2 mb-2">
                            <FileText className="w-4 h-4 text-purple-600" />
                            <span className="text-xs text-purple-600 font-medium">Dimensiune</span>
                          </div>
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="text-xs text-gray-600 mb-1">Cant: 1</p>
                              <p className="text-sm text-gray-900">{item.printType || 'Print Canvas'}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-gray-900 mb-1">{item.size}</p>
                              <p className="text-sm text-purple-600 font-medium">{item.price.toFixed(2)} lei</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Actions */}
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => downloadImage(item.originalImage || item.croppedImage, `original-${order.id}-${index + 1}.jpg`)}
                          className="px-3 py-1.5 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors text-xs flex items-center space-x-1"
                          title="Descarcă imaginea originală (calitate maximă)"
                          disabled={!item.originalImage && !item.croppedImage}
                        >
                          <Download className="w-3 h-3" />
                          <span>Descarcă Original</span>
                        </button>
                        <button
                          onClick={() => {
                            setPreviewImage(item.croppedImage);
                            setShowPreviewModal(true);
                          }}
                          className="px-3 py-1.5 bg-[#86C2FF] text-white rounded-lg hover:bg-[#6BADEF] transition-colors text-xs flex items-center space-x-1"
                          title="Vizualizează previzualizarea cropată"
                          disabled={!item.croppedImage}
                        >
                          <Eye className="w-3 h-3" />
                          <span>Vezi Preview</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            } else {
              // Regular Painting Card
              const sizeData = sizes.find(s => s.id === item.size);
              // Get painting to check orientation
              const painting = paintings.find(p => p.id === item.paintingId);
              // For admin, if painting is landscape, reverse the dimensions to show what production needs
              const shouldReverse = painting?.orientation === 'landscape';
              const sizeDisplay = sizeData 
                ? shouldReverse 
                  ? `${sizeData.height}×${sizeData.width} cm` // Reversed for landscape in admin
                  : `${sizeData.width}×${sizeData.height} cm`
                : item.size;
              
              // Calculate base size price (before print type or frame adjustments)
              const baseSizePrice = sizeData ? (sizeData.discount > 0 ? sizeData.price * (1 - sizeData.discount / 100) : sizeData.price) : 0;
              
              // Get print type price (percentage-based from size price)
              let printTypePrice = 0;
              if (item.printType && painting) {
                const printTypeName = item.printType === 'Print Canvas' ? 'canvas' : 'hartie';
                const printTypeData = painting.printTypes?.find((pt: any) => pt.name === printTypeName);
                if (printTypeData && printTypeData.pricePercentage > 0) {
                  printTypePrice = baseSizePrice * (printTypeData.pricePercentage / 100);
                }
              }
              
              // Get frame price (from size's framePrices JSONB)
              let framePrice = 0;
              if (item.frameType && sizeData?.framePrices && item.frameType in sizeData.framePrices) {
                const framePriceData = sizeData.framePrices[item.frameType];
                framePrice = framePriceData.discount > 0 
                  ? framePriceData.price * (1 - framePriceData.discount / 100)
                  : framePriceData.price;
              }
              
              // Check if frame is "Fara Rama" to hide the frame tile
              const frameTypeData = item.frameType ? getFrameTypeById(item.frameType) : null;
              const hasActualFrame = frameTypeData && frameTypeData.name !== 'Fara Rama';
              
              // Calculate dimensions price (base + print type)
              const dimensionsPrice = baseSizePrice + printTypePrice;
              
              return (
                <div key={index} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex flex-col sm:flex-row gap-4">
                    {/* Image */}
                    <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      <img 
                        src={item.image} 
                        alt={item.paintingTitle}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-start justify-between gap-2 mb-4">
                        <div className="flex-1">
                          <p className="text-sm text-gray-900 mb-2">{item.paintingTitle}</p>
                          
                          {item.paintingId && (() => {
                            // Create slug from painting title
                            const slug = item.paintingTitle
                              .toLowerCase()
                              .replace(/[^a-z0-9\s-]/g, '')
                              .replace(/\s+/g, '-')
                              .replace(/-+/g, '-')
                              .trim();
                            
                            return (
                              <Link
                                to={`/produs/${item.paintingId}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center space-x-1 text-xs text-[#86C2FF] hover:text-[#6BADEF] transition-colors"
                              >
                                <ExternalLink className="w-3 h-3" />
                                <span>Vezi în magazin</span>
                              </Link>
                            );
                          })()}
                        </div>
                        <div className="flex-shrink-0">
                          {hasActualFrame && framePrice > 0 ? (
                            <p className="text-lg text-gray-900">
                              {dimensionsPrice.toFixed(2)} + {framePrice.toFixed(2)} lei
                            </p>
                          ) : (
                            <p className="text-lg text-gray-900">{item.price.toFixed(2)} lei</p>
                          )}
                        </div>
                      </div>
                      
                      {/* Info Tiles */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                        {/* Print Type Tile with Size, Quantity, and Price */}
                        {item.printType && (
                          <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                            <div className="flex items-center space-x-2 mb-2">
                              <FileText className="w-4 h-4 text-purple-600" />
                              <span className="text-xs text-purple-600 font-medium">Tip Print</span>
                            </div>
                            <div className="flex items-start justify-between">
                              <div>
                                <p className="text-xs text-gray-600 mb-1">Cant: 1</p>
                                <p className="text-sm text-gray-900">{item.printType}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm text-gray-900 mb-1">{sizeDisplay}</p>
                                <p className="text-sm text-purple-600 font-medium">{dimensionsPrice.toFixed(2)} lei</p>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Frame Tile - Only show if not "Fara Rama" */}
                        {hasActualFrame && (
                          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                            <div className="flex items-center space-x-2 mb-2">
                              <Package className="w-4 h-4 text-amber-600" />
                              <span className="text-xs text-amber-600 font-medium">Ramă</span>
                            </div>
                            <p className="text-sm text-gray-900 mb-1">{frameTypeData.name}</p>
                            <p className="text-sm text-amber-600 font-medium">+{framePrice.toFixed(2)} lei</p>
                          </div>
                        )}
                      </div>

                      {/* Download button for painting */}
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={async () => {
                            // Check if this is an Unsplash image
                            const painting = paintings.find(p => p.id === item.paintingId);
                            if (painting?.unsplashData) {
                              // Use Unsplash service to download highest quality
                              try {
                                const { unsplashService } = await import('../../services/unsplashService');
                                await unsplashService.downloadImage(
                                  painting.unsplashData.id,
                                  `${item.paintingTitle}-${painting.unsplashData.id}.jpg`
                                );
                              } catch (error) {
                                console.error('Error downloading Unsplash image:', error);
                                // Fallback to regular download
                                downloadImage(item.image, `${item.paintingTitle}-${item.paintingId}.jpg`);
                              }
                            } else {
                              // Regular download for non-Unsplash images
                              downloadImage(item.image, `${item.paintingTitle}-${item.paintingId}.jpg`);
                            }
                          }}
                          className="px-3 py-1.5 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors text-xs flex items-center space-x-1"
                          title="Descarcă imaginea tabloului"
                        >
                          <Download className="w-3 h-3" />
                          <span>Descarcă Imagine</span>
                        </button>
                        {item.paintingId && (() => {
                          const painting = paintings.find(p => p.id === item.paintingId);
                          
                          // Check if this is an Unsplash image by ID format
                          const isUnsplashImage = item.paintingId.startsWith('unsplash-');
                          
                          if (isUnsplashImage) {
                            // Extract Unsplash ID from painting ID (format: unsplash-XXXXX)
                            const unsplashId = item.paintingId.replace('unsplash-', '');
                            const unsplashUrl = `https://unsplash.com/photos/${unsplashId}`;
                            
                            // Link to Unsplash page
                            return (
                              <a
                                href={unsplashUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-3 py-1.5 bg-[#86C2FF] text-white rounded-lg hover:bg-[#6BADEF] transition-colors text-xs flex items-center space-x-1"
                              >
                                <ExternalLink className="w-3 h-3" />
                                <span>Vezi în Magazin</span>
                              </a>
                            );
                          }
                          
                          // Regular product link
                          const slug = item.paintingTitle
                            .toLowerCase()
                            .replace(/[^a-z0-9\s-]/g, '')
                            .replace(/\s+/g, '-')
                            .replace(/-+/g, '-')
                            .trim();
                          
                          return (
                            <Link
                              to={`/produs/${item.paintingId}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-1.5 bg-[#86C2FF] text-white rounded-lg hover:bg-[#6BADEF] transition-colors text-xs flex items-center space-x-1"
                            >
                              <ExternalLink className="w-3 h-3" />
                              <span>Vezi în Magazin</span>
                            </Link>
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                </div>
              );
            }
          })}
        </div>

        {/* Total */}
        <div className="mt-6 pt-4 border-t border-gray-200 flex justify-end">
          <div className="text-right">
            <p className="text-sm text-gray-600 mb-1">Total Produse:</p>
            <p className="text-2xl text-yellow-600">{order.totalPrice.toFixed(2)} lei</p>
          </div>
        </div>
      </div>

      {/* Notes */}
      <div className="bg-white rounded-lg border-2 border-gray-200 p-6 mb-6" id="notes-section">
        <h3 className="text-lg text-gray-900 mb-4 flex items-center space-x-2">
          <MessageSquare className="w-5 h-5 text-yellow-600" />
          <span>Notițe Interne</span>
          {(order.orderNotes?.filter(n => n.status === 'open').length || 0) > 0 && (
            <span className="px-2 py-1 bg-blue-500 text-white rounded-full text-xs">
              {order.orderNotes.filter(n => n.status === 'open').length} active
            </span>
          )}
        </h3>

        {/* Add New Note */}
        <div className="mb-6">
          <textarea
            value={newNoteText}
            onChange={(e) => setNewNoteText(e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-yellow-500 focus:outline-none resize-none"
            rows={3}
            placeholder="Scrie o notă nouă despre această comandă..."
          />
          <button
            onClick={async () => {
              if (newNoteText.trim()) {
                await addOrderNote(order.id, newNoteText.trim());
                setNewNoteText('');
              }
            }}
            disabled={!newNoteText.trim()}
            className="mt-2 px-6 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Adaugă Notă</span>
          </button>
        </div>

        {/* Notes List */}
        {order.orderNotes && order.orderNotes.length > 0 ? (
          <div className="space-y-3">
            {order.orderNotes
              .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
              .map(note => (
              <div 
                key={note.id} 
                className={`border-2 rounded-lg p-4 ${
                  note.status === 'closed' 
                    ? 'border-gray-300 bg-gray-50' 
                    : note.isRead 
                      ? 'border-blue-200 bg-blue-50' 
                      : 'border-blue-400 bg-blue-100'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-sm text-gray-900">{note.createdBy}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        note.createdByRole === 'full-admin' ? 'bg-red-100 text-red-700' :
                        note.createdByRole === 'account-manager' ? 'bg-blue-100 text-blue-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {note.createdByRole === 'full-admin' ? 'Admin' :
                         note.createdByRole === 'account-manager' ? 'Account' :
                         'Production'}
                      </span>
                      {!note.isRead && note.status === 'open' && (
                        <span className="w-2 h-2 bg-blue-500 rounded-full" title="Necitit"></span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">
                      {new Date(note.createdAt).toLocaleString('ro-RO')}
                    </p>
                  </div>
                  
                  {/* Actions */}
                  {note.status === 'open' && (
                    <div className="flex items-center space-x-2">
                      {!note.isRead && (
                        <button
                          onClick={() => markNoteAsRead(order.id, note.id)}
                          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors text-xs flex items-center space-x-1"
                          title="Marchează ca citit"
                        >
                          <Check className="w-3 h-3" />
                          <span>Citit</span>
                        </button>
                      )}
                      <button
                        onClick={() => closeOrderNote(order.id, note.id)}
                        className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors text-xs flex items-center space-x-1"
                        title="Închide nota"
                      >
                        <XCircle className="w-3 h-3" />
                        <span>Închide</span>
                      </button>
                    </div>
                  )}
                </div>
                
                <p className="text-sm text-gray-900 whitespace-pre-wrap">{note.text}</p>
                
                {note.status === 'closed' && (
                  <div className="mt-2 pt-2 border-t border-gray-300">
                    <p className="text-xs text-gray-500">
                      Închis de {note.closedBy} la {new Date(note.closedAt!).toLocaleString('ro-RO')}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500 text-center py-4">Nu există notițe pentru această comandă.</p>
        )}
      </div>

      {/* Status History */}
      <div className="bg-white rounded-lg border-2 border-gray-200 p-6">
        <h3 className="text-lg text-gray-900 mb-4 flex items-center space-x-2">
          <History className="w-5 h-5 text-yellow-600" />
          <span>Istoric Status</span>
        </h3>
        <div className="space-y-4">
          {order.statusHistory.map((history, index) => (
            <div key={index} className="flex items-start space-x-4 pb-4 border-b border-gray-200 last:border-b-0">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${getStatusColor(history.status)}`}>
                <span className="text-xs">{index + 1}</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className={`px-3 py-1 rounded-full text-xs ${getStatusColor(history.status)}`}>
                    {getStatusLabel(history.status)}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(history.timestamp).toLocaleString('ro-RO')}
                  </span>
                </div>
                <p className="text-sm text-gray-900 mb-1">{history.reason}</p>
                <p className="text-xs text-gray-600">Modificat de: {history.changedBy}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Status Change Modal */}
      {showStatusModal && (
        <div 
          className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowStatusModal(false);
            }
          }}
        >
          <div 
            className="bg-white rounded-lg p-6 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl text-gray-900 mb-4">Schimbă Status Comandă</h3>
            
            <div className="mb-4">
              <label className="block text-sm text-gray-700 mb-2">Status Nou</label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value as OrderStatus)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none text-gray-900"
              >
                {availableStatuses.map(status => (
                  <option key={status} value={status}>{getStatusLabel(status)}</option>
                ))}
              </select>
            </div>

            {(newStatus === 'queue' || newStatus === 'returned' || newStatus === 'closed') && (
              <div className="mb-4">
                <label className="block text-sm text-gray-700 mb-2">
                  Motiv <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={statusReason}
                  onChange={(e) => setStatusReason(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none resize-none text-gray-900"
                  rows={4}
                  placeholder="Introduceți motivul schimbării statusului..."
                  autoFocus
                />
              </div>
            )}

            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowStatusModal(false);
                  setNewStatus(null);
                  setStatusReason('');
                }}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Anulează
              </button>
              <button
                onClick={() => {
                  handleStatusChange(statusReason.trim());
                  setStatusReason('');
                }}
                className="flex-1 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
              >
                Confirmă
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {showPreviewModal && previewImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={() => setShowPreviewModal(false)}
        >
          <div 
            className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl text-gray-900">Previzualizare Cropping</h3>
                <p className="text-sm text-gray-600">Zona selectată de client pentru printare</p>
              </div>
              <button
                onClick={() => {
                  setShowPreviewModal(false);
                  setPreviewImage(null);
                }}
                className="p-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                title="Închide"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex justify-center bg-gray-50 rounded-lg p-4">
              <img
                src={previewImage}
                alt="Previzualizare Cropping"
                className="max-w-full max-h-[70vh] rounded-lg shadow-lg"
              />
            </div>

            <div className="mt-4 text-center">
              <p className="text-xs text-gray-500">Aceasta este previzualizarea zonei cropate. Pentru printare, descarcă imaginea originală.</p>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};