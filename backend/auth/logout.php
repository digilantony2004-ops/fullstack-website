<?php
/**
 * FoodieHub - User Logout
 * POST: Destroy user session
 */

require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/db.php';

session_unset();
session_destroy();

sendJSON([
    "success" => true,
    "message" => "Logged out successfully"
]);
?>
