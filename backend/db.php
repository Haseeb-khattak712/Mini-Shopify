<?php
require_once __DIR__ . '/jwt.php';
// CORS headers to allow React frontend to fetch data from PHP API
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-User-Id");
header("Content-Type: application/json");
header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
header("Cache-Control: post-check=0, pre-check=0", false);
header("Pragma: no-cache");

// Handle preflight requests
if (isset($_SERVER['REQUEST_METHOD']) && $_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$db_file = __DIR__ . '/ownstore.sqlite';

try {
    $db = new PDO("sqlite:" . $db_file);
    // Set errormode to exceptions
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    // Fetch assoc array by default
    $db->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);

    // Auto-initialize database if empty
    $check = $db->query("SELECT name FROM sqlite_master WHERE type='table' AND name='users'");
    if (!$check->fetch()) {
        require_once __DIR__ . '/init_db.php';
    } else {
        // Migration: add missing columns to products table if they don't exist
        $cols = $db->query("PRAGMA table_info(products)")->fetchAll();
        $colNames = array_column($cols, 'name');
        
        if (!in_array('is_digital', $colNames)) {
            $db->exec("ALTER TABLE products ADD COLUMN is_digital INTEGER DEFAULT 0");
        }
        if (!in_array('file_url', $colNames)) {
            $db->exec("ALTER TABLE products ADD COLUMN file_url TEXT");
        }
        if (!in_array('variant_stock', $colNames)) {
            $db->exec("ALTER TABLE products ADD COLUMN variant_stock TEXT");
        }
    }

    function getUserId($db, $requireAuth = false) {
        $token = get_bearer_token();
        if ($token) {
            $payload = verify_jwt($token);
            if ($payload && isset($payload['id'])) {
                return $payload['id'];
            }
        }

        // If auth is required but token missing/invalid, fail immediately
        if ($requireAuth) {
            return null;
        }

        // For public endpoints, fallback to subdomain
        $subdomain = $_GET['subdomain'] ?? '';
        if ($subdomain) {
            $stmt = $db->prepare("SELECT id FROM users WHERE subdomain = ?");
            $stmt->execute([$subdomain]);
            $user = $stmt->fetch();
            if ($user) {
                return $user['id'];
            }
        }

        return null;
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => "Database connection failed: " . $e->getMessage()]);
    exit();
}
?>
