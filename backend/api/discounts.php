<?php
require_once __DIR__ . '/../db.php';

$method = $_SERVER['REQUEST_METHOD'];

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($method === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    if (!$data || !isset($data['code'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid JSON or missing code']);
        exit;
    }

    $code = strtoupper(trim($data['code']));

    // Pre-seeded discounts for the semester project
    $valid_codes = [
        'SUMMER20' => [
            'type' => 'percentage',
            'value' => 20
        ],
        'WELCOME10' => [
            'type' => 'percentage',
            'value' => 10
        ],
        'FREESHIP' => [
            'type' => 'fixed',
            'value' => 8 // Assuming $8 flat shipping
        ]
    ];

    if (array_key_exists($code, $valid_codes)) {
        echo json_encode([
            'valid' => true,
            'discount' => $valid_codes[$code]
        ]);
    } else {
        echo json_encode([
            'valid' => false,
            'error' => 'Invalid or expired discount code.'
        ]);
    }
} else {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
}
?>
