<?php


$stmt = $db->query("SELECT * FROM users WHERE role = 'admin'");
$admins = $stmt->fetchAll(PDO::FETCH_ASSOC);

if (count($admins) < 2) {
    // User hasn't registered yet, skip seeding other data
    return;
}

// Find the admin that is NOT 'demo'
$otherAdmin = null;
foreach ($admins as $admin) {
    if ($admin['subdomain'] !== 'demo') {
        $otherAdmin = $admin;
        break;
    }
}

if (!$otherAdmin) {
    echo "No other admin found.\n";
    print_r($admins);
    exit;
}

echo "Adding products to admin: " . $otherAdmin['business_name'] . " (Subdomain: " . $otherAdmin['subdomain'] . ")\n";

$otherAdminId = $otherAdmin['id'];

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
    // Check if it exists to avoid errors
    $check = $db->prepare("SELECT id FROM products WHERE id = ?");
    $check->execute([$p['id']]);
    if ($check->fetch()) {
        echo "Product {$p['id']} already exists. Skipping.\n";
        continue;
    }

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
    echo "Inserted product: {$p['name']}\n";
}

echo "Done seeding other admin!\n";
