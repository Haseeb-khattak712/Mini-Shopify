<?php
$db = new PDO("sqlite:backend/ownstore.sqlite");
echo json_encode($db->query("SELECT id FROM products")->fetchAll(PDO::FETCH_ASSOC));
?>
