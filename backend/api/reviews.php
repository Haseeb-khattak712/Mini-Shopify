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
        $stmt = $db->prepare("SELECT * FROM reviews WHERE user_id = ? ORDER BY date DESC");
        $stmt->execute([$user_id]);
        $reviews = $stmt->fetchAll();
        echo json_encode($reviews);
        break;

    case 'POST':
        $data = json_decode(file_get_contents('php://input'), true);
        if (!$data) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid JSON']);
            exit;
        }

        $id = $data['id'] ?? 'rev-' . time();
        $date = $data['date'] ?? date('Y-m-d');

        $stmt = $db->prepare("INSERT INTO reviews (id, user_id, product_id, author, rating, text, date) VALUES (?, ?, ?, ?, ?, ?, ?)");
        $stmt->execute([
            $id,
            $user_id,
            $data['product_id'],
            $data['author'],
            $data['rating'],
            $data['text'],
            $date
        ]);
        
        echo json_encode(['success' => true, 'id' => $id]);
        break;
}
?>
