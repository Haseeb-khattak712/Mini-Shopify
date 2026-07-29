<?php
$db_file = __DIR__ . '/backend/ownstore.sqlite';
$db = new PDO("sqlite:" . $db_file);
$db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
$db->exec('VACUUM');
echo "Vacuum completed. Database file has been completely rewritten.\n";
?>
