<?php
require_once __DIR__ . '/jwt.php';
// CORS headers to allow React frontend to fetch data from PHP API
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-User-Id");
header("Content-Type: application/json");

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

    function getUserId($db) {
        $subdomain = $_GET['subdomain'] ?? '';
        if ($subdomain) {
            $stmt = $db->prepare("SELECT id FROM users WHERE subdomain = ?");
            $stmt->execute([$subdomain]);
            $user = $stmt->fetch();
            if ($user) {
                return $user['id'];
            }
        }

        $token = get_bearer_token();
        if ($token) {
            $payload = verify_jwt($token);
            if ($payload && isset($payload['id'])) {
                return $payload['id'];
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
