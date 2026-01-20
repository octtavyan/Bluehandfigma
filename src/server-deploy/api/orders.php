<?php
// BlueHand Canvas - Orders API
// CRITICAL: Send CORS headers FIRST before anything else
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Content-Type: application/json; charset=utf-8');

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Now include config
require_once __DIR__ . '/config.php';

$method = $_SERVER['REQUEST_METHOD'];
$requestUri = $_SERVER['REQUEST_URI'] ?? '/';

// Extract path - handle /api/index.php/orders format
$path = $requestUri;
$path = preg_replace('#\?.*$#', '', $path);
$path = preg_replace('#^/api/index\.php/#', '', $path);
$path = preg_replace('#^/api/#', '', $path);
$path = trim($path, '/');

error_log("📦 Orders Handler: METHOD={$method}, PATH={$path}");

try {
    $db = getDB();
    
    // GET /api/orders - Get all orders
    if ($method === 'GET' && preg_match('#^orders/?$#', $path)) {
        // Admin only
        $auth = requireAuth();
        
        $stmt = $db->query("
            SELECT 
                id,
                order_number,
                customer_name,
                customer_email,
                customer_phone,
                delivery_address,
                delivery_city,
                delivery_county,
                delivery_postal_code,
                delivery_option,
                payment_method,
                payment_status,
                items,
                subtotal,
                delivery_cost,
                total,
                status,
                notes,
                created_at,
                updated_at
            FROM orders 
            ORDER BY created_at DESC
        ");
        $orders = $stmt->fetchAll();
        
        // Parse JSON fields
        foreach ($orders as &$order) {
            $order['items'] = json_decode($order['items'] ?? '[]', true);
        }
        
        jsonResponse(['orders' => $orders]);
    }
    
    // GET /api/orders/{id} - Get single order
    elseif ($method === 'GET' && preg_match('#^orders/([a-zA-Z0-9-]+)$#', $path, $matches)) {
        $orderId = $matches[1];
        
        $stmt = $db->prepare("
            SELECT 
                id,
                order_number,
                customer_name,
                customer_email,
                customer_phone,
                delivery_address,
                delivery_city,
                delivery_county,
                delivery_postal_code,
                delivery_option,
                payment_method,
                payment_status,
                items,
                subtotal,
                delivery_cost,
                total,
                status,
                notes,
                created_at,
                updated_at
            FROM orders 
            WHERE id = ?
        ");
        $stmt->execute([$orderId]);
        $order = $stmt->fetch();
        
        if (!$order) {
            jsonResponse(['error' => 'Order not found'], 404);
        }
        
        // Parse JSON fields
        $order['items'] = json_decode($order['items'] ?? '[]', true);
        
        jsonResponse(['order' => $order]);
    }
    
    // POST /api/orders - Create order
    elseif ($method === 'POST' && preg_match('#^orders/?$#', $path)) {
        $data = json_decode(file_get_contents('php://input'), true);
        
        if (!$data) {
            jsonResponse(['error' => 'Invalid JSON data'], 400);
        }
        
        // Validate required fields
        $required = ['customer_name', 'customer_email', 'customer_phone', 'delivery_address', 'delivery_option', 'payment_method', 'items', 'subtotal', 'total'];
        foreach ($required as $field) {
            if (!isset($data[$field])) {
                jsonResponse(['error' => "Missing required field: {$field}"], 400);
            }
        }
        
        $id = 'order-' . time() . '-' . uniqid();
        $orderNumber = 'BH' . date('Ymd') . rand(1000, 9999);
        
        $stmt = $db->prepare("
            INSERT INTO orders (
                id, order_number, customer_name, customer_email, customer_phone,
                delivery_address, delivery_city, delivery_county, delivery_postal_code,
                delivery_option, payment_method, payment_status,
                items, subtotal, delivery_cost, total,
                status, notes, created_at, updated_at
            ) VALUES (
                :id, :order_number, :customer_name, :customer_email, :customer_phone,
                :delivery_address, :delivery_city, :delivery_county, :delivery_postal_code,
                :delivery_option, :payment_method, :payment_status,
                :items, :subtotal, :delivery_cost, :total,
                :status, :notes, NOW(), NOW()
            )
        ");
        
        $stmt->execute([
            'id' => $id,
            'order_number' => $orderNumber,
            'customer_name' => $data['customer_name'],
            'customer_email' => $data['customer_email'],
            'customer_phone' => $data['customer_phone'],
            'delivery_address' => $data['delivery_address'],
            'delivery_city' => $data['delivery_city'] ?? '',
            'delivery_county' => $data['delivery_county'] ?? '',
            'delivery_postal_code' => $data['delivery_postal_code'] ?? '',
            'delivery_option' => $data['delivery_option'],
            'payment_method' => $data['payment_method'],
            'payment_status' => $data['payment_status'] ?? 'pending',
            'items' => json_encode($data['items']),
            'subtotal' => $data['subtotal'],
            'delivery_cost' => $data['delivery_cost'] ?? 0,
            'total' => $data['total'],
            'status' => 'pending',
            'notes' => $data['notes'] ?? ''
        ]);
        
        // Fetch created order
        $stmt = $db->prepare("SELECT * FROM orders WHERE id = ?");
        $stmt->execute([$id]);
        $order = $stmt->fetch();
        
        if ($order) {
            $order['items'] = json_decode($order['items'], true);
        }
        
        jsonResponse([
            'success' => true,
            'order' => $order,
            'order_number' => $orderNumber
        ], 201);
    }
    
    // PUT /api/orders/{id}/status - Update order status (Admin only)
    elseif ($method === 'PUT' && preg_match('#^orders/([a-zA-Z0-9-]+)/status$#', $path, $matches)) {
        $auth = requireAuth();
        $orderId = $matches[1];
        $data = json_decode(file_get_contents('php://input'), true);
        
        if (!isset($data['status'])) {
            jsonResponse(['error' => 'Status required'], 400);
        }
        
        $stmt = $db->prepare("
            UPDATE orders 
            SET status = ?, updated_at = NOW() 
            WHERE id = ?
        ");
        $stmt->execute([$data['status'], $orderId]);
        
        if ($stmt->rowCount() === 0) {
            jsonResponse(['error' => 'Order not found'], 404);
        }
        
        jsonResponse(['success' => true, 'message' => 'Order status updated']);
    }
    
    // PUT /api/orders/{id} - Update order (Admin only)
    elseif ($method === 'PUT' && preg_match('#^orders/([a-zA-Z0-9-]+)$#', $path, $matches)) {
        $auth = requireAuth();
        $orderId = $matches[1];
        $data = json_decode(file_get_contents('php://input'), true);
        
        $updates = [];
        $params = [];
        
        if (isset($data['customer_name'])) {
            $updates[] = "customer_name = ?";
            $params[] = $data['customer_name'];
        }
        if (isset($data['customer_email'])) {
            $updates[] = "customer_email = ?";
            $params[] = $data['customer_email'];
        }
        if (isset($data['customer_phone'])) {
            $updates[] = "customer_phone = ?";
            $params[] = $data['customer_phone'];
        }
        if (isset($data['delivery_address'])) {
            $updates[] = "delivery_address = ?";
            $params[] = $data['delivery_address'];
        }
        if (isset($data['status'])) {
            $updates[] = "status = ?";
            $params[] = $data['status'];
        }
        if (isset($data['notes'])) {
            $updates[] = "notes = ?";
            $params[] = $data['notes'];
        }
        
        if (empty($updates)) {
            jsonResponse(['error' => 'No fields to update'], 400);
        }
        
        $updates[] = "updated_at = NOW()";
        $params[] = $orderId;
        
        $sql = "UPDATE orders SET " . implode(', ', $updates) . " WHERE id = ?";
        $stmt = $db->prepare($sql);
        $stmt->execute($params);
        
        if ($stmt->rowCount() === 0) {
            jsonResponse(['error' => 'Order not found'], 404);
        }
        
        // Fetch updated order
        $stmt = $db->prepare("SELECT * FROM orders WHERE id = ?");
        $stmt->execute([$orderId]);
        $order = $stmt->fetch();
        
        if ($order) {
            $order['items'] = json_decode($order['items'], true);
        }
        
        jsonResponse(['success' => true, 'order' => $order]);
    }
    
    // DELETE /api/orders/{id} - Delete order (Admin only)
    elseif ($method === 'DELETE' && preg_match('#^orders/([a-zA-Z0-9-]+)$#', $path, $matches)) {
        $auth = requireAuth();
        $orderId = $matches[1];
        
        $stmt = $db->prepare("DELETE FROM orders WHERE id = ?");
        $stmt->execute([$orderId]);
        
        if ($stmt->rowCount() === 0) {
            jsonResponse(['error' => 'Order not found'], 404);
        }
        
        jsonResponse(['success' => true, 'message' => 'Order deleted']);
    }
    
    else {
        jsonResponse(['error' => 'Not found'], 404);
    }
    
} catch (PDOException $e) {
    error_log('Orders API Error: ' . $e->getMessage());
    jsonResponse(['error' => 'Database error', 'message' => $e->getMessage()], 500);
} catch (Exception $e) {
    error_log('Orders API Error: ' . $e->getMessage());
    jsonResponse(['error' => 'Server error', 'message' => $e->getMessage()], 500);
}
