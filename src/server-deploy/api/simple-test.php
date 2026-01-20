<?php
// SUPER SIMPLE TEST - No dependencies
// Access at: https://bluehand.ro/api/simple-test.php

error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "PHP is working! Version: " . phpversion();
echo "\n\n";

// Test if we can connect to MySQL
$host = 'localhost';
$port = '3306';
$db = 'wiseguy_bluehand';
$user = 'wiseguy_bluehand';
$pass = 'BlueHand2024';  // Updated password

try {
    $dsn = "mysql:host=$host;port=$port;dbname=$db;charset=utf8mb4";
    $pdo = new PDO($dsn, $user, $pass);
    echo "✅ Database connection successful!\n";
    
    // Count records
    $stmt = $pdo->query("SELECT COUNT(*) FROM paintings");
    $count = $stmt->fetchColumn();
    echo "Paintings: $count\n";
    
    $stmt = $pdo->query("SELECT COUNT(*) FROM orders");
    $count = $stmt->fetchColumn();
    echo "Orders: $count\n";
    
    $stmt = $pdo->query("SELECT COUNT(*) FROM users");
    $count = $stmt->fetchColumn();
    echo "Users: $count\n";
    
} catch (PDOException $e) {
    echo "❌ Database error: " . $e->getMessage() . "\n";
}
?>