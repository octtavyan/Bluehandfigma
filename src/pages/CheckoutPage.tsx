import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, CreditCard, Truck, Loader2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAdmin } from '../context/AdminContext';
import { toast } from 'sonner@2.0.3';
import type { CanvasItemType } from '../context/AdminContext';
import { romanianCounties } from '../data/romaniaData';
import { projectId, publicAnonKey } from '../utils/supabase/info';

type CheckoutStep = 'delivery' | 'details' | 'payment' | 'confirmation';

export const CheckoutPage = () => {
  const { cart, getCartTotal, clearCart } = useCart();
  const { addOrder, sizes } = useAdmin(); // Add sizes from AdminContext
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<CheckoutStep>('delivery');
  const [deliveryOption, setDeliveryOption] = useState<'express' | 'standard' | 'economic'>('standard');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'cash'>('card');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    county: '',
    postalCode: '',
    personType: 'fizica' as 'fizica' | 'juridica',
    companyName: '',
    cui: '',
    regCom: '',
    companyCounty: '',
    companyCity: '',
    companyAddress: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showRetryModal, setShowRetryModal] = useState(false);
  const [retryAttempts, setRetryAttempts] = useState(0);
  const [availableCities, setAvailableCities] = useState<string[]>([]);
  const [showCustomCityInput, setShowCustomCityInput] = useState(false);
  const [customCity, setCustomCity] = useState('');
  
  // Refs for scrolling to steps
  const paymentStepRef = useRef<HTMLDivElement>(null);

  // Update available cities when county changes
  useEffect(() => {
    if (formData.county) {
      const selectedCounty = romanianCounties.find(c => c.name === formData.county);
      setAvailableCities(selectedCounty?.cities || []);
      // Reset city selection when county changes
      setShowCustomCityInput(false);
      setCustomCity('');
      // Reset city if it's not in the new county's cities
      if (formData.city && selectedCounty && !selectedCounty.cities.includes(formData.city)) {
        setFormData(prev => ({ ...prev, city: '' }));
      }
    } else {
      setAvailableCities([]);
      setShowCustomCityInput(false);
      setCustomCity('');
    }
  }, [formData.county]);

  // Redirect to cart if empty
  useEffect(() => {
    if (cart.length === 0 && currentStep !== 'confirmation') {
      navigate('/cos');
    }
  }, [cart.length, currentStep, navigate]);

  // Auto-scroll to payment step when it becomes active
  useEffect(() => {
    if (currentStep === 'payment' && paymentStepRef.current) {
      setTimeout(() => {
        if (paymentStepRef.current) {
          const elementPosition = paymentStepRef.current.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - 80; // 80px offset for header
          
          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
        }
      }, 150);
    }
  }, [currentStep]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleContinueToDetails = () => {
    setCurrentStep('details');
    // Scroll to top to bring step into view
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleContinueToPayment = () => {
    if (!validateForm()) {
      return;
    }
    
    setCurrentStep('payment');
  };

  const validateForm = () => {
    const { firstName, lastName, email, phone, address, city, county, postalCode, personType, companyName, cui, regCom, companyCounty, companyCity, companyAddress } = formData;
    
    // Trim whitespace and check if fields are filled
    const trimmedData = {
      firstName: firstName?.trim(),
      lastName: lastName?.trim(),
      email: email?.trim(),
      phone: phone?.trim(),
      address: address?.trim(),
      city: city?.trim(),
      county: county?.trim(),
      postalCode: postalCode?.trim(),
      personType: personType?.trim(),
      companyName: companyName?.trim(),
      cui: cui?.trim(),
      regCom: regCom?.trim(),
      companyCounty: companyCounty?.trim(),
      companyCity: companyCity?.trim(),
      companyAddress: companyAddress?.trim(),
    };

    const missingFields = [];
    if (!trimmedData.firstName) missingFields.push('Prenume');
    if (!trimmedData.lastName) missingFields.push('Nume');
    if (!trimmedData.email) missingFields.push('Email');
    if (!trimmedData.phone) missingFields.push('Telefon');
    if (!trimmedData.address) missingFields.push('Adresă');
    if (!trimmedData.city) missingFields.push('Oraș');
    if (!trimmedData.county) missingFields.push('Județ');
    if (!trimmedData.postalCode) missingFields.push('Cod Poștal');

    if (trimmedData.personType === 'juridica') {
      if (!trimmedData.companyName) missingFields.push('Numele Companiei');
      if (!trimmedData.cui) missingFields.push('CUI');
      if (!trimmedData.regCom) missingFields.push('Reg. Com.');
      if (!trimmedData.companyCounty) missingFields.push('Județul Companiei');
      if (!trimmedData.companyCity) missingFields.push('Orașul Companiei');
      if (!trimmedData.companyAddress) missingFields.push('Adresa Companiei');
    }

    if (missingFields.length > 0) {
      alert(`Următoarele câmpuri sunt obligatorii: ${missingFields.join(', ')}`);
      return false;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedData.email)) {
      alert('Te rugăm să introduci o adresă de email validă.');
      return false;
    }

    return true;
  };

  const handlePlaceOrder = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare canvas items for order - Remove large images to prevent timeout
      const canvasItems = cart.map(item => {
        let itemPrice;
        if (item.customization) {
          itemPrice = item.customization.price;
        } else {
          // For paintings, find price by sizeId
          const sizeData = sizes.find(s => s.id === item.selectedDimension);
          if (sizeData) {
            // Calculate with discount
            itemPrice = sizeData.discount > 0
              ? sizeData.price * (1 - sizeData.discount / 100)
              : sizeData.price;
          } else {
            // Fallback to base price
            itemPrice = item.product.price || 0;
          }
          
          // Add frame price if applicable
          if (item.frameType && sizeData?.framePrices && sizeData.framePrices[item.frameType]) {
            const framePricing = sizeData.framePrices[item.frameType];
            const framePrice = framePricing.price * (1 - framePricing.discount / 100);
            itemPrice += framePrice;
          } else {
            // Fallback: Check for old data structure
            itemPrice = item.selectedDimension
              ? item.product.dimensions?.find(d => d.size === item.selectedDimension)?.price || item.product.price
              : item.product.price;
          }
        }

        const totalItemPrice = itemPrice * item.quantity;

        if (item.customization) {
          return {
            type: 'personalized' as const,
            // Use storage URLs instead of base64 images
            originalImage: item.customization.originalImageUrl || '', // From Supabase Storage
            croppedImage: item.customization.croppedImageUrl || '', // From Supabase Storage
            size: item.customization.selectedSize || 'N/A',
            orientation: item.customization.orientation || 'portrait',
            price: totalItemPrice,
            hasCustomImage: true,
          };
        } else {
          return {
            type: 'painting' as const,
            paintingId: item.product.id,
            paintingTitle: item.product.title,
            image: item.product.image,
            size: item.selectedDimension || 'N/A',
            quantity: item.quantity,
            price: totalItemPrice,
            printType: item.printType, // Include print type from cart
            frameType: item.frameType, // Include frame type from cart
          };
        }
      });

      const deliveryPrice = deliveryOption === 'express' ? 25 : 0;
      const totalPrice = getCartTotal() + deliveryPrice;

      console.log('📦 Creating order with data:', {
        clientName: `${formData.firstName} ${formData.lastName}`,
        clientEmail: formData.email,
        totalPrice,
        itemsCount: canvasItems.length
      });

      // Create order with timeout protection
      const orderPromise = addOrder({
        clientId: '', // Will be set by addOrder function
        clientName: `${formData.firstName} ${formData.lastName}`,
        clientEmail: formData.email,
        clientPhone: formData.phone,
        address: formData.address,
        city: formData.city,
        county: formData.county,
        postalCode: formData.postalCode,
        canvasItems,
        totalPrice,
        deliveryMethod: deliveryOption,
        paymentMethod,
        notes: '',
        personType: formData.personType,
        companyName: formData.companyName,
        cui: formData.cui,
        regCom: formData.regCom,
        companyCounty: formData.companyCounty,
        companyCity: formData.companyCity,
        companyAddress: formData.companyAddress,
      }, { skipReload: true }); // Skip the expensive data reload for customer orders

      // Add 30-second timeout
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Order creation timeout - possible database issue')), 30000)
      );

      await Promise.race([orderPromise, timeoutPromise]);
      console.log('✅ Order created successfully');

      // Send order confirmation email to customer (non-blocking)
      try {
        console.log('📧 Sending confirmation email...');
        const orderNumber = Date.now().toString().slice(-8); // Generate simple order number
        
        const emailPromise = fetch(`https://${projectId}.supabase.co/functions/v1/make-server-bbc0c500/send-order-confirmation`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            orderNumber,
            customerName: `${formData.firstName} ${formData.lastName}`,
            customerEmail: formData.email,
            total: totalPrice,
            items: canvasItems,
            deliveryMethod: deliveryOption,
            paymentMethod,
            address: formData.address,
            city: formData.city,
            county: formData.county,
            postalCode: formData.postalCode,
            deliveryPrice,
          }),
        });

        // Timeout email after 10 seconds
        const emailTimeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Email timeout')), 10000)
        );

        await Promise.race([emailPromise, emailTimeoutPromise]);
        console.log('✅ Order confirmation email sent to customer');
      } catch (emailError) {
        console.error('⚠️ Failed to send confirmation email (non-critical):', emailError);
        // Don't block order completion if email fails
      }

      console.log('🎉 Order placement complete - showing confirmation');
      setCurrentStep('confirmation');
      clearCart();
      
      // Scroll to top to show confirmation message
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      console.error('❌ Error placing order:', error);
      
      // Check if it's a quota/bandwidth error
      const errorMessage = (error as Error).message.toLowerCase();
      if (errorMessage.includes('quota') || errorMessage.includes('bandwidth') || 
          errorMessage.includes('timeout') || errorMessage.includes('connection')) {
        alert('Serviciul este temporar indisponibil din cauza traficului intens. Te rugăm să încerci din nou în câteva minute sau contactează-ne direct la hello@bluehand.ro cu detaliile comenzii tale.');
      } else {
        alert('A apărut o eroare la plasarea comenzii. Te rugăm să încerci din nou sau contactează-ne la hello@bluehand.ro');
      }
      
      setRetryAttempts(prev => prev + 1);
      if (retryAttempts < 3) {
        setShowRetryModal(true);
      }
    } finally {
      setIsSubmitting(false);
      console.log('🏁 Order placement process finished');
    }
  };

  if (currentStep === 'confirmation') {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-gray-900 mb-4">Comanda Ta A Fost Plasată!</h1>
          <p className="text-xl text-gray-600 mb-2">Număr comandă: #PZ{Date.now().toString().slice(-8)}</p>
          <p className="text-gray-600 mb-8">
            Vei primi un email de confirmare în câteva minute. Echipa noastră va procesa comanda
            ta și vei fi notificat când produsele sunt în curs de livrare.
          </p>

          <div className="bg-gray-50 rounded-lg p-6 mb-8">
            <h3 className="text-gray-900 mb-4">Detalii Livrare</h3>
            <div className="text-left space-y-2">
              <p className="text-gray-700">
                <strong>Opțiune:</strong>{' '}
                {deliveryOption === 'express' && 'Express (1-4 ore)'}
                {deliveryOption === 'standard' && 'Standard (24-48 ore)'}
                {deliveryOption === 'economic' && 'Economic (3-4 zile)'}
              </p>
              <p className="text-gray-700">
                <strong>Adresă:</strong> {formData.address}, {formData.city}
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/')}
              className="px-8 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
            >
              Înapoi la Magazin
            </button>
            <button
              onClick={() => navigate('/configureaza-tablou')}
              className="px-8 py-3 bg-white border-2 border-gray-900 text-gray-900 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Creează Alt Tablou
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-[1600px] mx-auto px-6 py-12">
        <h1 className="text-gray-900 mb-8">Finalizare Comandă</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className={`bg-white border-2 rounded-lg p-6 ${currentStep === 'delivery' ? 'border-yellow-500' : 'border-gray-200'}`}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-gray-900">1. Opțiuni Livrare</h2>
                <div className="flex items-center space-x-2">
                  {currentStep !== 'delivery' && (
                    <>
                      <Check className="w-6 h-6 text-green-600" />
                      <button
                        onClick={() => setCurrentStep('delivery')}
                        className="text-sm text-[#86C2FF] hover:text-[#6BADEF] underline"
                      >
                        Modifică
                      </button>
                    </>
                  )}
                </div>
              </div>

              {currentStep === 'delivery' && (
                <div className="space-y-4">
                  {/* Only Standard delivery option available */}
                  <button
                    onClick={() => setDeliveryOption('standard')}
                    className={`w-full p-4 border-2 rounded-lg text-left transition-all ${
                      deliveryOption === 'standard'
                        ? 'border-yellow-500 bg-yellow-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <Truck className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-1" />
                      <div className="flex-1">
                        <h3 className="text-gray-900 mb-1">Standard (24-48 ore)</h3>
                        <p className="text-sm text-gray-600">Toată țara - Gratuit</p>
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={handleContinueToDetails}
                    className="w-full px-8 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
                  >
                    Continuă
                  </button>
                </div>
              )}
            </div>

            <div className={`bg-white border-2 rounded-lg p-6 ${currentStep === 'details' ? 'border-yellow-500' : 'border-gray-200'}`}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-gray-900">2. Detalii Livrare</h2>
                <div className="flex items-center space-x-2">
                  {currentStep === 'payment' && (
                    <>
                      <Check className="w-6 h-6 text-green-600" />
                      <button
                        onClick={() => setCurrentStep('details')}
                        className="text-sm text-[#86C2FF] hover:text-[#6BADEF] underline"
                      >
                        Modifică
                      </button>
                    </>
                  )}
                </div>
              </div>

              {currentStep === 'details' && (
                <div className="space-y-4">
                  {/* Person Type Selection */}
                  <div className="space-y-3 pb-4 border-b border-gray-200">
                    <label className="flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer transition-all hover:bg-gray-50" style={{
                      borderColor: formData.personType === 'fizica' ? '#fbbf24' : '#e5e7eb',
                      backgroundColor: formData.personType === 'fizica' ? '#fffbeb' : 'transparent'
                    }}>
                      <input
                        type="radio"
                        name="personType"
                        value="fizica"
                        checked={formData.personType === 'fizica'}
                        onChange={(e) => setFormData({ ...formData, personType: e.target.value as 'fizica' | 'juridica' })}
                        className="w-5 h-5 text-yellow-500 focus:ring-2 focus:ring-yellow-500"
                      />
                      <div>
                        <div className="text-gray-900">Persoană Fizică</div>
                        <div className="text-sm text-gray-600">Preluam datele de livrare.</div>
                      </div>
                    </label>
                    
                    <label className="flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer transition-all hover:bg-gray-50" style={{
                      borderColor: formData.personType === 'juridica' ? '#fbbf24' : '#e5e7eb',
                      backgroundColor: formData.personType === 'juridica' ? '#fffbeb' : 'transparent'
                    }}>
                      <input
                        type="radio"
                        name="personType"
                        value="juridica"
                        checked={formData.personType === 'juridica'}
                        onChange={(e) => setFormData({ ...formData, personType: e.target.value as 'fizica' | 'juridica' })}
                        className="w-5 h-5 text-yellow-500 focus:ring-2 focus:ring-yellow-500"
                      />
                      <div>
                        <div className="text-gray-900">Persoană Juridică</div>
                        <div className="text-sm text-gray-600">Facturam conform datelor introduse de tine!</div>
                      </div>
                    </label>
                  </div>

                  {/* Company Fields - Only for Juridica */}
                  {formData.personType === 'juridica' && (
                    <div className="space-y-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <h3 className="text-gray-900 mb-3">Date Facturare</h3>
                      
                      <div>
                        <label className="block text-gray-700 mb-2">
                          Nume companie <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="companyName"
                          value={formData.companyName}
                          onChange={handleInputChange}
                          required={formData.personType === 'juridica'}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 bg-white"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-gray-700 mb-2">
                            Cod unic de Inregistrare <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            name="cui"
                            value={formData.cui}
                            onChange={handleInputChange}
                            required={formData.personType === 'juridica'}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 bg-white"
                          />
                        </div>
                        <div>
                          <label className="block text-gray-700 mb-2">
                            Nr. de inregistrare in Reg. Comertului <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            name="regCom"
                            value={formData.regCom}
                            onChange={handleInputChange}
                            required={formData.personType === 'juridica'}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 bg-white"
                          />
                        </div>
                      </div>

                      <div>
                        <h4 className="text-gray-900 mb-3">Sediul central:</h4>
                        
                        <div className="space-y-4">
                          <div>
                            <label className="block text-gray-700 mb-2">
                              Județ <span className="text-red-500">*</span>
                            </label>
                            <select
                              name="companyCounty"
                              value={formData.companyCounty}
                              onChange={handleSelectChange}
                              required={formData.personType === 'juridica'}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 bg-white"
                            >
                              <option value="">Alege Județ</option>
                              {romanianCounties.map(county => (
                                <option key={county.name} value={county.name}>
                                  {county.name}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-gray-700 mb-2">
                              Oraș <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              name="companyCity"
                              value={formData.companyCity}
                              onChange={handleInputChange}
                              required={formData.personType === 'juridica'}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 bg-white"
                            />
                          </div>

                          <div>
                            <label className="block text-gray-700 mb-2">
                              Adresa <span className="text-red-500">*</span>
                            </label>
                            <textarea
                              name="companyAddress"
                              value={formData.companyAddress}
                              onChange={(e) => setFormData({ ...formData, companyAddress: e.target.value })}
                              required={formData.personType === 'juridica'}
                              rows={3}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 bg-white resize-none"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Personal Details Section */}
                  <div className="space-y-4 pt-4">
                    <h3 className="text-gray-900 pb-2 font-bold">
                      Detalii Personale
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-gray-700 mb-2">
                          Prenume <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-700 mb-2">
                          Nume <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-gray-700 mb-2">
                          Email <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-700 mb-2">
                          Telefon <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Delivery Address Section */}
                  <div className="space-y-4 pt-6 mt-6 border-t border-gray-200">
                    <h3 className="text-gray-900 pb-2 font-bold">
                      Adresa de Livrare
                    </h3>

                    <div>
                      <label className="block text-gray-700 mb-2">
                        Adresă <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-gray-700 mb-2">
                          Județ <span className="text-red-500">*</span>
                        </label>
                        <select
                          name="county"
                          value={formData.county}
                          onChange={handleSelectChange}
                          required
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 bg-white"
                        >
                          <option value="">Selectează județul</option>
                          {romanianCounties.map(county => (
                            <option key={county.name} value={county.name}>
                              {county.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-gray-700 mb-2">
                          Oraș <span className="text-red-500">*</span>
                        </label>
                        {!showCustomCityInput ? (
                          <>
                            <select
                              name="city"
                              value={formData.city}
                              onChange={(e) => {
                                if (e.target.value === '__custom__') {
                                  setShowCustomCityInput(true);
                                  setFormData(prev => ({ ...prev, city: '' }));
                                } else {
                                  handleSelectChange(e);
                                }
                              }}
                              required
                              disabled={!formData.county}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
                            >
                              <option value="">
                                {formData.county ? 'Selectează orașul' : 'Selectează județul mai întâi'}
                              </option>
                              {availableCities.map((city, index) => (
                                <option key={`${formData.county}-${city}-${index}`} value={city}>
                                  {city}
                                </option>
                              ))}
                              {formData.county && (
                                <option value="__custom__" className="text-[#6994FF]">
                                  ➕ Altul (introdu manual)
                                </option>
                              )}
                            </select>
                          </>
                        ) : (
                          <div className="space-y-2">
                            <input
                              type="text"
                              name="city"
                              value={formData.city}
                              onChange={handleInputChange}
                              placeholder="Introdu orașul"
                              required
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                setShowCustomCityInput(false);
                                setFormData(prev => ({ ...prev, city: '' }));
                              }}
                              className="text-sm text-[#6994FF] hover:text-[#5078E6] underline"
                            >
                              ← Înapoi la listă
                            </button>
                          </div>
                        )}
                      </div>
                      <div>
                        <label className="block text-gray-700 mb-2">
                          Cod Poștal <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="postalCode"
                          value={formData.postalCode}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                        />
                      </div>
                    </div>

                    <button
                      onClick={handleContinueToPayment}
                      className="w-full px-8 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
                    >
                      Continuă
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className={`bg-white border-2 rounded-lg p-6 ${currentStep === 'payment' ? 'border-yellow-500' : 'border-gray-200'}`} ref={paymentStepRef}>
              <h2 className="text-gray-900 mb-6">3. Metodă de Plată</h2>

              {currentStep === 'payment' && (
                <div className="space-y-4">
                  <button
                    onClick={() => setPaymentMethod('card')}
                    className={`w-full p-4 border-2 rounded-lg text-left transition-all ${
                      paymentMethod === 'card'
                        ? 'border-yellow-500 bg-yellow-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <CreditCard className="w-5 h-5 text-yellow-600" />
                      <span className="text-gray-900">Card Bancar</span>
                    </div>
                  </button>

                  <button
                    onClick={() => setPaymentMethod('cash')}
                    className={`w-full p-4 border-2 rounded-lg text-left transition-all ${
                      paymentMethod === 'cash'
                        ? 'border-yellow-500 bg-yellow-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <CreditCard className="w-5 h-5 text-yellow-600" />
                      <span className="text-gray-900">Numerar la Livrare</span>
                    </div>
                  </button>

                  <button
                    onClick={handlePlaceOrder}
                    className="w-full px-8 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    disabled={isSubmitting}
                  >
                    {isSubmitting && <Loader2 className="w-5 h-5 animate-spin" />}
                    {isSubmitting ? 'Se plasează comanda...' : 'Plasează Comanda'}
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-gray-50 rounded-lg p-6 sticky top-24">
              <h3 className="text-gray-900 mb-4">Sumar Comandă</h3>

              <div className="space-y-3 mb-4">
                {cart.map(item => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-gray-700">
                      {item.product.title} × {item.quantity}
                    </span>
                    <span className="text-gray-900">
                      {((item.customization?.price || item.product.price) * item.quantity).toFixed(2)} lei
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-200 pt-4 space-y-2">
                <div className="flex justify-between text-gray-700">
                  <span>Subtotal:</span>
                  <span>{getCartTotal().toFixed(2)} lei</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Livrare:</span>
                  <span className="text-green-600">
                    {deliveryOption === 'express' ? '25 lei' : 'Gratuit'}
                  </span>
                </div>
                <div className="border-t border-gray-200 pt-2 flex justify-between">
                  <span className="text-gray-900">Total:</span>
                  <span className="text-2xl text-yellow-600">
                    {(getCartTotal() + (deliveryOption === 'express' ? 25 : 0)).toFixed(2)} lei
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};