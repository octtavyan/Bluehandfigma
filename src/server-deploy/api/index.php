<?php
// BlueHand Canvas API Router
require_once 'config.php';

// Get request method and path
$method = $_SERVER['REQUEST_METHOD'];
$requestUri = $_SERVER['REQUEST_URI'] ?? '/';

// Extract path from REQUEST_URI
// Handle multiple formats:
// - /api/auth/login (with .htaccess rewrite)
// - /api/index.php/auth/login (without .htaccess rewrite)
// - /api/index.php?path=auth/login (query string fallback)

$path = $requestUri;

// Remove query string first
$path = preg_replace('#\?.*$#', '', $path);

// Remove /api/index.php/ prefix
$path = preg_replace('#^/api/index\.php/#', '', $path);

// Remove /api/ prefix
$path = preg_replace('#^/api/#', '', $path);

// Trim slashes
$path = trim($path, '/');

// Remove index.php if still present
$path = preg_replace('#^index\.php/?#', '', $path);

// If path is empty, check PATH_INFO (when using .htaccess rewrite)
if (empty($path) && isset($_SERVER['PATH_INFO'])) {
    $path = trim($_SERVER['PATH_INFO'], '/');
}

// Log for debugging
error_log("🔍 API Request: METHOD={$method}, PATH={$path}, REQUEST_URI={$requestUri}");

// Health check endpoint
if (empty($path) || $path === 'health') {
    jsonResponse([
        'status' => 'ok',
        'message' => 'BlueHand Canvas API v1.0',
        'timestamp' => date('Y-m-d H:i:s'),
        'environment' => 'production'
    ]);
}

// Database connection test
if ($path === 'test-db') {
    try {
        $db = getDB();
        $stmt = $db->query("SELECT COUNT(*) as count FROM paintings");
        $result = $stmt->fetch();
        jsonResponse([
            'status' => 'ok',
            'message' => 'Database connected',
            'paintings_count' => $result['count']
        ]);
    } catch (Exception $e) {
        jsonResponse([
            'status' => 'error',
            'message' => 'Database error: ' . $e->getMessage()
        ], 500);
    }
}

// Route to handlers
if (strpos($path, 'paintings') === 0) {
    require 'paintings.php';
    exit;
}

if (strpos($path, 'orders') === 0) {
    require 'orders.php';
    exit;
}

if (strpos($path, 'auth') === 0) {
    require 'auth.php';
    exit;
}

if (strpos($path, 'unsplash') === 0) {
    require 'unsplash.php';
    exit;
}

if (strpos($path, 'sizes') === 0) {
    require 'sizes.php';
    exit;
}

if (strpos($path, 'frame-types') === 0) {
    require 'frame-types.php';
    exit;
}

if (strpos($path, 'categories') === 0) {
    require 'categories.php';
    exit;
}

if (strpos($path, 'debug') === 0) {
    require 'debug.php';
    exit;
}

if ($path === 'upload') {
    require 'upload.php';
    exit;
}

// Settings
if (strpos($path, 'settings') === 0) {
    $db = getDB();
    $stmt = $db->query("SELECT * FROM settings");
    $settings = [];
    foreach ($stmt->fetchAll() as $row) {
        $settings[$row['key']] = json_decode($row['value'], true) ?? $row['value'];
    }
    jsonResponse(['settings' => $settings]);
}

// 404
jsonResponse(['error' => 'Endpoint not found: ' . $path], 404);