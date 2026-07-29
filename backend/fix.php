<?php
require_once __DIR__ . '/db.php';
$db->exec("UPDATE users SET subdomain = 'demo' WHERE id = 'usr_fresh_admin'");
echo "Subdomain updated to demo.";
?>
