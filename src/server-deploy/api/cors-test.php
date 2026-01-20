<?php
// Super simple CORS test - This should ALWAYS work
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

echo json_encode([
    'status' => 'success',
    'message' => '✅ CORS is working! PHP is working!',
    'timestamp' => date('Y-m-d H:i:s'),
    'test' => 'This is a super simple test file',
    'server_info' => [
        'php_version' => phpversion(),
        'request_method' => $_SERVER['REQUEST_METHOD'],
        'request_uri' => $_SERVER['REQUEST_URI'],
    ]
], JSON_PRETTY_PRINT);
