<?php
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
}
