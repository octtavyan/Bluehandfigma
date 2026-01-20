<?php
// File Upload API Handler
// CRITICAL: Send CORS headers FIRST before anything else
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Content-Type: application/json; charset=utf-8');

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/config.php';

$method = $_SERVER['REQUEST_METHOD'];

// POST /api/upload - Upload file
if ($method === 'POST') {
    // Check if file was uploaded
    if (!isset($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) {
        $error = $_FILES['file']['error'] ?? 'unknown';
        jsonResponse(['error' => 'No file uploaded or upload error: ' . $error], 400);
    }
    
    $file = $_FILES['file'];
    $folder = $_POST['folder'] ?? 'paintings';
    
    // Use the upload helper from config.php
    $result = uploadFile($file, $folder);
    
    if (isset($result['error'])) {
        jsonResponse($result, 400);
    }
    
    jsonResponse($result);
}

// If we get here, method not allowed
jsonResponse(['error' => 'Method not allowed - Use POST to upload files'], 405);