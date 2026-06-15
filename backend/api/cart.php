<?php
/**
 * FoodieHub - Cart API
 * GET: Fetch cart items | POST: Add to cart | PUT: Update quantity | DELETE: Remove item
 */

require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/db.php';

requireLogin();
$userId = $_SESSION['user_id'];
$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        $stmt = $conn->prepare("SELECT c.*, f.food_name, f.price, f.image, f.description, r.restaurant_name FROM cart c JOIN foods f ON c.food_id = f.food_id LEFT JOIN restaurants r ON f.restaurant_id = r.restaurant_id WHERE c.user_id = ? ORDER BY c.added_at DESC");
        $stmt->bind_param("i", $userId);
        $stmt->execute();
        $result = $stmt->get_result();
        $items = [];
        $total = 0;
        while ($row = $result->fetch_assoc()) {
            $row['item_total'] = $row['price'] * $row['quantity'];
            $total += $row['item_total'];
            $items[] = $row;
        }
        $stmt->close();

        sendJSON([
            "success" => true,
            "data" => [
                "items" => $items,
                "count" => count($items),
                "subtotal" => $total
            ]
        ]);
        break;

    case 'POST':
        $data = getRequestBody();
        $foodId = $data['food_id'] ?? 0;
        $quantity = $data['quantity'] ?? 1;

        if (!$foodId) sendJSON(["success" => false, "message" => "Food ID is required"], 400);

        // Check if already in cart
        $stmt = $conn->prepare("SELECT cart_id, quantity FROM cart WHERE user_id = ? AND food_id = ?");
        $stmt->bind_param("ii", $userId, $foodId);
        $stmt->execute();
        $existing = $stmt->get_result()->fetch_assoc();
        $stmt->close();

        if ($existing) {
            $newQty = $existing['quantity'] + $quantity;
            $stmt = $conn->prepare("UPDATE cart SET quantity = ? WHERE cart_id = ?");
            $stmt->bind_param("ii", $newQty, $existing['cart_id']);
            $stmt->execute();
            $stmt->close();
            sendJSON(["success" => true, "message" => "Cart updated", "data" => ["cart_id" => $existing['cart_id'], "quantity" => $newQty]]);
        } else {
            $stmt = $conn->prepare("INSERT INTO cart (user_id, food_id, quantity) VALUES (?, ?, ?)");
            $stmt->bind_param("iii", $userId, $foodId, $quantity);
            $stmt->execute();
            $cartId = $stmt->insert_id;
            $stmt->close();
            sendJSON(["success" => true, "message" => "Added to cart", "data" => ["cart_id" => $cartId, "quantity" => $quantity]], 201);
        }
        break;

    case 'PUT':
        $data = getRequestBody();
        $cartId = $data['cart_id'] ?? 0;
        $quantity = $data['quantity'] ?? 1;

        if (!$cartId) sendJSON(["success" => false, "message" => "Cart ID is required"], 400);

        if ($quantity <= 0) {
            $stmt = $conn->prepare("DELETE FROM cart WHERE cart_id = ? AND user_id = ?");
            $stmt->bind_param("ii", $cartId, $userId);
            $stmt->execute();
            $stmt->close();
            sendJSON(["success" => true, "message" => "Item removed from cart"]);
        } else {
            $stmt = $conn->prepare("UPDATE cart SET quantity = ? WHERE cart_id = ? AND user_id = ?");
            $stmt->bind_param("iii", $quantity, $cartId, $userId);
            $stmt->execute();
            $stmt->close();
            sendJSON(["success" => true, "message" => "Quantity updated", "data" => ["quantity" => $quantity]]);
        }
        break;

    case 'DELETE':
        $data = getRequestBody();
        $cartId = $data['cart_id'] ?? ($_GET['cart_id'] ?? 0);

        if (!$cartId) sendJSON(["success" => false, "message" => "Cart ID is required"], 400);

        $stmt = $conn->prepare("DELETE FROM cart WHERE cart_id = ? AND user_id = ?");
        $stmt->bind_param("ii", $cartId, $userId);
        $stmt->execute();
        $stmt->close();

        sendJSON(["success" => true, "message" => "Item removed from cart"]);
        break;

    default:
        sendJSON(["success" => false, "message" => "Method not allowed"], 405);
}
?>
