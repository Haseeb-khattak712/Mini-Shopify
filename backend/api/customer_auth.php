<?php
require_once __DIR__ . '/../db.php';

$action = $_GET['action'] ?? null;
$data = json_decode(file_get_contents('php://input'), true);

if (!$data) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid JSON']);
    exit;
}

// Customers are always bound to a specific store owner (user_id), which is looked up via subdomain.
$subdomain = $data['subdomain'] ?? '';
if (!$subdomain) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing store subdomain']);
    exit;
}

$stmt = $db->prepare("SELECT id FROM users WHERE subdomain = ?");
$stmt->execute([$subdomain]);
$storeOwner = $stmt->fetch();

if (!$storeOwner) {
    http_response_code(404);
    echo json_encode(['error' => 'Store not found']);
    exit;
}

$user_id = $storeOwner['id'];

if ($action === 'register') {
    $name = $data['name'] ?? '';
    $email = $data['email'] ?? '';
    $password = $data['password'] ?? '';

    if (!$name || !$email || !$password) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing fields']);
        exit;
    }

    // Check if customer already exists for this store
    $stmt = $db->prepare("SELECT id FROM customers WHERE user_id = ? AND email = ?");
    $stmt->execute([$user_id, $email]);
    if ($stmt->fetch()) {
        http_response_code(400);
        echo json_encode(['error' => 'Account already exists for this store']);
        exit;
    }

    $id = 'cus_' . bin2hex(random_bytes(8));
    $hash = password_hash($password, PASSWORD_DEFAULT);

    $stmt = $db->prepare("INSERT INTO customers (id, user_id, name, email, password_hash) VALUES (?, ?, ?, ?, ?)");
    $stmt->execute([$id, $user_id, $name, $email, $hash]);

    echo json_encode([
        'success' => true,
        'customer' => [
            'id' => $id,
            'name' => $name,
            'email' => $email,
            'subdomain' => $subdomain
        ]
    ]);
} elseif ($action === 'login') {
    $email = $data['email'] ?? '';
    $password = $data['password'] ?? '';

    if (!$email || !$password) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing credentials']);
        exit;
    }

    $stmt = $db->prepare("SELECT id, name, password_hash FROM customers WHERE user_id = ? AND email = ?");
    $stmt->execute([$user_id, $email]);
    $customer = $stmt->fetch();

    if ($customer && password_verify($password, $customer['password_hash'])) {
        echo json_encode([
            'success' => true,
            'customer' => [
                'id' => $customer['id'],
                'name' => $customer['name'],
                'email' => $email,
                'subdomain' => $subdomain
            ]
        ]);
    } else {
        http_response_code(401);
        echo json_encode(['error' => 'Invalid email or password']);
    }
} else {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid action']);
}
?>
