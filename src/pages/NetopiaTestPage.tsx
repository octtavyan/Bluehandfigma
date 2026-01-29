import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Loader2, CreditCard, CheckCircle, XCircle } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

export default function NetopiaTestPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    orderId: `TEST-${Date.now()}`,
    amount: '10.50',
    customerName: 'Ion Popescu',
    customerEmail: 'ion.popescu@test.ro',
    customerPhone: '0722123456',
    customerAddress: 'Str. Victoriei nr. 10, București, București',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleTestPayment = async () => {
    setLoading(true);
    setResult(null);
    setError(null);

    try {
      console.log('🧪 Testing Netopia payment with data:', formData);

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-bbc0c500/netopia/start-payment`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            orderId: formData.orderId,
            amount: parseFloat(formData.amount),
            customerEmail: formData.customerEmail,
            customerName: formData.customerName,
            customerPhone: formData.customerPhone,
            customerAddress: formData.customerAddress,
            returnUrl: `${window.location.origin}/payment-success`,
          }),
        }
      );

      const data = await response.json();

      console.log('📥 Netopia response:', data);

      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      if (data.success && data.redirectUrl) {
        setResult(data);
        console.log('✅ Payment initialized successfully!');
        console.log('🔗 Redirect URL:', data.redirectUrl);
        
        // Automatically redirect after 3 seconds
        setTimeout(() => {
          window.location.href = data.redirectUrl;
        }, 3000);
      } else {
        throw new Error(data.error || 'No redirect URL received');
      }

    } catch (err) {
      console.error('❌ Payment test failed:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-6 w-6 text-blue-600" />
              Netopia SDK Payment Test
            </CardTitle>
            <CardDescription>
              Test the Netopia Payments integration using the official SDK
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Form */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="orderId">Order ID</Label>
                <Input
                  id="orderId"
                  name="orderId"
                  value={formData.orderId}
                  onChange={handleInputChange}
                  placeholder="TEST-123456"
                />
              </div>

              <div>
                <Label htmlFor="amount">Amount (RON)</Label>
                <Input
                  id="amount"
                  name="amount"
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={handleInputChange}
                  placeholder="10.50"
                />
              </div>

              <div>
                <Label htmlFor="customerName">Customer Name</Label>
                <Input
                  id="customerName"
                  name="customerName"
                  value={formData.customerName}
                  onChange={handleInputChange}
                  placeholder="Ion Popescu"
                />
              </div>

              <div>
                <Label htmlFor="customerEmail">Customer Email</Label>
                <Input
                  id="customerEmail"
                  name="customerEmail"
                  type="email"
                  value={formData.customerEmail}
                  onChange={handleInputChange}
                  placeholder="ion.popescu@test.ro"
                />
              </div>

              <div>
                <Label htmlFor="customerPhone">Customer Phone</Label>
                <Input
                  id="customerPhone"
                  name="customerPhone"
                  value={formData.customerPhone}
                  onChange={handleInputChange}
                  placeholder="0722123456"
                />
              </div>

              <div>
                <Label htmlFor="customerAddress">Customer Address</Label>
                <Input
                  id="customerAddress"
                  name="customerAddress"
                  value={formData.customerAddress}
                  onChange={handleInputChange}
                  placeholder="Str. Victoriei nr. 10, București, București"
                />
              </div>
            </div>

            {/* Test Button */}
            <Button
              onClick={handleTestPayment}
              disabled={loading}
              className="w-full"
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Initializing Payment...
                </>
              ) : (
                <>
                  <CreditCard className="mr-2 h-4 w-4" />
                  Test Netopia Payment
                </>
              )}
            </Button>

            {/* Success Result */}
            {result && (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  <div className="space-y-2">
                    <p className="font-semibold">✅ Payment initialized successfully!</p>
                    <p className="text-sm">Order ID: {result.orderId}</p>
                    <p className="text-sm break-all">
                      Redirect URL: <a href={result.redirectUrl} className="underline" target="_blank" rel="noopener noreferrer">
                        {result.redirectUrl}
                      </a>
                    </p>
                    <p className="text-xs text-green-600 font-medium mt-2">
                      🔄 Redirecting to payment page in 3 seconds...
                    </p>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {/* Error */}
            {error && (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-2">
                    <p className="font-semibold">❌ Payment initialization failed</p>
                    <p className="text-sm">{error}</p>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {/* Instructions */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">📋 Test Instructions</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Make sure Netopia settings are configured in Admin Settings</li>
                <li>• NETOPIA_API_KEY and NETOPIA_POS_SIGNATURE must be set in Supabase secrets</li>
                <li>• This uses manual XML encryption (confirmed working by Netopia)</li>
                <li>• For sandbox testing, use test cards below</li>
                <li>• Check the browser console and Supabase logs for detailed information</li>
              </ul>
            </div>

            {/* Test Cards */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-semibold text-green-900 mb-2">✅ Netopia Sandbox Test Cards</h3>
              <div className="text-sm text-green-800 space-y-3">
                <div className="bg-white border border-green-300 rounded p-3">
                  <p className="font-semibold text-green-900 mb-1">✅ Successful Payment:</p>
                  <div className="font-mono text-xs space-y-1">
                    <p>Card: <strong>9900004810566980</strong></p>
                    <p>Expiry: <strong>12/28</strong></p>
                    <p>CVV: <strong>000</strong></p>
                    <p>Name: <strong>Any Name</strong></p>
                  </div>
                </div>
                <div className="bg-white border border-green-300 rounded p-3">
                  <p className="font-semibold text-green-900 mb-1">❌ Failed Payment:</p>
                  <div className="font-mono text-xs space-y-1">
                    <p>Card: <strong>9900004810517280</strong></p>
                    <p>Expiry: <strong>12/28</strong></p>
                    <p>CVV: <strong>000</strong></p>
                    <p>Name: <strong>Any Name</strong></p>
                  </div>
                </div>
              </div>
            </div>

            {/* What's New Badge */}
            <div className="bg-green-50 border-2 border-green-500 rounded-lg p-4">
              <h3 className="font-semibold text-green-900 mb-2 flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                ✅ Integration Confirmed Working by Netopia
              </h3>
              <div className="text-sm text-green-800 space-y-2">
                <p className="font-medium">Netopia support confirmed on Jan 29, 2026:</p>
                <blockquote className="italic border-l-4 border-green-400 pl-3 my-2">
                  "Folosind apikey-ul si semnatura dvs. am obtinut payment URL si am fost redirectionati in pagina de plata."
                </blockquote>
                <p><strong>Implementation details:</strong></p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>AES-256-CBC encryption for payment data</li>
                  <li>RSA encryption for AES key with PKCS#1 padding</li>
                  <li>Dual currency placement (XML element + invoice attribute)</li>
                  <li>Complete logging for debugging</li>
                </ul>
                <div className="mt-3 pt-3 border-t border-green-300">
                  <p className="font-medium">📚 Documentation:</p>
                  <ul className="list-disc list-inside space-y-1 ml-2 mt-1">
                    <li><code className="bg-green-100 px-1 rounded">/NETOPIA_SUCCESS_CONFIRMED.md</code> - Confirmation details</li>
                    <li><code className="bg-green-100 px-1 rounded">/NETOPIA_SIMPLE_FIX.md</code> - Quick testing guide</li>
                    <li><code className="bg-green-100 px-1 rounded">/NETOPIA_QUICK_REFERENCE.md</code> - Quick reference</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Reference Card */}
        <Card className="mt-4">
          <CardHeader>
            <CardTitle className="text-lg">🔍 Quick Debug Reference</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Console Logs */}
            <div>
              <h4 className="font-semibold text-sm mb-2">Expected Console Logs:</h4>
              <pre className="bg-gray-900 text-green-400 p-3 rounded text-xs overflow-x-auto">
{`🧪 Testing Netopia payment with data: {...}
📥 Netopia response: { success: true, ... }
✅ Payment initialized successfully!
🔗 Redirect URL: https://secure.sandbox...`}
              </pre>
            </div>

            {/* Supabase Logs */}
            <div>
              <h4 className="font-semibold text-sm mb-2">Expected Supabase Edge Function Logs:</h4>
              <pre className="bg-gray-900 text-blue-400 p-3 rounded text-xs overflow-x-auto">
{`💳 Initiating Netopia payment for order TEST-...
📦 Importing Netopia SDK...
✅ Netopia SDK imported successfully
✅ Netopia instance created
📝 Payment data prepared: {...}
🚀 Creating payment with Netopia SDK...
✅ Netopia SDK response: {...}
✅ Payment initialized successfully. Redirect URL: ...`}
              </pre>
            </div>

            {/* Success Criteria */}
            <div className="bg-green-50 border border-green-200 rounded p-3">
              <h4 className="font-semibold text-sm text-green-900 mb-2">✅ Success Criteria:</h4>
              <ul className="text-xs text-green-800 space-y-1">
                <li>✓ Green success alert appears on this page</li>
                <li>✓ Redirect URL is displayed (starts with https://secure.sandbox...)</li>
                <li>✓ Auto-redirect countdown shows "Redirecting in 3 seconds..."</li>
                <li>✓ Browser redirects to Netopia payment page</li>
                <li>✓ All console logs show ✅ (no ❌ errors)</li>
              </ul>
            </div>

            {/* Common Issues */}
            <div className="bg-amber-50 border border-amber-200 rounded p-3">
              <h4 className="font-semibold text-sm text-amber-900 mb-2">⚠️ Common Issues:</h4>
              <div className="text-xs text-amber-800 space-y-2">
                <div>
                  <strong>"Not configured":</strong>
                  <p className="ml-2">→ Set NETOPIA_API_KEY and NETOPIA_POS_SIGNATURE in Supabase secrets</p>
                </div>
                <div>
                  <strong>"SDK import failed":</strong>
                  <p className="ml-2">→ Check Edge Function deployment in Supabase dashboard</p>
                </div>
                <div>
                  <strong>"No payment URL":</strong>
                  <p className="ml-2">→ Verify API credentials match your Netopia account</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}