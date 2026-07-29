<?php
$db_file = __DIR__ . '/backend/ownstore.sqlite';
$db = new PDO("sqlite:" . $db_file);
$stmt = $db->query("SELECT * FROM products WHERE user_id = 'usr_b1761bb0b0122bf3'");
$products = $stmt->fetchAll(PDO::FETCH_ASSOC);
echo json_encode($products, JSON_PRETTY_PRINT);
?>
