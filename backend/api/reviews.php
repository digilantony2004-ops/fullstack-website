<?php
/**
 * FoodieHub - Reviews API
 * GET: Fetch reviews for food | POST: Add review
 */

require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/db.php';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $foodId = $_GET['food_id'] ?? 0;
    if (!$foodId) sendJSON(["success" => false, "message" => "Food ID is required"], 400);

    $stmt = $conn->prepare("SELECT rv.*, u.name as user_name FROM reviews rv JOIN users u ON rv.user_id = u.user_id WHERE rv.food_id = ? ORDER BY rv.created_at DESC");
    $stmt->bind_param("i", $foodId);
    $stmt->execute();
    $result = $stmt->get_result();
    $reviews = [];
    while ($row = $result->fetch_assoc()) $reviews[] = $row;
    $stmt->close();

    sendJSON(["success" => true, "data" => $reviews]);

} elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    requireLogin();
    $data = getRequestBody();
    $foodId = $data['food_id'] ?? 0;
    $rating = $data['rating'] ?? 0;
    $comment = trim($data['comment'] ?? '');

    if (!$foodId || !$rating || $rating < 1 || $rating > 5) {
        sendJSON(["success" => false, "message" => "Valid food ID and rating (1-5) are required"], 400);
    }

    $stmt = $conn->prepare("INSERT INTO reviews (user_id, food_id, rating, comment) VALUES (?, ?, ?, ?)");
    $stmt->bind_param("iiis", $_SESSION['user_id'], $foodId, $rating, $comment);
    
    if ($stmt->execute()) {
        // Update food average rating
        $stmt2 = $conn->prepare("UPDATE foods SET rating = (SELECT AVG(rating) FROM reviews WHERE food_id = ?) WHERE food_id = ?");
        $stmt2->bind_param("ii", $foodId, $foodId);
        $stmt2->execute();
        $stmt2->close();

        sendJSON(["success" => true, "message" => "Review added successfully"], 201);
    } else {
        sendJSON(["success" => false, "message" => "Failed to add review"], 500);
    }
    $stmt->close();
} else {
    sendJSON(["success" => false, "message" => "Method not allowed"], 405);
}
?>
