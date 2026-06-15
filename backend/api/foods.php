<?php
/**
 * FoodieHub - Foods API
 * GET: Fetch foods with filtering, search, and sorting
 */

require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    sendJSON(["success" => false, "message" => "Method not allowed"], 405);
}

$id = $_GET['id'] ?? null;
$category = $_GET['category'] ?? null;
$restaurant = $_GET['restaurant'] ?? null;
$search = $_GET['search'] ?? null;
$popular = $_GET['popular'] ?? null;

if ($id) {
    // Single food with reviews
    $stmt = $conn->prepare("SELECT f.*, r.restaurant_name, r.location, c.category_name FROM foods f LEFT JOIN restaurants r ON f.restaurant_id = r.restaurant_id LEFT JOIN categories c ON f.category_id = c.category_id WHERE f.food_id = ?");
    $stmt->bind_param("i", $id);
    $stmt->execute();
    $food = $stmt->get_result()->fetch_assoc();
    $stmt->close();

    if (!$food) {
        sendJSON(["success" => false, "message" => "Food not found"], 404);
    }

    // Get reviews
    $stmt = $conn->prepare("SELECT rv.*, u.name as user_name FROM reviews rv JOIN users u ON rv.user_id = u.user_id WHERE rv.food_id = ? ORDER BY rv.created_at DESC");
    $stmt->bind_param("i", $id);
    $stmt->execute();
    $result = $stmt->get_result();
    $reviews = [];
    while ($row = $result->fetch_assoc()) $reviews[] = $row;
    $stmt->close();

    $food['reviews'] = $reviews;
    sendJSON(["success" => true, "data" => $food]);

} else {
    // All foods with filters
    $query = "SELECT f.*, r.restaurant_name, c.category_name FROM foods f LEFT JOIN restaurants r ON f.restaurant_id = r.restaurant_id LEFT JOIN categories c ON f.category_id = c.category_id WHERE f.is_available = TRUE";
    $params = [];
    $types = "";

    if ($category) {
        $query .= " AND f.category_id = ?";
        $params[] = $category;
        $types .= "i";
    }
    if ($restaurant) {
        $query .= " AND f.restaurant_id = ?";
        $params[] = $restaurant;
        $types .= "i";
    }
    if ($search) {
        $query .= " AND (f.food_name LIKE ? OR f.description LIKE ?)";
        $searchParam = "%$search%";
        $params[] = $searchParam;
        $params[] = $searchParam;
        $types .= "ss";
    }
    if ($popular) {
        $query .= " AND f.is_popular = TRUE";
    }

    $query .= " ORDER BY f.is_popular DESC, f.rating DESC";

    $stmt = $conn->prepare($query);
    if (!empty($params)) {
        $stmt->bind_param($types, ...$params);
    }
    $stmt->execute();
    $result = $stmt->get_result();
    $foods = [];
    while ($row = $result->fetch_assoc()) $foods[] = $row;
    $stmt->close();

    sendJSON(["success" => true, "data" => $foods]);
}
?>
