<?php
// CORS Headers
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json; charset=UTF-8');

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Include config
require_once 'config.php';

// GET - Fetch all orders
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        $stmt = $pdo->query("SELECT * FROM orders ORDER BY created_at DESC");
        $orders = $stmt->fetchAll();
        
        echo json_encode(array(
            'success' => true,
            'orders' => $orders
        ));
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(array(
            'success' => false,
            'error' => $e->getMessage()
        ));
    }
}

// POST - Create new order
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        $input = file_get_contents('php://input');
        $data = json_decode($input, true);
        
        // Insert order
        $stmt = $pdo->prepare("
            INSERT INTO orders 
            (order_number, customer_name, customer_email, customer_phone, 
             delivery_address, items, subtotal, delivery_cost, total, status, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'new', NOW())
        ");
        
        $stmt->execute(array(
            $data['order_number'],
            $data['customer_name'],
            $data['customer_email'],
            $data['customer_phone'],
            $data['delivery_address'],
            json_encode($data['items']),
            $data['subtotal'],
            $data['delivery_cost'],
            $data['total']
        ));
        
        echo json_encode(array(
            'success' => true,
            'order_id' => $pdo->lastInsertId()
        ));
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(array(
            'success' => false,
            'error' => $e->getMessage()
        ));
    }
}
