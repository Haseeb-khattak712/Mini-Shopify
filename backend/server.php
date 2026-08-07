<?php
// backend/server.php
// This file allows us to emulate Apache's "mod_rewrite" functionality from the built-in PHP web server.

$uri = urldecode(
    parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH)
);

// If the requested resource exists in the public directory, serve it directly
if ($uri !== '/' && file_exists(__DIR__.'/public'.$uri)) {
    return false;
}

// Otherwise, require the front controller
require_once __DIR__.'/public/index.php';
