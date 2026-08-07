<?php
// backend/public/index.php

// 1. CORS Headers
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-User-Id");
header("Content-Type: application/json");
header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
header("Cache-Control: post-check=0, pre-check=0", false);
header("Pragma: no-cache");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// 2. Simple Autoloader (PSR-4 style)
spl_autoload_register(function ($class) {
    $prefix = '';
    $base_dir = '';
    
    if (strpos($class, 'App\\') === 0) {
        $prefix = 'App\\';
        $base_dir = __DIR__ . '/../app/';
    } elseif (strpos($class, 'Config\\') === 0) {
        $prefix = 'Config\\';
        $base_dir = __DIR__ . '/../config/';
    }
    
    if ($prefix) {
        $relative_class = substr($class, strlen($prefix));
        $file = $base_dir . str_replace('\\', '/', $relative_class) . '.php';
        
        if (file_exists($file)) {
            require $file;
        }
    }
});

// 3. Load Routes and Dispatch
$request_uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

// Strip '/backend' from the URI if the live server is hosted in a subfolder
$base_path = '/backend';
if (strpos($request_uri, $base_path) === 0) {
    $request_uri = substr($request_uri, strlen($base_path));
}

$request_method = $_SERVER['REQUEST_METHOD'];

require_once __DIR__ . '/../routes/api.php';
