<?php
/**
 * FoodieHub - Database Configuration
 * Handles MySQL connection and helper functions
 */

session_start();

$host = "localhost";
$username = "root";
$password = "";
$database = "foodiehub";

$conn = mysqli_connect($host, $username, $password, $database);

if (!$conn) {
    die(json_encode([
        "success" => false,
        "message" => "Database Connection Failed: " . mysqli_connect_error()
    ]));
}

// Set charset to UTF-8
mysqli_set_charset($conn, "utf8mb4");

/**
 * Send JSON response with HTTP status code
 */
function sendJSON($data, $status = 200) {
    http_response_code($status);
    header("Content-Type: application/json; charset=UTF-8");
    echo json_encode($data);
    exit();
}

/**
 * Require user to be logged in
 */
function requireLogin() {
    if (!isset($_SESSION['user_id'])) {
        sendJSON([
            "success" => false,
            "message" => "Please login to continue"
        ], 401);
    }
}

/**
 * Get JSON request body
 */
function getRequestBody() {
    $json = file_get_contents("php://input");
    return json_decode($json, true) ?? [];
}
?>