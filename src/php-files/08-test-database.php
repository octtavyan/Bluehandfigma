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

// Database Configuration (copy from config.php)
define('DB_HOST', 'localhost');
define('DB_NAME', 'bluehand_db');
define('DB_USER', 'bluehand_user');
define('DB_PASS', 'your_password_here'); // ⚠️ CHANGE THIS

$results = array(
    'tests' => array()
);

// Test 1: PHP Version
$results['tests']['php_version'] = array(
    'name' => 'PHP Version',
    'status' => version_compare(PHP_VERSION, '5.5.0', '>=') ? 'pass' : 'fail',
    'value' => PHP_VERSION,
    'required' => '5.5.0 or higher'
);

// Test 2: PDO Extension
$results['tests']['pdo_available'] = array(
    'name' => 'PDO Extension',
    'status' => extension_loaded('pdo') ? 'pass' : 'fail',
    'value' => extension_loaded('pdo') ? 'Available' : 'Not available'
);

// Test 3: PDO MySQL Driver
$results['tests']['pdo_mysql'] = array(
    'name' => 'PDO MySQL Driver',
    'status' => extension_loaded('pdo_mysql') ? 'pass' : 'fail',
    'value' => extension_loaded('pdo_mysql') ? 'Available' : 'Not available'
);

// Test 4: Database Connection
try {
    $pdo = new PDO(
        "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4",
        DB_USER,
        DB_PASS,
        array(
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
        )
    );
    
    $results['tests']['db_connection'] = array(
        'name' => 'Database Connection',
        'status' => 'pass',
        'value' => 'Connected to ' . DB_NAME
    );
    
    // Test 5: Check Tables
    $tables = array('users', 'paintings', 'orders', 'categories', 'sizes');
    $existingTables = array();
    $missingTables = array();
    
    foreach ($tables as $table) {
        $stmt = $pdo->query("SHOW TABLES LIKE '$table'");
        if ($stmt->rowCount() > 0) {
            $existingTables[] = $table;
        } else {
            $missingTables[] = $table;
        }
    }
    
    $results['tests']['tables'] = array(
        'name' => 'Database Tables',
        'status' => empty($missingTables) ? 'pass' : 'warning',
        'existing' => $existingTables,
        'missing' => $missingTables
    );
    
    // Test 6: Check for admin user
    $stmt = $pdo->query("SELECT COUNT(*) as count FROM users WHERE username = 'admin'");
    $adminCount = $stmt->fetch()['count'];
    
    $results['tests']['admin_user'] = array(
        'name' => 'Admin User',
        'status' => $adminCount > 0 ? 'pass' : 'fail',
        'value' => $adminCount > 0 ? 'Admin user exists' : 'Admin user not found',
        'note' => $adminCount > 0 ? '' : 'Create admin user in database'
    );
    
    // Test 7: Count records
    $stmt = $pdo->query("SELECT COUNT(*) as count FROM users");
    $userCount = $stmt->fetch()['count'];
    
    $results['tests']['user_count'] = array(
        'name' => 'Total Users',
        'status' => 'info',
        'value' => $userCount . ' users found'
    );
    
} catch (PDOException $e) {
    $results['tests']['db_connection'] = array(
        'name' => 'Database Connection',
        'status' => 'fail',
        'error' => $e->getMessage()
    );
}

// Overall status
$allPassed = true;
foreach ($results['tests'] as $test) {
    if ($test['status'] === 'fail') {
        $allPassed = false;
        break;
    }
}

$results['overall_status'] = $allPassed ? 'pass' : 'fail';
$results['timestamp'] = date('Y-m-d H:i:s');

echo json_encode($results, JSON_PRETTY_PRINT);
