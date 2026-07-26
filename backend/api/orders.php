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
        $customer_id = $_GET['customer_id'] ?? null;
        if ($customer_id) {
            $stmt = $db->prepare("SELECT * FROM orders WHERE user_id = ? AND customer_id = ? ORDER BY date DESC, id DESC");
            $stmt->execute([$user_id, $customer_id]);
        } else {
            $stmt = $db->prepare("SELECT * FROM orders WHERE user_id = ? ORDER BY date DESC, id DESC");
            $stmt->execute([$user_id]);
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

        $id = $data['id'] ?? 'ORD-' . rand(1000, 9999);
        $items = json_encode($data['items'] ?? []);

        $stmt = $db->prepare("INSERT INTO orders (id, user_id, customer_id, customer, total, date, status, items) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
        $stmt->execute([
            $id,
            $user_id,
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

        $stmt = $db->prepare("UPDATE orders SET status=? WHERE id=? AND user_id=?");
        $stmt->execute([
            $data['status'],
            $data['id'],
            $user_id
        ]);
        
        echo json_encode(['success' => true]);
        break;
}
?>
