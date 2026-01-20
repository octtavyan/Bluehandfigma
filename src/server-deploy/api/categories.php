<?php
// BlueHand Canvas - Categories API
// Updated to match actual database structure
require_once __DIR__ . '/config.php';

$method = $_SERVER['REQUEST_METHOD'];

try {
    switch ($method) {
        case 'GET':
            // Get all active categories
            $db = getDB();
            $stmt = $db->prepare("
                SELECT 
                    id,
                    name,
                    slug,
                    description,
                    parent_id,
                    order_index,
                    is_active,
                    created_at,
                    updated_at
                FROM categories
                WHERE is_active = 1
                ORDER BY order_index ASC, name ASC
            ");
            $stmt->execute();
            $categories = $stmt->fetchAll();
            
            // Transform to match frontend format
            $result = array_map(function($cat) {
                return [
                    'id' => $cat['id'],
                    'name' => $cat['name'],
                    'slug' => $cat['slug'],
                    'description' => $cat['description'],
                    'parentId' => $cat['parent_id'],
                    'sortOrder' => (int)$cat['order_index'], // Map order_index to sortOrder
                    'active' => (bool)$cat['is_active'], // Map is_active to active
                    'createdAt' => $cat['created_at'],
                    'updatedAt' => $cat['updated_at']
                ];
            }, $categories);
            
            jsonResponse($result);
            break;
            
        case 'POST':
            // Create new category (admin only)
            $auth = requireAuth();
            $db = getDB();
            
            $data = json_decode(file_get_contents('php://input'), true);
            
            if (!isset($data['name']) || !isset($data['slug'])) {
                jsonResponse(['error' => 'Missing required fields'], 400);
            }
            
            // Generate ID
            $id = 'cat-' . uniqid();
            
            $stmt = $db->prepare("
                INSERT INTO categories (id, name, slug, description, parent_id, order_index, is_active)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            ");
            
            $stmt->execute([
                $id,
                $data['name'],
                $data['slug'],
                $data['description'] ?? null,
                $data['parentId'] ?? null,
                $data['sortOrder'] ?? 0,
                $data['active'] ?? true
            ]);
            
            // Fetch the created category
            $stmt = $db->prepare("SELECT * FROM categories WHERE id = ?");
            $stmt->execute([$id]);
            $category = $stmt->fetch();
            
            jsonResponse([
                'success' => true,
                'category' => [
                    'id' => $category['id'],
                    'name' => $category['name'],
                    'slug' => $category['slug'],
                    'description' => $category['description'],
                    'parentId' => $category['parent_id'],
                    'sortOrder' => (int)$category['order_index'],
                    'active' => (bool)$category['is_active'],
                    'createdAt' => $category['created_at'],
                    'updatedAt' => $category['updated_at']
                ]
            ]);
            break;
            
        case 'PUT':
            // Update category (admin only)
            $auth = requireAuth();
            $db = getDB();
            
            $data = json_decode(file_get_contents('php://input'), true);
            
            if (!isset($data['id'])) {
                jsonResponse(['error' => 'Category ID required'], 400);
            }
            
            $updates = [];
            $params = [];
            
            if (isset($data['name'])) {
                $updates[] = "name = ?";
                $params[] = $data['name'];
            }
            if (isset($data['slug'])) {
                $updates[] = "slug = ?";
                $params[] = $data['slug'];
            }
            if (isset($data['description'])) {
                $updates[] = "description = ?";
                $params[] = $data['description'];
            }
            if (isset($data['parentId'])) {
                $updates[] = "parent_id = ?";
                $params[] = $data['parentId'];
            }
            if (isset($data['sortOrder'])) {
                $updates[] = "order_index = ?";
                $params[] = $data['sortOrder'];
            }
            if (isset($data['active'])) {
                $updates[] = "is_active = ?";
                $params[] = $data['active'];
            }
            
            if (empty($updates)) {
                jsonResponse(['error' => 'No fields to update'], 400);
            }
            
            $params[] = $data['id'];
            
            $sql = "UPDATE categories SET " . implode(', ', $updates) . " WHERE id = ?";
            $stmt = $db->prepare($sql);
            $stmt->execute($params);
            
            // Fetch updated category
            $stmt = $db->prepare("SELECT * FROM categories WHERE id = ?");
            $stmt->execute([$data['id']]);
            $category = $stmt->fetch();
            
            if (!$category) {
                jsonResponse(['error' => 'Category not found'], 404);
            }
            
            jsonResponse([
                'success' => true,
                'category' => [
                    'id' => $category['id'],
                    'name' => $category['name'],
                    'slug' => $category['slug'],
                    'description' => $category['description'],
                    'parentId' => $category['parent_id'],
                    'sortOrder' => (int)$category['order_index'],
                    'active' => (bool)$category['is_active'],
                    'createdAt' => $category['created_at'],
                    'updatedAt' => $category['updated_at']
                ]
            ]);
            break;
            
        case 'DELETE':
            // Delete category (admin only)
            $auth = requireAuth();
            $db = getDB();
            
            $data = json_decode(file_get_contents('php://input'), true);
            
            if (!isset($data['id'])) {
                jsonResponse(['error' => 'Category ID required'], 400);
            }
            
            $stmt = $db->prepare("DELETE FROM categories WHERE id = ?");
            $stmt->execute([$data['id']]);
            
            jsonResponse(['success' => true, 'message' => 'Category deleted']);
            break;
            
        default:
            jsonResponse(['error' => 'Method not allowed'], 405);
    }
} catch (PDOException $e) {
    error_log('Categories API Error: ' . $e->getMessage());
    jsonResponse(['error' => 'Database error', 'message' => $e->getMessage()], 500);
} catch (Exception $e) {
    error_log('Categories API Error: ' . $e->getMessage());
    jsonResponse(['error' => 'Server error', 'message' => $e->getMessage()], 500);
}