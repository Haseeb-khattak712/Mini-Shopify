<?php
require_once __DIR__ . '/db.php';
// db.php already automatically runs init_db.php if tables are missing.
// But we can force it here just to be sure.
require_once __DIR__ . '/init_db.php';

echo "Database setup complete! SQLite database created at: " . __DIR__ . "/ownstore.sqlite\n";
?>
