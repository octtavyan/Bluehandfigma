export default function ServerSetupGuide() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-black text-white p-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">🚀 Server Setup Guide</h1>
          <p className="text-xl text-blue-300">Fix the 404 error by setting up your API</p>
        </div>

        {/* Problem Statement */}
        <div className="bg-red-900/50 border-2 border-red-500 rounded-lg p-6 mb-6">
          <h2 className="text-2xl font-bold mb-3 flex items-center gap-2">
            ❌ Problem: 404 Error
          </h2>
          <p className="text-lg mb-2">
            When accessing <code className="bg-black px-2 py-1 rounded">https://bluehand.ro/api/paintings</code>
          </p>
          <p className="text-red-300">
            → This means the <code>/api/</code> directory doesn't exist or isn't configured on your server.
          </p>
        </div>

        {/* Solution Steps */}
        <div className="space-y-6">
          
          {/* Step 1 */}
          <div className="bg-gray-800 border-2 border-blue-500 rounded-lg p-6">
            <h3 className="text-xl font-bold mb-3 text-blue-400">Step 1: SSH into your server</h3>
            <pre className="bg-black p-4 rounded text-green-400 text-sm overflow-x-auto">
ssh root@89.41.38.220
# or
ssh root@bluehand.ro
            </pre>
          </div>

          {/* Step 2 */}
          <div className="bg-gray-800 border-2 border-blue-500 rounded-lg p-6">
            <h3 className="text-xl font-bold mb-3 text-blue-400">Step 2: Navigate to web root</h3>
            <pre className="bg-black p-4 rounded text-green-400 text-sm overflow-x-auto">
cd /var/www/html
# or if different directory:
# cd /home/bluehand/public_html
            </pre>
          </div>

          {/* Step 3 */}
          <div className="bg-gray-800 border-2 border-blue-500 rounded-lg p-6">
            <h3 className="text-xl font-bold mb-3 text-blue-400">Step 3: Create /api directory</h3>
            <pre className="bg-black p-4 rounded text-green-400 text-sm overflow-x-auto">
mkdir -p api
cd api
            </pre>
          </div>

          {/* Step 4 */}
          <div className="bg-gray-800 border-2 border-yellow-500 rounded-lg p-6">
            <h3 className="text-xl font-bold mb-3 text-yellow-400">Step 4: Create index.php</h3>
            <pre className="bg-black p-4 rounded text-green-400 text-sm overflow-x-auto">
nano index.php
            </pre>
            <p className="text-sm text-gray-300 my-3">Paste this minimal working code:</p>
            <pre className="bg-black p-4 rounded text-green-400 text-xs overflow-x-auto max-h-96">
{`<?php
// CORS Headers - MUST BE FIRST!
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Database connection
$host = 'localhost';
$dbname = 'bluehand_db';  // CHANGE THIS!
$username = 'bluehand_user';  // CHANGE THIS!
$password = 'your_password';  // CHANGE THIS!

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database connection failed']);
    exit();
}

// Simple routing
$path = str_replace('/api/', '', parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH));
$endpoint = trim($path, '/');

switch ($endpoint) {
    case 'paintings':
        $stmt = $pdo->query("SELECT * FROM paintings");
        echo json_encode(['paintings' => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
        break;
    
    case 'categories':
        $stmt = $pdo->query("SELECT * FROM categories");
        echo json_encode(['categories' => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
        break;
    
    case 'sizes':
        $stmt = $pdo->query("SELECT * FROM sizes");
        echo json_encode(['sizes' => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
        break;
    
    case 'styles':
        $stmt = $pdo->query("SELECT * FROM styles");
        echo json_encode(['styles' => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
        break;
    
    case 'print-types':
        $stmt = $pdo->query("SELECT * FROM print_types");
        echo json_encode(['printTypes' => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
        break;
    
    case 'frame-types':
        $stmt = $pdo->query("SELECT * FROM frame_types");
        echo json_encode(['frameTypes' => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
        break;
    
    case 'orders':
        $stmt = $pdo->query("SELECT * FROM orders ORDER BY created_at DESC");
        echo json_encode(['orders' => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
        break;
    
    case 'health':
        echo json_encode(['status' => 'ok', 'database' => 'connected']);
        break;
    
    default:
        http_response_code(404);
        echo json_encode(['error' => 'Endpoint not found']);
        break;
}`}
            </pre>
            <p className="text-yellow-300 text-sm mt-3">
              💾 Save: Press <kbd className="bg-gray-700 px-2 py-1 rounded">Ctrl+X</kbd>, then <kbd className="bg-gray-700 px-2 py-1 rounded">Y</kbd>, then <kbd className="bg-gray-700 px-2 py-1 rounded">Enter</kbd>
            </p>
          </div>

          {/* Step 5 */}
          <div className="bg-gray-800 border-2 border-yellow-500 rounded-lg p-6">
            <h3 className="text-xl font-bold mb-3 text-yellow-400">Step 5: Create .htaccess</h3>
            <pre className="bg-black p-4 rounded text-green-400 text-sm overflow-x-auto">
