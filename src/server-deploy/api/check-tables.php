<?php
// BlueHand Canvas - Table Structure Checker
// Upload this to /public_html/api/check-tables.php
// Then visit: https://bluehand.ro/api/check-tables.php

require_once 'config.php';

header('Content-Type: text/html; charset=utf-8');

echo "<h1>BlueHand Database Table Structure</h1>";
echo "<style>
    body { font-family: monospace; padding: 20px; background: #f5f5f5; }
    table { border-collapse: collapse; margin: 20px 0; background: white; width: 100%; }
    th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
    th { background: #667eea; color: white; }
    tr:hover { background: #f0f0f0; }
    .section { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; }
</style>";

try {
    $db = getDB();
    
    // Check all tables
    $tables = ['categories', 'frame_types', 'sizes', 'print_types', 'products', 'orders', 'order_items'];
    
    foreach ($tables as $tableName) {
        echo "<div class='section'>";
        echo "<h2>Table: $tableName</h2>";
        
        // Check if table exists
        $stmt = $db->query("SHOW TABLES LIKE '$tableName'");
        $exists = $stmt->fetch();
        
        if (!$exists) {
            echo "<p style='color: red;'>❌ Table does NOT exist</p>";
            echo "</div>";
            continue;
        }
        
        echo "<p style='color: green;'>✅ Table EXISTS</p>";
        
        // Get table structure
        $stmt = $db->query("DESCRIBE $tableName");
        $columns = $stmt->fetchAll();
        
        echo "<table>";
        echo "<tr><th>Column Name</th><th>Type</th><th>Null</th><th>Key</th><th>Default</th><th>Extra</th></tr>";
        
        foreach ($columns as $col) {
            echo "<tr>";
            echo "<td><strong>" . htmlspecialchars($col['Field']) . "</strong></td>";
            echo "<td>" . htmlspecialchars($col['Type']) . "</td>";
            echo "<td>" . htmlspecialchars($col['Null']) . "</td>";
            echo "<td>" . htmlspecialchars($col['Key']) . "</td>";
            echo "<td>" . htmlspecialchars($col['Default']) . "</td>";
            echo "<td>" . htmlspecialchars($col['Extra']) . "</td>";
            echo "</tr>";
        }
        
        echo "</table>";
        
        // Count rows
        $stmt = $db->query("SELECT COUNT(*) as count FROM $tableName");
        $count = $stmt->fetch();
        echo "<p><strong>Row count:</strong> " . $count['count'] . "</p>";
        
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
                            echo "<td>" . htmlspecialchars($value ?? 'NULL') . "</td>";
                        }
                    }
                    echo "</tr>";
                }
                echo "</table>";
            }
        }
        
        echo "</div>";
    }
    
    echo "<div class='section'>";
    echo "<h2>Database Connection Info</h2>";
    echo "<p><strong>Connected to database:</strong> " . $db->query("SELECT DATABASE()")->fetchColumn() . "</p>";
    echo "<p><strong>MySQL Version:</strong> " . $db->query("SELECT VERSION()")->fetchColumn() . "</p>";
    echo "</div>";
    
} catch (PDOException $e) {
    echo "<div class='section'>";
    echo "<h2 style='color: red;'>❌ Database Error</h2>";
    echo "<p>" . htmlspecialchars($e->getMessage()) . "</p>";
    echo "</div>";
}
