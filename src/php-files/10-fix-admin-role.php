<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Fix Admin Role - BlueHand Canvas</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            max-width: 800px;
            margin: 40px auto;
            padding: 20px;
            background: #f5f5f5;
        }
        .container {
            background: white;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        h1 {
            color: #333;
            margin-bottom: 10px;
        }
        .subtitle {
            color: #666;
            margin-bottom: 30px;
        }
        .success {
            background: #d4edda;
            color: #155724;
            padding: 15px;
            border-radius: 4px;
            margin: 20px 0;
            border: 1px solid #c3e6cb;
        }
        .error {
            background: #f8d7da;
            color: #721c24;
            padding: 15px;
            border-radius: 4px;
            margin: 20px 0;
            border: 1px solid #f5c6cb;
        }
        .warning {
            background: #fff3cd;
            color: #856404;
            padding: 15px;
            border-radius: 4px;
            margin: 20px 0;
            border: 1px solid #ffeaa7;
        }
        .info {
            background: #d1ecf1;
            color: #0c5460;
            padding: 15px;
            border-radius: 4px;
            margin: 20px 0;
            border: 1px solid #bee5eb;
        }
        pre {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 4px;
            overflow-x: auto;
            border: 1px solid #dee2e6;
        }
        code {
            color: #e83e8c;
            background: #f8f9fa;
            padding: 2px 6px;
            border-radius: 3px;
        }
        .btn {
            display: inline-block;
            padding: 10px 20px;
            background: #007bff;
            color: white;
            text-decoration: none;
            border-radius: 4px;
            border: none;
            cursor: pointer;
            font-size: 16px;
        }
        .btn:hover {
            background: #0056b3;
        }
        .btn-danger {
            background: #dc3545;
        }
        .btn-danger:hover {
            background: #c82333;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
        }
        th, td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #dee2e6;
        }
        th {
            background: #f8f9fa;
            font-weight: 600;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🔧 Fix Admin Role - BlueHand Canvas</h1>
        <p class="subtitle">One-time database fix script</p>

<?php
/**
 * BlueHand Canvas - Fix Admin Role
 * 
 * PROBLEM:
 * - Database has role = 'admin'
 * - Frontend expects role = 'full-admin'
 * - Sidebar menu items won't show because role mismatch
 * 
 * SOLUTION:
 * - Update users table: role 'admin' → 'full-admin'
 * 
 * INSTRUCTIONS:
 * 1. Upload to: /public_html/api/fix-admin-role.php
 * 2. Visit: https://bluehand.ro/api/fix-admin-role.php
 * 3. DELETE THIS FILE after fixing!
 */

// Database configuration
$host = 'localhost';
$dbname = 'blueh954_main';
$username = 'blueh954_user';
$password = 'Bluehand2024!Secure';

echo '<div class="info">';
echo '<h2>📋 Diagnostic Information</h2>';
echo '<p><strong>Script:</strong> fix-admin-role.php</p>';
echo '<p><strong>Purpose:</strong> Update admin role from \'admin\' to \'full-admin\'</p>';
echo '</div>';

try {
    // Connect to database
    echo '<h2>🔌 Connecting to Database...</h2>';
    $pdo = new PDO(
        "mysql:host=$host;dbname=$dbname;charset=utf8mb4",
        $username,
        $password,
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false
        ]
    );
    
    echo '<div class="success">';
    echo '✅ Connected to database: <code>' . htmlspecialchars($dbname) . '</code>';
    echo '</div>';
    
    // Check current users
    echo '<h2>👥 Current Users</h2>';
    $stmt = $pdo->query("SELECT id, username, email, role, full_name, is_active, last_login FROM users ORDER BY id");
    $users = $stmt->fetchAll();
    
    if (empty($users)) {
        echo '<div class="error">❌ No users found in database!</div>';
    } else {
        echo '<table>';
        echo '<thead><tr>';
        echo '<th>Username</th>';
        echo '<th>Email</th>';
        echo '<th>Role</th>';
        echo '<th>Full Name</th>';
        echo '<th>Active</th>';
        echo '<th>Last Login</th>';
        echo '</tr></thead>';
        echo '<tbody>';
        
        foreach ($users as $user) {
            $needsFix = ($user['role'] === 'admin');
            $rowStyle = $needsFix ? 'background: #fff3cd;' : '';
            
            echo '<tr style="' . $rowStyle . '">';
            echo '<td><strong>' . htmlspecialchars($user['username']) . '</strong></td>';
            echo '<td>' . htmlspecialchars($user['email']) . '</td>';
            echo '<td><code>' . htmlspecialchars($user['role']) . '</code>';
            if ($needsFix) {
                echo ' <strong style="color: #dc3545;">← NEEDS FIX!</strong>';
            }
            echo '</td>';
            echo '<td>' . htmlspecialchars($user['full_name']) . '</td>';
            echo '<td>' . ($user['is_active'] ? '✅' : '❌') . '</td>';
            echo '<td>' . htmlspecialchars($user['last_login'] ?? 'Never') . '</td>';
            echo '</tr>';
        }
        
        echo '</tbody></table>';
    }
    
    // Count users needing fix
    $stmt = $pdo->query("SELECT COUNT(*) as count FROM users WHERE role = 'admin'");
    $needsFixCount = $stmt->fetch()['count'];
    
    if ($needsFixCount > 0) {
        echo '<div class="warning">';
        echo '<h3>⚠️ Found ' . $needsFixCount . ' user(s) with role = \'admin\'</h3>';
        echo '<p>These users need to be updated to role = \'full-admin\' for the CMS to work properly.</p>';
        echo '</div>';
        
        // Apply fix
        echo '<h2>🔧 Applying Fix...</h2>';
        
        $stmt = $pdo->prepare("UPDATE users SET role = 'full-admin' WHERE role = 'admin'");
        $stmt->execute();
        $updatedCount = $stmt->rowCount();
        
        echo '<div class="success">';
        echo '<h3>✅ Fix Applied Successfully!</h3>';
        echo '<p><strong>Updated ' . $updatedCount . ' user(s)</strong></p>';
        echo '<p>Role changed: <code>admin</code> → <code>full-admin</code></p>';
        echo '</div>';
        
        // Show updated users
        echo '<h2>✅ Updated Users</h2>';
        $stmt = $pdo->query("SELECT id, username, email, role, full_name FROM users ORDER BY id");
        $usersAfter = $stmt->fetchAll();
        
        echo '<table>';
        echo '<thead><tr>';
        echo '<th>Username</th>';
        echo '<th>Email</th>';
        echo '<th>Role</th>';
        echo '<th>Full Name</th>';
        echo '</tr></thead>';
        echo '<tbody>';
        
        foreach ($usersAfter as $user) {
            echo '<tr>';
            echo '<td><strong>' . htmlspecialchars($user['username']) . '</strong></td>';
            echo '<td>' . htmlspecialchars($user['email']) . '</td>';
            echo '<td><code style="background: #d4edda; color: #155724;">' . htmlspecialchars($user['role']) . '</code> ✅</td>';
            echo '<td>' . htmlspecialchars($user['full_name']) . '</td>';
            echo '</tr>';
        }
        
        echo '</tbody></table>';
        
        echo '<div class="success">';
        echo '<h3>🎉 All Done!</h3>';
        echo '<h4>Next Steps:</h4>';
        echo '<ol>';
        echo '<li>Go to: <a href="https://bluehand.ro/admin/dashboard" target="_blank"><strong>https://bluehand.ro/admin/dashboard</strong></a></li>';
        echo '<li>Press <code>Ctrl+Shift+R</code> (Windows) or <code>Cmd+Shift+R</code> (Mac) to hard refresh</li>';
        echo '<li>The sidebar menu should now appear with all menu items!</li>';
        echo '<li><strong>DELETE THIS FILE:</strong> <code>/public_html/api/fix-admin-role.php</code></li>';
        echo '</ol>';
        echo '</div>';
        
        echo '<div class="warning">';
        echo '<h3>⚠️ IMPORTANT: DELETE THIS FILE!</h3>';
        echo '<p>This file contains database credentials and should be deleted immediately:</p>';
        echo '<pre>In cPanel File Manager: Delete /public_html/api/fix-admin-role.php</pre>';
        echo '</div>';
        
    } else {
        echo '<div class="success">';
        echo '<h3>✅ No Fix Needed!</h3>';
        echo '<p>All users already have valid roles (\'full-admin\', \'account-manager\', or \'production\').</p>';
        echo '<p>You can safely delete this file.</p>';
        echo '</div>';
    }
    
} catch (PDOException $e) {
    echo '<div class="error">';
    echo '<h3>❌ Database Error</h3>';
    echo '<pre>' . htmlspecialchars($e->getMessage()) . '</pre>';
    echo '</div>';
    
    echo '<div class="warning">';
    echo '<h3>💡 Manual Fix</h3>';
    echo '<p>If this script doesn\'t work, you can fix it manually in phpMyAdmin:</p>';
    echo '<pre>';
    echo 'UPDATE users SET role = \'full-admin\' WHERE role = \'admin\';';
    echo '</pre>';
    echo '</div>';
}
?>

        <hr style="margin: 40px 0;">
        
        <div class="info">
            <h3>📚 Understanding Roles</h3>
            <table>
                <tr>
                    <th>Role</th>
                    <th>Access Level</th>
                    <th>Description</th>
                </tr>
                <tr>
                    <td><code>full-admin</code></td>
                    <td>🔴 Full Access</td>
                    <td>All CMS features, settings, users, sizes, frame types</td>
                </tr>
                <tr>
                    <td><code>account-manager</code></td>
                    <td>🟡 Medium Access</td>
                    <td>Orders, clients, paintings, blog, settings (no user management)</td>
                </tr>
                <tr>
                    <td><code>production</code></td>
                    <td>🟢 Limited Access</td>
                    <td>Only production-related orders (in-production, delivered, returned, closed)</td>
                </tr>
            </table>
            
            <p style="margin-top: 20px;"><strong>Note:</strong> The role <code>admin</code> is not recognized by the frontend. It must be <code>full-admin</code> for the sidebar menu to appear.</p>
        </div>
    </div>
</body>
</html>
