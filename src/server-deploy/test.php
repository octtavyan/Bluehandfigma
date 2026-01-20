<?php
// Simple test file - no rewrite rules needed
header('Content-Type: application/json');

echo json_encode([
    'status' => 'ok',
    'message' => 'PHP is working!',
    'test' => 'direct-access',
    'time' => date('Y-m-d H:i:s'),
    'server' => $_SERVER['SERVER_SOFTWARE'] ?? 'unknown'
]);
