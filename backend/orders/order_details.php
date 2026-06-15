<?php
/**
 * FoodieHub - Order Details
 * GET: Fetch single order details
 */

require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    sendJSON(["success" => false, "message" => "Method not allowed"], 405);
}

requireLogin();
$userId = $_SESSION['user_id'];
$orderId = $_GET['id'] ?? 0;

if (!$orderId) {
    sendJSON(["success" => false, "message" => "Order ID is required"], 400);
}

// Get order (verify ownership)
$stmt = $conn->prepare("SELECT * FROM orders WHERE order_id = ? AND user_id = ?");
$stmt->bind_param("ii", $orderId, $userId);
$stmt->execute();
$order = $stmt->get_result()->fetch_assoc();
$stmt->close();

if (!$order) {
    sendJSON(["success" => false, "message" => "Order not found"], 404);
}

// Get order items
$stmt = $conn->prepare("SELECT oi.*, f.food_name, f.image, f.description, r.restaurant_name FROM order_items oi JOIN foods f ON oi.food_id = f.food_id LEFT JOIN restaurants r ON f.restaurant_id = r.restaurant_id WHERE oi.order_id = ?");
$stmt->bind_param("i", $orderId);
$stmt->execute();
$result = $stmt->get_result();
$items = [];
while ($row = $result->fetch_assoc()) $items[] = $row;
$stmt->close();

$order['items'] = $items;
sendJSON(["success" => true, "data" => $order]);
?>
