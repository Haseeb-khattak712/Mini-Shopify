<?php
namespace App\Http\Controllers;

use Config\Database;
use App\Utils\Auth;

class ReviewController {
    public function index() {
        $db = Database::getConnection();
        $subdomain = $_GET['subdomain'] ?? null;
        $user_id = Auth::getUserId(false, $subdomain);
        
        if (!$user_id) {
            http_response_code(401);
            echo json_encode(['error' => 'Unauthorized or missing subdomain']);
            exit;
        }

        $product_id = $_GET['product_id'] ?? null;
        if ($product_id) {
            $stmt = $db->prepare("SELECT * FROM reviews WHERE user_id = ? AND product_id = ? AND status = 'approved' ORDER BY date DESC");
            $stmt->execute([$user_id, $product_id]);
        } else {
            $stmt = $db->prepare("SELECT * FROM reviews WHERE user_id = ? ORDER BY date DESC");
            $stmt->execute([$user_id]);
        }
        $reviews = $stmt->fetchAll(\PDO::FETCH_ASSOC);
        echo json_encode($reviews);
    }

    public function store() {
        $db = Database::getConnection();
        $subdomain = $_GET['subdomain'] ?? null;
        $user_id = Auth::getUserId(false, $subdomain);
        
        if (!$user_id) {
            http_response_code(401);
            echo json_encode(['error' => 'Unauthorized or missing subdomain']);
            exit;
        }

        $data = json_decode(file_get_contents('php://input'), true);
        if (!$data) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid JSON']);
            exit;
        }

        $id = $data['id'] ?? 'rev-' . time();
        $date = $data['date'] ?? date('Y-m-d');

        $stmt = $db->prepare("INSERT INTO reviews (id, user_id, product_id, author, rating, text, date, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
        $stmt->execute([
            $id,
            $user_id,
            $data['product_id'],
            $data['author'],
            $data['rating'],
            $data['text'],
            $date,
            'approved'
        ]);
        
        echo json_encode(['success' => true, 'id' => $id]);
    }

    public function update() {
        $db = Database::getConnection();
        $user_id = Auth::getUserId(true);
        if (!$user_id) {
            http_response_code(401);
            echo json_encode(['error' => 'Unauthorized']);
            exit;
        }
        $data = json_decode(file_get_contents('php://input'), true);
        if (!$data || !isset($data['id'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid JSON or missing id']);
            exit;
        }

        $status = $data['status'] ?? 'approved';
        $stmt = $db->prepare("UPDATE reviews SET status=? WHERE id=? AND user_id=?");
        $stmt->execute([
            $status,
            $data['id'],
            $user_id
        ]);
        echo json_encode(['success' => true]);
    }

    public function destroy() {
        $db = Database::getConnection();
        $user_id = Auth::getUserId(true);
        if (!$user_id) {
            http_response_code(401);
            echo json_encode(['error' => 'Unauthorized']);
            exit;
        }
        $id = $_GET['id'] ?? null;
        if (!$id) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing id']);
            exit;
        }
        
        $stmt = $db->prepare("DELETE FROM reviews WHERE id=? AND user_id=?");
        $stmt->execute([$id, $user_id]);
        echo json_encode(['success' => true]);
    }
}
