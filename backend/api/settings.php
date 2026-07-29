<?php
require_once __DIR__ . '/../db.php';

$method = $_SERVER['REQUEST_METHOD'];
$user_id = getUserId($db);

if (!$user_id) {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized or missing subdomain']);
    exit;
}

switch ($method) {
    case 'GET':
        // Return theme_settings for this user
        $stmt = $db->prepare("SELECT theme_settings FROM users WHERE id = ?");
        $stmt->execute([$user_id]);
        $user = $stmt->fetch();
        
        if ($user && $user['theme_settings']) {
            echo $user['theme_settings']; // It should already be a JSON string
        } else {
            // Return default settings
            echo json_encode([
                'storeName' => '',
                'announcementText' => '',
                'primaryColor' => '#4f46e5',
                'buttonRadius' => 'rounded',
                'headerLayout' => 'left',
                'fontFamily' => 'Inter',
                'heroTitle' => 'Welcome to our store',
                'heroSubtitle' => 'Discover our premium collection today.'
            ]);
        }
        break;

    case 'POST':
        // Ensure admin is logged in (not just passing ?subdomain)
        $headers = getallheaders();
        $is_admin = isset($headers['X-User-Id']) || isset($_SERVER['HTTP_X_USER_ID']);
        if (!$is_admin) {
            http_response_code(403);
            echo json_encode(['error' => 'Forbidden. Only logged in admins can update settings.']);
            exit;
        }

        $data = file_get_contents('php://input');
        // Validate JSON
        if (!json_decode($data)) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid JSON']);
            exit;
        }

        $stmt = $db->prepare("UPDATE users SET theme_settings = ? WHERE id = ?");
        $stmt->execute([$data, $user_id]);
        
        echo json_encode(['success' => true]);
        break;

    default:
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
        break;
}
?>
