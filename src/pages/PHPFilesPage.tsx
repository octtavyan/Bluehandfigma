import React, { useState } from 'react';
import { Check, Copy } from 'lucide-react';

const phpFiles = {
  'config.php': `<?php
// CORS Headers - MUST be first
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json; charset=UTF-8');

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Database Configuration
define('DB_HOST', 'localhost');
define('DB_NAME', 'bluehand_db');          // ⚠️ CHANGE THIS
define('DB_USER', 'bluehand_user');        // ⚠️ CHANGE THIS
define('DB_PASS', 'your_password_here');   // ⚠️ CHANGE THIS

// Create PDO connection
try {
    $pdo = new PDO(
        "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4",
        DB_USER,
        DB_PASS,
        array(
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false
        )
    );
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(array('success' => false, 'error' => 'Database connection failed'));
    exit;
}`,

  'health.php': `<?php
// CORS Headers
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json; charset=UTF-8');

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Return success
echo json_encode(array(
    'success' => true,
    'message' => 'BlueHand API is running',
    'timestamp' => date('Y-m-d H:i:s'),
    'version' => '1.0'
));`,

  'auth/login.php': `<?php
// CORS Headers - MUST be first
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json; charset=UTF-8');

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Include config (one level up from auth/ folder)
require_once dirname(__FILE__) . '/../config.php';

// Get POST data
$input = file_get_contents('php://input');
$data = json_decode($input, true);

$username = isset($data['username']) ? $data['username'] : '';
$password = isset($data['password']) ? $data['password'] : '';

// Validate input
if (empty($username) || empty($password)) {
    echo json_encode(array(
        'success' => false,
        'error' => 'Username and password required'
    ));
    exit;
}

try {
    // Query user from database
    $stmt = $pdo->prepare("SELECT * FROM users WHERE username = ? AND is_active = 1");
    $stmt->execute(array($username));
    $user = $stmt->fetch();
    
    // Check if user exists and password matches
    if ($user && password_verify($password, $user['password_hash'])) {
        // Generate token (simple version - use JWT for production)
        $token = bin2hex(random_bytes(32));
        
        // Return success
        echo json_encode(array(
            'success' => true,
            'token' => $token,
            'user' => array(
                'id' => $user['id'],
                'username' => $user['username'],
                'email' => isset($user['email']) ? $user['email'] : '',
                'role' => $user['role'],
                'full_name' => $user['username']
            )
        ));
    } else {
        // Invalid credentials
        echo json_encode(array(
            'success' => false,
            'error' => 'Invalid username or password'
        ));
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(array(
        'success' => false,
        'error' => $e->getMessage()
    ));
}`,

  'paintings.php': `<?php
// CORS Headers
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json; charset=UTF-8');

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Include config
require_once 'config.php';

try {
    // Get all paintings
    $stmt = $pdo->query("SELECT * FROM paintings WHERE is_active = 1 ORDER BY created_at DESC");
    $paintings = $stmt->fetchAll();
    
    echo json_encode(array(
        'success' => true,
        'paintings' => $paintings
    ));
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(array(
        'success' => false,
        'error' => $e->getMessage()
    ));
}`,

  'categories.php': `<?php
// CORS Headers
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json; charset=UTF-8');

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Include config
require_once 'config.php';

try {
    $stmt = $pdo->query("SELECT * FROM categories WHERE is_active = 1 ORDER BY name");
    $categories = $stmt->fetchAll();
    
    echo json_encode(array(
        'success' => true,
        'categories' => $categories
    ));
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(array(
        'success' => false,
        'error' => $e->getMessage()
    ));
}`,

  'sizes.php': `<?php
// CORS Headers
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json; charset=UTF-8');

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Include config
require_once 'config.php';

try {
    $stmt = $pdo->query("SELECT * FROM sizes WHERE is_active = 1 ORDER BY price");
    $sizes = $stmt->fetchAll();
    
    echo json_encode(array(
        'success' => true,
        'sizes' => $sizes
    ));
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(array(
        'success' => false,
        'error' => $e->getMessage()
    ));
}`,

  'orders.php': `<?php
// CORS Headers
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json; charset=UTF-8');

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Include config
require_once 'config.php';

// GET - Fetch all orders
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        $stmt = $pdo->query("SELECT * FROM orders ORDER BY created_at DESC");
        $orders = $stmt->fetchAll();
        
        echo json_encode(array(
            'success' => true,
            'orders' => $orders
        ));
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(array(
            'success' => false,
            'error' => $e->getMessage()
        ));
    }
}

// POST - Create new order
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        $input = file_get_contents('php://input');
        $data = json_decode($input, true);
        
        // Insert order
        $stmt = $pdo->prepare("
            INSERT INTO orders 
            (order_number, customer_name, customer_email, customer_phone, 
             delivery_address, items, subtotal, delivery_cost, total, status, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'new', NOW())
        ");
        
        $stmt->execute(array(
            $data['order_number'],
            $data['customer_name'],
            $data['customer_email'],
            $data['customer_phone'],
            $data['delivery_address'],
            json_encode($data['items']),
            $data['subtotal'],
            $data['delivery_cost'],
            $data['total']
        ));
        
        echo json_encode(array(
            'success' => true,
            'order_id' => $pdo->lastInsertId()
        ));
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(array(
            'success' => false,
            'error' => $e->getMessage()
        ));
    }
}`
};

