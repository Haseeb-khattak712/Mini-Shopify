<?php
// Drop existing tables
$db->exec("DROP TABLE IF EXISTS products");
$db->exec("DROP TABLE IF EXISTS orders");
$db->exec("DROP TABLE IF EXISTS reviews");
$db->exec("DROP TABLE IF EXISTS users");
$db->exec("DROP TABLE IF EXISTS customers"); // no longer needed

// Create unified Users table
$db->exec("CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'customer',
    business_name TEXT,
    subdomain TEXT UNIQUE,
    theme_settings TEXT
)");

// Create Products table
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

// Create Orders table
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

// Create Reviews table
$db->exec("CREATE TABLE IF NOT EXISTS reviews (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    product_id TEXT NOT NULL,
    author TEXT NOT NULL,
    rating INTEGER NOT NULL,
    text TEXT,
    date TEXT NOT NULL
)");

// Seed demo admin user
$adminId = 'usr_demo';
$adminHash = password_hash('admin123', PASSWORD_DEFAULT);
$db->exec("INSERT INTO users (id, name, email, password_hash, role, business_name, subdomain) VALUES ('$adminId', 'Demo Admin', 'admin@ownstore.com', '$adminHash', 'admin', 'Demo Store', 'demo')");

// Seed demo customer user
$customerId = 'usr_customer_demo';
$custHash = password_hash('customer123', PASSWORD_DEFAULT);
$db->exec("INSERT INTO users (id, name, email, password_hash, role) VALUES ('$customerId', 'Demo Customer', 'customer@ownstore.com', '$custHash', 'customer')");

$products = [
    [
        'id' => 'p1',
        'user_id' => $adminId,
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
        'user_id' => $adminId,
        'name' => 'Leather Wallet',
        'price' => 35,
        'stock' => 4,
        'category' => 'Accessories',
        'description' => 'Slim bifold wallet made from premium full-grain leather.',
        'image' => 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=600&h=600&fit=crop&auto=format',
        'sizes' => json_encode([]),
        'colors' => json_encode(['Brown', 'Black'])
    ]
];
$insertP = $db->prepare("INSERT INTO products (id, user_id, name, price, stock, category, description, image, sizes, colors) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
foreach ($products as $p) {
    $insertP->execute([$p['id'], $p['user_id'], $p['name'], $p['price'], $p['stock'], $p['category'], $p['description'], $p['image'], $p['sizes'], $p['colors']]);
}

$orders = [
    ['id' => 'ORD-7829', 'user_id' => $adminId, 'customer_id' => null, 'customer' => 'Alice Smith', 'total' => 125, 'date' => date('Y-m-d'), 'status' => 'processing', 'items' => '[]'],
    ['id' => 'ORD-7828', 'user_id' => $adminId, 'customer_id' => null, 'customer' => 'Bob Jones', 'total' => 45, 'date' => date('Y-m-d', strtotime('-1 day')), 'status' => 'shipped', 'items' => '[]']
];
$insertO = $db->prepare("INSERT INTO orders (id, user_id, customer_id, customer, total, date, status, items) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
foreach ($orders as $o) {
    $insertO->execute([$o['id'], $o['user_id'], $o['customer_id'], $o['customer'], $o['total'], $o['date'], $o['status'], $o['items']]);
}
?>
