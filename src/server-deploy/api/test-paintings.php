<?php
// Test Paintings Endpoint - Direct test without routing
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once 'config.php';

try {
    $db = getDB();
    
    // First, check if paintings table exists
    $stmt = $db->query("SHOW TABLES LIKE 'paintings'");
    $tableExists = $stmt->rowCount() > 0;
    
    if (!$tableExists) {
        echo json_encode([
            'error' => 'Paintings table does not exist',
            'suggestion' => 'Create the paintings table in MySQL'
        ], JSON_PRETTY_PRINT);
        exit;
    }
    
    // Check table structure
    $stmt = $db->query("DESCRIBE paintings");
    $columns = $stmt->fetchAll(PDO::FETCH_COLUMN);
    
    // Try to fetch paintings
    $stmt = $db->query("SELECT * FROM paintings LIMIT 5");
    $paintings = $stmt->fetchAll();
    
    // Parse JSON fields if they exist
    foreach ($paintings as &$painting) {
        if (isset($painting['available_sizes'])) {
            $painting['available_sizes'] = json_decode($painting['available_sizes'] ?? '[]', true);
        }
        if (isset($painting['variants'])) {
            $painting['variants'] = json_decode($painting['variants'] ?? '[]', true);
        }
        if (isset($painting['print_types'])) {
            $painting['print_types'] = json_decode($painting['print_types'] ?? '[]', true);
        }
        if (isset($painting['frame_types_by_print_type'])) {
            $painting['frame_types_by_print_type'] = json_decode($painting['frame_types_by_print_type'] ?? '[]', true);
        }
    }
    
    echo json_encode([
        'status' => 'ok',
        'table_exists' => true,
        'columns' => $columns,
        'paintings_count' => count($paintings),
        'paintings' => $paintings
    ], JSON_PRETTY_PRINT);
    
} catch (PDOException $e) {
    echo json_encode([
        'error' => 'Database error',
        'message' => $e->getMessage(),
        'code' => $e->getCode()
    ], JSON_PRETTY_PRINT);
} catch (Exception $e) {
    echo json_encode([
        'error' => 'Server error',
        'message' => $e->getMessage()
    ], JSON_PRETTY_PRINT);
}
