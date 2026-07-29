<?php
$db_file = __DIR__ . '/backend/ownstore.sqlite';
$db = new PDO("sqlite:" . $db_file);
$stmt = $db->query("SELECT * FROM users WHERE role = 'admin'");
$admins = $stmt->fetchAll(PDO::FETCH_ASSOC);
echo json_encode($admins, JSON_PRETTY_PRINT);
?>
