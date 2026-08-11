<?php
namespace App\Http\Controllers;

use Config\Database;

class MarketplaceController {
    public function index() {
        $db = Database::getConnection();

        if (isset($_GET['brands'])) {
            $stmt = $db->query("
                SELECT id, business_name as name, subdomain, email
                FROM users 
                WHERE role = 'admin'
                ORDER BY id DESC
            ");
            $brands = $stmt->fetchAll(\PDO::FETCH_ASSOC);
            echo json_encode($brands);
        } else {
            $stmt = $db->query("
                SELECT p.*, u.business_name, u.subdomain 
                FROM products p
                JOIN users u ON p.user_id = u.id
                WHERE u.role = 'admin'
                ORDER BY p.id DESC
            ");
            $products = $stmt->fetchAll(\PDO::FETCH_ASSOC);
            foreach ($products as &$p) {
                $p['sizes'] = json_decode($p['sizes'], true) ?: [];
                $p['colors'] = json_decode($p['colors'], true) ?: [];
            }
            echo json_encode($products);
        }
    }
}
