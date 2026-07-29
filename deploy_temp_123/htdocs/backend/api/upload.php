<?php
require_once __DIR__ . '/../db.php';
require_once __DIR__ . '/../jwt.php';

$method = $_SERVER['REQUEST_METHOD'];

// Verify JWT token for upload
$token = get_bearer_token();
if (!$token) {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}

$payload = verify_jwt($token);
if (!$payload || !isset($payload['id'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Invalid token']);
    exit;
}

if ($method !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

if (!isset($_FILES['file'])) {
    http_response_code(400);
    echo json_encode(['error' => 'No file uploaded']);
    exit;
}

$uploadDir = __DIR__ . '/../uploads/';
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
    // Generate public URL
    $protocol = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? 'https://' : 'http://';
    $host = $_SERVER['HTTP_HOST'] ?? 'localhost:8000';
    $url = $protocol . $host . '/uploads/' . $filename;
    
    echo json_encode(['success' => true, 'url' => $url]);
} else {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to move uploaded file']);
}
?>
