<?php
namespace Config;

use PDO;
use PDOException;

class Database {
    private static $instance = null;
    
    private static function loadEnv() {
        // Try to load .env from the root directory (one level above backend, or backend root)
        $envFile = __DIR__ . '/../../.env';
        if (!file_exists($envFile)) {
            $envFile = __DIR__ . '/../.env'; // fallback to backend/.env
        }
        if (file_exists($envFile)) {
            $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
            foreach ($lines as $line) {
                if (strpos(trim($line), '#') === 0) continue;
                $parts = explode('=', $line, 2);
                if (count($parts) === 2) {
                    putenv(trim($parts[0]) . '=' . trim($parts[1]));
                }
            }
        }
    }

    public static function getConnection() {
        if (self::$instance === null) {
            self::loadEnv();
            try {
                $driver = getenv('DB_CONNECTION') ?: 'sqlite';
                if ($driver === 'mysql') {
                    $host = getenv('DB_HOST') ?: '127.0.0.1';
                    $port = getenv('DB_PORT') ?: '3306';
                    $db   = getenv('DB_DATABASE') ?: '';
                    $user = getenv('DB_USERNAME') ?: '';
                    $pass = getenv('DB_PASSWORD') ?: '';
                    self::$instance = new PDO("mysql:host=$host;port=$port;dbname=$db", $user, $pass);
                } else {
                    $db_file = __DIR__ . '/../ownstore.sqlite';
                    self::$instance = new PDO("sqlite:" . $db_file);
                }
                
                self::$instance->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
                self::$instance->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);

                // Auto-initialize database if empty
                $driverType = self::$instance->getAttribute(PDO::ATTR_DRIVER_NAME);
                if ($driverType === 'mysql') {
                    $check = self::$instance->query("SHOW TABLES LIKE 'users'");
                } else {
                    $check = self::$instance->query("SELECT name FROM sqlite_master WHERE type='table' AND name='users'");
                }
                
                if (!$check || !$check->fetch()) {
                    require_once __DIR__ . '/../database/init_db.php';
                } else {
                    self::runMigrations(self::$instance, $driverType);
                }
            } catch (PDOException $e) {
                http_response_code(500);
                echo json_encode(["error" => "Database connection failed: " . $e->getMessage()]);
                exit();
            }
        }
        return self::$instance;
    }

    private static function getColumnNames($db, $table, $driverType) {
        if ($driverType === 'mysql') {
            $cols = $db->query("SHOW COLUMNS FROM `$table`")->fetchAll();
            return array_column($cols, 'Field');
        } else {
            $cols = $db->query("PRAGMA table_info(`$table`)")->fetchAll();
            return array_column($cols, 'name');
        }
    }

    private static function runMigrations($db, $driverType) {
        // Migration: Create discounts table if it doesn't exist
        $db->exec("CREATE TABLE IF NOT EXISTS discounts (
            id VARCHAR(50) PRIMARY KEY,
            user_id VARCHAR(50) NOT NULL,
            code VARCHAR(50) NOT NULL,
            type VARCHAR(50) NOT NULL,
            value DECIMAL(10,2) NOT NULL,
            active INT DEFAULT 1
        )");

        // Migration: add missing columns to products table if they don't exist
        $colNames = self::getColumnNames($db, 'products', $driverType);
        
        if (!in_array('is_digital', $colNames)) {
            $db->exec("ALTER TABLE products ADD COLUMN is_digital INT DEFAULT 0");
        }
        if (!in_array('file_url', $colNames)) {
            $db->exec("ALTER TABLE products ADD COLUMN file_url TEXT");
        }
        if (!in_array('variant_stock', $colNames)) {
            $db->exec("ALTER TABLE products ADD COLUMN variant_stock TEXT");
        }

        // Migration: add email to orders
        $orderColNames = self::getColumnNames($db, 'orders', $driverType);
        if (!in_array('email', $orderColNames)) {
            $db->exec("ALTER TABLE orders ADD COLUMN email VARCHAR(255)");
        }

        // Migration: add status to reviews
        $reviewColNames = self::getColumnNames($db, 'reviews', $driverType);
        if (!in_array('status', $reviewColNames)) {
            $db->exec("ALTER TABLE reviews ADD COLUMN status VARCHAR(50) DEFAULT 'approved'");
        }
    }
}
