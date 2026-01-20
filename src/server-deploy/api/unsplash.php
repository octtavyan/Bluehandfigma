<?php
// Unsplash Management API Handler
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

$db = getDB();
$path = preg_replace('#^/api/#', '', $_SERVER['REQUEST_URI'] ?? '/');
$path = preg_replace('#\?.*$#', '', $path);
$method = $_SERVER['REQUEST_METHOD'];

// POST /api/unsplash/save-search - Save search query and results
if ($method === 'POST' && preg_match('#^/?unsplash/save-search/?$#', $path)) {
    try {
        $data = json_decode(file_get_contents('php://input'), true);
        
        $query = $data['query'] ?? '';
        $results = $data['results'] ?? [];
        $totalResults = $data['total_results'] ?? 0;
        
        if (empty($query)) {
            jsonResponse(['error' => 'Query is required'], 400);
        }
        
        // Convert results array to JSON
        $resultsJson = json_encode($results);
        
        // Insert search record
        $stmt = $db->prepare("
            INSERT INTO unsplash_searches (query, results, total_results, searched_at)
            VALUES (?, ?, ?, NOW())
        ");
        $stmt->execute([$query, $resultsJson, $totalResults]);
        
        jsonResponse([
            'success' => true,
            'search_id' => $db->lastInsertId()
        ]);
    } catch (Exception $e) {
        jsonResponse(['error' => 'Failed to save search: ' . $e->getMessage()], 500);
    }
}

// GET /api/unsplash/search-history - Get search history with pagination
if ($method === 'GET' && preg_match('#^/?unsplash/search-history/?$#', $path)) {
    try {
        $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
        $perPage = isset($_GET['per_page']) ? (int)$_GET['per_page'] : 20;
        $offset = ($page - 1) * $perPage;
        
        // Get total count
        $stmt = $db->query("SELECT COUNT(*) as total FROM unsplash_searches");
        $totalCount = $stmt->fetch()['total'];
        
        // Get paginated searches
        $stmt = $db->prepare("
            SELECT id, query, results, total_results, searched_at
            FROM unsplash_searches
            ORDER BY searched_at DESC
            LIMIT ? OFFSET ?
        ");
        $stmt->execute([$perPage, $offset]);
        $searches = $stmt->fetchAll();
        
        // Decode results JSON for each search
        foreach ($searches as &$search) {
            $search['results'] = json_decode($search['results'], true);
        }
        
        jsonResponse([
            'success' => true,
            'searches' => $searches,
            'pagination' => [
                'current_page' => $page,
                'per_page' => $perPage,
                'total' => $totalCount,
                'total_pages' => ceil($totalCount / $perPage)
            ]
        ]);
    } catch (Exception $e) {
        jsonResponse(['error' => 'Failed to load search history: ' . $e->getMessage()], 500);
    }
}

// GET /api/unsplash/search-stats - Get search statistics (top searches)
if ($method === 'GET' && preg_match('#^/?unsplash/search-stats/?$#', $path)) {
    try {
        // Get top 20 most searched queries
        $stmt = $db->query("
            SELECT query, COUNT(*) as count
            FROM unsplash_searches
            GROUP BY query
            ORDER BY count DESC
            LIMIT 20
        ");
        $topSearches = $stmt->fetchAll();
        
        // Get total searches
        $stmt = $db->query("SELECT COUNT(*) as total FROM unsplash_searches");
        $totalSearches = $stmt->fetch()['total'];
        
        jsonResponse([
            'success' => true,
            'topSearches' => $topSearches,
            'totalSearches' => $totalSearches
        ]);
    } catch (Exception $e) {
        jsonResponse(['error' => 'Failed to load search stats: ' . $e->getMessage()], 500);
    }
}

// GET /api/unsplash/settings - Get Unsplash settings
if ($method === 'GET' && preg_match('#^/?unsplash/settings/?$#', $path)) {
    try {
        $stmt = $db->query("
            SELECT settings_value 
            FROM system_settings 
            WHERE settings_key = 'unsplash_config'
            LIMIT 1
        ");
        $row = $stmt->fetch();
        
        if ($row) {
            $settings = json_decode($row['settings_value'], true);
            jsonResponse([
                'success' => true,
                'settings' => $settings
            ]);
        } else {
            // Return default settings
            jsonResponse([
                'success' => true,
                'settings' => [
                    'curatedQueries' => ['nature', 'abstract', 'architecture', 'minimal', 'landscape'],
                    'randomImageCount' => 24,
                    'refreshOnPageLoad' => true
                ]
            ]);
        }
    } catch (Exception $e) {
        jsonResponse(['error' => 'Failed to load settings: ' . $e->getMessage()], 500);
    }
}

// POST /api/unsplash/settings - Save Unsplash settings
if ($method === 'POST' && preg_match('#^/?unsplash/settings/?$#', $path)) {
    try {
        $data = json_decode(file_get_contents('php://input'), true);
        $settings = $data['settings'] ?? [];
        
        if (empty($settings)) {
            jsonResponse(['error' => 'Settings are required'], 400);
        }
        
        $settingsJson = json_encode($settings);
        
        // Upsert settings
        $stmt = $db->prepare("
            INSERT INTO system_settings (settings_key, settings_value, updated_at)
            VALUES ('unsplash_config', ?, NOW())
            ON DUPLICATE KEY UPDATE settings_value = ?, updated_at = NOW()
        ");
        $stmt->execute([$settingsJson, $settingsJson]);
        
        jsonResponse([
            'success' => true,
            'message' => 'Settings saved successfully'
        ]);
    } catch (Exception $e) {
        jsonResponse(['error' => 'Failed to save settings: ' . $e->getMessage()], 500);
    }
}

// DELETE /api/unsplash/search-history/:id - Delete a search record
if ($method === 'DELETE' && preg_match('#^/?unsplash/search-history/(\d+)/?$#', $path, $matches)) {
    try {
        $searchId = $matches[1];
        
        $stmt = $db->prepare("DELETE FROM unsplash_searches WHERE id = ?");
        $stmt->execute([$searchId]);
        
        if ($stmt->rowCount() > 0) {
            jsonResponse([
                'success' => true,
                'message' => 'Search deleted successfully'
            ]);
        } else {
            jsonResponse(['error' => 'Search not found'], 404);
        }
    } catch (Exception $e) {
        jsonResponse(['error' => 'Failed to delete search: ' . $e->getMessage()], 500);
    }
}

// If we get here, method not allowed
jsonResponse(['error' => 'Method not allowed for this endpoint'], 405);
