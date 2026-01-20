<?php
// Simple test file to verify PHP is working and show server info
// Upload this to /api/test.php on your server

header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');

echo json_encode([
    'status' => 'PHP is working!',
    'timestamp' => date('Y-m-d H:i:s'),
    'server_software' => $_SERVER['SERVER_SOFTWARE'] ?? 'Unknown',
    'php_version' => PHP_VERSION,
    'document_root' => $_SERVER['DOCUMENT_ROOT'] ?? 'Unknown',
    'request_uri' => $_SERVER['REQUEST_URI'] ?? 'Unknown',
    'script_filename' => __FILE__,
    'current_directory' => __DIR__,
    'api_folder_exists' => file_exists(__DIR__ . '/index.php') ? 'YES' : 'NO',
    'htaccess_exists' => file_exists(__DIR__ . '/.htaccess') ? 'YES' : 'NO',
    'mod_rewrite' => in_array('mod_rewrite', apache_get_modules()) ? 'ENABLED' : 'DISABLED',
]);
