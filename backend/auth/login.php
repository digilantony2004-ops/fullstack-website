<?php
/**
 * FoodieHub - User Login
 * POST: Authenticate user with email and password
 */

require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendJSON(["success" => false, "message" => "Method not allowed"], 405);
}

$data = getRequestBody();
$email = trim($data['email'] ?? '');
$password = $data['password'] ?? '';

// Validation
if (empty($email) || empty($password)) {
    sendJSON(["success" => false, "message" => "Email and password are required"], 400);
}

// Fetch user
$stmt = $conn->prepare("SELECT user_id, name, email, phone, password, role, profile_image FROM users WHERE email = ?");
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    sendJSON(["success" => false, "message" => "Invalid email or password"], 401);
}

$user = $result->fetch_assoc();

// Verify password
if (!password_verify($password, $user['password'])) {
    sendJSON(["success" => false, "message" => "Invalid email or password"], 401);
}

// Set session
$_SESSION['user_id'] = $user['user_id'];
$_SESSION['user_name'] = $user['name'];
$_SESSION['user_email'] = $user['email'];
$_SESSION['user_role'] = $user['role'];

sendJSON([
    "success" => true,
    "message" => "Login successful",
    "data" => [
        "user_id" => $user['user_id'],
        "name" => $user['name'],
        "email" => $user['email'],
        "phone" => $user['phone'],
        "role" => $user['role'],
        "profile_image" => $user['profile_image']
    ]
]);

$stmt->close();
?>
