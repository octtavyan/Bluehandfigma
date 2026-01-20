<?php
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
}
