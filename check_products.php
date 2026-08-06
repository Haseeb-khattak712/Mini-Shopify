<?php
require 'backend/db.php';
$stmt = $db->query("SELECT id, user_id, name FROM products");
print_r($stmt->fetchAll(PDO::FETCH_ASSOC));
?>
