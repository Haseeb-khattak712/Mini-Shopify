<?php
namespace App\Http\Controllers;

use Config\Database;
use App\Utils\Auth;
use App\Utils\Jwt;

class DiscountController {
    private function getAuthUserId() {
        $token = Auth::getBearerToken();
        if ($token) {
            $payload = Jwt::verify($token);
            if ($payload && isset($payload['id'])) {
                return $payload['id']; // Used 'id' instead of 'user_id' which was a bug in procedural code
            }
        }
        return null;
    }

    private function getRole($auth_user_id) {
        if (!$auth_user_id) return null;
        $db = Database::getConnection();
        $stmt = $db->prepare("SELECT role FROM users WHERE id = ?");
        $stmt->execute([$auth_user_id]);
        $user = $stmt->fetch();
        return $user ? $user['role'] : null;
    }

    public function index() {
        $userId = $this->getAuthUserId();
        $role = $this->getRole($userId);
        
        if (!$userId || $role !== 'admin') {
            http_response_code(401);
            echo json_encode(['error' => 'Unauthorized']);
            exit;
        }
        
        $db = Database::getConnection();
        $stmt = $db->prepare("SELECT * FROM discounts WHERE user_id = ?");
        $stmt->execute([$userId]);
        $discounts = $stmt->fetchAll(\PDO::FETCH_ASSOC);
        echo json_encode($discounts);
    }

    public function store() {
        $userId = $this->getAuthUserId();
        $role = $this->getRole($userId);
        $db = Database::getConnection();
        
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (isset($input['code']) && !isset($input['type']) && !isset($input['value'])) {
            $code = strtoupper(trim($input['code']));
            
            $stmt = $db->prepare("SELECT * FROM discounts WHERE code = ? AND active = 1");
            $stmt->execute([$code]);
            $discount = $stmt->fetch(\PDO::FETCH_ASSOC);
            
            if ($discount) {
                echo json_encode(['valid' => true, 'discount' => $discount]);
            } else {
                echo json_encode(['valid' => false, 'error' => 'Invalid or inactive promo code']);
            }
            exit;
        }
        
        if (!$userId || $role !== 'admin') {
            http_response_code(401);
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
    }

    public function update() {
        $userId = $this->getAuthUserId();
        $role = $this->getRole($userId);
        if (!$userId || $role !== 'admin') {
            http_response_code(401);
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
        
        $db = Database::getConnection();
        $stmt = $db->prepare("UPDATE discounts SET active = ? WHERE id = ? AND user_id = ?");
        $stmt->execute([$active, $id, $userId]);
        echo json_encode(['success' => true]);
    }

    public function destroy() {
        $userId = $this->getAuthUserId();
        $role = $this->getRole($userId);
        if (!$userId || $role !== 'admin') {
            http_response_code(401);
            echo json_encode(['error' => 'Unauthorized']);
            exit;
        }
        
        $id = $_GET['id'] ?? '';
        if (empty($id)) {
            echo json_encode(['success' => false, 'error' => 'ID is required']);
            exit;
        }
        
        $db = Database::getConnection();
        $stmt = $db->prepare("DELETE FROM discounts WHERE id = ? AND user_id = ?");
        $stmt->execute([$id, $userId]);
        echo json_encode(['success' => true]);
    }
}
