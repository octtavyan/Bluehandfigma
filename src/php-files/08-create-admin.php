<?php
/**
 * CREATE ADMIN USER SCRIPT
 * 
 * INSTRUCTIONS:
 * 1. Upload this file to: /var/www/html/api/create-admin.php
 * 2. Visit: https://bluehand.ro/api/create-admin.php in your browser
 * 3. It will create an admin user with username: admin, password: admin123
 * 4. DELETE THIS FILE after creating the admin user (for security!)
 */

// CORS Headers
header('Access-Control-Allow-Origin: *');
header('Content-Type: text/html; charset=UTF-8');

// Include config
require_once __DIR__ . '/config.php';

echo '<!DOCTYPE html>
<html lang="ro">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Create Admin User - BlueHand Canvas</title>
    <style>
        body {
            font-family: system-ui, -apple-system, sans-serif;
            max-width: 800px;
            margin: 50px auto;
            padding: 20px;
            background: #f5f5f5;
        }
        .card {
            background: white;
            border-radius: 8px;
            padding: 30px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .success {
            background: #d4edda;
            border: 1px solid #c3e6cb;
            color: #155724;
            padding: 15px;
            border-radius: 5px;
            margin: 20px 0;
        }
        .error {
            background: #f8d7da;
            border: 1px solid #f5c6cb;
            color: #721c24;
            padding: 15px;
            border-radius: 5px;
            margin: 20px 0;
        }
        .warning {
            background: #fff3cd;
            border: 1px solid #ffeaa7;
            color: #856404;
            padding: 15px;
            border-radius: 5px;
            margin: 20px 0;
        }
        .info {
            background: #d1ecf1;
            border: 1px solid #bee5eb;
            color: #0c5460;
            padding: 15px;
            border-radius: 5px;
            margin: 20px 0;
        }
        code {
            background: #f4f4f4;
            padding: 2px 6px;
            border-radius: 3px;
            font-family: monospace;
        }
        h1 { color: #333; }
        h2 { color: #666; margin-top: 30px; }
        pre {
            background: #f4f4f4;
            padding: 15px;
            border-radius: 5px;
            overflow-x: auto;
        }
        .btn {
            display: inline-block;
            background: #007bff;
            color: white;
            padding: 10px 20px;
            text-decoration: none;
            border-radius: 5px;
            margin-top: 20px;
        }
        .btn:hover {
            background: #0056b3;
        }
    </style>
</head>
<body>
    <div class="card">
        <h1>🔐 Create Admin User</h1>
';

try {
    // Check if users table exists
    $stmt = $pdo->query("SHOW TABLES LIKE 'users'");
    $tableExists = $stmt->fetch();
    
    if (!$tableExists) {
        // Create users table
        echo '<div class="info"><strong>ℹ️ Info:</strong> Users table does not exist. Creating it now...</div>';
        
        $createTableSQL = "
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(50) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                email VARCHAR(100),
                role ENUM('admin', 'editor', 'viewer') DEFAULT 'viewer',
                full_name VARCHAR(100),
                is_active TINYINT(1) DEFAULT 1,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_username (username),
                INDEX idx_role (role)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        ";
        
        $pdo->exec($createTableSQL);
        echo '<div class="success"><strong>✅ Success:</strong> Users table created!</div>';
    } else {
        echo '<div class="info"><strong>ℹ️ Info:</strong> Users table already exists.</div>';
    }
    
    // Check if admin user already exists
    $stmt = $pdo->prepare("SELECT * FROM users WHERE username = ?");
    $stmt->execute(['admin']);
    $existingAdmin = $stmt->fetch();
    
    if ($existingAdmin) {
        echo '<div class="warning">
            <strong>⚠️ Warning:</strong> Admin user already exists!<br><br>
            <strong>Username:</strong> admin<br>
            <strong>Role:</strong> ' . htmlspecialchars($existingAdmin['role']) . '<br>
            <strong>Email:</strong> ' . htmlspecialchars($existingAdmin['email'] ?? 'N/A') . '<br>
            <strong>Active:</strong> ' . ($existingAdmin['is_active'] ? 'Yes' : 'No') . '<br><br>
            If you forgot your password, you need to reset it manually in the database.
        </div>';
        
        // Show password reset instructions
        echo '<h2>🔧 Reset Password Manually</h2>';
        echo '<div class="info">
            <p>To reset the admin password to <code>admin123</code>, run this SQL query in phpMyAdmin:</p>
            <pre>';
        
        $newPasswordHash = password_hash('admin123', PASSWORD_DEFAULT);
        echo 'UPDATE users SET password_hash = \'' . $newPasswordHash . '\' WHERE username = \'admin\';';
        
        echo '</pre>
            <p><strong>Or use this PHP snippet:</strong></p>
            <pre>';
        echo '&lt;?php
require_once __DIR__ . \'/config.php\';
$newHash = password_hash(\'admin123\', PASSWORD_DEFAULT);
$stmt = $pdo-&gt;prepare("UPDATE users SET password_hash = ? WHERE username = \'admin\'");
$stmt-&gt;execute([$newHash]);
echo "Password reset successful!";
?&gt;';
        echo '</pre>
        </div>';
        
    } else {
        // Create admin user
        $username = 'admin';
        $password = 'admin123';
        $passwordHash = password_hash($password, PASSWORD_DEFAULT);
        
        $stmt = $pdo->prepare("
            INSERT INTO users (username, password_hash, email, role, full_name, is_active)
            VALUES (?, ?, ?, ?, ?, 1)
        ");
        
        $stmt->execute([
            $username,
            $passwordHash,
            'admin@bluehand.ro',
            'admin',
            'Administrator'
        ]);
        
        echo '<div class="success">
            <h2>✅ Admin User Created Successfully!</h2>
            <p><strong>Username:</strong> <code>admin</code></p>
            <p><strong>Password:</strong> <code>admin123</code></p>
            <p><strong>Email:</strong> <code>admin@bluehand.ro</code></p>
            <p><strong>Role:</strong> <code>admin</code></p>
        </div>';
        
        echo '<div class="warning">
            <strong>⚠️ IMPORTANT SECURITY STEPS:</strong>
            <ol>
                <li>Login to your admin panel at: <a href="https://bluehand.ro/admin/login" target="_blank">https://bluehand.ro/admin/login</a></li>
                <li><strong>Change your password immediately!</strong></li>
                <li><strong>DELETE THIS FILE:</strong> <code>/var/www/html/api/create-admin.php</code></li>
            </ol>
        </div>';
    }
    
    // Show all users in database (for debugging)
    echo '<h2>👥 All Users in Database</h2>';
    $stmt = $pdo->query("SELECT id, username, email, role, is_active, created_at FROM users ORDER BY created_at DESC");
    $users = $stmt->fetchAll();
    
    if (count($users) > 0) {
        echo '<table border="1" cellpadding="10" cellspacing="0" style="width: 100%; border-collapse: collapse; margin-top: 10px;">
            <thead>
                <tr style="background: #f4f4f4;">
                    <th>ID</th>
                    <th>Username</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Active</th>
                    <th>Created At</th>
                </tr>
            </thead>
            <tbody>';
        
        foreach ($users as $user) {
            echo '<tr>
                <td>' . htmlspecialchars($user['id']) . '</td>
                <td><strong>' . htmlspecialchars($user['username']) . '</strong></td>
                <td>' . htmlspecialchars($user['email'] ?? 'N/A') . '</td>
                <td>' . htmlspecialchars($user['role']) . '</td>
                <td>' . ($user['is_active'] ? '✅ Yes' : '❌ No') . '</td>
                <td>' . htmlspecialchars($user['created_at']) . '</td>
            </tr>';
        }
        
        echo '</tbody>
        </table>';
    } else {
        echo '<div class="info">No users found in database.</div>';
    }
    
} catch (Exception $e) {
    echo '<div class="error">
        <h2>❌ Error</h2>
        <p><strong>Error Message:</strong> ' . htmlspecialchars($e->getMessage()) . '</p>
        <p><strong>Possible Causes:</strong></p>
        <ul>
            <li>Database connection failed (check config.php)</li>
            <li>Wrong database credentials</li>
            <li>MySQL server not running</li>
        </ul>
    </div>';
    
    echo '<h2>🔍 Debug Information</h2>';
    echo '<pre>';
    echo 'PHP Version: ' . PHP_VERSION . "\n";
    echo 'Script Path: ' . __FILE__ . "\n";
    echo 'Config Path: ' . __DIR__ . '/config.php' . "\n";
    echo '</pre>';
}

echo '
        <div style="margin-top: 30px; padding-top: 20px; border-top: 2px solid #eee;">
            <a href="https://bluehand.ro/admin/login" class="btn">🔑 Go to Login Page</a>
            <a href="https://bluehand.ro/api/health.php" class="btn" style="background: #28a745; margin-left: 10px;">❤️ Test API Health</a>
        </div>
        
        <div style="margin-top: 30px; padding: 15px; background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 5px;">
            <strong>🔒 Security Reminder:</strong> Delete this file after creating the admin user!
            <br><br>
            In cPanel File Manager, delete: <code>/public_html/api/create-admin.php</code>
        </div>
    </div>
</body>
</html>
';
