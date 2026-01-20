<?php
// Authentication API Handler
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

require_once __DIR__ . '/config.php';

$db = getDB();
$path = preg_replace('#^/api/#', '', $_SERVER['REQUEST_URI'] ?? '/');
$path = preg_replace('#\?.*$#', '', $path);
$method = $_SERVER['REQUEST_METHOD'];

// POST /api/auth/login - Admin login
if ($method === 'POST' && preg_match('#^/?auth/login/?$#', $path)) {
    try {
        $data = json_decode(file_get_contents('php://input'), true);
        
        $username = $data['username'] ?? '';
        $password = $data['password'] ?? '';
        
        if (empty($username) || empty($password)) {
            jsonResponse(['error' => 'Username and password are required'], 400);
        }
        
        $stmt = $db->prepare("
            SELECT * FROM users 
            WHERE username = ? AND is_active = 1
        ");
        $stmt->execute([$username]);
        $user = $stmt->fetch();
        
        if (!$user) {
            jsonResponse(['error' => 'Invalid credentials'], 401);
        }
        
        // Verify password
        if (!password_verify($password, $user['password_hash'])) {
            jsonResponse(['error' => 'Invalid credentials'], 401);
        }
        
        // Generate token (simple base64 encoded JSON)
        $tokenData = [
            'user_id' => $user['id'],
            'username' => $user['username'],
            'role' => $user['role'],
            'exp' => time() + (7 * 24 * 60 * 60) // 7 days
        ];
        
        $token = base64_encode(json_encode($tokenData));
        
        // Update last login
        $stmt = $db->prepare("UPDATE users SET last_login = NOW() WHERE id = ?");
        $stmt->execute([$user['id']]);
        
        jsonResponse([
            'success' => true,
            'token' => $token,
            'user' => [
                'id' => $user['id'],
                'username' => $user['username'],
                'email' => $user['email'],
                'role' => $user['role'],
                'full_name' => $user['full_name']
            ]
        ]);
    } catch (Exception $e) {
        jsonResponse(['error' => 'Login failed: ' . $e->getMessage()], 500);
    }
}

// POST /api/auth/verify - Verify token
if ($method === 'POST' && preg_match('#^/?auth/verify/?$#', $path)) {
    try {
        $authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
        $token = str_replace('Bearer ', '', $authHeader);
        
        if (empty($token)) {
            jsonResponse(['error' => 'No token provided'], 401);
        }
        
        // Decode token
        $decoded = base64_decode($token);
        $data = json_decode($decoded, true);
        
        if (!$data || !isset($data['user_id'])) {
            jsonResponse(['error' => 'Invalid token'], 401);
        }
        
        // Check expiration
        if ($data['exp'] < time()) {
            jsonResponse(['error' => 'Token expired'], 401);
        }
        
        // Get user from database
        $stmt = $db->prepare("SELECT id, username, email, role, full_name FROM users WHERE id = ? AND is_active = 1");
        $stmt->execute([$data['user_id']]);
        $user = $stmt->fetch();
        
        if (!$user) {
            jsonResponse(['error' => 'User not found'], 401);
        }
        
        jsonResponse([
            'success' => true,
            'valid' => true,
            'user' => $user
        ]);
    } catch (Exception $e) {
        jsonResponse(['error' => 'Verification failed: ' . $e->getMessage()], 401);
    }
}

// POST /api/auth/change-password - Change password (Authenticated)
if ($method === 'POST' && preg_match('#^/?auth/change-password/?$#', $path)) {
    $userData = requireAuth();
    
    try {
        $data = json_decode(file_get_contents('php://input'), true);
        
        $currentPassword = $data['currentPassword'] ?? '';
        $newPassword = $data['newPassword'] ?? '';
        
        if (empty($currentPassword) || empty($newPassword)) {
            jsonResponse(['error' => 'Current and new password are required'], 400);
        }
        
        if (strlen($newPassword) < 6) {
            jsonResponse(['error' => 'New password must be at least 6 characters'], 400);
        }
        
        // Get user from database
        $stmt = $db->prepare("SELECT * FROM users WHERE id = ?");
        $stmt->execute([$userData['user_id']]);
        $user = $stmt->fetch();
        
        if (!$user) {
            jsonResponse(['error' => 'User not found'], 404);
        }
        
        // Verify current password
        if (!password_verify($currentPassword, $user['password_hash'])) {
            jsonResponse(['error' => 'Current password is incorrect'], 401);
        }
        
        // Update password
        $newHash = password_hash($newPassword, PASSWORD_DEFAULT);
        $stmt = $db->prepare("UPDATE users SET password_hash = ?, updated_at = NOW() WHERE id = ?");
        $stmt->execute([$newHash, $user['id']]);
        
        jsonResponse([
            'success' => true,
            'message' => 'Password changed successfully'
        ]);
    } catch (Exception $e) {
        jsonResponse(['error' => 'Failed to change password: ' . $e->getMessage()], 500);
    }
}

// If we get here, method not allowed
jsonResponse(['error' => 'Method not allowed for this endpoint'], 405);