nano .htaccess
            </pre>
            <p className="text-sm text-gray-300 my-3">Paste this:</p>
            <pre className="bg-black p-4 rounded text-green-400 text-sm overflow-x-auto">
{`RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ index.php [L,QSA]`}
            </pre>
            <p className="text-yellow-300 text-sm mt-3">
              💾 Save: Press <kbd className="bg-gray-700 px-2 py-1 rounded">Ctrl+X</kbd>, then <kbd className="bg-gray-700 px-2 py-1 rounded">Y</kbd>, then <kbd className="bg-gray-700 px-2 py-1 rounded">Enter</kbd>
            </p>
          </div>

          {/* Step 6 */}
          <div className="bg-gray-800 border-2 border-blue-500 rounded-lg p-6">
            <h3 className="text-xl font-bold mb-3 text-blue-400">Step 6: Set permissions</h3>
            <pre className="bg-black p-4 rounded text-green-400 text-sm overflow-x-auto">
chmod 644 index.php
chmod 644 .htaccess
            </pre>
          </div>

          {/* Step 7 */}
          <div className="bg-gray-800 border-2 border-blue-500 rounded-lg p-6">
            <h3 className="text-xl font-bold mb-3 text-blue-400">Step 7: Enable mod_rewrite</h3>
            <pre className="bg-black p-4 rounded text-green-400 text-sm overflow-x-auto">
{`# For Apache:
sudo a2enmod rewrite
sudo systemctl restart apache2

# For Nginx: Already enabled`}
            </pre>
          </div>

          {/* Step 8 */}
          <div className="bg-gray-800 border-2 border-green-500 rounded-lg p-6">
            <h3 className="text-xl font-bold mb-3 text-green-400">Step 8: Test it!</h3>
            <pre className="bg-black p-4 rounded text-green-400 text-sm overflow-x-auto mb-3">
curl https://bluehand.ro/api/health
            </pre>
            <p className="text-sm text-gray-300 mb-2">Expected output:</p>
            <pre className="bg-black p-4 rounded text-green-400 text-sm overflow-x-auto">
{`{"status":"ok","database":"connected"}`}
            </pre>
            <div className="mt-4 pt-4 border-t border-gray-600">
              <p className="text-sm text-gray-300 mb-2">Also test in browser:</p>
              <a 
                href="https://bluehand.ro/api/health" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 underline"
              >
                https://bluehand.ro/api/health
              </a>
            </div>
          </div>
        </div>

        {/* Troubleshooting */}
        <div className="mt-8 bg-orange-900/50 border-2 border-orange-500 rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-4">🔧 Still getting 404?</h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="font-bold text-orange-300 mb-2">1. Check Apache AllowOverride</h3>
              <pre className="bg-black p-3 rounded text-green-400 text-xs overflow-x-auto">
{`sudo nano /etc/apache2/sites-available/bluehand.ro.conf

# Make sure it has:
<Directory /var/www/html>
    AllowOverride All
</Directory>

# Then restart:
sudo systemctl restart apache2`}
              </pre>
            </div>

            <div>
              <h3 className="font-bold text-orange-300 mb-2">2. Check error logs</h3>
              <pre className="bg-black p-3 rounded text-green-400 text-xs overflow-x-auto">
tail -f /var/log/apache2/error.log
              </pre>
            </div>

            <div>
              <h3 className="font-bold text-orange-300 mb-2">3. Verify file exists</h3>
              <pre className="bg-black p-3 rounded text-green-400 text-xs overflow-x-auto">
ls -la /var/www/html/api/
              </pre>
              <p className="text-sm text-gray-300 mt-1">Should show: index.php and .htaccess</p>
            </div>
          </div>
        </div>

        {/* Success Message */}
        <div className="mt-8 bg-green-900/50 border-2 border-green-500 rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-3 flex items-center gap-2">
            ✅ Once it works...
          </h2>
          <p className="text-lg">
            Refresh this app and all the "Failed to fetch" errors will disappear!
          </p>
          <p className="text-sm text-green-300 mt-2">
            The app will automatically connect to your live database.
          </p>
        </div>

        {/* Navigation */}
        <div className="mt-8 flex gap-3 flex-wrap">
          <a href="/" className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-bold">
            ← Back to App
          </a>
          <a href="/simple-connection-test" className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-bold">
            🧪 Test Connection
          </a>
          <a href="https://bluehand.ro/api/health" target="_blank" rel="noopener noreferrer" className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-bold">
            🌐 Test API in Browser
          </a>
        </div>
      </div>
    </div>
  );
}
