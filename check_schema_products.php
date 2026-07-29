<?php
$db = new PDO('sqlite:d:/Projects/Store-Kit/backend/ownstore.sqlite');
$stmt = $db->query("SELECT sql FROM sqlite_master WHERE type='table' AND name='products'");
print_r($stmt->fetch());
