<?php
namespace Config;

use PDO;
use PDOException;

class Database {
    private static $instance = null;
    
    public static function getConnection() {
        if (self::$instance === null) {
            try {
                $db_file = __DIR__ . '/../ownstore.sqlite';
                self::$instance = new PDO("sqlite:" . $db_file);
                self::$instance->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
                self::$instance->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);

                // Auto-initialize database if empty
                $check = self::$instance->query("SELECT name FROM sqlite_master WHERE type='table' AND name='users'");
                if (!$check->fetch()) {
                    require_once __DIR__ . '/../database/init_db.php';
                } else {
                    self::runMigrations(self::$instance);
                }
            } catch (PDOException $e) {
                http_response_code(500);
                echo json_encode(["error" => "Database connection failed: " . $e->getMessage()]);
                exit();
            }
        }
        return self::$instance;
    }

    private static function runMigrations($db) {
        // Migration: Create discounts table if it doesn't exist
        $db->exec("CREATE TABLE IF NOT EXISTS discounts (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            code TEXT NOT NULL,
            type TEXT NOT NULL,
            value REAL NOT NULL,
            active INTEGER DEFAULT 1
        )");

        // Migration: add missing columns to products table if they don't exist
        $cols = $db->query("PRAGMA table_info(products)")->fetchAll();
        $colNames = array_column($cols, 'name');
        
        if (!in_array('is_digital', $colNames)) {
            $db->exec("ALTER TABLE products ADD COLUMN is_digital INTEGER DEFAULT 0");
        }
        if (!in_array('file_url', $colNames)) {
            $db->exec("ALTER TABLE products ADD COLUMN file_url TEXT");
        }
        if (!in_array('variant_stock', $colNames)) {
            $db->exec("ALTER TABLE products ADD COLUMN variant_stock TEXT");
        }
    }
}
