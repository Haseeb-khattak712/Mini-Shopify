<?php
require_once __DIR__ . '/db.php';

$db->exec("DROP TABLE IF EXISTS products");
$db->exec("DROP TABLE IF EXISTS orders");
$db->exec("DROP TABLE IF EXISTS reviews");
$db->exec("DROP TABLE IF EXISTS users");
$db->exec("DROP TABLE IF EXISTS customers");

// Create Users Table
$db->exec("CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    business_name TEXT NOT NULL,
    subdomain TEXT UNIQUE NOT NULL
)");

// Create Customers Table
$db->exec("CREATE TABLE IF NOT EXISTS customers (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    UNIQUE(user_id, email)
)");

// Create Products Table
$db->exec("CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    price REAL NOT NULL,
    stock INTEGER NOT NULL,
    category TEXT NOT NULL,
    description TEXT,
    image TEXT,
    sizes TEXT,
    colors TEXT
)");

// Create Orders Table
$db->exec("CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    customer_id TEXT,
    customer TEXT NOT NULL,
    total REAL NOT NULL,
    date TEXT NOT NULL,
    status TEXT NOT NULL,
    items TEXT
)");

// Create Reviews Table
$db->exec("CREATE TABLE IF NOT EXISTS reviews (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    product_id TEXT NOT NULL,
    author TEXT NOT NULL,
    rating INTEGER NOT NULL,
    text TEXT,
    date TEXT NOT NULL
)");

// Seed Demo User
$demoUserId = 'usr_demo';
$demoHash = password_hash('admin123', PASSWORD_DEFAULT);
$db->exec("INSERT INTO users (id, email, password_hash, business_name, subdomain) VALUES ('$demoUserId', 'admin@storekit.com', '$demoHash', 'Demo Store', 'demo')");

echo "Seeding products...\n";
$products = [
    [
        'id' => 'p1', 'user_id' => $demoUserId, 'name' => 'Cotton Oxford Shirt', 'price' => 45, 'stock' => 12, 'category' => 'Apparel',
        'description' => 'A breathable, lightweight cotton shirt perfect for any occasion.', 'image' => 'https://images.unsplash.com/photo-1596755094514-f87e32f85e2c?w=600&h=600&fit=crop&auto=format',
        'sizes' => json_encode(['S', 'M', 'L', 'XL']), 'colors' => json_encode(['White', 'Light Blue'])
    ],
    [
        'id' => 'p2', 'user_id' => $demoUserId, 'name' => 'Leather Wallet', 'price' => 35, 'stock' => 4, 'category' => 'Accessories',
        'description' => 'Slim bifold wallet made from premium full-grain leather.', 'image' => 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=600&h=600&fit=crop&auto=format',
        'sizes' => json_encode([]), 'colors' => json_encode(['Brown', 'Black'])
    ]
];
$insertP = $db->prepare("INSERT INTO products (id, user_id, name, price, stock, category, description, image, sizes, colors) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
foreach ($products as $p) {
    $insertP->execute([$p['id'], $p['user_id'], $p['name'], $p['price'], $p['stock'], $p['category'], $p['description'], $p['image'], $p['sizes'], $p['colors']]);
}

echo "Seeding orders...\n";
$orders = [
    ['id' => 'ORD-7829', 'user_id' => $demoUserId, 'customer_id' => null, 'customer' => 'Alice Smith', 'total' => 125, 'date' => date('Y-m-d'), 'status' => 'processing', 'items' => '[]'],
    ['id' => 'ORD-7828', 'user_id' => $demoUserId, 'customer_id' => null, 'customer' => 'Bob Jones', 'total' => 45, 'date' => date('Y-m-d', strtotime('-1 day')), 'status' => 'shipped', 'items' => '[]']
];
$insertO = $db->prepare("INSERT INTO orders (id, user_id, customer_id, customer, total, date, status, items) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
foreach ($orders as $o) {
    $insertO->execute([$o['id'], $o['user_id'], $o['customer_id'], $o['customer'], $o['total'], $o['date'], $o['status'], $o['items']]);
}

echo "Database setup complete! SQLite database created at: " . __DIR__ . "/storekit.sqlite\n";
?>
