<?php
/**
 * FoodieHub - Get Orders
 * GET: Fetch order history for current user
 */

require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    sendJSON(["success" => false, "message" => "Method not allowed"], 405);
}

requireLogin();
$userId = $_SESSION['user_id'];

// Get all orders
$stmt = $conn->prepare("SELECT * FROM orders WHERE user_id = ? ORDER BY order_date DESC");
$stmt->bind_param("i", $userId);
$stmt->execute();
$result = $stmt->get_result();
$orders = [];

while ($order = $result->fetch_assoc()) {
    // Get items for each order
    $stmt2 = $conn->prepare("SELECT oi.*, f.food_name, f.image FROM order_items oi JOIN foods f ON oi.food_id = f.food_id WHERE oi.order_id = ?");
    $stmt2->bind_param("i", $order['order_id']);
    $stmt2->execute();
    $itemsResult = $stmt2->get_result();
    $items = [];
    while ($item = $itemsResult->fetch_assoc()) $items[] = $item;
    $stmt2->close();

    $order['items'] = $items;
    $orders[] = $order;
}
$stmt->close();

sendJSON(["success" => true, "data" => $orders]);
?>
