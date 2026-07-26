<?php
require_once __DIR__ . '/../db.php';

$method = $_SERVER['REQUEST_METHOD'];
if ($method !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

$action = $_GET['action'] ?? '';
$data = json_decode(file_get_contents('php://input'), true);

if (!$data) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid JSON']);
    exit;
}

if ($action === 'register') {
    $email = $data['email'] ?? '';
    $password = $data['password'] ?? '';
    $biz = $data['biz'] ?? '';
    $subdomain = $data['subdomain'] ?? '';

    if (!$email || !$password || !$biz || !$subdomain) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing required fields']);
        exit;
    }

    // Check if email or subdomain exists
    $stmt = $db->prepare("SELECT COUNT(*) as count FROM users WHERE email = ? OR subdomain = ?");
    $stmt->execute([$email, $subdomain]);
    $row = $stmt->fetch();
    if ($row['count'] > 0) {
        http_response_code(409);
        echo json_encode(['error' => 'Email or subdomain already exists']);
        exit;
    }

    $id = 'usr_' . time();
    $hash = password_hash($password, PASSWORD_DEFAULT);

    $stmt = $db->prepare("INSERT INTO users (id, email, password_hash, business_name, subdomain) VALUES (?, ?, ?, ?, ?)");
    $stmt->execute([$id, $email, $hash, $biz, $subdomain]);

    echo json_encode(['success' => true, 'id' => $id]);
} 
elseif ($action === 'login') {
    $email = $data['email'] ?? '';
    $password = $data['password'] ?? '';

    if (!$email || !$password) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing email or password']);
        exit;
    }

    $stmt = $db->prepare("SELECT id, password_hash, business_name, subdomain FROM users WHERE email = ?");
    $stmt->execute([$email]);
    $user = $stmt->fetch();

    if ($user && password_verify($password, $user['password_hash'])) {
        // Successful login
        echo json_encode([
            'success' => true,
            'user' => [
                'id' => $user['id'],
                'email' => $email,
                'business_name' => $user['business_name'],
                'subdomain' => $user['subdomain']
            ]
        ]);
    } else {
        http_response_code(401);
        echo json_encode(['error' => 'Invalid email or password']);
    }
} 
else {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid action']);
}
?>
