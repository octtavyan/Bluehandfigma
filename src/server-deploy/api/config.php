<?php
// BlueHand Canvas - API Configuration

// ⚠️ CHANGE THESE VALUES!
define('DB_HOST', 'localhost');
define('DB_PORT', '3306');
define('DB_NAME', 'wiseguy_bluehand');
define('DB_USER', 'wiseguy_bluehand');
define('DB_PASS', 'Changeme11muie');  // ← Current server password

// File paths
define('UPLOAD_DIR', dirname(__DIR__) . '/uploads/');
define('UPLOAD_URL', 'https://bluehand.ro/uploads/');

// Security
define('JWT_SECRET', 'bluehand-canvas-secret-key-change-this-2026');  // ← CHANGE THIS!

// Error reporting
ini_set('display_errors', 0);  // Don't show errors in response - return JSON only
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/error.log');
error_reporting(E_ALL);

// CORS headers
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json; charset=utf-8');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Database connection function
function getDB() {
    static $pdo = null;
    
    if ($pdo === null) {
        try {
            $dsn = sprintf(
                "mysql:host=%s;port=%s;dbname=%s;charset=utf8mb4",
                DB_HOST,
                DB_PORT,
                DB_NAME
            );
            
            $pdo = new PDO($dsn, DB_USER, DB_PASS, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
            ]);
        } catch (PDOException $e) {
            error_log('Database connection failed: ' . $e->getMessage());
            http_response_code(500);
            echo json_encode([
                'error' => 'Database connection failed',
                'message' => $e->getMessage()
            ]);
            exit;
        }
    }
    
    return $pdo;
}

// JSON response helper
function jsonResponse($data, $code = 200) {
    http_response_code($code);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

// Authentication helper
function requireAuth() {
    // Try multiple ways to get the Authorization header
    $authHeader = null;
    
    // Method 1: Direct HTTP_AUTHORIZATION
    if (isset($_SERVER['HTTP_AUTHORIZATION'])) {
        $authHeader = $_SERVER['HTTP_AUTHORIZATION'];
    }
    // Method 2: Apache rewrites it to REDIRECT_HTTP_AUTHORIZATION
    elseif (isset($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) {
        $authHeader = $_SERVER['REDIRECT_HTTP_AUTHORIZATION'];
    }
    // Method 3: Try getallheaders()
    elseif (function_exists('getallheaders')) {
        $headers = getallheaders();
        if (isset($headers['Authorization'])) {
            $authHeader = $headers['Authorization'];
        } elseif (isset($headers['authorization'])) {
            $authHeader = $headers['authorization'];
        }
    }
    
    // Log ALL headers for debugging
    error_log("🔐 requireAuth: All headers: " . json_encode(function_exists('getallheaders') ? getallheaders() : $_SERVER));
    error_log("🔐 requireAuth: authHeader=" . ($authHeader ? substr($authHeader, 0, 50) . '...' : 'NULL'));
    
    $token = str_replace('Bearer ', '', $authHeader ?? '');
    
    if (empty($token)) {
        error_log("❌ requireAuth: No token provided");
        error_log("❌ Full _SERVER dump: " . json_encode($_SERVER));
        jsonResponse(['error' => 'Unauthorized - No token provided'], 401);
    }
    
    // Decode token
    try {
        $decoded = base64_decode($token);
        $data = json_decode($decoded, true);
        
        error_log("🔓 requireAuth: Decoded token data: " . json_encode($data));
        
        if (!$data || !isset($data['user_id'])) {
            error_log("❌ requireAuth: Invalid token structure");
            jsonResponse(['error' => 'Unauthorized - Invalid token'], 401);
        }
        
        if ($data['exp'] < time()) {
            error_log("❌ requireAuth: Token expired");
            jsonResponse(['error' => 'Unauthorized - Token expired'], 401);
        }
        
        error_log("✅ requireAuth: Valid token for user " . $data['user_id']);
        return $data;
    } catch (Exception $e) {
        error_log("❌ requireAuth: Exception - " . $e->getMessage());
        jsonResponse(['error' => 'Unauthorized - Token decode failed'], 401);
    }
}

// File upload helper
function uploadFile($file, $folder = 'paintings') {
    $allowed = ['paintings', 'orders', 'sliders', 'blog'];
    
    if (!in_array($folder, $allowed)) {
        return ['error' => 'Invalid folder'];
    }
    
    $allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    $finfo = finfo_open(FILEINFO_MIME_TYPE);
    $mimeType = finfo_file($finfo, $file['tmp_name']);
    finfo_close($finfo);
    
    if (!in_array($mimeType, $allowedTypes)) {
        return ['error' => 'Invalid file type'];
    }
    
    $ext = pathinfo($file['name'], PATHINFO_EXTENSION);
    $filename = time() . '_' . uniqid() . '.' . $ext;
    $dir = UPLOAD_DIR . $folder . '/';
    
    if (!is_dir($dir)) {
        mkdir($dir, 0755, true);
    }
    
    if (move_uploaded_file($file['tmp_name'], $dir . $filename)) {
        chmod($dir . $filename, 0644);
        return [
            'success' => true,
            'url' => UPLOAD_URL . $folder . '/' . $filename,
            'filename' => $filename,
            'folder' => $folder
        ];
    }
    
    return ['error' => 'Upload failed'];
}