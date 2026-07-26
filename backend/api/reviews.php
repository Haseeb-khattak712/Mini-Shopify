<?php
require_once __DIR__ . '/../db.php';

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        $stmt = $db->query("SELECT * FROM reviews ORDER BY date DESC");
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

        $stmt = $db->prepare("INSERT INTO reviews (id, product_id, author, rating, text, date) VALUES (?, ?, ?, ?, ?, ?)");
        $stmt->execute([
            $id,
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
