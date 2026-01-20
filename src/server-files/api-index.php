<?php
// =============================================================================
// CORS HEADERS - MUST BE FIRST!
// =============================================================================
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Max-Age: 86400');
header('Content-Type: application/json');

// Handle OPTIONS preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// =============================================================================
// DATABASE CONNECTION
// =============================================================================
$host = 'localhost';
$dbname = 'bluehand_db'; // Change this to your actual database name
$username = 'bluehand_user'; // Change this to your actual username
$password = 'your_password'; // Change this to your actual password

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database connection failed: ' . $e->getMessage()]);
    exit();
}

// =============================================================================
// ROUTING
// =============================================================================

// Get the request URI and method
$requestUri = $_SERVER['REQUEST_URI'];
$requestMethod = $_SERVER['REQUEST_METHOD'];

// Remove /api/ prefix and query string
$path = parse_url($requestUri, PHP_URL_PATH);
$path = str_replace('/api/', '', $path);
$path = trim($path, '/');

// Parse path segments
$segments = explode('/', $path);
$endpoint = $segments[0] ?? '';

// Get JSON input for POST/PUT requests
$input = null;
if (in_array($requestMethod, ['POST', 'PUT', 'PATCH'])) {
    $rawInput = file_get_contents('php://input');
    $input = json_decode($rawInput, true);
}

// =============================================================================
// API ENDPOINTS
// =============================================================================

try {
    switch ($endpoint) {
        
        // GET /api/paintings
        case 'paintings':
            if ($requestMethod === 'GET') {
                $stmt = $pdo->query("SELECT * FROM paintings WHERE active = 1 ORDER BY created_at DESC");
                $paintings = $stmt->fetchAll();
                echo json_encode(['paintings' => $paintings]);
            }
            break;
        
        // GET /api/categories
        case 'categories':
            if ($requestMethod === 'GET') {
                $stmt = $pdo->query("SELECT * FROM categories ORDER BY name ASC");
                $categories = $stmt->fetchAll();
                echo json_encode(['categories' => $categories]);
            }
            break;
        
        // GET /api/sizes
        case 'sizes':
            if ($requestMethod === 'GET') {
                $stmt = $pdo->query("SELECT * FROM sizes ORDER BY width ASC, height ASC");
                $sizes = $stmt->fetchAll();
                echo json_encode(['sizes' => $sizes]);
            }
            break;
        
        // GET /api/styles
        case 'styles':
            if ($requestMethod === 'GET') {
                $stmt = $pdo->query("SELECT * FROM styles ORDER BY name ASC");
                $styles = $stmt->fetchAll();
                echo json_encode(['styles' => $styles]);
            }
            break;
        
        // GET /api/print-types
        case 'print-types':
            if ($requestMethod === 'GET') {
                $stmt = $pdo->query("SELECT * FROM print_types ORDER BY name ASC");
                $printTypes = $stmt->fetchAll();
                echo json_encode(['printTypes' => $printTypes]);
            }
            break;
        
        // GET /api/frame-types
        case 'frame-types':
            if ($requestMethod === 'GET') {
                $stmt = $pdo->query("SELECT * FROM frame_types ORDER BY name ASC");
                $frameTypes = $stmt->fetchAll();
                echo json_encode(['frameTypes' => $frameTypes]);
            }
            break;
        
        // GET /api/orders
        case 'orders':
            if ($requestMethod === 'GET') {
                $stmt = $pdo->query("SELECT * FROM orders ORDER BY created_at DESC");
                $orders = $stmt->fetchAll();
                echo json_encode(['orders' => $orders]);
            }
            break;
        
        // Health check
        case 'health':
            echo json_encode([
                'status' => 'ok',
                'timestamp' => date('Y-m-d H:i:s'),
                'database' => 'connected'
            ]);
            break;
        
        // 404 Not Found
        default:
            http_response_code(404);
            echo json_encode([
                'error' => 'Endpoint not found',
                'requested_path' => $path,
                'available_endpoints' => [
                    'GET /api/paintings',
                    'GET /api/categories',
                    'GET /api/sizes',
                    'GET /api/styles',
                    'GET /api/print-types',
                    'GET /api/frame-types',
                    'GET /api/orders',
                    'GET /api/health'
                ]
            ]);
            break;
    }
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'error' => 'Internal server error',
        'message' => $e->getMessage(),
        'trace' => $e->getTraceAsString()
    ]);
}
