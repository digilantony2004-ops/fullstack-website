<?php
/**
 * FoodieHub - Place Order
 * POST: Convert cart to order
 */

require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendJSON(["success" => false, "message" => "Method not allowed"], 405);
}

requireLogin();
$userId = $_SESSION['user_id'];
$data = getRequestBody();

$deliveryAddress = trim($data['delivery_address'] ?? '');
$paymentMethod = $data['payment_method'] ?? 'cod';

if (empty($deliveryAddress)) {
    sendJSON(["success" => false, "message" => "Delivery address is required"], 400);
}

// Fetch cart items
$stmt = $conn->prepare("SELECT c.*, f.price, f.food_name FROM cart c JOIN foods f ON c.food_id = f.food_id WHERE c.user_id = ?");
$stmt->bind_param("i", $userId);
$stmt->execute();
$result = $stmt->get_result();
$cartItems = [];
$subtotal = 0;
while ($row = $result->fetch_assoc()) {
    $cartItems[] = $row;
    $subtotal += $row['price'] * $row['quantity'];
}
$stmt->close();

if (empty($cartItems)) {
    sendJSON(["success" => false, "message" => "Cart is empty"], 400);
}

// Calculate totals
$deliveryFee = $subtotal >= 500 ? 0 : 40.00;
$totalAmount = $subtotal + $deliveryFee;

// Begin transaction
$conn->begin_transaction();

try {
    // Create order
    $stmt = $conn->prepare("INSERT INTO orders (user_id, total_amount, delivery_fee, delivery_address, payment_method, order_status) VALUES (?, ?, ?, ?, ?, 'pending')");
    $stmt->bind_param("iddss", $userId, $totalAmount, $deliveryFee, $deliveryAddress, $paymentMethod);
    $stmt->execute();
    $orderId = $stmt->insert_id;
    $stmt->close();

    // Create order items
    $stmt = $conn->prepare("INSERT INTO order_items (order_id, food_id, quantity, price) VALUES (?, ?, ?, ?)");
    foreach ($cartItems as $item) {
        $stmt->bind_param("iiid", $orderId, $item['food_id'], $item['quantity'], $item['price']);
        $stmt->execute();
    }
    $stmt->close();

    // Clear cart
    $stmt = $conn->prepare("DELETE FROM cart WHERE user_id = ?");
    $stmt->bind_param("i", $userId);
    $stmt->execute();
    $stmt->close();

    $conn->commit();

    sendJSON([
        "success" => true,
        "message" => "Order placed successfully!",
        "data" => [
            "order_id" => $orderId,
            "total_amount" => $totalAmount,
            "delivery_fee" => $deliveryFee,
            "payment_method" => $paymentMethod,
            "status" => "pending"
        ]
    ], 201);

} catch (Exception $e) {
    $conn->rollback();
    sendJSON(["success" => false, "message" => "Failed to place order: " . $e->getMessage()], 500);
}
?>
