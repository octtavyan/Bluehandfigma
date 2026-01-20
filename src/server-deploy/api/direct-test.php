<?php
// Direct test - bypasses .htaccess routing
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

echo json_encode([
    'status' => 'ok',
    'message' => 'Direct PHP test successful',
    'timestamp' => date('Y-m-d H:i:s'),
    'info' => [
        'php_version' => phpversion(),
        'request_method' => $_SERVER['REQUEST_METHOD'],
        'request_uri' => $_SERVER['REQUEST_URI'],
        'server_software' => $_SERVER['SERVER_SOFTWARE'] ?? 'unknown',
        'mod_rewrite_available' => function_exists('apache_get_modules') && in_array('mod_rewrite', apache_get_modules()),
    ]
], JSON_PRETTY_PRINT);
