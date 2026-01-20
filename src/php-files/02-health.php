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

// Return success
echo json_encode(array(
    'success' => true,
    'message' => 'BlueHand API is running',
    'timestamp' => date('Y-m-d H:i:s'),
    'version' => '1.0'
));
