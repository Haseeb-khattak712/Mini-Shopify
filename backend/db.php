<?php
// CORS headers to allow React frontend to fetch data from PHP API
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

// Handle preflight requests
if (isset($_SERVER['REQUEST_METHOD']) && $_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$db_file = __DIR__ . '/storekit.sqlite';

try {
    $db = new PDO("sqlite:" . $db_file);
    // Set errormode to exceptions
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    // Fetch assoc array by default
    $db->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);

    function getUserId($db) {
        // 1. If admin is logged in, they will send X-User-Id header
        $headers = getallheaders();
        if (isset($headers['X-User-Id'])) {
            return $headers['X-User-Id'];
        }
        if (isset($_SERVER['HTTP_X_USER_ID'])) {
            return $_SERVER['HTTP_X_USER_ID'];
        }

        // 2. If it's the storefront, they will send ?subdomain=...
        $subdomain = $_GET['subdomain'] ?? '';
        if ($subdomain) {
            $stmt = $db->prepare("SELECT id FROM users WHERE subdomain = ?");
            $stmt->execute([$subdomain]);
            $user = $stmt->fetch();
            if ($user) {
                return $user['id'];
            }
        }

        // If neither is provided or valid, return null
        return null;
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => "Database connection failed: " . $e->getMessage()]);
    exit();
}
?>
