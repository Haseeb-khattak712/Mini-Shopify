<?php
namespace App\Utils;

class Jwt {
    const SECRET = 'super_secret_store_kit_key_2026';

    public static function generate($payload, $expirySeconds = 86400) {
        if (!isset($payload['exp'])) {
            $payload['exp'] = time() + $expirySeconds;
        }
        $header = json_encode(['typ' => 'JWT', 'alg' => 'HS256']);
        $payload = json_encode($payload);
        
        $base64UrlHeader = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($header));
        $base64UrlPayload = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($payload));
        
        $signature = hash_hmac('sha256', $base64UrlHeader . "." . $base64UrlPayload, self::SECRET, true);
        $base64UrlSignature = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($signature));
        
        return $base64UrlHeader . "." . $base64UrlPayload . "." . $base64UrlSignature;
    }

    public static function verify($jwt) {
        $tokenParts = explode('.', $jwt);
        if (count($tokenParts) != 3) {
            return false;
        }
        
        $base64UrlHeader = $tokenParts[0];
        $base64UrlPayload = $tokenParts[1];
        $signatureProvided = $tokenParts[2];
        
        $signature = hash_hmac('sha256', $base64UrlHeader . "." . $base64UrlPayload, self::SECRET, true);
        $base64UrlSignature = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($signature));
        
        if (hash_equals($base64UrlSignature, $signatureProvided)) {
            $headerObj = json_decode(self::b64url_decode($base64UrlHeader), true);
            if (!$headerObj || !isset($headerObj['alg']) || $headerObj['alg'] !== 'HS256') {
                return false;
            }

            $payload = self::b64url_decode($base64UrlPayload);
            $decoded = json_decode($payload, true);
            
            if ($decoded && isset($decoded['exp']) && $decoded['exp'] < time()) {
                return false; 
            }
            
            return $decoded;
        }
        return false;
    }

    private static function b64url_decode($data) {
        $b64 = str_replace(['-', '_'], ['+', '/'], $data);
        $pad = strlen($b64) % 4;
        if ($pad) {
            $b64 .= str_repeat('=', 4 - $pad);
        }
        return base64_decode($b64);
    }
}
