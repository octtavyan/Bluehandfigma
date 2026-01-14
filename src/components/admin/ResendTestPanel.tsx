import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Alert, AlertDescription } from '../ui/alert';
import { CheckCircle2, XCircle, Mail, Loader2, TestTube } from 'lucide-react';
import { projectId, publicAnonKey } from '../../utils/supabase/info';

export function ResendTestPanel() {
  const [loading, setLoading] = useState(false);
  const [testEmailLoading, setTestEmailLoading] = useState(false);
  const [configStatus, setConfigStatus] = useState<any>(null);
  const [testResult, setTestResult] = useState<any>(null);
  
  const [testEmail, setTestEmail] = useState('octavian.dumitrescu@gmail.com');
  const [testSubject, setTestSubject] = useState('🧪 Test Email from BlueHand Canvas');
  const [testMessage, setTestMessage] = useState('This is a test email to verify the Resend integration is working correctly.');

  const checkConfiguration = async () => {
    setLoading(true);
    setConfigStatus(null);
    
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-bbc0c500/test-resend`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      const data = await response.json();
      setConfigStatus(data);
    } catch (error) {
      setConfigStatus({
        configured: false,
        error: error instanceof Error ? error.message : 'Failed to check configuration',
      });
    } finally {
      setLoading(false);
    }
  };

  const sendTestEmail = async () => {
    setTestEmailLoading(true);
    setTestResult(null);
    
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-bbc0c500/send-test-email`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            to: testEmail,
            subject: testSubject,
            message: testMessage,
          }),
        }
      );

      const data = await response.json();
      setTestResult(data);
    } catch (error) {
      setTestResult({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to send test email',
      });
    } finally {
      setTestEmailLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Configuration Check */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TestTube className="w-5 h-5" />
            Verificare Configurație Resend
          </CardTitle>
          <CardDescription>
            Verifică dacă cheia API Resend este configurată corect în Supabase
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={checkConfiguration}
            disabled={loading}
            className="w-full"
          >
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Verifică Configurația
          </Button>

          {configStatus && (
            <Alert className={configStatus.configured ? 'border-green-500' : 'border-red-500'}>
              <div className="flex items-start gap-2">
                {configStatus.configured ? (
                  <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-500 mt-0.5" />
                )}
                <div className="flex-1">
                  <AlertDescription>
                    {configStatus.configured ? (
                      <div className="space-y-2">
                        <p className="font-medium text-green-700">
                          ✅ {configStatus.message}
                        </p>
                        <p className="text-sm text-gray-600">
                          Cheie API: <code className="bg-gray-100 px-2 py-1 rounded">{configStatus.keyPreview}</code>
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <p className="font-medium text-red-700">
                          ❌ {configStatus.error}
                        </p>
                        {configStatus.instructions && (
                          <p className="text-sm text-gray-600">
                            {configStatus.instructions}
                          </p>
                        )}
                        {configStatus.keyPreview && (
                          <p className="text-sm text-gray-600">
                            Cheie curentă: <code className="bg-gray-100 px-2 py-1 rounded">{configStatus.keyPreview}</code>
                          </p>
                        )}
                      </div>
                    )}
                  </AlertDescription>
                </div>
              </div>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Test Email Sender */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Trimite Email de Test
          </CardTitle>
          <CardDescription>
            Trimite un email de test pentru a verifica integrarea Resend
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="test-email">Email Destinatar</Label>
            <Input
              id="test-email"
              type="email"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              placeholder="email@example.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="test-subject">Subiect</Label>
            <Input
              id="test-subject"
              value={testSubject}
              onChange={(e) => setTestSubject(e.target.value)}
              placeholder="Test Email Subject"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="test-message">Mesaj</Label>
            <Textarea
              id="test-message"
              value={testMessage}
              onChange={(e) => setTestMessage(e.target.value)}
              placeholder="Your test message..."
              rows={4}
            />
          </div>

          <Button
            onClick={sendTestEmail}
            disabled={testEmailLoading || !testEmail}
            className="w-full"
          >
            {testEmailLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Trimite Email de Test
          </Button>

          {testResult && (
            <Alert className={testResult.success ? 'border-green-500' : 'border-red-500'}>
              <div className="flex items-start gap-2">
                {testResult.success ? (
                  <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-500 mt-0.5" />
                )}
                <div className="flex-1">
                  <AlertDescription>
                    {testResult.success ? (
                      <div className="space-y-2">
                        <p className="font-medium text-green-700">
                          ✅ Email trimis cu succes!
                        </p>
                        <p className="text-sm text-gray-600">
                          Email ID: <code className="bg-gray-100 px-2 py-1 rounded">{testResult.emailId}</code>
                        </p>
                        <p className="text-sm text-gray-600">
                          Verifică inbox-ul pentru a confirma primirea emailului.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <p className="font-medium text-red-700">
                          ❌ Eroare la trimiterea emailului
                        </p>
                        <p className="text-sm text-gray-600">
                          {testResult.error}
                        </p>
                        {testResult.details && (
                          <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto">
                            {JSON.stringify(testResult.details, null, 2)}
                          </pre>
                        )}
                      </div>
                    )}
                  </AlertDescription>
                </div>
              </div>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Instrucțiuni de Configurare</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="space-y-2">
            <p className="font-medium">Pentru a configura cheia API Resend:</p>
            <ol className="list-decimal list-inside space-y-1 text-gray-600 ml-2">
              <li>Mergi la Supabase Dashboard: <code className="bg-gray-100 px-1 rounded">Edge Functions → Secrets</code></li>
              <li>Adaugă un secret nou cu numele: <code className="bg-gray-100 px-1 rounded">RESEND_API_KEY</code></li>
              <li>Valoarea cheii: <code className="bg-gray-100 px-1 rounded">re_5NCJQCN6_Q4bPvRW93eAvZo9pD82ezn3j</code></li>
              <li>Salvează și așteaptă câteva secunde pentru propagare</li>
              <li>Revino aici și apasă butonul "Verifică Configurația"</li>
            </ol>
          </div>

          <div className="space-y-2 pt-2 border-t">
            <p className="font-medium">Link-uri Utile:</p>
            <ul className="space-y-1 text-gray-600">
              <li>
                <a 
                  href={`https://supabase.com/dashboard/project/${projectId}/functions`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  → Supabase Edge Functions
                </a>
              </li>
              <li>
                <a 
                  href="https://resend.com/overview"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  → Resend Dashboard
                </a>
              </li>
              <li>
                <a 
                  href="https://resend.com/docs"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  → Resend Documentation
                </a>
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
