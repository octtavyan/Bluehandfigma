<?php
// CORS Headers
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json; charset=UTF-8');

// Handle OPTIONS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Get action from query string
$action = $_GET['action'] ?? '';

// Route to appropriate handler
switch ($action) {
    case 'unsplash_settings_get':
    case 'unsplash_settings_save':
    case 'email_settings_get':
    case 'email_settings_save':
    case 'email_test':
    case 'fancourier_settings_get':
    case 'fancourier_settings_save':
    case 'fancourier_test':
    case 'netopia_settings_get':
    case 'netopia_settings_save':
    case 'netopia_test':
    case 'netopia_start_payment':
    case 'netopia_status':
    case 'legal_get':
    case 'legal_save':
    case 'legal_delete':
    case 'send_order_confirmation':
    case 'send_password_reset':
        // Return success with empty data for now
        echo json_encode([
            'success' => true,
            'message' => "Feature '$action' not yet implemented in standalone PHP backend",
            'data' => []
        ]);
        break;
    
    case 'cart_load':
        // Return empty cart
        echo json_encode([
            'success' => true,
            'items' => []
        ]);
        break;
    
    case 'cart_save':
        // Accept cart save but don't persist
        echo json_encode([
            'success' => true,
            'message' => 'Cart saved to localStorage only (server persistence not implemented)'
        ]);
        break;
    
    default:
        http_response_code(404);
        echo json_encode([
            'success' => false,
            'error' => "Unknown action: $action"
        ]);
        break;
}
