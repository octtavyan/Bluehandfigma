<?php
// BlueHand Canvas - Frame Types API
// Updated to match actual database structure
require_once __DIR__ . '/config.php';

$method = $_SERVER['REQUEST_METHOD'];

try {
    switch ($method) {
        case 'GET':
            // Get all active frame types
            $db = getDB();
            
            // Check if print_type filter is requested
            $printType = $_GET['print_type'] ?? null;
            
            if ($printType) {
                $stmt = $db->prepare("
                    SELECT 
                        id,
                        name,
                        print_type,
                        price_percentage,
                        is_active,
                        created_at,
                        updated_at
                    FROM frame_types
                    WHERE is_active = 1 AND print_type = ?
                    ORDER BY name ASC
                ");
                $stmt->execute([$printType]);
            } else {
                $stmt = $db->prepare("
                    SELECT 
                        id,
                        name,
                        print_type,
                        price_percentage,
                        is_active,
                        created_at,
                        updated_at
                    FROM frame_types
                    WHERE is_active = 1
                    ORDER BY print_type ASC, name ASC
                ");
                $stmt->execute();
            }
            
            $frameTypes = $stmt->fetchAll();
            
            // Transform to match frontend format
            $result = array_map(function($type) {
                return [
                    'id' => $type['id'],
                    'name' => $type['name'],
                    'slug' => $type['id'], // Use ID as slug since no slug column exists
                    'printType' => $type['print_type'],
                    'pricePercentage' => (float)$type['price_percentage'],
                    'active' => (bool)$type['is_active'],
                    'createdAt' => $type['created_at'],
                    'updatedAt' => $type['updated_at']
                ];
            }, $frameTypes);
            
            jsonResponse($result);
            break;
            
        case 'POST':
            // Create new frame type (admin only)
            $auth = requireAuth();
            $db = getDB();
            
            $data = json_decode(file_get_contents('php://input'), true);
            
            if (!isset($data['name']) || !isset($data['printType'])) {
                jsonResponse(['error' => 'Missing required fields'], 400);
            }
            
            // Generate ID
            $id = 'frame-' . strtolower(str_replace(' ', '-', $data['printType'])) . '-' . uniqid();
            
            $stmt = $db->prepare("
                INSERT INTO frame_types (id, name, print_type, price_percentage, is_active)
                VALUES (?, ?, ?, ?, ?)
            ");
            
            $stmt->execute([
                $id,
                $data['name'],
                $data['printType'],
                $data['pricePercentage'] ?? 0,
                $data['active'] ?? true
            ]);
            
            // Fetch the created frame type
            $stmt = $db->prepare("SELECT * FROM frame_types WHERE id = ?");
            $stmt->execute([$id]);
            $frameType = $stmt->fetch();
            
            jsonResponse([
                'success' => true,
                'frameType' => [
                    'id' => $frameType['id'],
                    'name' => $frameType['name'],
                    'slug' => $frameType['id'],
                    'printType' => $frameType['print_type'],
                    'pricePercentage' => (float)$frameType['price_percentage'],
                    'active' => (bool)$frameType['is_active'],
                    'createdAt' => $frameType['created_at'],
                    'updatedAt' => $frameType['updated_at']
                ]
            ]);
            break;
            
        case 'PUT':
            // Update frame type (admin only)
            $auth = requireAuth();
            $db = getDB();
            
            $data = json_decode(file_get_contents('php://input'), true);
            
            if (!isset($data['id'])) {
                jsonResponse(['error' => 'Frame type ID required'], 400);
            }
            
            $updates = [];
            $params = [];
            
            if (isset($data['name'])) {
                $updates[] = "name = ?";
                $params[] = $data['name'];
            }
            if (isset($data['printType'])) {
                $updates[] = "print_type = ?";
                $params[] = $data['printType'];
            }
            if (isset($data['pricePercentage'])) {
                $updates[] = "price_percentage = ?";
                $params[] = $data['pricePercentage'];
            }
            if (isset($data['active'])) {
                $updates[] = "is_active = ?";
                $params[] = $data['active'];
            }
            
            if (empty($updates)) {
                jsonResponse(['error' => 'No fields to update'], 400);
            }
            
            $params[] = $data['id'];
            
            $sql = "UPDATE frame_types SET " . implode(', ', $updates) . " WHERE id = ?";
            $stmt = $db->prepare($sql);
            $stmt->execute($params);
            
            // Fetch updated frame type
            $stmt = $db->prepare("SELECT * FROM frame_types WHERE id = ?");
            $stmt->execute([$data['id']]);
            $frameType = $stmt->fetch();
            
            if (!$frameType) {
                jsonResponse(['error' => 'Frame type not found'], 404);
            }
            
            jsonResponse([
                'success' => true,
                'frameType' => [
                    'id' => $frameType['id'],
                    'name' => $frameType['name'],
                    'slug' => $frameType['id'],
                    'printType' => $frameType['print_type'],
                    'pricePercentage' => (float)$frameType['price_percentage'],
                    'active' => (bool)$frameType['is_active'],
                    'createdAt' => $frameType['created_at'],
                    'updatedAt' => $frameType['updated_at']
                ]
            ]);
            break;
            
        case 'DELETE':
            // Delete frame type (admin only)
            $auth = requireAuth();
            $db = getDB();
            
            $data = json_decode(file_get_contents('php://input'), true);
            
            if (!isset($data['id'])) {
                jsonResponse(['error' => 'Frame type ID required'], 400);
            }
            
            $stmt = $db->prepare("DELETE FROM frame_types WHERE id = ?");
            $stmt->execute([$data['id']]);
            
            jsonResponse(['success' => true, 'message' => 'Frame type deleted']);
            break;
            
        default:
            jsonResponse(['error' => 'Method not allowed'], 405);
    }
} catch (PDOException $e) {
    error_log('Frame Types API Error: ' . $e->getMessage());
    jsonResponse(['error' => 'Database error', 'message' => $e->getMessage()], 500);
} catch (Exception $e) {
    error_log('Frame Types API Error: ' . $e->getMessage());
    jsonResponse(['error' => 'Server error', 'message' => $e->getMessage()], 500);
}