<?php
// backend/routes/api.php

class Router {
    private static $routes = [];

    public static function get($path, $action) {
        self::$routes['GET'][$path] = $action;
    }

    public static function post($path, $action) {
        self::$routes['POST'][$path] = $action;
    }

    public static function delete($path, $action) {
        self::$routes['DELETE'][$path] = $action;
    }

    public static function put($path, $action) {
        self::$routes['PUT'][$path] = $action;
    }

    public static function dispatch($method, $uri) {
        // Handle trailing slashes
        $uri = rtrim($uri, '/');
        if (empty($uri)) $uri = '/';

        if (isset(self::$routes[$method])) {
            foreach (self::$routes[$method] as $route => $action) {
                // exact matching
                if ($route === $uri) {
                    list($controllerName, $methodName) = explode('@', $action);
                    $controllerClass = "App\\Http\\Controllers\\" . $controllerName;
                    
                    if (class_exists($controllerClass)) {
                        $controller = new $controllerClass();
                        if (method_exists($controller, $methodName)) {
                            $controller->$methodName();
                            return;
                        } else {
                            self::sendError("Method $methodName not found in $controllerClass", 500);
                            return;
                        }
                    } else {
                        self::sendError("Controller $controllerClass not found", 500);
                        return;
                    }
                }
            }
        }

        self::sendError('Route not found: ' . $uri, 404);
    }

    private static function sendError($message, $code) {
        http_response_code($code);
        echo json_encode(['error' => $message]);
    }
}

// ----------------------------------------------------------------------
// Define Routes
// ----------------------------------------------------------------------

// Auth
Router::post('/api/auth/login', 'AuthController@login');
Router::post('/api/auth/register', 'AuthController@register');

// Products
Router::get('/api/products', 'ProductController@index');
Router::get('/api/products/inventory', 'ProductController@inventory');
Router::post('/api/products', 'ProductController@store');
Router::put('/api/products', 'ProductController@update');
Router::delete('/api/products', 'ProductController@destroy');

// Orders
Router::get('/api/orders', 'OrderController@index');
Router::post('/api/orders', 'OrderController@store');
Router::put('/api/orders', 'OrderController@update');

// Discounts
Router::get('/api/discounts', 'DiscountController@index');
Router::post('/api/discounts', 'DiscountController@store');
Router::put('/api/discounts', 'DiscountController@update');
Router::delete('/api/discounts', 'DiscountController@destroy');

// Reviews
Router::get('/api/reviews', 'ReviewController@index');
Router::post('/api/reviews', 'ReviewController@store');
Router::put('/api/reviews', 'ReviewController@update');
Router::delete('/api/reviews', 'ReviewController@destroy');

// Settings
Router::get('/api/settings', 'SettingController@show');
Router::post('/api/settings', 'SettingController@update');

// Marketplace
Router::get('/api/marketplace', 'MarketplaceController@index');

// Upload
Router::post('/api/upload', 'UploadController@store');

// Dispatch
Router::dispatch($request_method, $request_uri);
