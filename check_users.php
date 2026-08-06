<?php
require 'backend/db.php';
$stmt = $db->query("SELECT id, subdomain FROM users");
print_r($stmt->fetchAll(PDO::FETCH_ASSOC));
?>
