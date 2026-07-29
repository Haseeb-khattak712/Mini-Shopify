<?php
require_once __DIR__ . '/../db.php';
require_once __DIR__ . '/../jwt.php';

echo json_encode([
    'get_bearer_token' => get_bearer_token(),
    'headers' => function_exists('getallheaders') ? getallheaders() : $_SERVER
]);
?>
