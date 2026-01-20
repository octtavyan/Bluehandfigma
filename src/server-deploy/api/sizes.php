<?php
// BlueHand Canvas - Sizes API
// Updated to match actual database structure
require_once __DIR__ . '/config.php';

$method = $_SERVER['REQUEST_METHOD'];

try {
    switch ($method) {
        case 'GET':
            // Get all active sizes
            $db = getDB();
            $stmt = $db->prepare("
                SELECT 
                    id,
                    name,
                    dimensions,
                    base_price,
                    supports_print_canvas,
                    supports_print_hartie,
                    is_active,
                    created_at,
                    updated_at
                FROM sizes
                WHERE is_active = 1
                ORDER BY base_price ASC
            ");
            $stmt->execute();
            $sizes = $stmt->fetchAll();
            
            // Transform to match frontend format
            $result = array_map(function($size) {
                // Parse dimensions (e.g., "30x40" -> width: 30, height: 40)
                $dims = explode('x', $size['dimensions']);
                $width = isset($dims[0]) ? (int)$dims[0] : 0;
                $height = isset($dims[1]) ? (int)$dims[1] : 0;
                
                return [
                    'id' => $size['id'],
                    'name' => $size['name'],
                    'width' => $width,
                    'height' => $height,
                    'dimensions' => $size['dimensions'],
                    'basePrice' => (float)$size['base_price'],
                    'supportsPrintCanvas' => (bool)$size['supports_print_canvas'],
                    'supportsPrintHartie' => (bool)$size['supports_print_hartie'],
                    'active' => (bool)$size['is_active'],
                    'createdAt' => $size['created_at'],
                    'updatedAt' => $size['updated_at']
                ];
            }, $sizes);
            
            jsonResponse($result);
            break;
            
        case 'POST':
            // Create new size (admin only)
            $auth = requireAuth();
            $db = getDB();
            
            $data = json_decode(file_get_contents('php://input'), true);
            
            if (!isset($data['name']) || !isset($data['dimensions']) || !isset($data['basePrice'])) {
                jsonResponse(['error' => 'Missing required fields'], 400);
            }
            
            // Generate ID
            $id = 'size-' . str_replace('x', '-', $data['dimensions']);
            
            $stmt = $db->prepare("
                INSERT INTO sizes (id, name, dimensions, base_price, supports_print_canvas, supports_print_hartie, is_active)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            ");
            
            $stmt->execute([
                $id,
                $data['name'],
                $data['dimensions'],
                $data['basePrice'],
                $data['supportsPrintCanvas'] ?? true,
                $data['supportsPrintHartie'] ?? true,
                $data['active'] ?? true
            ]);
            
            // Fetch the created size
            $stmt = $db->prepare("SELECT * FROM sizes WHERE id = ?");
            $stmt->execute([$id]);
            $size = $stmt->fetch();
            
            // Parse dimensions
            $dims = explode('x', $size['dimensions']);
            $width = isset($dims[0]) ? (int)$dims[0] : 0;
            $height = isset($dims[1]) ? (int)$dims[1] : 0;
            
            jsonResponse([
                'success' => true,
                'size' => [
                    'id' => $size['id'],
                    'name' => $size['name'],
                    'width' => $width,
                    'height' => $height,
                    'dimensions' => $size['dimensions'],
                    'basePrice' => (float)$size['base_price'],
                    'supportsPrintCanvas' => (bool)$size['supports_print_canvas'],
                    'supportsPrintHartie' => (bool)$size['supports_print_hartie'],
                    'active' => (bool)$size['is_active'],
                    'createdAt' => $size['created_at'],
                    'updatedAt' => $size['updated_at']
                ]
            ]);
            break;
            
        case 'PUT':
            // Update size (admin only)
            $auth = requireAuth();
            $db = getDB();
            
            $data = json_decode(file_get_contents('php://input'), true);
            
            if (!isset($data['id'])) {
                jsonResponse(['error' => 'Size ID required'], 400);
            }
            
            $updates = [];
            $params = [];
            
            if (isset($data['name'])) {
                $updates[] = "name = ?";
                $params[] = $data['name'];
            }
            if (isset($data['dimensions'])) {
                $updates[] = "dimensions = ?";
                $params[] = $data['dimensions'];
            }
            if (isset($data['basePrice'])) {
                $updates[] = "base_price = ?";
                $params[] = $data['basePrice'];
            }
            if (isset($data['supportsPrintCanvas'])) {
                $updates[] = "supports_print_canvas = ?";
                $params[] = $data['supportsPrintCanvas'];
            }
            if (isset($data['supportsPrintHartie'])) {
                $updates[] = "supports_print_hartie = ?";
                $params[] = $data['supportsPrintHartie'];
            }
            if (isset($data['active'])) {
                $updates[] = "is_active = ?";
                $params[] = $data['active'];
            }
            
            if (empty($updates)) {
                jsonResponse(['error' => 'No fields to update'], 400);
            }
            
            $params[] = $data['id'];
            
            $sql = "UPDATE sizes SET " . implode(', ', $updates) . " WHERE id = ?";
            $stmt = $db->prepare($sql);
            $stmt->execute($params);
            
            // Fetch updated size
            $stmt = $db->prepare("SELECT * FROM sizes WHERE id = ?");
            $stmt->execute([$data['id']]);
            $size = $stmt->fetch();
            
            if (!$size) {
                jsonResponse(['error' => 'Size not found'], 404);
            }
            
            // Parse dimensions
            $dims = explode('x', $size['dimensions']);
            $width = isset($dims[0]) ? (int)$dims[0] : 0;
            $height = isset($dims[1]) ? (int)$dims[1] : 0;
            
            jsonResponse([
                'success' => true,
                'size' => [
                    'id' => $size['id'],
                    'name' => $size['name'],
                    'width' => $width,
                    'height' => $height,
                    'dimensions' => $size['dimensions'],
                    'basePrice' => (float)$size['base_price'],
                    'supportsPrintCanvas' => (bool)$size['supports_print_canvas'],
                    'supportsPrintHartie' => (bool)$size['supports_print_hartie'],
                    'active' => (bool)$size['is_active'],
                    'createdAt' => $size['created_at'],
                    'updatedAt' => $size['updated_at']
                ]
            ]);
            break;
            
        case 'DELETE':
            // Delete size (admin only)
            $auth = requireAuth();
            $db = getDB();
            
            $data = json_decode(file_get_contents('php://input'), true);
            
            if (!isset($data['id'])) {
                jsonResponse(['error' => 'Size ID required'], 400);
            }
            
            $stmt = $db->prepare("DELETE FROM sizes WHERE id = ?");
            $stmt->execute([$data['id']]);
            
            jsonResponse(['success' => true, 'message' => 'Size deleted']);
            break;
            
        default:
            jsonResponse(['error' => 'Method not allowed'], 405);
    }
} catch (PDOException $e) {
    error_log('Sizes API Error: ' . $e->getMessage());
    jsonResponse(['error' => 'Database error', 'message' => $e->getMessage()], 500);
} catch (Exception $e) {
    error_log('Sizes API Error: ' . $e->getMessage());
    jsonResponse(['error' => 'Server error', 'message' => $e->getMessage()], 500);
}