<?php
require_once __DIR__ . '/../db.php';

$method = $_SERVER['REQUEST_METHOD'];

// Get the user ID from headers (authenticated user)
$auth_user_id = null;
$headers = getallheaders();
if (isset($headers['X-User-Id'])) {
    $auth_user_id = $headers['X-User-Id'];
} elseif (isset($_SERVER['HTTP_X_USER_ID'])) {
    $auth_user_id = $_SERVER['HTTP_X_USER_ID'];
}

// Get store owner ID from subdomain
$subdomain = $_GET['subdomain'] ?? '';
$store_owner_id = null;
if ($subdomain) {
    $stmt = $db->prepare("SELECT id FROM users WHERE subdomain = ?");
    $stmt->execute([$subdomain]);
    $store = $stmt->fetch();
    if ($store) {
        $store_owner_id = $store['id'];
    }
}

// Determine role of authenticated user
$role = 'customer';
if ($auth_user_id) {
    $stmt = $db->prepare("SELECT role FROM users WHERE id = ?");
    $stmt->execute([$auth_user_id]);
    $user = $stmt->fetch();
    if ($user) {
        $role = $user['role'];
    }
}

switch ($method) {
    case 'GET':
        if (!$auth_user_id && !$store_owner_id) {
            http_response_code(401);
            echo json_encode(['error' => 'Unauthorized']);
            exit;
        }

        if ($role === 'admin' && $auth_user_id) {
            // Admin fetching their store's orders
            $stmt = $db->prepare("SELECT * FROM orders WHERE user_id = ? ORDER BY date DESC, id DESC");
            $stmt->execute([$auth_user_id]);
        } else if ($auth_user_id) {
            // Customer fetching their personal orders across all stores
            $stmt = $db->prepare("SELECT * FROM orders WHERE customer_id = ? ORDER BY date DESC, id DESC");
            $stmt->execute([$auth_user_id]);
        } else {
            // Unauthenticated GET for a store (e.g. storefront demo)
            // Ideally this shouldn't happen or should be restricted, but preserving original logic
            $stmt = $db->prepare("SELECT * FROM orders WHERE user_id = ? ORDER BY date DESC, id DESC");
            $stmt->execute([$store_owner_id]);
        }
        
        $orders = $stmt->fetchAll();
        foreach ($orders as &$o) {
            $o['items'] = json_decode($o['items'], true) ?: [];
        }
        echo json_encode($orders);
        break;

    case 'POST':
        $data = json_decode(file_get_contents('php://input'), true);
        if (!$data) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid JSON']);
            exit;
        }
        
        if (!$store_owner_id) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing or invalid store subdomain']);
            exit;
        }

        $id = $data['id'] ?? 'ORD-' . rand(1000, 9999);
        $items = json_encode($data['items'] ?? []);

        $stmt = $db->prepare("INSERT INTO orders (id, user_id, customer_id, customer, total, date, status, items) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
        $stmt->execute([
            $id,
            $store_owner_id,
            $data['customer_id'] ?? null,
            $data['customer'],
            $data['total'],
            $data['date'] ?? date('Y-m-d'),
            $data['status'] ?? 'processing',
            $items
        ]);
        
        echo json_encode(['success' => true, 'id' => $id]);
        break;

    case 'PUT':
        $data = json_decode(file_get_contents('php://input'), true);
        if (!$data || !isset($data['id'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid JSON or missing id']);
            exit;
        }
        
        if ($role !== 'admin' || !$auth_user_id) {
            http_response_code(403);
            echo json_encode(['error' => 'Forbidden']);
            exit;
        }

        $stmt = $db->prepare("UPDATE orders SET status=? WHERE id=? AND user_id=?");
        $stmt->execute([
            $data['status'],
            $data['id'],
            $auth_user_id
        ]);
        
        echo json_encode(['success' => true]);
        break;
}
?>
