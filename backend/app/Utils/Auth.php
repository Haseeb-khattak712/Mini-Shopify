<?php
namespace App\Utils;

use Config\Database;

class Auth {
    public static function getBearerToken() {
        $headers = null;
        if (isset($_SERVER['Authorization'])) {
            $headers = trim($_SERVER["Authorization"]);
        } else if (isset($_SERVER['HTTP_AUTHORIZATION'])) { // Nginx or fast CGI
            $headers = trim($_SERVER["HTTP_AUTHORIZATION"]);
        } else if (isset($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) {
            $headers = trim($_SERVER["REDIRECT_HTTP_AUTHORIZATION"]);
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

    public static function getUserId($requireAuth = false, $subdomain = null) {
        $token = self::getBearerToken();
        $jwtUserId = null;
        
        if ($token) {
            $payload = Jwt::verify($token);
            if ($payload && isset($payload['id'])) {
                $jwtUserId = $payload['id'];
            }
        }

        // If auth is strictly required, we MUST return the JWT user or fail.
        if ($requireAuth) {
            return $jwtUserId;
        }

        // For public endpoints (requireAuth = false), prioritize subdomain over JWT
        if ($subdomain) {
            $db = Database::getConnection();
            $stmt = $db->prepare("SELECT id FROM users WHERE subdomain = ?");
            $stmt->execute([$subdomain]);
            $user = $stmt->fetch();
            if ($user) {
                return $user['id'];
            }
        }

        // Fallback to JWT if no subdomain is provided
        return $jwtUserId;
    }
}
