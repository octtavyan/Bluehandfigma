<?php
// CORS Headers - MUST be first
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json; charset=UTF-8');

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Include config (one level up from auth/ folder)
require_once dirname(__FILE__) . '/../config.php';

// Get POST data
$input = file_get_contents('php://input');
$data = json_decode($input, true);

$username = isset($data['username']) ? $data['username'] : '';
$password = isset($data['password']) ? $data['password'] : '';

// Validate input
if (empty($username) || empty($password)) {
    echo json_encode(array(
        'success' => false,
        'error' => 'Username and password required'
    ));
    exit;
}

try {
    // Query user from database
    $stmt = $pdo->prepare("SELECT * FROM users WHERE username = ? AND is_active = 1");
    $stmt->execute(array($username));
    $user = $stmt->fetch();
    
    // Check if user exists and password matches
    if ($user && password_verify($password, $user['password_hash'])) {
        // Generate token (simple version - use JWT for production)
        $token = bin2hex(random_bytes(32));
        
        // Return success
        echo json_encode(array(
            'success' => true,
            'token' => $token,
            'user' => array(
                'id' => $user['id'],
                'username' => $user['username'],
                'email' => isset($user['email']) ? $user['email'] : '',
                'role' => $user['role'],
                'full_name' => $user['username']
            )
        ));
    } else {
        // Invalid credentials
        echo json_encode(array(
            'success' => false,
            'error' => 'Invalid username or password'
        ));
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(array(
        'success' => false,
        'error' => $e->getMessage()
    ));
}
