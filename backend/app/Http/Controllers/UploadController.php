<?php
namespace App\Http\Controllers;

use App\Utils\Auth;
use App\Utils\Jwt;

class UploadController {
    public function store() {
        $token = Auth::getBearerToken();
        if (!$token) {
            http_response_code(401);
            echo json_encode(['error' => 'Unauthorized']);
            exit;
        }

        $payload = Jwt::verify($token);
        if (!$payload || !isset($payload['id'])) {
            http_response_code(401);
            echo json_encode(['error' => 'Invalid token']);
            exit;
        }

        if (!isset($_FILES['file'])) {
            http_response_code(400);
            echo json_encode(['error' => 'No file uploaded']);
            exit;
        }

        $uploadDir = __DIR__ . '/../../../public/uploads/';
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0755, true);
        }

        $file = $_FILES['file'];
        if ($file['error'] !== UPLOAD_ERR_OK) {
            http_response_code(500);
            echo json_encode(['error' => 'Upload error code: ' . $file['error']]);
            exit;
        }

        $ext = pathinfo($file['name'], PATHINFO_EXTENSION);
        $filename = uniqid('file_') . '_' . time() . '.' . $ext;
        $targetPath = $uploadDir . $filename;

        if (move_uploaded_file($file['tmp_name'], $targetPath)) {
            $protocol = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? 'https://' : 'http://';
            $host = $_SERVER['HTTP_HOST'] ?? 'localhost:8000';
            
            // dynamically determine base path
            $scriptName = $_SERVER['SCRIPT_NAME'];
            $base = str_replace(['/public/index.php', '/server.php'], '', $scriptName);
            
            $url = $protocol . $host . $base . '/uploads/' . $filename;
            
            echo json_encode(['success' => true, 'url' => $url]);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to move uploaded file']);
        }
    }
}
