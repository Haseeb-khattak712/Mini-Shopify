<?php
require_once __DIR__ . '/config/Database.php';
$db = \Config\Database::getConnection();

try {
    require_once __DIR__ . '/database/init_db.php';
    require_once __DIR__ . '/database/seed_haseeb.php';
    require_once __DIR__ . '/database/seed_other.php';
    echo "Database setup complete! All tables and seed data have been inserted successfully.";
} catch (Exception $e) {
    http_response_code(500);
    echo "Error setting up database: " . $e->getMessage();
}
?>
