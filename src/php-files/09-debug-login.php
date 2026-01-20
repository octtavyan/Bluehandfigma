<?php
/**
 * DEBUG LOGIN SCRIPT
 * 
 * This script will:
 * 1. Show all users in database
 * 2. Generate a correct password hash for "admin123"
 * 3. Update the admin user with the correct hash
 * 4. Test password verification
 * 
 * INSTRUCTIONS:
 * 1. Upload to: /var/www/html/api/debug-login.php
 * 2. Visit: https://bluehand.ro/api/debug-login.php
 * 3. DELETE THIS FILE after fixing (contains sensitive info!)
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
    <title>Debug Login - BlueHand Canvas</title>
    <style>
        body {
            font-family: system-ui, -apple-system, sans-serif;
            max-width: 1000px;
            margin: 30px auto;
            padding: 20px;
            background: #f5f5f5;
        }
        .card {
            background: white;
            border-radius: 8px;
            padding: 25px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            margin-bottom: 20px;
        }
        .success {
            background: #d4edda;
            border: 1px solid #c3e6cb;
            color: #155724;
            padding: 15px;
            border-radius: 5px;
            margin: 15px 0;
        }
        .error {
            background: #f8d7da;
            border: 1px solid #f5c6cb;
            color: #721c24;
            padding: 15px;
            border-radius: 5px;
            margin: 15px 0;
        }
        .warning {
            background: #fff3cd;
            border: 1px solid #ffeaa7;
            color: #856404;
            padding: 15px;
            border-radius: 5px;
            margin: 15px 0;
        }
        .info {
            background: #d1ecf1;
            border: 1px solid #bee5eb;
            color: #0c5460;
            padding: 15px;
            border-radius: 5px;
            margin: 15px 0;
        }
        code {
            background: #f4f4f4;
            padding: 2px 6px;
            border-radius: 3px;
            font-family: monospace;
            font-size: 13px;
        }
        pre {
            background: #f4f4f4;
            padding: 15px;
            border-radius: 5px;
            overflow-x: auto;
            font-size: 12px;
        }
        h1 { color: #333; margin-top: 0; }
        h2 { color: #666; margin-top: 25px; border-bottom: 2px solid #eee; padding-bottom: 10px; }
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 15px 0;
        }
        table th {
            background: #f4f4f4;
            padding: 10px;
            text-align: left;
            font-weight: 600;
        }
        table td {
            padding: 10px;
            border-bottom: 1px solid #eee;
        }
        .btn {
            display: inline-block;
            background: #007bff;
            color: white;
            padding: 10px 20px;
            text-decoration: none;
            border-radius: 5px;
            margin: 10px 5px 0 0;
        }
        .btn:hover {
            background: #0056b3;
        }
        .btn-success {
            background: #28a745;
        }
        .btn-success:hover {
            background: #1e7e34;
        }
        .btn-danger {
            background: #dc3545;
        }
        .btn-danger:hover {
            background: #a71d2a;
        }
    </style>
</head>
<body>
    <div class="card">
        <h1>🔍 Login Debug Tool</h1>
        <p style="color: #666;">This will help diagnose and fix your login issue.</p>
    </div>
';

try {
    // ============================================
    // STEP 1: Show all users
    // ============================================
    echo '<div class="card">';
    echo '<h2>👥 Step 1: Current Users in Database</h2>';
    
    $stmt = $pdo->query("SELECT * FROM users ORDER BY id");
    $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    if (count($users) > 0) {
        echo '<table>';
        echo '<thead><tr><th>ID</th><th>Username</th><th>Email</th><th>Role</th><th>Active</th><th>Password Hash (first 50 chars)</th></tr></thead>';
        echo '<tbody>';
        
        foreach ($users as $user) {
            $hashPreview = substr($user['password_hash'], 0, 50);
            $isActive = isset($user['is_active']) ? $user['is_active'] : 1;
            
            echo '<tr>';
            echo '<td>' . htmlspecialchars($user['id']) . '</td>';
            echo '<td><strong>' . htmlspecialchars($user['username']) . '</strong></td>';
            echo '<td>' . htmlspecialchars($user['email'] ?? 'N/A') . '</td>';
            echo '<td>' . htmlspecialchars($user['role']) . '</td>';
            echo '<td>' . ($isActive ? '✅ Yes' : '❌ No') . '</td>';
            echo '<td><code>' . htmlspecialchars($hashPreview) . '...</code></td>';
            echo '</tr>';
        }
        
        echo '</tbody></table>';
    } else {
        echo '<div class="warning">⚠️ No users found in database!</div>';
    }
    
    echo '</div>';
    
    // ============================================
    // STEP 2: Generate new password hash
    // ============================================
    echo '<div class="card">';
    echo '<h2>🔐 Step 2: Generate Fresh Password Hash</h2>';
    
    $testPassword = 'admin123';
    $newHash = password_hash($testPassword, PASSWORD_DEFAULT);
    
    echo '<div class="info">';
    echo '<p><strong>Password:</strong> <code>' . $testPassword . '</code></p>';
    echo '<p><strong>New Hash:</strong></p>';
    echo '<pre>' . htmlspecialchars($newHash) . '</pre>';
    echo '<p style="font-size: 12px; color: #666;">This is a fresh bcrypt hash generated by PHP\'s <code>password_hash()</code> function.</p>';
    echo '</div>';
    
    echo '</div>';
    
    // ============================================
    // STEP 3: Check if admin user exists
    // ============================================
    echo '<div class="card">';
    echo '<h2>🔎 Step 3: Check Admin User</h2>';
    
    $stmt = $pdo->prepare("SELECT * FROM users WHERE username = ?");
    $stmt->execute(['admin']);
    $adminUser = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($adminUser) {
        echo '<div class="success">';
        echo '<p>✅ Admin user found!</p>';
        echo '<p><strong>ID:</strong> ' . htmlspecialchars($adminUser['id']) . '</p>';
        echo '<p><strong>Username:</strong> ' . htmlspecialchars($adminUser['username']) . '</p>';
        echo '<p><strong>Email:</strong> ' . htmlspecialchars($adminUser['email'] ?? 'N/A') . '</p>';
        echo '<p><strong>Role:</strong> ' . htmlspecialchars($adminUser['role']) . '</p>';
        echo '<p><strong>Active:</strong> ' . (isset($adminUser['is_active']) && $adminUser['is_active'] ? '✅ Yes' : '❌ No') . '</p>';
        echo '<p><strong>Current Password Hash:</strong></p>';
        echo '<pre>' . htmlspecialchars($adminUser['password_hash']) . '</pre>';
        echo '</div>';
        
        // Test current password
        echo '<h3>🧪 Test Current Password</h3>';
        $testPasswords = ['admin', 'admin123', 'password', 'Admin123'];
        
        echo '<table>';
        echo '<thead><tr><th>Test Password</th><th>Verification Result</th></tr></thead>';
        echo '<tbody>';
        
        foreach ($testPasswords as $testPass) {
            $verified = password_verify($testPass, $adminUser['password_hash']);
            echo '<tr>';
            echo '<td><code>' . htmlspecialchars($testPass) . '</code></td>';
            echo '<td>' . ($verified ? '<span style="color: green; font-weight: bold;">✅ MATCH!</span>' : '<span style="color: red;">❌ No match</span>') . '</td>';
            echo '</tr>';
        }
        
        echo '</tbody></table>';
        
    } else {
        echo '<div class="error">';
        echo '<p>❌ No admin user found with username "admin"!</p>';
        echo '</div>';
    }
    
    echo '</div>';
    
    // ============================================
    // STEP 4: Update password button (GET parameter)
    // ============================================
    echo '<div class="card">';
    echo '<h2>🔧 Step 4: Fix Password</h2>';
    
    if (isset($_GET['fix']) && $_GET['fix'] === 'password') {
        // DO THE FIX
        $newPassword = 'admin123';
        $newHash = password_hash($newPassword, PASSWORD_DEFAULT);
        
        if ($adminUser) {
            $stmt = $pdo->prepare("UPDATE users SET password_hash = ? WHERE username = ?");
            $stmt->execute([$newHash, 'admin']);
            
            echo '<div class="success">';
            echo '<h3>✅ Password Updated Successfully!</h3>';
            echo '<p><strong>Username:</strong> <code>admin</code></p>';
            echo '<p><strong>Password:</strong> <code>admin123</code></p>';
            echo '<p><strong>New Hash:</strong></p>';
            echo '<pre>' . htmlspecialchars($newHash) . '</pre>';
            echo '</div>';
            
            // Verify it works
            $verifyTest = password_verify($newPassword, $newHash);
            if ($verifyTest) {
                echo '<div class="success">';
                echo '<p>✅ Verification test: Password hash is working correctly!</p>';
                echo '</div>';
            } else {
                echo '<div class="error">';
                echo '<p>❌ Verification test failed! Something is wrong.</p>';
                echo '</div>';
            }
            
            echo '<div class="info" style="margin-top: 20px;">';
            echo '<h3>🎯 Next Steps:</h3>';
            echo '<ol>';
            echo '<li>Go to: <a href="https://bluehand.ro/admin/login" target="_blank">https://bluehand.ro/admin/login</a></li>';
            echo '<li>Login with: <code>admin</code> / <code>admin123</code></li>';
            echo '<li><strong>DELETE THIS FILE!</strong> (security risk)</li>';
            echo '</ol>';
            echo '</div>';
            
            echo '<a href="https://bluehand.ro/admin/login" class="btn btn-success">🔑 Go to Login Page</a>';
            
        } else {
            echo '<div class="error">';
            echo '<p>❌ Cannot update: Admin user not found!</p>';
            echo '</div>';
        }
        
    } else {
        // SHOW BUTTON TO FIX
        if ($adminUser) {
            echo '<div class="warning">';
            echo '<p>Click the button below to update the admin password to: <code>admin123</code></p>';
            echo '</div>';
            echo '<a href="?fix=password" class="btn btn-danger">🔧 Fix Password Now</a>';
        } else {
            echo '<div class="error">';
            echo '<p>❌ Cannot fix: No admin user found!</p>';
            echo '<p>You need to create an admin user first. Use the <strong>create-admin.php</strong> script.</p>';
            echo '</div>';
        }
    }
    
    echo '</div>';
    
    // ============================================
    // STEP 5: Test login endpoint
    // ============================================
    echo '<div class="card">';
    echo '<h2>🧪 Step 5: Test Login Endpoint</h2>';
    
    echo '<div class="info">';
    echo '<p>You can test the login endpoint manually:</p>';
    echo '<pre>';
    echo 'curl -X POST https://bluehand.ro/api/auth/login.php \\' . "\n";
    echo '  -H "Content-Type: application/json" \\' . "\n";
    echo '  -d \'{"username":"admin","password":"admin123"}\'';
    echo '</pre>';
    echo '</div>';
    
    echo '<a href="https://bluehand.ro/api/health.php" target="_blank" class="btn">❤️ Test API Health</a>';
    echo '<a href="https://bluehand.ro/admin/login" target="_blank" class="btn btn-success">🔑 Go to Login</a>';
    
    echo '</div>';
    
} catch (Exception $e) {
    echo '<div class="card">';
    echo '<div class="error">';
    echo '<h2>❌ Database Error</h2>';
    echo '<p><strong>Error:</strong> ' . htmlspecialchars($e->getMessage()) . '</p>';
    echo '<p><strong>Check:</strong></p>';
    echo '<ul>';
    echo '<li>Database credentials in config.php</li>';
    echo '<li>MySQL server is running</li>';
    echo '<li>Users table exists</li>';
    echo '</ul>';
    echo '</div>';
    echo '</div>';
}

echo '
    <div class="card" style="background: #fff3cd; border: 2px solid #ffc107;">
        <h2 style="color: #856404;">⚠️ SECURITY WARNING</h2>
        <p style="color: #856404; font-size: 16px; font-weight: 600;">
            DELETE THIS FILE after fixing the login issue!<br>
            This file contains sensitive debugging information.
        </p>
        <p style="color: #856404;">
            In cPanel File Manager: Delete <code>/public_html/api/debug-login.php</code>
        </p>
    </div>
</body>
</html>
';
