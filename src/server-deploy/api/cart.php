<?php
// Cart API Handler
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json; charset=utf-8');

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/config.php';

try {
    $db = getDB();
    $method = $_SERVER['REQUEST_METHOD'];
    
    // Get action from query string
    $action = $_GET['action'] ?? '';
    $sessionId = $_GET['sessionId'] ?? '';
    
    error_log("🛒 Cart Handler: METHOD={$method}, ACTION={$action}, SESSION={$sessionId}");
    
    // GET - Load cart
    if ($method === 'GET' && $action === 'cart_load') {
        if (empty($sessionId)) {
            jsonResponse(['error' => 'Session ID required'], 400);
        }
        
        try {
            $stmt = $db->prepare("SELECT cart_data FROM cart_sessions WHERE session_id = ? AND expires_at > NOW()");
            $stmt->execute([$sessionId]);
            $result = $stmt->fetch();
            
            if ($result) {
                $cart = json_decode($result['cart_data'], true);
                jsonResponse(['success' => true, 'cart' => $cart ?? []]);
            } else {
                // No cart found, return empty
                jsonResponse(['success' => true, 'cart' => []]);
            }
        } catch (Exception $e) {
            error_log("❌ Cart load error: " . $e->getMessage());
            jsonResponse(['error' => 'Failed to load cart'], 500);
        }
    }
    
    // POST - Save cart
    elseif ($method === 'POST' && $action === 'cart_save') {
        $data = json_decode(file_get_contents('php://input'), true);
        
        if (!$data || !isset($data['sessionId']) || !isset($data['cart'])) {
            jsonResponse(['error' => 'Invalid data'], 400);
        }
        
        $sessionId = $data['sessionId'];
        $cart = json_encode($data['cart']);
        $expiresAt = date('Y-m-d H:i:s', strtotime('+30 days'));
        
        try {
            // Use INSERT ... ON DUPLICATE KEY UPDATE
            $stmt = $db->prepare("
                INSERT INTO cart_sessions (session_id, cart_data, expires_at, updated_at)
                VALUES (:session, :cart, :expires, NOW())
                ON DUPLICATE KEY UPDATE 
                    cart_data = :cart,
                    expires_at = :expires,
                    updated_at = NOW()
            ");
            
            $stmt->execute([
                'session' => $sessionId,
                'cart' => $cart,
                'expires' => $expiresAt
            ]);
            
            jsonResponse(['success' => true]);
        } catch (Exception $e) {
            error_log("❌ Cart save error: " . $e->getMessage());
            jsonResponse(['error' => 'Failed to save cart'], 500);
        }
    }
    
    // DELETE - Clear cart
    elseif ($method === 'DELETE' && $action === 'cart_clear') {
        if (empty($sessionId)) {
            jsonResponse(['error' => 'Session ID required'], 400);
        }
        
        try {
            $stmt = $db->prepare("DELETE FROM cart_sessions WHERE session_id = ?");
            $stmt->execute([$sessionId]);
            
            jsonResponse(['success' => true]);
        } catch (Exception $e) {
            error_log("❌ Cart clear error: " . $e->getMessage());
            jsonResponse(['error' => 'Failed to clear cart'], 500);
        }
    }
    
    else {
        jsonResponse(['error' => 'Invalid cart action'], 404);
    }
    
} catch (Exception $e) {
    error_log("❌ CRITICAL Cart error: " . $e->getMessage());
    jsonResponse(['error' => 'Server error: ' . $e->getMessage()], 500);
}
