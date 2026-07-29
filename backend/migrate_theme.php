<?php
require_once __DIR__ . '/db.php';

try {
    // Add theme_settings column to users table
    $db->exec("ALTER TABLE users ADD COLUMN theme_settings TEXT");
    echo "Migration successful: Added theme_settings column to users table.\n";
} catch (PDOException $e) {
    if (strpos($e->getMessage(), 'duplicate column name') !== false) {
        echo "Migration skipped: theme_settings column already exists.\n";
    } else {
        echo "Migration failed: " . $e->getMessage() . "\n";
    }
}
?>
