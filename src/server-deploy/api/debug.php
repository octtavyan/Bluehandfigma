<?php
// Debug endpoint to check server configuration
require_once 'config.php';

error_log("🔍 Debug endpoint accessed");

$debug = [
    'status' => 'ok',
    'message' => 'BlueHand Canvas API Debug Info',
    'timestamp' => date('Y-m-d H:i:s'),
    'server' => [
        'REQUEST_METHOD' => $_SERVER['REQUEST_METHOD'] ?? 'N/A',
        'REQUEST_URI' => $_SERVER['REQUEST_URI'] ?? 'N/A',
        'PATH_INFO' => $_SERVER['PATH_INFO'] ?? 'N/A',
        'SCRIPT_NAME' => $_SERVER['SCRIPT_NAME'] ?? 'N/A',
        'PHP_VERSION' => phpversion(),
        'SERVER_SOFTWARE' => $_SERVER['SERVER_SOFTWARE'] ?? 'N/A',
    ],
    'headers' => function_exists('getallheaders') ? getallheaders() : 'getallheaders() not available',
    'modules' => [
        'mod_rewrite' => in_array('mod_rewrite', apache_get_modules()) ? 'enabled' : 'disabled',
        'mod_headers' => in_array('mod_headers', apache_get_modules()) ? 'enabled' : 'disabled',
    ],
    'database' => 'not tested'
];

// Test database
try {
    $db = getDB();
    $stmt = $db->query("SELECT COUNT(*) as paintings_count FROM paintings");
    $paintingsCount = $stmt->fetch()['paintings_count'];
    
    $stmt = $db->query("SELECT COUNT(*) as orders_count FROM orders");
    $ordersCount = $stmt->fetch()['orders_count'];
    
    $stmt = $db->query("SELECT COUNT(*) as users_count FROM users");
    $usersCount = $stmt->fetch()['users_count'];
    
    $debug['database'] = [
        'status' => 'connected',
        'paintings' => $paintingsCount,
        'orders' => $ordersCount,
        'users' => $usersCount,
    ];
} catch (Exception $e) {
    $debug['database'] = [
        'status' => 'error',
        'message' => $e->getMessage()
    ];
}

jsonResponse($debug);
