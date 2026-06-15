<?php
/**
 * FoodieHub - Categories API
 * GET: Fetch all categories with food count
 */

require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    sendJSON(["success" => false, "message" => "Method not allowed"], 405);
}

$query = "SELECT c.*, (SELECT COUNT(*) FROM foods f WHERE f.category_id = c.category_id AND f.is_available = TRUE) as food_count FROM categories c ORDER BY c.category_name ASC";

$result = $conn->query($query);
$categories = [];
while ($row = $result->fetch_assoc()) $categories[] = $row;

sendJSON(["success" => true, "data" => $categories]);
?>
