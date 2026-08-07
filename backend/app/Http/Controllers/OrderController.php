<?php
namespace App\Http\Controllers;

use Config\Database;
use App\Utils\Auth;
use App\Utils\Jwt;

class OrderController {

    private function getAuthUserId() {
        $token = Auth::getBearerToken();
        if ($token) {
            $payload = Jwt::verify($token);
            if ($payload && isset($payload['id'])) {
                return $payload['id'];
            }
        }
        return null;
    }

    private function getRole($auth_user_id) {
        if (!$auth_user_id) return 'customer';
        $db = Database::getConnection();
        $stmt = $db->prepare("SELECT role FROM users WHERE id = ?");
        $stmt->execute([$auth_user_id]);
        $user = $stmt->fetch();
        return $user ? $user['role'] : 'customer';
    }

    private function getStoreOwnerId() {
        $subdomain = $_GET['subdomain'] ?? '';
        if ($subdomain) {
            $db = Database::getConnection();
            $stmt = $db->prepare("SELECT id FROM users WHERE subdomain = ?");
            $stmt->execute([$subdomain]);
            $store = $stmt->fetch();
            if ($store) {
                return $store['id'];
            }
        }
        return null;
    }

    public function index() {
        $auth_user_id = $this->getAuthUserId();
        if (!$auth_user_id) {
            http_response_code(401);
            echo json_encode(['error' => 'Unauthorized']);
            exit;
        }

        $role = $this->getRole($auth_user_id);
        $db = Database::getConnection();

        if ($role === 'admin') {
            $stmt = $db->prepare("SELECT * FROM orders WHERE user_id = ? ORDER BY date DESC, id DESC");
            $stmt->execute([$auth_user_id]);
        } else {
            $stmt = $db->prepare("SELECT * FROM orders WHERE customer_id = ? ORDER BY date DESC, id DESC");
            $stmt->execute([$auth_user_id]);
        }
        
        $orders = $stmt->fetchAll();
        foreach ($orders as &$o) {
            $o['items'] = json_decode($o['items'], true) ?: [];
        }
        echo json_encode($orders);
    }

    public function store() {
        $store_owner_id = $this->getStoreOwnerId();
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

        $db = Database::getConnection();
        $stmt = $db->prepare("INSERT INTO orders (id, user_id, customer_id, customer, email, total, date, status, items) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
        $stmt->execute([
            $id,
            $store_owner_id,
            $data['customer_id'] ?? null,
            $data['customer'],
            $data['email'] ?? '',
            $data['total'],
            $data['date'] ?? date('Y-m-d'),
            $data['status'] ?? 'processing',
            $items
        ]);
        
        // Reduce stock
        if (isset($data['items']) && is_array($data['items'])) {
            foreach ($data['items'] as $item) {
                $pid = $item['product_id'];
                $qty = intval($item['quantity']);
                
                $pStmt = $db->prepare("SELECT stock, variant_stock FROM products WHERE id = ?");
                $pStmt->execute([$pid]);
                $prod = $pStmt->fetch();
                if ($prod) {
                    $newStock = max(0, intval($prod['stock']) - $qty);
                    $vStock = json_decode($prod['variant_stock'], true) ?: [];
                    
                    $size = $item['size'] ?? '';
                    $color = $item['color'] ?? '';
                    $variantKey = implode('-', array_filter([$color, $size]));
                    
                    if ($variantKey && isset($vStock[$variantKey])) {
                        $vStock[$variantKey] = max(0, intval($vStock[$variantKey]) - $qty);
                    }
                    
                    $uStmt = $db->prepare("UPDATE products SET stock = ?, variant_stock = ? WHERE id = ?");
                    $uStmt->execute([$newStock, json_encode($vStock), $pid]);
                }
            }
        }
        
        echo json_encode(['success' => true, 'id' => $id]);
    }

    public function update() {
        $auth_user_id = $this->getAuthUserId();
        $role = $this->getRole($auth_user_id);
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

        $db = Database::getConnection();
        $stmt = $db->prepare("UPDATE orders SET status=? WHERE id=? AND user_id=?");
        $stmt->execute([
            $data['status'],
            $data['id'],
            $auth_user_id
        ]);
        
        echo json_encode(['success' => true]);
    }
}