export default function PHPFilesPage() {
  const [copiedFile, setCopiedFile] = useState<string | null>(null);

  const copyToClipboard = async (filename: string, content: string) => {
    try {
      // Try modern clipboard API first
      await navigator.clipboard.writeText(content);
      setCopiedFile(filename);
      setTimeout(() => setCopiedFile(null), 2000);
    } catch (err) {
      // Fallback to old-school method
      const textarea = document.createElement('textarea');
      textarea.value = content;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand('copy');
        setCopiedFile(filename);
        setTimeout(() => setCopiedFile(null), 2000);
      } catch (copyErr) {
        alert('Failed to copy. Please select and copy manually.');
      } finally {
        document.body.removeChild(textarea);
      }
    }
  };

  const fileInfo = {
    'config.php': { path: '/var/www/html/api/config.php', icon: '⚙️', desc: 'Database configuration' },
    'health.php': { path: '/var/www/html/api/health.php', icon: '❤️', desc: 'Health check endpoint' },
    'auth/login.php': { path: '/var/www/html/api/auth/login.php', icon: '🔐', desc: 'Login endpoint (create auth/ folder first!)' },
    'paintings.php': { path: '/var/www/html/api/paintings.php', icon: '🖼️', desc: 'Paintings API' },
    'categories.php': { path: '/var/www/html/api/categories.php', icon: '📁', desc: 'Categories API' },
    'sizes.php': { path: '/var/www/html/api/sizes.php', icon: '📏', desc: 'Sizes API' },
    'orders.php': { path: '/var/www/html/api/orders.php', icon: '🛒', desc: 'Orders API' }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">📦 PHP Backend Files</h1>
          
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Problem Found</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>Your PHP files have a <strong>syntax error</strong> and are missing CORS headers:</p>
                  <code className="bg-red-100 px-2 py-1 rounded mt-2 block">
                    Parse error: syntax error, unexpected '&lt;', expecting end of file
                  </code>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-green-50 border-l-4 border-green-400 p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">Solution</h3>
                <div className="mt-2 text-sm text-green-700">
                  <p>Copy these clean PHP files to your server. Click the <strong>📋 Copy</strong> button for each file.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Installation Steps */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-blue-900 mb-3">📋 Quick Steps</h2>
          <ol className="space-y-2 text-sm text-blue-800">
            <li><strong>1.</strong> Create folder: <code className="bg-blue-100 px-2 py-1 rounded">mkdir -p /var/www/html/api/auth</code></li>
            <li><strong>2.</strong> Copy each file below (click 📋 Copy button)</li>
            <li><strong>3.</strong> Create new file on server and paste content</li>
            <li><strong>4.</strong> Edit <code className="bg-blue-100 px-2 py-1 rounded">config.php</code> - update database credentials</li>
            <li><strong>5.</strong> Test: <a href="https://bluehand.ro/api/health.php" target="_blank" className="underline">https://bluehand.ro/api/health.php</a></li>
          </ol>
        </div>

        {/* Files */}
        {Object.entries(phpFiles).map(([filename, content]) => {
          const info = fileInfo[filename as keyof typeof fileInfo];
          const isCopied = copiedFile === filename;
          
          return (
            <div key={filename} className="bg-white rounded-lg shadow-sm mb-4 overflow-hidden">
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-2xl">{info.icon}</span>
                      <h3 className="text-lg font-bold text-gray-900">{filename}</h3>
                    </div>
                    <p className="text-sm text-gray-600">{info.desc}</p>
                    <div className="mt-2 bg-blue-50 border border-blue-200 rounded p-2">
                      <p className="text-xs text-blue-900 font-mono">{info.path}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => copyToClipboard(filename, content)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                      isCopied
                        ? 'bg-green-500 text-white'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {isCopied ? (
                      <>
                        <Check className="w-4 h-4" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        Copy
                      </>
                    )}
                  </button>
                </div>
              </div>
              <div className="p-6">
                <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm">
                  <code>{content}</code>
                </pre>
              </div>
            </div>
          );
        })}

        {/* Navigation */}
        <div className="flex gap-3 mt-6">
          <a
            href="/admin/login"
            className="flex-1 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-center transition-colors"
          >
            ← Back to Login
          </a>
          <a
            href="/api-test"
            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-center transition-colors"
          >
            Test API →
          </a>
        </div>
      </div>
    </div>
  );
}