<?php
require_once __DIR__ . '/db.php';

// Drop tables if we want a fresh start (optional, but good for setup)
// $db->exec("DROP TABLE IF EXISTS products");
// $db->exec("DROP TABLE IF EXISTS orders");
// $db->exec("DROP TABLE IF EXISTS reviews");

// Create Products Table
$db->exec("CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    price REAL NOT NULL,
    stock INTEGER NOT NULL,
    category TEXT NOT NULL,
    description TEXT,
    image TEXT,
    sizes TEXT, -- stored as JSON array
    colors TEXT -- stored as JSON array
)");

// Create Orders Table
$db->exec("CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    customer TEXT NOT NULL,
    total REAL NOT NULL,
    date TEXT NOT NULL,
    status TEXT NOT NULL,
    items TEXT -- stored as JSON array
)");

// Create Reviews Table
$db->exec("CREATE TABLE IF NOT EXISTS reviews (
    id TEXT PRIMARY KEY,
    product_id TEXT NOT NULL,
    author TEXT NOT NULL,
    rating INTEGER NOT NULL,
    text TEXT,
    date TEXT NOT NULL
)");

// Check if products exist, if not, seed with defaults
$stmt = $db->query("SELECT COUNT(*) as count FROM products");
$row = $stmt->fetch();
if ($row['count'] == 0) {
    echo "Seeding products...\n";
    
    $products = [
        [
            'id' => 'p1',
            'name' => 'Cotton Oxford Shirt',
            'price' => 45,
            'stock' => 12,
            'category' => 'Apparel',
            'description' => 'A breathable, lightweight cotton shirt perfect for any occasion.',
            'image' => 'https://images.unsplash.com/photo-1596755094514-f87e32f85e2c?w=600&h=600&fit=crop&auto=format',
            'sizes' => json_encode(['S', 'M', 'L', 'XL']),
            'colors' => json_encode(['White', 'Light Blue'])
        ],
        [
            'id' => 'p2',
            'name' => 'Leather Wallet',
            'price' => 35,
            'stock' => 4,
            'category' => 'Accessories',
            'description' => 'Slim bifold wallet made from premium full-grain leather.',
            'image' => 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=600&h=600&fit=crop&auto=format',
            'sizes' => json_encode([]),
            'colors' => json_encode(['Brown', 'Black'])
        ],
        [
            'id' => 'p3',
            'name' => 'Desk Lamp',
            'price' => 65,
            'stock' => 8,
            'category' => 'Home',
            'description' => 'Minimalist LED desk lamp with adjustable brightness.',
            'image' => 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600&h=600&fit=crop&auto=format',
            'sizes' => json_encode([]),
            'colors' => json_encode([])
        ],
        [
            'id' => 'p4',
            'name' => 'Canvas Tote Bag',
            'price' => 20,
            'stock' => 25,
            'category' => 'Accessories',
            'description' => 'Durable 100% cotton canvas tote for everyday use.',
            'image' => 'https://images.unsplash.com/photo-1597484661643-2f5fef640df1?w=600&h=600&fit=crop&auto=format',
            'sizes' => json_encode([]),
            'colors' => json_encode([])
        ]
    ];
    
    $insert = $db->prepare("INSERT INTO products (id, name, price, stock, category, description, image, sizes, colors) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
    
    foreach ($products as $p) {
        $insert->execute([$p['id'], $p['name'], $p['price'], $p['stock'], $p['category'], $p['description'], $p['image'], $p['sizes'], $p['colors']]);
    }
}

// Seed Orders if empty
$stmt = $db->query("SELECT COUNT(*) as count FROM orders");
$row = $stmt->fetch();
if ($row['count'] == 0) {
    echo "Seeding orders...\n";
    $orders = [
        ['id' => 'ORD-7829', 'customer' => 'Alice Smith', 'total' => 125, 'date' => date('Y-m-d'), 'status' => 'processing', 'items' => '[]'],
        ['id' => 'ORD-7828', 'customer' => 'Bob Jones', 'total' => 45, 'date' => date('Y-m-d', strtotime('-1 day')), 'status' => 'shipped', 'items' => '[]'],
        ['id' => 'ORD-7827', 'customer' => 'Charlie Lee', 'total' => 210, 'date' => date('Y-m-d', strtotime('-2 days')), 'status' => 'delivered', 'items' => '[]']
    ];
    
    $insert = $db->prepare("INSERT INTO orders (id, customer, total, date, status, items) VALUES (?, ?, ?, ?, ?, ?)");
    foreach ($orders as $o) {
        $insert->execute([$o['id'], $o['customer'], $o['total'], $o['date'], $o['status'], $o['items']]);
    }
}

echo "Database setup complete! SQLite database created at: " . $db_file . "\n";
?>
