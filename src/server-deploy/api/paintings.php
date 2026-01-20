<?php
// Paintings API Handler
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

// Now include config (which also sends headers, but we sent them first to be safe)
require_once __DIR__ . '/config.php';

try {
    $db = getDB();
    $method = $_SERVER['REQUEST_METHOD'];
    $requestUri = $_SERVER['REQUEST_URI'] ?? '/';
    
    // Extract path - handle /api/index.php/paintings format
    $path = $requestUri;
    $path = preg_replace('#\?.*$#', '', $path);
    $path = preg_replace('#^/api/index\.php/#', '', $path);
    $path = preg_replace('#^/api/#', '', $path);
    $path = trim($path, '/');
    
    error_log("🎨 Paintings Handler: METHOD={$method}, PATH={$path}");
    
    // GET /api/paintings - Get all paintings
    if ($method === 'GET' && preg_match('#^paintings/?$#', $path)) {
        try {
            // Admin users should see all paintings (active and inactive)
            // Public users only see active paintings
            // Check if authenticated (simple check - if Authorization header exists)
            $authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? '';
            $isAdmin = !empty($authHeader);
            
            if ($isAdmin) {
                // Admin: Get ALL paintings
                $stmt = $db->query("
                    SELECT p.*, c.name as category_name 
                    FROM paintings p
                    LEFT JOIN categories c ON p.category = c.id
                    ORDER BY p.created_at DESC
                ");
            } else {
                // Public: Only active paintings
                $stmt = $db->query("
                    SELECT p.*, c.name as category_name 
                    FROM paintings p
                    LEFT JOIN categories c ON p.category = c.id
                    WHERE p.is_active = 1
                    ORDER BY p.created_at DESC
                ");
            }
            
            $paintings = $stmt->fetchAll();
            
            // Parse JSON fields
            foreach ($paintings as &$painting) {
                $painting['available_sizes'] = json_decode($painting['available_sizes'] ?? '[]', true);
                $painting['variants'] = json_decode($painting['variants'] ?? '[]', true);
                
                // New fields for print types and frame types
                if (isset($painting['print_types'])) {
                    $painting['print_types'] = json_decode($painting['print_types'], true);
                }
                if (isset($painting['frame_types_by_print_type'])) {
                    $painting['frame_types_by_print_type'] = json_decode($painting['frame_types_by_print_type'], true);
                }
            }
            
            jsonResponse(['paintings' => $paintings]);
        } catch (Exception $e) {
            error_log("❌ Paintings fetch error: " . $e->getMessage());
            jsonResponse(['error' => 'Failed to fetch paintings: ' . $e->getMessage()], 500);
        }
    }
    
    // GET /api/paintings/{slug} - Get single painting
    elseif ($method === 'GET' && preg_match('#^paintings/([a-zA-Z0-9-]+)$#', $path, $matches)) {
        try {
            $slug = $matches[1];
            
            $stmt = $db->prepare("
                SELECT p.*, c.name as category_name, c.slug as category_slug
                FROM paintings p
                LEFT JOIN categories c ON p.category = c.id
                WHERE p.slug = ? AND p.is_active = 1
            ");
            $stmt->execute([$slug]);
            $painting = $stmt->fetch();
            
            if (!$painting) {
                jsonResponse(['error' => 'Painting not found'], 404);
            }
            
            // Parse JSON fields
            $painting['available_sizes'] = json_decode($painting['available_sizes'] ?? '[]', true);
            $painting['variants'] = json_decode($painting['variants'] ?? '[]', true);
            
            if (isset($painting['print_types'])) {
                $painting['print_types'] = json_decode($painting['print_types'], true);
            }
            if (isset($painting['frame_types_by_print_type'])) {
                $painting['frame_types_by_print_type'] = json_decode($painting['frame_types_by_print_type'], true);
            }
            
            jsonResponse(['painting' => $painting]);
        } catch (Exception $e) {
            error_log("❌ Painting fetch error: " . $e->getMessage());
            jsonResponse(['error' => 'Failed to fetch painting: ' . $e->getMessage()], 500);
        }
    }
    
    // POST /api/paintings - Create painting (Admin only)
    elseif ($method === 'POST' && preg_match('#^paintings/?$#', $path)) {
        $auth = requireAuth();
        
        try {
            $data = json_decode(file_get_contents('php://input'), true);
            
            $id = 'painting-' . time() . '-' . uniqid();
            $slug = strtolower(preg_replace('/[^a-zA-Z0-9]+/', '-', $data['title']));
            
            $stmt = $db->prepare("
                INSERT INTO paintings (
                    id, slug, title, category, description, image, 
                    available_sizes, variants, price, discount, is_active, created_at
                ) VALUES (
                    :id, :slug, :title, :category, :description, :image,
                    :sizes, :variants, :price, :discount, :active, NOW()
                )
            ");
            
            $stmt->execute([
                'id' => $id,
                'slug' => $slug,
                'title' => $data['title'],
                'category' => $data['category'],
                'description' => $data['description'] ?? '',
                'image' => $data['image'],
                'sizes' => json_encode($data['available_sizes'] ?? []),
                'variants' => json_encode($data['variants'] ?? []),
                'price' => $data['price'] ?? 0,
                'discount' => $data['discount'] ?? 0,
                'active' => $data['is_active'] ?? 1
            ]);
            
            // Fetch and return the created painting
            $fetchStmt = $db->prepare("
                SELECT p.*, c.name as category_name 
                FROM paintings p
                LEFT JOIN categories c ON p.category = c.id
                WHERE p.id = ?
            ");
            $fetchStmt->execute([$id]);
            $painting = $fetchStmt->fetch();
            
            if ($painting) {
                $painting['available_sizes'] = json_decode($painting['available_sizes'] ?? '[]', true);
                $painting['variants'] = json_decode($painting['variants'] ?? '[]', true);
            }
            
            jsonResponse([
                'success' => true, 
                'id' => $id, 
                'slug' => $slug,
                'painting' => $painting
            ], 201);
        } catch (Exception $e) {
            error_log("❌ Painting create error: " . $e->getMessage());
            jsonResponse(['error' => 'Failed to create painting: ' . $e->getMessage()], 500);
        }
    }
    
    // PUT /api/paintings/{id} - Update painting (Admin only)
    elseif ($method === 'PUT' && preg_match('#^/?paintings/([a-zA-Z0-9-]+)/?$#', $path, $matches)) {
        $auth = requireAuth();
        
        try {
            $id = $matches[1];
            $data = json_decode(file_get_contents('php://input'), true);
            
            $stmt = $db->prepare("
                UPDATE paintings SET
                    title = :title,
                    category = :category,
                    description = :description,
                    image = :image,
                    available_sizes = :sizes,
                    variants = :variants,
                    price = :price,
                    discount = :discount,
                    is_active = :active
                WHERE id = :id
            ");
            
            $stmt->execute([
                'id' => $id,
                'title' => $data['title'],
                'category' => $data['category'],
                'description' => $data['description'] ?? '',
                'image' => $data['image'],
                'sizes' => json_encode($data['available_sizes'] ?? []),
                'variants' => json_encode($data['variants'] ?? []),
                'price' => $data['price'] ?? 0,
                'discount' => $data['discount'] ?? 0,
                'active' => $data['is_active'] ?? 1
            ]);
            
            jsonResponse(['success' => true, 'id' => $id]);
        } catch (Exception $e) {
            error_log("❌ Painting update error: " . $e->getMessage());
            jsonResponse(['error' => 'Failed to update painting: ' . $e->getMessage()], 500);
        }
    }
    
    // DELETE /api/paintings/{id} - Delete painting (Admin only)
    elseif ($method === 'DELETE' && preg_match('#^/?paintings/([a-zA-Z0-9-]+)/?$#', $path, $matches)) {
        $auth = requireAuth();
        
        try {
            $id = $matches[1];
            
            $stmt = $db->prepare("DELETE FROM paintings WHERE id = ?");
            $stmt->execute([$id]);
            
            jsonResponse(['success' => true, 'id' => $id]);
        } catch (Exception $e) {
            error_log("❌ Painting delete error: " . $e->getMessage());
            jsonResponse(['error' => 'Failed to delete painting: ' . $e->getMessage()], 500);
        }
    }
    
    // No matching route
    else {
        jsonResponse(['error' => 'Paintings endpoint not found: ' . $method . ' ' . $path], 404);
    }
    
} catch (Exception $e) {
    error_log("❌ CRITICAL Paintings error: " . $e->getMessage());
    jsonResponse(['error' => 'Server error: ' . $e->getMessage()], 500);
}
