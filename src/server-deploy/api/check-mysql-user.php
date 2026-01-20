<?php
// Check MySQL users and try different connection methods

echo "🔍 <b>MySQL User Host Check</b><br><br>";

$username = 'wiseguy_bluehand';
$password = 'BlueHand2024';
$database = 'wiseguy_bluehand';

echo "<b>Testing connections with different hosts:</b><br><br>";

// Test 1: localhost
echo "1️⃣ Testing with host='localhost'...<br>";
try {
    $pdo = new PDO("mysql:host=localhost;dbname=$database", $username, $password);
    echo "✅ <span style='color:green;'>SUCCESS with localhost!</span><br><br>";
} catch (PDOException $e) {
    echo "❌ FAILED: " . $e->getMessage() . "<br><br>";
}

// Test 2: 127.0.0.1
echo "2️⃣ Testing with host='127.0.0.1'...<br>";
try {
    $pdo = new PDO("mysql:host=127.0.0.1;dbname=$database", $username, $password);
    echo "✅ <span style='color:green;'>SUCCESS with 127.0.0.1!</span><br><br>";
} catch (PDOException $e) {
    echo "❌ FAILED: " . $e->getMessage() . "<br><br>";
}

// Test 3: Get server hostname
echo "3️⃣ Testing with server hostname...<br>";
$hostname = gethostname();
echo "Server hostname: " . $hostname . "<br>";
try {
    $pdo = new PDO("mysql:host=$hostname;dbname=$database", $username, $password);
    echo "✅ <span style='color:green;'>SUCCESS with $hostname!</span><br><br>";
} catch (PDOException $e) {
    echo "❌ FAILED: " . $e->getMessage() . "<br><br>";
}

// Test 4: Try without specifying port
echo "4️⃣ Testing without port specification...<br>";
try {
    $pdo = new PDO("mysql:host=localhost;dbname=$database;charset=utf8mb4", $username, $password, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    ]);
    echo "✅ <span style='color:green;'>SUCCESS without port!</span><br><br>";
} catch (PDOException $e) {
    echo "❌ FAILED: " . $e->getMessage() . "<br><br>";
}

echo "<br><b>Server Information:</b><br>";
echo "Server IP: " . $_SERVER['SERVER_ADDR'] . "<br>";
echo "PHP Version: " . PHP_VERSION . "<br>";

// Check if we can run mysql command
echo "<br><b>Checking MySQL client:</b><br>";
$output = shell_exec('which mysql 2>&1');
echo "MySQL client path: " . ($output ? $output : 'Not found') . "<br>";
