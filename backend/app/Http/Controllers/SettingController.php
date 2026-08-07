<?php
namespace App\Http\Controllers;

use Config\Database;
use App\Utils\Auth;

class SettingController {
    public function show() {
        $db = Database::getConnection();
        $subdomain = $_GET['subdomain'] ?? null;
        $user_id = Auth::getUserId(false, $subdomain);
        if (!$user_id) {
            http_response_code(401);
            echo json_encode(['error' => 'Unauthorized or missing subdomain']);
            exit;
        }

        $stmt = $db->prepare("SELECT theme_settings FROM users WHERE id = ?");
        $stmt->execute([$user_id]);
        $user = $stmt->fetch();
        
        if ($user && $user['theme_settings']) {
            echo $user['theme_settings'];
        } else {
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
    }

    public function update() {
        $db = Database::getConnection();
        $user_id = Auth::getUserId(true);
        if (!$user_id) {
            http_response_code(401);
            echo json_encode(['error' => 'Unauthorized or missing subdomain']);
            exit;
        }

        $data = file_get_contents('php://input');
        if (!json_decode($data)) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid JSON']);
            exit;
        }

        $stmt = $db->prepare("UPDATE users SET theme_settings = ? WHERE id = ?");
        $stmt->execute([$data, $user_id]);
        
        echo json_encode(['success' => true]);
    }
}
