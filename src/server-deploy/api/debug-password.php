<?php
// Debug script to check what config.php is loading

echo "🔍 <b>BlueHand Debug - Password Check</b><br><br>";

// Load config
require_once 'config.php';

echo "✅ Config loaded successfully<br><br>";

echo "<b>Database Configuration:</b><br>";
echo "DB_HOST: " . DB_HOST . "<br>";
echo "DB_PORT: " . DB_PORT . "<br>";
echo "DB_NAME: " . DB_NAME . "<br>";
echo "DB_USER: " . DB_USER . "<br>";
echo "DB_PASS: " . substr(DB_PASS, 0, 3) . "***" . substr(DB_PASS, -3) . " (length: " . strlen(DB_PASS) . ")<br>";
echo "DB_PASS (full - REMOVE THIS AFTER TESTING): <span style='color:red;'>" . DB_PASS . "</span><br>";
echo "<br>";

echo "<b>Connection Test:</b><br>";

try {
    $dsn = sprintf(
        "mysql:host=%s;port=%s;dbname=%s;charset=utf8mb4",
        DB_HOST,
        DB_PORT,
        DB_NAME
    );
    
    echo "DSN: " . $dsn . "<br><br>";
    
    $pdo = new PDO($dsn, DB_USER, DB_PASS, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);
    
    echo "✅ <span style='color:green;font-weight:bold;'>DATABASE CONNECTION SUCCESSFUL!</span><br>";
    
    // Try a simple query
    $stmt = $pdo->query("SELECT COUNT(*) as count FROM users");
    $result = $stmt->fetch();
    echo "Users in database: " . $result['count'] . "<br>";
    
} catch (PDOException $e) {
    echo "❌ <span style='color:red;font-weight:bold;'>DATABASE CONNECTION FAILED!</span><br>";
    echo "Error: " . $e->getMessage() . "<br>";
    echo "Error Code: " . $e->getCode() . "<br>";
}

echo "<br><b>Config File Path:</b><br>";
echo __DIR__ . '/config.php<br>';
echo "File exists: " . (file_exists(__DIR__ . '/config.php') ? 'YES' : 'NO') . "<br>";
echo "File modified: " . date('Y-m-d H:i:s', filemtime(__DIR__ . '/config.php')) . "<br>";

echo "<br><b>PHP Info:</b><br>";
echo "PHP Version: " . PHP_VERSION . "<br>";
echo "Server: " . $_SERVER['SERVER_SOFTWARE'] . "<br>";
