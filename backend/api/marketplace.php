<?php
require_once __DIR__ . '/../db.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($method === 'GET') {
    if (isset($_GET['brands'])) {
        $stmt = $db->query("
            SELECT id, business_name as name, subdomain, email, date_joined
            FROM users 
            WHERE role = 'admin'
            ORDER BY date_joined DESC, id DESC
        ");
        $brands = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode($brands);
    } else {
        $stmt = $db->query("
            SELECT p.*, u.business_name, u.subdomain 
            FROM products p
            JOIN users u ON p.user_id = u.id
            WHERE u.role = 'admin'
            ORDER BY p.id DESC
        ");
        $products = $stmt->fetchAll(PDO::FETCH_ASSOC);
        foreach ($products as &$p) {
            $p['sizes'] = json_decode($p['sizes'], true) ?: [];
            $p['colors'] = json_decode($p['colors'], true) ?: [];
        }
        echo json_encode($products);
    }
} else {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
}
?>
