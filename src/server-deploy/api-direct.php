<?php
// BlueHand Canvas API - Direct Access (No .htaccess needed)
// Save this as: /public_html/api.php
// Access via: https://bluehand.ro/api.php?endpoint=health

require_once __DIR__ . '/api/config.php';

// Get endpoint from query string
$endpoint = $_GET['endpoint'] ?? 'health';
$endpoint = trim($endpoint, '/');

// Remove query string for routing
$path = preg_replace('#\?.*$#', '', $endpoint);
$method = $_SERVER['REQUEST_METHOD'];

// Health check
if ($path === 'health') {
    jsonResponse([
        'status' => 'ok',
        'message' => 'BlueHand Canvas API v1.0',
        'timestamp' => date('Y-m-d H:i:s'),
        'environment' => 'production',
        'access_method' => 'direct (no htaccess)'
    ]);
}

// Database test
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

// Paintings
if (strpos($path, 'paintings') === 0) {
    require __DIR__ . '/api/paintings.php';
    exit;
}

// Orders
if (strpos($path, 'orders') === 0) {
    require __DIR__ . '/api/orders.php';
    exit;
}

// Auth
if (strpos($path, 'auth') === 0) {
    require __DIR__ . '/api/auth.php';
    exit;
}

// Upload
if ($path === 'upload') {
    require __DIR__ . '/api/upload.php';
    exit;
}

// Categories
if ($path === 'categories') {
    $db = getDB();
    $stmt = $db->query("SELECT * FROM categories WHERE is_active = 1 ORDER BY display_order");
    jsonResponse(['categories' => $stmt->fetchAll()]);
}

// Settings
if ($path === 'settings') {
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
