<?php
require_once __DIR__ . '/../db.php';
require_once __DIR__ . '/../jwt.php';

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
    // Register as a customer or admin
    $name = $data['name'] ?? '';
    $email = $data['email'] ?? '';
    $password = $data['password'] ?? '';
    $role = $data['role'] ?? 'customer';
    
    if (!$name || !$email || !$password) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing required fields']);
        exit;
    }
    
    $business_name = null;
    $subdomain = null;
    
    if ($role === 'admin') {
        $business_name = $data['business_name'] ?? '';
        $subdomain = $data['subdomain'] ?? '';
        if (!$business_name || !$subdomain) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing business_name or subdomain for seller account']);
            exit;
        }
        
        $stmt = $db->prepare("SELECT COUNT(*) as cnt FROM users WHERE subdomain = ?");
        $stmt->execute([$subdomain]);
        $row = $stmt->fetch();
        if ($row['cnt'] > 0) {
            http_response_code(409);
            echo json_encode(['error' => 'Subdomain already taken']);
            exit;
        }
    }
    
    // Ensure email is unique
    $stmt = $db->prepare("SELECT COUNT(*) as cnt FROM users WHERE email = ?");
    $stmt->execute([$email]);
    $row = $stmt->fetch();
    if ($row['cnt'] > 0) {
        http_response_code(409);
        echo json_encode(['error' => 'Email already exists']);
        exit;
    }
    
    $id = 'usr_' . bin2hex(random_bytes(8));
    $hash = password_hash($password, PASSWORD_DEFAULT);
    
    $stmt = $db->prepare("INSERT INTO users (id, name, email, password_hash, role, business_name, subdomain) VALUES (?, ?, ?, ?, ?, ?, ?)");
    $stmt->execute([$id, $name, $email, $hash, $role, $business_name, $subdomain]);
    
    $token = generate_jwt(['id' => $id, 'role' => $role]);
    
    echo json_encode(['success' => true, 'id' => $id, 'token' => $token]);
}
elseif ($action === 'login') {
    $email = $data['email'] ?? '';
    $password = $data['password'] ?? '';
    if (!$email || !$password) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing email or password']);
        exit;
    }
    $stmt = $db->prepare("SELECT id, name, email, password_hash, role, business_name, subdomain FROM users WHERE email = ?");
    $stmt->execute([$email]);
    $user = $stmt->fetch();
    if ($user && password_verify($password, $user['password_hash'])) {
        $token = generate_jwt(['id' => $user['id'], 'role' => $user['role']]);
        
        echo json_encode([
            'success' => true,
            'token' => $token,
            'user' => [
                'id' => $user['id'],
                'name' => $user['name'],
                'email' => $user['email'],
                'role' => $user['role'],
                'business_name' => $user['business_name'],
                'subdomain' => $user['subdomain']
            ]
        ]);
    } else {
        http_response_code(401);
        echo json_encode(['error' => 'Invalid email or password']);
    }
}
elseif ($action === 'upgrade') {
    // Upgrade a logged-in customer to admin (store owner)
    $token = get_bearer_token();
    if (!$token) {
        http_response_code(401);
        echo json_encode(['error' => 'Unauthorized: Missing token']);
        exit;
    }
    $payload = verify_jwt($token);
    if (!$payload || !isset($payload['id'])) {
        http_response_code(401);
        echo json_encode(['error' => 'Unauthorized: Invalid token']);
        exit;
    }
    $adminId = $payload['id'];
    $business_name = $data['business_name'] ?? '';
    $subdomain = $data['subdomain'] ?? '';
    if (!$business_name || !$subdomain) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing business_name or subdomain']);
        exit;
    }
    // Check subdomain uniqueness
    $stmt = $db->prepare("SELECT COUNT(*) as cnt FROM users WHERE subdomain = ?");
    $stmt->execute([$subdomain]);
    $row = $stmt->fetch();
    if ($row['cnt'] > 0) {
        http_response_code(409);
        echo json_encode(['error' => 'Subdomain already taken']);
        exit;
    }
    // Update user record
    $stmt = $db->prepare("UPDATE users SET role = 'admin', business_name = ?, subdomain = ? WHERE id = ?");
    $stmt->execute([$business_name, $subdomain, $adminId]);
    echo json_encode(['success' => true]);
}
else {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid action']);
}
?>
