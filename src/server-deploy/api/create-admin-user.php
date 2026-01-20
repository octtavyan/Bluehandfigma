<?php
// Create Admin User Script
// Access at: https://bluehand.ro/api/create-admin-user.php

require_once 'config.php';

echo "<h1>🔐 Create Admin User</h1>";

$db = getDB();

// Check if users table exists
try {
    $stmt = $db->query("SHOW TABLES LIKE 'users'");
    $tableExists = $stmt->rowCount() > 0;
    
    if (!$tableExists) {
        echo "<p style='color:red;'>❌ Users table does not exist! Creating it...</p>";
        
        // Create users table
        $db->exec("
            CREATE TABLE IF NOT EXISTS users (
                id VARCHAR(255) PRIMARY KEY,
                username VARCHAR(100) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                email VARCHAR(255),
                role ENUM('full-admin', 'account-manager', 'production') DEFAULT 'account-manager',
                full_name VARCHAR(255),
                is_active BOOLEAN DEFAULT 1,
                last_login DATETIME,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_username (username),
                INDEX idx_email (email),
                INDEX idx_role (role)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        ");
        
        echo "<p style='color:green;'>✅ Users table created!</p>";
    } else {
        echo "<p style='color:green;'>✅ Users table exists</p>";
    }
    
    // Check existing users
    $stmt = $db->query("SELECT id, username, email, role, is_active, last_login FROM users");
    $users = $stmt->fetchAll();
    
    echo "<h2>Existing Users:</h2>";
    if (count($users) > 0) {
        echo "<table border='1' cellpadding='5'>";
        echo "<tr><th>ID</th><th>Username</th><th>Email</th><th>Role</th><th>Active</th><th>Last Login</th></tr>";
        foreach ($users as $user) {
            echo "<tr>";
            echo "<td>" . htmlspecialchars($user['id']) . "</td>";
            echo "<td>" . htmlspecialchars($user['username']) . "</td>";
            echo "<td>" . htmlspecialchars($user['email']) . "</td>";
            echo "<td>" . htmlspecialchars($user['role']) . "</td>";
            echo "<td>" . ($user['is_active'] ? '✅' : '❌') . "</td>";
            echo "<td>" . htmlspecialchars($user['last_login'] ?? 'Never') . "</td>";
            echo "</tr>";
        }
        echo "</table>";
    } else {
        echo "<p>No users found.</p>";
    }
    
    // Create default admin user if none exists
    $stmt = $db->query("SELECT COUNT(*) as count FROM users WHERE role = 'full-admin' AND is_active = 1");
    $result = $stmt->fetch();
    
    if ($result['count'] == 0) {
        echo "<h2>Creating Default Admin User:</h2>";
        
        $adminUsername = 'admin';
        $adminPassword = 'admin123';  // CHANGE THIS IMMEDIATELY AFTER FIRST LOGIN!
        $adminEmail = 'admin@bluehand.ro';
        $adminFullName = 'Administrator';
        $adminId = 'admin-' . time();
        
        $passwordHash = password_hash($adminPassword, PASSWORD_DEFAULT);
        
        $stmt = $db->prepare("
            INSERT INTO users (id, username, password_hash, email, role, full_name, is_active, created_at, updated_at)
            VALUES (?, ?, ?, ?, 'full-admin', ?, 1, NOW(), NOW())
        ");
        
        $stmt->execute([
            $adminId,
            $adminUsername,
            $passwordHash,
            $adminEmail,
            $adminFullName
        ]);
        
        echo "<div style='background:#e8f5e9; padding:15px; border-left:4px solid #4caf50;'>";
        echo "<h3>✅ Admin User Created!</h3>";
        echo "<p><strong>Username:</strong> <code style='background:#fff;padding:3px 8px;'>$adminUsername</code></p>";
        echo "<p><strong>Password:</strong> <code style='background:#fff;padding:3px 8px;'>$adminPassword</code></p>";
        echo "<p><strong>Role:</strong> full-admin</p>";
        echo "<p style='color:red;'><strong>⚠️ IMPORTANT: Change this password immediately after first login!</strong></p>";
        echo "</div>";
        
        echo "<h3>🔐 Test Login:</h3>";
        echo "<p>Go to: <a href='https://bluehand.ro/admin/login' target='_blank'>https://bluehand.ro/admin/login</a></p>";
        echo "<p>Login with the credentials above.</p>";
    } else {
        echo "<h2>✅ Admin user already exists</h2>";
        echo "<p>You can login with your existing admin credentials.</p>";
    }
    
    echo "<hr>";
    echo "<h2>🔒 Password Reset (Optional):</h2>";
    echo "<p>To reset a user's password, run this SQL command in cPanel MySQL:</p>";
    echo "<pre style='background:#f5f5f5; padding:10px;'>";
    echo "UPDATE users SET password_hash = '" . password_hash('newpassword123', PASSWORD_DEFAULT) . "' WHERE username = 'admin';\n";
    echo "</pre>";
    echo "<p>Then login with username: <code>admin</code> and password: <code>newpassword123</code></p>";
    
    echo "<hr>";
    echo "<p><strong>⚠️ SECURITY:</strong> Delete or rename this file after creating your admin user!</p>";
    
} catch (PDOException $e) {
    echo "<p style='color:red;'>❌ Database error: " . $e->getMessage() . "</p>";
}
