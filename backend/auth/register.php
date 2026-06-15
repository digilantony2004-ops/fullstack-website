<?php
/**
 * FoodieHub - User Registration
 * POST: Register a new customer account
 */

require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendJSON(["success" => false, "message" => "Method not allowed"], 405);
}

$data = getRequestBody();
$name = trim($data['name'] ?? '');
$email = trim($data['email'] ?? '');
$phone = trim($data['phone'] ?? '');
$password = $data['password'] ?? '';

// Validation
if (empty($name)) sendJSON(["success" => false, "message" => "Name is required"], 400);
if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    sendJSON(["success" => false, "message" => "Valid email is required"], 400);
}
if (strlen($password) < 6) {
    sendJSON(["success" => false, "message" => "Password must be at least 6 characters"], 400);
}

// Check if email exists
$stmt = $conn->prepare("SELECT user_id FROM users WHERE email = ?");
$stmt->bind_param("s", $email);
$stmt->execute();
if ($stmt->get_result()->num_rows > 0) {
    sendJSON(["success" => false, "message" => "Email already registered"], 409);
}
$stmt->close();

// Hash password and insert
$hashedPassword = password_hash($password, PASSWORD_DEFAULT);
$stmt = $conn->prepare("INSERT INTO users (name, email, phone, password, role) VALUES (?, ?, ?, ?, 'customer')");
$stmt->bind_param("ssss", $name, $email, $phone, $hashedPassword);

if ($stmt->execute()) {
    $userId = $stmt->insert_id;
    $_SESSION['user_id'] = $userId;
    $_SESSION['user_name'] = $name;
    $_SESSION['user_email'] = $email;
    $_SESSION['user_role'] = 'customer';

    sendJSON([
        "success" => true,
        "message" => "Registration successful",
        "data" => [
            "user_id" => $userId,
            "name" => $name,
            "email" => $email,
            "role" => "customer"
        ]
    ], 201);
} else {
    sendJSON(["success" => false, "message" => "Registration failed"], 500);
}
$stmt->close();
?>
