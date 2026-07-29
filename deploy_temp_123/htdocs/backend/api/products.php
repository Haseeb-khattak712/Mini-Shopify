<?php
require_once __DIR__ . '/../db.php';

$method = $_SERVER['REQUEST_METHOD'];
$require_auth = ($method !== 'GET');
$user_id = getUserId($db, $require_auth);

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

        $is_digital = isset($data['is_digital']) ? intval($data['is_digital']) : 0;
        $file_url = $data['file_url'] ?? '';
        $variant_stock = isset($data['variant_stock']) ? json_encode($data['variant_stock']) : '{}';

        $stmt = $db->prepare("INSERT INTO products (id, user_id, name, price, stock, category, description, image, sizes, colors, is_digital, file_url, variant_stock) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
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
            $colors,
            $is_digital,
            $file_url,
            $variant_stock
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

        $is_digital = isset($data['is_digital']) ? intval($data['is_digital']) : 0;
        $file_url = $data['file_url'] ?? '';
        $variant_stock = isset($data['variant_stock']) ? json_encode($data['variant_stock']) : '{}';

        $stmt = $db->prepare("UPDATE products SET name=?, price=?, stock=?, category=?, description=?, image=?, sizes=?, colors=?, is_digital=?, file_url=?, variant_stock=? WHERE id=? AND user_id=?");
        $stmt->execute([
            $data['name'],
            $data['price'],
            $data['stock'],
            $data['category'],
            $data['description'],
            $data['image'],
            $sizes,
            $colors,
            $is_digital,
            $file_url,
            $variant_stock,
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
