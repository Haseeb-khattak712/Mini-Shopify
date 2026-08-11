<?php
namespace App\Http\Controllers;

use Config\Database;
use App\Utils\Auth;

class ProductController {
    
    private function getUserId($require_auth) {
        $subdomain = $_GET['subdomain'] ?? null;
        $user_id = Auth::getUserId($require_auth, $subdomain);
        if (!$user_id) {
            http_response_code(401);
            echo json_encode(['error' => 'Unauthorized or missing subdomain']);
            exit;
        }
        return $user_id;
    }

    public function index() {
        $db = Database::getConnection();
        $user_id = $this->getUserId(false);

        $stmt = $db->prepare("
            SELECT p.*, u.business_name, u.subdomain 
            FROM products p
            JOIN users u ON p.user_id = u.id
            WHERE p.user_id = ? 
            ORDER BY p.id DESC
        ");
        $stmt->execute([$user_id]);
        $products = $stmt->fetchAll(\PDO::FETCH_ASSOC);
        
        foreach ($products as &$p) {
            $p['sizes'] = json_decode($p['sizes'], true) ?: [];
            $p['colors'] = json_decode($p['colors'], true) ?: [];
        }
        echo json_encode($products);
    }

    public function store() {
        $db = Database::getConnection();
        $user_id = $this->getUserId(true);
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
    }

    public function update() {
        $db = Database::getConnection();
        $user_id = $this->getUserId(true);
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
    }

    public function destroy() {
        $db = Database::getConnection();
        $user_id = $this->getUserId(true);
        $id = $_GET['id'] ?? null;
        if (!$id) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing id']);
            exit;
        }
        
        $stmt = $db->prepare("DELETE FROM products WHERE id=? AND user_id=?");
        $stmt->execute([$id, $user_id]);
        echo json_encode(['success' => true]);
    }
}
