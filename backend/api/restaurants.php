<?php
/**
 * FoodieHub - Restaurants API
 * GET: Fetch all restaurants or single restaurant with menu
 */

require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    sendJSON(["success" => false, "message" => "Method not allowed"], 405);
}

$id = $_GET['id'] ?? null;
$search = $_GET['search'] ?? null;

if ($id) {
    // Single restaurant with its foods
    $stmt = $conn->prepare("SELECT * FROM restaurants WHERE restaurant_id = ? AND is_active = TRUE");
    $stmt->bind_param("i", $id);
    $stmt->execute();
    $restaurant = $stmt->get_result()->fetch_assoc();
    $stmt->close();

    if (!$restaurant) {
        sendJSON(["success" => false, "message" => "Restaurant not found"], 404);
    }

    // Get foods for this restaurant
    $stmt = $conn->prepare("SELECT f.*, c.category_name FROM foods f LEFT JOIN categories c ON f.category_id = c.category_id WHERE f.restaurant_id = ? AND f.is_available = TRUE ORDER BY f.is_popular DESC, f.food_name ASC");
    $stmt->bind_param("i", $id);
    $stmt->execute();
    $result = $stmt->get_result();
    $foods = [];
    while ($row = $result->fetch_assoc()) $foods[] = $row;
    $stmt->close();

    $restaurant['foods'] = $foods;
    sendJSON(["success" => true, "data" => $restaurant]);

} else {
    // All restaurants
    $query = "SELECT r.*, (SELECT COUNT(*) FROM foods f WHERE f.restaurant_id = r.restaurant_id AND f.is_available = TRUE) as food_count FROM restaurants r WHERE r.is_active = TRUE";
    $params = [];
    $types = "";

    if ($search) {
        $query .= " AND (r.restaurant_name LIKE ? OR r.cuisine_type LIKE ? OR r.location LIKE ?)";
        $searchParam = "%$search%";
        $params = [$searchParam, $searchParam, $searchParam];
        $types = "sss";
    }

    $query .= " ORDER BY r.rating DESC";

    $stmt = $conn->prepare($query);
    if (!empty($params)) {
        $stmt->bind_param($types, ...$params);
    }
    $stmt->execute();
    $result = $stmt->get_result();
    $restaurants = [];
    while ($row = $result->fetch_assoc()) $restaurants[] = $row;
    $stmt->close();

    sendJSON(["success" => true, "data" => $restaurants]);
}
?>
