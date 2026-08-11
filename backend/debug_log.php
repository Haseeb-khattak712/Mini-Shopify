<?php
error_reporting(E_ALL);
ini_set("display_errors", 1);
ini_set("log_errors", 1);
ini_set("error_log", __DIR__ . "/error.log");

try {
    require_once __DIR__ . "/config/Database.php";
    $db = \Config\Database::getConnection();
    echo "Database Connected successfully!";
} catch (Exception $e) {
    echo "Exception: " . $e->getMessage();
}
?>
