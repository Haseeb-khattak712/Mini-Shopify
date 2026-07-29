<?php
require_once __DIR__ . '/../db.php';

$users = $db->query("SELECT id, email, subdomain FROM users")->fetchAll();
$products = $db->query("SELECT user_id, COUNT(*) as count FROM products GROUP BY user_id")->fetchAll();

echo json_encode(['users' => $users, 'products' => $products]);
?>
