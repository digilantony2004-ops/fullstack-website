<?php
/**
 * FoodieHub - Session Check
 * GET: Check if user is authenticated
 */

require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/db.php';

if (isset($_SESSION['user_id'])) {
    sendJSON([
        "success" => true,
        "data" => [
            "user_id" => $_SESSION['user_id'],
            "name" => $_SESSION['user_name'],
            "email" => $_SESSION['user_email'],
            "role" => $_SESSION['user_role']
        ]
    ]);
} else {
    sendJSON(["success" => false, "message" => "Not authenticated"], 401);
}
?>
