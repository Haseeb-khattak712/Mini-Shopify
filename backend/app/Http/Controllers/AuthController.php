<?php
namespace App\Http\Controllers;

use Config\Database;
use App\Utils\Jwt;
use App\Utils\Auth;

class AuthController {
    public function register() {
        $db = Database::getConnection();
        $data = json_decode(file_get_contents('php://input'), true);
        if (!$data) {
            $this->sendError('Invalid JSON', 400);
            return;
        }

        $name = $data['name'] ?? '';
        $email = $data['email'] ?? '';
        $password = $data['password'] ?? '';
        $role = $data['role'] ?? 'customer';
        
        if (!$name || !$email || !$password) {
            $this->sendError('Missing required fields', 400);
            return;
        }
        
        $business_name = null;
        $subdomain = null;
        
        if ($role === 'admin') {
            $business_name = $data['business_name'] ?? '';
            $subdomain = $data['subdomain'] ?? '';
            if (!$business_name || !$subdomain) {
                $this->sendError('Missing business_name or subdomain for seller account', 400);
                return;
            }
            
            $stmt = $db->prepare("SELECT COUNT(*) as cnt FROM users WHERE subdomain = ?");
            $stmt->execute([$subdomain]);
            $row = $stmt->fetch();
            if ($row['cnt'] > 0) {
                $this->sendError('Subdomain already taken', 409);
                return;
            }
        }
        
        $stmt = $db->prepare("SELECT COUNT(*) as cnt FROM users WHERE email = ?");
        $stmt->execute([$email]);
        $row = $stmt->fetch();
        if ($row['cnt'] > 0) {
            $this->sendError('Email already exists', 409);
            return;
        }
        
        $id = 'usr_' . bin2hex(random_bytes(8));
        $hash = password_hash($password, PASSWORD_DEFAULT);
        
        $stmt = $db->prepare("INSERT INTO users (id, name, email, password_hash, role, business_name, subdomain) VALUES (?, ?, ?, ?, ?, ?, ?)");
        $stmt->execute([$id, $name, $email, $hash, $role, $business_name, $subdomain]);
        
        $token = Jwt::generate(['id' => $id, 'role' => $role]);
        
        echo json_encode(['success' => true, 'id' => $id, 'token' => $token]);
    }

    public function login() {
        $db = Database::getConnection();
        $data = json_decode(file_get_contents('php://input'), true);
        if (!$data) {
            $this->sendError('Invalid JSON', 400);
            return;
        }

        $email = $data['email'] ?? '';
        $password = $data['password'] ?? '';
        if (!$email || !$password) {
            $this->sendError('Missing email or password', 400);
            return;
        }

        $stmt = $db->prepare("SELECT id, name, email, password_hash, role, business_name, subdomain FROM users WHERE email = ?");
        $stmt->execute([$email]);
        $user = $stmt->fetch();

        if ($user && password_verify($password, $user['password_hash'])) {
            $token = Jwt::generate(['id' => $user['id'], 'role' => $user['role']]);
            
            echo json_encode([
                'success' => true,
                'token' => $token,
                'user' => [
                    'id' => $user['id'],
                    'name' => $user['name'],
                    'email' => $user['email'],
                    'role' => $user['role'],
                    'business_name' => $user['business_name'],
                    'subdomain' => $user['subdomain']
                ]
            ]);
        } else {
            $this->sendError('Invalid email or password', 401);
        }
    }

    private function sendError($message, $code) {
        http_response_code($code);
        echo json_encode(['error' => $message]);
    }
}
