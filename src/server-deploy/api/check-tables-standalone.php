<?php
// BlueHand Canvas - Standalone Table Structure Checker
// This version connects directly without using config.php

header('Content-Type: text/html; charset=utf-8');

// Database connection details (UPDATE THESE if different!)
$host = 'localhost';
$dbname = 'wiseguy_bluehand';
$username = 'wiseguy_bluehand';
$password = 'T0zl4qKxQm2u';

echo "<h1>BlueHand Database Table Structure</h1>";
echo "<style>
    body { font-family: monospace; padding: 20px; background: #f5f5f5; }
    table { border-collapse: collapse; margin: 20px 0; background: white; width: 100%; }
    th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
    th { background: #667eea; color: white; }
    tr:hover { background: #f0f0f0; }
    .section { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    .success { color: green; font-weight: bold; }
    .error { color: red; font-weight: bold; }
</style>";

try {
    // Connect to database
    $dsn = "mysql:host=$host;dbname=$dbname;charset=utf8mb4";
    $options = [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ];
    
    $db = new PDO($dsn, $username, $password, $options);
    
    echo "<div class='section'>";
    echo "<h2 class='success'>✅ Database Connected Successfully!</h2>";
    echo "<p><strong>Database:</strong> " . $db->query("SELECT DATABASE()")->fetchColumn() . "</p>";
    echo "<p><strong>MySQL Version:</strong> " . $db->query("SELECT VERSION()")->fetchColumn() . "</p>";
    echo "</div>";
    
    // Check all tables
    $tables = ['categories', 'frame_types', 'sizes', 'print_types', 'products', 'orders', 'order_items', 'clients', 'users'];
    
    foreach ($tables as $tableName) {
        echo "<div class='section'>";
        echo "<h2>Table: $tableName</h2>";
        
        // Check if table exists
        $stmt = $db->query("SHOW TABLES LIKE '$tableName'");
        $exists = $stmt->fetch();
        
        if (!$exists) {
            echo "<p class='error'>❌ Table does NOT exist</p>";
            echo "</div>";
            continue;
        }
        
        echo "<p class='success'>✅ Table EXISTS</p>";
        
        // Get table structure
        $stmt = $db->query("DESCRIBE $tableName");
        $columns = $stmt->fetchAll();
        
        echo "<h3>Column Structure:</h3>";
        echo "<table>";
        echo "<tr><th>Column Name</th><th>Type</th><th>Null</th><th>Key</th><th>Default</th><th>Extra</th></tr>";
        
        foreach ($columns as $col) {
            echo "<tr>";
            echo "<td><strong style='background: yellow; padding: 3px 8px;'>" . htmlspecialchars($col['Field']) . "</strong></td>";
            echo "<td>" . htmlspecialchars($col['Type']) . "</td>";
            echo "<td>" . htmlspecialchars($col['Null']) . "</td>";
            echo "<td>" . htmlspecialchars($col['Key']) . "</td>";
            echo "<td>" . htmlspecialchars($col['Default'] ?? 'NULL') . "</td>";
            echo "<td>" . htmlspecialchars($col['Extra']) . "</td>";
            echo "</tr>";
        }
        
        echo "</table>";
        
        // Count rows
        $stmt = $db->query("SELECT COUNT(*) as count FROM $tableName");
        $count = $stmt->fetch();
        echo "<p><strong>Total Rows:</strong> " . $count['count'] . "</p>";
        
        // Show sample data
        if ($count['count'] > 0) {
            echo "<h3>Sample Data (first 3 rows):</h3>";
            $stmt = $db->query("SELECT * FROM $tableName LIMIT 3");
            $rows = $stmt->fetchAll();
            
            if ($rows) {
                echo "<table>";
                echo "<tr>";
                foreach ($rows[0] as $key => $value) {
                    if (!is_numeric($key)) {
                        echo "<th>" . htmlspecialchars($key) . "</th>";
                    }
                }
                echo "</tr>";
                
                foreach ($rows as $row) {
                    echo "<tr>";
                    foreach ($row as $key => $value) {
                        if (!is_numeric($key)) {
                            $displayValue = $value ?? 'NULL';
                            if (strlen($displayValue) > 100) {
                                $displayValue = substr($displayValue, 0, 100) . '...';
                            }
                            echo "<td>" . htmlspecialchars($displayValue) . "</td>";
                        }
                    }
                    echo "</tr>";
                }
                echo "</table>";
            }
        } else {
            echo "<p style='color: orange;'>⚠️ Table is EMPTY (no data)</p>";
        }
        
        echo "</div>";
    }
    
    // Show ALL tables in database
    echo "<div class='section'>";
    echo "<h2>All Tables in Database</h2>";
    $stmt = $db->query("SHOW TABLES");
    $allTables = $stmt->fetchAll(PDO::FETCH_COLUMN);
    echo "<ul>";
    foreach ($allTables as $table) {
        echo "<li>" . htmlspecialchars($table) . "</li>";
    }
    echo "</ul>";
    echo "</div>";
    
} catch (PDOException $e) {
    echo "<div class='section'>";
    echo "<h2 class='error'>❌ Database Error</h2>";
    echo "<p><strong>Error Message:</strong> " . htmlspecialchars($e->getMessage()) . "</p>";
    echo "<p><strong>Error Code:</strong> " . htmlspecialchars($e->getCode()) . "</p>";
    
    echo "<h3>💡 Possible Fixes:</h3>";
    echo "<ul>";
    echo "<li>Check that database name is: <code>wiseguy_bluehand</code></li>";
    echo "<li>Check that database user is: <code>wiseguy_bluehand</code></li>";
    echo "<li>Check that password is correct (update at top of this file)</li>";
    echo "<li>Check that database exists in cPanel → MySQL Databases</li>";
    echo "</ul>";
    echo "</div>";
}

echo "<div class='section' style='background: #d4edda; border-left: 5px solid #28a745;'>";
echo "<h2>✅ Next Steps:</h2>";
echo "<ol>";
echo "<li>Take a SCREENSHOT of this entire page</li>";
echo "<li>Send it to the assistant</li>";
echo "<li>The assistant will create custom INSERT statements for YOUR exact table structure</li>";
echo "</ol>";
echo "</div>";
?>
