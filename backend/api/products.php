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
        $stmt = $db->prepare("SELECT * FROM products WHERE user_id = ? ORDER BY id DESC");
        $stmt->execute([$user_id]);
        $products = $stmt->fetchAll();
        // Decode JSON fields
        foreach ($products as &$p) {
            $p['sizes'] = json_decode($p['sizes'], true) ?: [];
            $p['colors'] = json_decode($p['colors'], true) ?: [];
        }
        echo json_encode($products);
        break;

    case 'POST':
        $data = json_decode(file_get_contents('php://input'), true);
        if (!$data) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid JSON']);
            exit;
        }

        $id = $data['id'] ?? 'p' . time();
        $sizes = json_encode($data['sizes'] ?? []);
        $colors = json_encode($data['colors'] ?? []);

        $stmt = $db->prepare("INSERT INTO products (id, user_id, name, price, stock, category, description, image, sizes, colors) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
        $stmt->execute([
            $id,
            $user_id,
            $data['name'],
            $data['price'],
            $data['stock'],
            $data['category'],
            $data['description'],
            $data['image'],
            $sizes,
            $colors
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

        $sizes = json_encode($data['sizes'] ?? []);
        $colors = json_encode($data['colors'] ?? []);

        $stmt = $db->prepare("UPDATE products SET name=?, price=?, stock=?, category=?, description=?, image=?, sizes=?, colors=? WHERE id=? AND user_id=?");
        $stmt->execute([
            $data['name'],
            $data['price'],
            $data['stock'],
            $data['category'],
            $data['description'],
            $data['image'],
            $sizes,
            $colors,
            $data['id'],
            $user_id
        ]);
        
        echo json_encode(['success' => true]);
        break;

    case 'DELETE':
        $id = $_GET['id'] ?? null;
        if (!$id) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing id']);
            exit;
        }
        
        $stmt = $db->prepare("DELETE FROM products WHERE id=? AND user_id=?");
        $stmt->execute([$id, $user_id]);
        echo json_encode(['success' => true]);
        break;
}
?>
