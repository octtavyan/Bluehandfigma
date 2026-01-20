<?php
// DEBUG ENDPOINT - Shows full error details
// Access at: https://bluehand.ro/api/test-debug.php

error_reporting(E_ALL);
ini_set('display_errors', 1);

header('Content-Type: text/html; charset=utf-8');

echo "<h1>🔍 BlueHand API Debug Test</h1>";

// 1. Test PHP Version
echo "<h2>✅ PHP Version</h2>";
echo "<p>PHP " . phpversion() . "</p>";

// 2. Test Database Connection
echo "<h2>🗄️ Database Connection</h2>";
try {
    require_once 'config.php';
    $db = getDB();
    echo "<p style='color: green;'>✅ Connected to database successfully</p>";
    
    // Test query
    $stmt = $db->query("SELECT COUNT(*) as count FROM paintings");
    $result = $stmt->fetch();
    echo "<p>Paintings count: " . $result['count'] . "</p>";
    
    $stmt = $db->query("SELECT COUNT(*) as count FROM orders");
    $result = $stmt->fetch();
    echo "<p>Orders count: " . $result['count'] . "</p>";
    
    $stmt = $db->query("SELECT COUNT(*) as count FROM users");
    $result = $stmt->fetch();
    echo "<p>Users count: " . $result['count'] . "</p>";
    
} catch (Exception $e) {
    echo "<p style='color: red;'>❌ Database Error: " . htmlspecialchars($e->getMessage()) . "</p>";
    echo "<pre>" . htmlspecialchars($e->getTraceAsString()) . "</pre>";
}

// 3. Test Authorization Header
echo "<h2>🔐 Authorization Header Test</h2>";
echo "<p><strong>HTTP_AUTHORIZATION:</strong> " . ($_SERVER['HTTP_AUTHORIZATION'] ?? 'NOT SET') . "</p>";
echo "<p><strong>REDIRECT_HTTP_AUTHORIZATION:</strong> " . ($_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? 'NOT SET') . "</p>";

if (function_exists('getallheaders')) {
    $headers = getallheaders();
    echo "<p><strong>getallheaders() Authorization:</strong> " . ($headers['Authorization'] ?? 'NOT SET') . "</p>";
}

echo "<h3>All Headers:</h3>";
echo "<pre>";
foreach ($_SERVER as $key => $value) {
    if (strpos($key, 'HTTP_') === 0) {
        echo htmlspecialchars($key) . ": " . htmlspecialchars(substr($value, 0, 100)) . "\n";
    }
}
echo "</pre>";

// 4. Test File Paths
echo "<h2>📁 File Paths</h2>";
echo "<p><strong>UPLOAD_DIR:</strong> " . (defined('UPLOAD_DIR') ? UPLOAD_DIR : 'NOT DEFINED') . "</p>";
echo "<p><strong>UPLOAD_URL:</strong> " . (defined('UPLOAD_URL') ? UPLOAD_URL : 'NOT DEFINED') . "</p>";
echo "<p><strong>uploads/ exists:</strong> " . (is_dir(dirname(__DIR__) . '/uploads/') ? 'YES' : 'NO') . "</p>";
echo "<p><strong>uploads/ writable:</strong> " . (is_writable(dirname(__DIR__) . '/uploads/') ? 'YES' : 'NO') . "</p>";

// 5. Test Error Log
echo "<h2>📝 Error Log</h2>";
$errorLog = __DIR__ . '/error.log';
if (file_exists($errorLog)) {
    echo "<p style='color: green;'>✅ error.log exists</p>";
    echo "<h3>Last 30 lines:</h3>";
    echo "<pre style='background: #f0f0f0; padding: 10px; max-height: 400px; overflow: auto;'>";
    $lines = file($errorLog);
    $lastLines = array_slice($lines, -30);
    echo htmlspecialchars(implode('', $lastLines));
    echo "</pre>";
} else {
    echo "<p style='color: orange;'>⚠️ error.log does not exist yet</p>";
}

// 6. Test Paintings API
echo "<h2>🎨 Test Paintings API</h2>";
try {
    $stmt = $db->query("
        SELECT p.*, c.name as category_name 
        FROM paintings p
        LEFT JOIN categories c ON p.category = c.id
        ORDER BY p.created_at DESC
        LIMIT 5
    ");
    $paintings = $stmt->fetchAll();
    
    echo "<p>Found " . count($paintings) . " paintings</p>";
    
    if (count($paintings) > 0) {
        echo "<pre>";
        print_r($paintings);
        echo "</pre>";
    }
} catch (Exception $e) {
    echo "<p style='color: red;'>❌ Error: " . htmlspecialchars($e->getMessage()) . "</p>";
}

echo "<hr>";
echo "<p><a href='/api/index.php/paintings'>Test GET /api/paintings</a></p>";
echo "<p><a href='/api/index.php/orders'>Test GET /api/orders</a></p>";
echo "<p><a href='/admin/login'>Go to Admin Login</a></p>";
?>
