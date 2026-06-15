<?php
/**
 * FoodieHub - Favorites API
 * GET: Fetch favorites | POST: Toggle favorite
 */

require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/db.php';

requireLogin();
$userId = $_SESSION['user_id'];

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $stmt = $conn->prepare("SELECT fav.*, f.food_name, f.price, f.image, f.rating, f.description, r.restaurant_name, c.category_name FROM favorites fav JOIN foods f ON fav.food_id = f.food_id LEFT JOIN restaurants r ON f.restaurant_id = r.restaurant_id LEFT JOIN categories c ON f.category_id = c.category_id WHERE fav.user_id = ? ORDER BY fav.added_at DESC");
    $stmt->bind_param("i", $userId);
    $stmt->execute();
    $result = $stmt->get_result();
    $favorites = [];
    while ($row = $result->fetch_assoc()) $favorites[] = $row;
    $stmt->close();

    sendJSON(["success" => true, "data" => $favorites]);

} elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = getRequestBody();
    $foodId = $data['food_id'] ?? 0;
    if (!$foodId) sendJSON(["success" => false, "message" => "Food ID is required"], 400);

    // Toggle: remove if exists, add if not
    $stmt = $conn->prepare("SELECT favorite_id FROM favorites WHERE user_id = ? AND food_id = ?");
    $stmt->bind_param("ii", $userId, $foodId);
    $stmt->execute();
    $existing = $stmt->get_result()->fetch_assoc();
    $stmt->close();

    if ($existing) {
        $stmt = $conn->prepare("DELETE FROM favorites WHERE favorite_id = ?");
        $stmt->bind_param("i", $existing['favorite_id']);
        $stmt->execute();
        $stmt->close();
        sendJSON(["success" => true, "message" => "Removed from favorites", "data" => ["is_favorite" => false]]);
    } else {
        $stmt = $conn->prepare("INSERT INTO favorites (user_id, food_id) VALUES (?, ?)");
        $stmt->bind_param("ii", $userId, $foodId);
        $stmt->execute();
        $stmt->close();
        sendJSON(["success" => true, "message" => "Added to favorites", "data" => ["is_favorite" => true]], 201);
    }
} else {
    sendJSON(["success" => false, "message" => "Method not allowed"], 405);
}
?>
