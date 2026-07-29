<?php
define('JWT_SECRET', 'super_secret_store_kit_key_2026');

function b64url_decode($data) {
    $b64 = str_replace(['-', '_'], ['+', '/'], $data);
    $pad = strlen($b64) % 4;
    if ($pad) {
        $b64 .= str_repeat('=', 4 - $pad);
    }
    return base64_decode($b64);
}

function generate_jwt($payload, $secret = JWT_SECRET, $expirySeconds = 86400) {
    if (!isset($payload['exp'])) {
        $payload['exp'] = time() + $expirySeconds;
    }
    $header = json_encode(['typ' => 'JWT', 'alg' => 'HS256']);
    $payload = json_encode($payload);
    
    $base64UrlHeader = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($header));
    $base64UrlPayload = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($payload));
    
    $signature = hash_hmac('sha256', $base64UrlHeader . "." . $base64UrlPayload, $secret, true);
    $base64UrlSignature = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($signature));
    
    return $base64UrlHeader . "." . $base64UrlPayload . "." . $base64UrlSignature;
}

function verify_jwt($jwt, $secret = JWT_SECRET) {
    $tokenParts = explode('.', $jwt);
    if (count($tokenParts) != 3) {
        return false;
    }
    
    $base64UrlHeader = $tokenParts[0];
    $base64UrlPayload = $tokenParts[1];
    $signatureProvided = $tokenParts[2];
    
    $signature = hash_hmac('sha256', $base64UrlHeader . "." . $base64UrlPayload, $secret, true);
    $base64UrlSignature = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($signature));
    
    if (hash_equals($base64UrlSignature, $signatureProvided)) {
        $headerObj = json_decode(b64url_decode($base64UrlHeader), true);
        if (!$headerObj || !isset($headerObj['alg']) || $headerObj['alg'] !== 'HS256') {
            return false;
        }

        $payload = b64url_decode($base64UrlPayload);
        $decoded = json_decode($payload, true);
        
        if ($decoded && isset($decoded['exp']) && $decoded['exp'] < time()) {
            return false; // Token expired
        }
        
        return $decoded;
    }
    return false;
}

function get_bearer_token() {
    $headers = null;
    if (isset($_SERVER['Authorization'])) {
        $headers = trim($_SERVER["Authorization"]);
    } else if (isset($_SERVER['HTTP_AUTHORIZATION'])) { // Nginx or fast CGI
        $headers = trim($_SERVER["HTTP_AUTHORIZATION"]);
    } elseif (function_exists('apache_request_headers')) {
        $requestHeaders = apache_request_headers();
        $requestHeaders = array_combine(array_map('ucwords', array_keys($requestHeaders)), array_values($requestHeaders));
        if (isset($requestHeaders['Authorization'])) {
            $headers = trim($requestHeaders['Authorization']);
        }
    }
    
    if (!empty($headers)) {
        if (preg_match('/Bearer\s(\S+)/', $headers, $matches)) {
            return $matches[1];
        }
    }
    return null;
}
?>
