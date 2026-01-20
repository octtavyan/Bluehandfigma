<?php
// Test Orders Endpoint - Direct test without routing
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once 'config.php';

try {
    $db = getDB();
    
    // First, check if orders table exists
    $stmt = $db->query("SHOW TABLES LIKE 'orders'");
    $tableExists = $stmt->rowCount() > 0;
    
    if (!$tableExists) {
        echo json_encode([
            'error' => 'Orders table does not exist',
            'suggestion' => 'Create the orders table in MySQL'
        ], JSON_PRETTY_PRINT);
        exit;
    }
    
    // Check table structure
    $stmt = $db->query("DESCRIBE orders");
    $columns = $stmt->fetchAll(PDO::FETCH_COLUMN);
    
    // Try to fetch orders (without auth check for testing)
    $stmt = $db->query("SELECT * FROM orders LIMIT 5");
    $orders = $stmt->fetchAll();
    
    // Parse JSON fields if they exist
    foreach ($orders as &$order) {
        if (isset($order['items'])) {
            $order['items'] = json_decode($order['items'] ?? '[]', true);
        }
        if (isset($order['status_history'])) {
            $order['status_history'] = json_decode($order['status_history'] ?? '[]', true);
        }
        if (isset($order['notes'])) {
            $order['notes'] = json_decode($order['notes'] ?? '[]', true);
        }
    }
    
    echo json_encode([
        'status' => 'ok',
        'table_exists' => true,
        'columns' => $columns,
        'orders_count' => count($orders),
        'orders' => $orders
    ], JSON_PRETTY_PRINT);
    
} catch (PDOException $e) {
    echo json_encode([
        'error' => 'Database error',
        'message' => $e->getMessage(),
        'code' => $e->getCode()
    ], JSON_PRETTY_PRINT);
} catch (Exception $e) {
    echo json_encode([
        'error' => 'Server error',
        'message' => $e->getMessage()
    ], JSON_PRETTY_PRINT);
}
