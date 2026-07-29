<?php
require_once __DIR__ . '/../db.php';
require_once __DIR__ . '/../jwt.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

$headers = getallheaders();
$authHeader = isset($headers['Authorization']) ? $headers['Authorization'] : '';
$userId = null;
$role = null;

if (preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
    $jwt = $matches[1];
    $payload = verify_jwt($jwt);
    if ($payload) {
        $userId = $payload['user_id'];
        $role = $payload['role'];
    }
}

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    if (!$userId || $role !== 'admin') {
        echo json_encode(['error' => 'Unauthorized']);
        exit;
    }
    $stmt = $db->prepare("SELECT * FROM discounts WHERE user_id = ?");
    $stmt->execute([$userId]);
    $discounts = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($discounts);
    exit;
}

if ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    
    // Validate request
    if (isset($input['code']) && !isset($input['type']) && !isset($input['value'])) {
        // Validation request
        $code = strtoupper(trim($input['code']));
        
        $stmt = $db->prepare("SELECT * FROM discounts WHERE code = ? AND active = 1");
        $stmt->execute([$code]);
        $discount = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($discount) {
            echo json_encode(['valid' => true, 'discount' => $discount]);
        } else {
            echo json_encode(['valid' => false, 'error' => 'Invalid or inactive promo code']);
        }
        exit;
    }
    
    // Create request (Admin only)
    if (!$userId || $role !== 'admin') {
        echo json_encode(['error' => 'Unauthorized']);
        exit;
    }
    
    $id = uniqid('dsc_');
    $code = strtoupper(trim($input['code'] ?? ''));
    $type = $input['type'] ?? 'percentage';
    $value = floatval($input['value'] ?? 0);
    $active = isset($input['active']) ? intval($input['active']) : 1;
    
    if (empty($code) || $value <= 0) {
        echo json_encode(['success' => false, 'error' => 'Invalid data']);
        exit;
    }
    
    // Check if code exists for this user
    $check = $db->prepare("SELECT id FROM discounts WHERE user_id = ? AND code = ?");
    $check->execute([$userId, $code]);
    if ($check->fetch()) {
        echo json_encode(['success' => false, 'error' => 'Discount code already exists']);
        exit;
    }
    
    $stmt = $db->prepare("INSERT INTO discounts (id, user_id, code, type, value, active) VALUES (?, ?, ?, ?, ?, ?)");
    $stmt->execute([$id, $userId, $code, $type, $value, $active]);
    echo json_encode(['success' => true, 'discount' => [
        'id' => $id, 'user_id' => $userId, 'code' => $code, 'type' => $type, 'value' => $value, 'active' => $active
    ]]);
    exit;
}

if ($method === 'PUT') {
    if (!$userId || $role !== 'admin') {
        echo json_encode(['error' => 'Unauthorized']);
        exit;
    }
    
    $input = json_decode(file_get_contents('php://input'), true);
    $id = $input['id'] ?? '';
    
    if (empty($id)) {
        echo json_encode(['success' => false, 'error' => 'ID is required']);
        exit;
    }
    
    $active = isset($input['active']) ? intval($input['active']) : 0;
    
    $stmt = $db->prepare("UPDATE discounts SET active = ? WHERE id = ? AND user_id = ?");
    $stmt->execute([$active, $id, $userId]);
    echo json_encode(['success' => true]);
    exit;
}

if ($method === 'DELETE') {
    if (!$userId || $role !== 'admin') {
        echo json_encode(['error' => 'Unauthorized']);
        exit;
    }
    
    $id = $_GET['id'] ?? '';
    if (empty($id)) {
        echo json_encode(['success' => false, 'error' => 'ID is required']);
        exit;
    }
    
    $stmt = $db->prepare("DELETE FROM discounts WHERE id = ? AND user_id = ?");
    $stmt->execute([$id, $userId]);
    echo json_encode(['success' => true]);
    exit;
}

echo json_encode(['error' => 'Invalid request']);
?>
