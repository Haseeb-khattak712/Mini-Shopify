<?php
$db_file = __DIR__ . '/backend/ownstore_copy.sqlite';
$db = new PDO("sqlite:" . $db_file);
$db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

$otherAdminId = 'usr_b1761bb0b0122bf3';

$products = [
    [
        'id' => 'PRD-EXT-1001',
        'user_id' => $otherAdminId,
        'name' => 'Ceramic Matcha Bowl',
        'price' => 38,
        'stock' => 20,
        'category' => 'Home',
        'description' => 'Handcrafted ceramic matcha bowl with an earthy reactive glaze.',
        'image' => 'https://images.unsplash.com/photo-1594246944648-52b0d0c3eb1a?w=800&q=80',
        'sizes' => '[]',
        'colors' => '[]'
    ],
    [
        'id' => 'PRD-EXT-1002',
        'user_id' => $otherAdminId,
        'name' => 'Woven Storage Basket',
        'price' => 55,
        'stock' => 15,
        'category' => 'Home',
        'description' => 'A beautifully woven natural seagrass basket for modern homes.',
        'image' => 'https://images.unsplash.com/photo-1590725141019-216952d7ee4d?w=800&q=80',
        'sizes' => '[]',
        'colors' => '[]'
    ],
    [
        'id' => 'PRD-EXT-1003',
        'user_id' => $otherAdminId,
        'name' => 'Brass Desk Lamp',
        'price' => 125,
        'stock' => 8,
        'category' => 'Lighting',
        'description' => 'Elegant solid brass desk lamp with an adjustable articulating arm.',
        'image' => 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&q=80',
        'sizes' => '[]',
        'colors' => '[]'
    ],
    [
        'id' => 'PRD-EXT-1004',
        'user_id' => $otherAdminId,
        'name' => 'Minimalist Linen Apron',
        'price' => 45,
        'stock' => 30,
        'category' => 'Apparel',
        'description' => 'Soft washed linen cross-back apron in a neutral stone color.',
        'image' => 'https://images.unsplash.com/photo-1596205737380-45c1103c2005?w=800&q=80',
        'sizes' => json_encode(['S', 'M', 'L']),
        'colors' => json_encode(['Stone', 'Charcoal'])
    ]
];

$stmt = $db->prepare("INSERT INTO products (id, user_id, name, price, stock, category, description, image, sizes, colors) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");

foreach ($products as $p) {
    try {
        $stmt->execute([
            $p['id'],
            $p['user_id'],
            $p['name'],
            $p['price'],
            $p['stock'],
            $p['category'],
            $p['description'],
            $p['image'],
            $p['sizes'],
            $p['colors']
        ]);
        echo "Inserted {$p['name']}\n";
    } catch (Exception $e) {
        echo "Failed {$p['name']}: " . $e->getMessage() . "\n";
    }
}
?>
