-- =============================================
-- FoodieHub - Food Booking System Database
-- =============================================

CREATE DATABASE IF NOT EXISTS foodiehub;
USE foodiehub;

-- =============================================
-- USERS TABLE
-- =============================================
CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20),
    password VARCHAR(255) NOT NULL,
    role ENUM('customer', 'admin') DEFAULT 'customer',
    profile_image VARCHAR(255) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- RESTAURANTS TABLE
-- =============================================
CREATE TABLE restaurants (
    restaurant_id INT AUTO_INCREMENT PRIMARY KEY,
    restaurant_name VARCHAR(100) NOT NULL,
    description TEXT,
    location VARCHAR(200),
    cuisine_type VARCHAR(100),
    rating DECIMAL(2,1) DEFAULT 4.0,
    delivery_time VARCHAR(50) DEFAULT '30-45 min',
    image VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- CATEGORIES TABLE
-- =============================================
CREATE TABLE categories (
    category_id INT AUTO_INCREMENT PRIMARY KEY,
    category_name VARCHAR(50) NOT NULL,
    icon VARCHAR(50) DEFAULT 'utensils',
    image VARCHAR(255)
);

-- =============================================
-- FOODS TABLE
-- =============================================
CREATE TABLE foods (
    food_id INT AUTO_INCREMENT PRIMARY KEY,
    restaurant_id INT,
    category_id INT,
    food_name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    image VARCHAR(255),
    rating DECIMAL(2,1) DEFAULT 4.0,
    is_available BOOLEAN DEFAULT TRUE,
    is_popular BOOLEAN DEFAULT FALSE,
    is_vegetarian BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(restaurant_id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(category_id) ON DELETE SET NULL
);

-- =============================================
-- CART TABLE
-- =============================================
CREATE TABLE cart (
    cart_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    food_id INT NOT NULL,
    quantity INT DEFAULT 1,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (food_id) REFERENCES foods(food_id) ON DELETE CASCADE
);

-- =============================================
-- FAVORITES TABLE
-- =============================================
CREATE TABLE favorites (
    favorite_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    food_id INT NOT NULL,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (food_id) REFERENCES foods(food_id) ON DELETE CASCADE,
    UNIQUE KEY unique_favorite (user_id, food_id)
);

-- =============================================
-- REVIEWS TABLE
-- =============================================
CREATE TABLE reviews (
    review_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    food_id INT NOT NULL,
    rating INT NOT NULL,
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (food_id) REFERENCES foods(food_id) ON DELETE CASCADE
);

-- =============================================
-- ORDERS TABLE
-- =============================================
CREATE TABLE orders (
    order_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    delivery_fee DECIMAL(10,2) DEFAULT 40.00,
    delivery_address TEXT,
    payment_method ENUM('cod', 'card', 'upi') DEFAULT 'cod',
    order_status ENUM('pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled') DEFAULT 'pending',
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- =============================================
-- ORDER ITEMS TABLE
-- =============================================
CREATE TABLE order_items (
    order_item_id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    food_id INT NOT NULL,
    quantity INT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE,
    FOREIGN KEY (food_id) REFERENCES foods(food_id) ON DELETE CASCADE
);

-- =============================================
-- SEED DATA
-- =============================================

-- Admin user (password: admin123)
INSERT INTO users (name, email, phone, password, role) VALUES
('Admin', 'admin@foodiehub.com', '9876543210', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin'),
('John Doe', 'john@example.com', '9876543211', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'customer'),
('Jane Smith', 'jane@example.com', '9876543212', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'customer');

-- Categories
INSERT INTO categories (category_name, icon) VALUES
('Pizza', 'pizza-slice'),
('Burgers', 'hamburger'),
('Sushi', 'fish'),
('Indian', 'bowl-food'),
('Desserts', 'ice-cream'),
('Beverages', 'mug-hot');

-- Restaurants
INSERT INTO restaurants (restaurant_name, description, location, cuisine_type, rating, delivery_time, image) VALUES
('Pizza Paradise', 'Authentic Italian pizzas made with fresh ingredients and wood-fired ovens.', 'MG Road, Bangalore', 'Italian', 4.5, '25-35 min', 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400'),
('Burger Barn', 'Gourmet burgers with premium patties and artisan buns.', 'Koramangala, Bangalore', 'American', 4.3, '20-30 min', 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400'),
('Sakura Sushi', 'Traditional Japanese cuisine with the freshest fish and ingredients.', 'Indiranagar, Bangalore', 'Japanese', 4.7, '35-45 min', 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=400'),
('Spice Garden', 'Rich and flavorful Indian dishes prepared with authentic spices.', 'Jayanagar, Bangalore', 'Indian', 4.6, '30-40 min', 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400'),
('Sweet Tooth', 'Decadent desserts and refreshing beverages for every craving.', 'HSR Layout, Bangalore', 'Desserts & Drinks', 4.4, '20-30 min', 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400');

-- Foods
INSERT INTO foods (restaurant_id, category_id, food_name, description, price, image, rating, is_popular, is_vegetarian) VALUES
-- Pizza Paradise
(1, 1, 'Margherita Pizza', 'Classic pizza with fresh mozzarella, tomato sauce, and basil.', 299.00, 'https://images.unsplash.com/photo-1604382355076-af4b0eb60143?w=400', 4.5, TRUE, TRUE),
(1, 1, 'Pepperoni Pizza', 'Loaded with spicy pepperoni and melted cheese.', 399.00, 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400', 4.6, TRUE, FALSE),
(1, 1, 'BBQ Chicken Pizza', 'Smoky BBQ sauce with grilled chicken and red onions.', 449.00, 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400', 4.4, FALSE, FALSE),
(1, 1, 'Veggie Supreme', 'Loaded with bell peppers, olives, mushrooms, and corn.', 349.00, 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400', 4.3, FALSE, TRUE),

-- Burger Barn
(2, 2, 'Classic Cheeseburger', 'Juicy beef patty with cheddar cheese, lettuce, and tomato.', 249.00, 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400', 4.5, TRUE, FALSE),
(2, 2, 'Double Smash Burger', 'Two smashed patties with American cheese and special sauce.', 349.00, 'https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=400', 4.7, TRUE, FALSE),
(2, 2, 'Veggie Burger', 'Plant-based patty with avocado, lettuce, and chipotle mayo.', 279.00, 'https://images.unsplash.com/photo-1520072959219-c595dc870360?w=400', 4.2, FALSE, TRUE),
(2, 2, 'Chicken Zinger', 'Crispy fried chicken burger with coleslaw and mayo.', 299.00, 'https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=400', 4.4, TRUE, FALSE),

-- Sakura Sushi
(3, 3, 'California Roll', 'Crab, avocado, and cucumber wrapped in seasoned rice.', 499.00, 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=400', 4.6, TRUE, FALSE),
(3, 3, 'Salmon Nigiri', 'Fresh salmon slices on hand-pressed sushi rice.', 549.00, 'https://images.unsplash.com/photo-1583623025817-d180a2221d0a?w=400', 4.8, TRUE, FALSE),
(3, 3, 'Dragon Roll', 'Shrimp tempura roll topped with avocado and eel sauce.', 599.00, 'https://images.unsplash.com/photo-1617196034796-73dfa7b1fd56?w=400', 4.7, FALSE, FALSE),
(3, 3, 'Veggie Maki', 'Assorted vegetable roll with avocado and cucumber.', 399.00, 'https://images.unsplash.com/photo-1611143669185-af224c5e3252?w=400', 4.3, FALSE, TRUE),

-- Spice Garden
(4, 4, 'Butter Chicken', 'Tender chicken in rich, creamy tomato-butter gravy.', 349.00, 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=400', 4.8, TRUE, FALSE),
(4, 4, 'Paneer Tikka Masala', 'Grilled paneer cubes in spiced tomato-onion gravy.', 299.00, 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=400', 4.5, TRUE, TRUE),
(4, 4, 'Chicken Biryani', 'Fragrant basmati rice layered with spiced chicken and saffron.', 379.00, 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400', 4.7, TRUE, FALSE),
(4, 4, 'Dal Makhani', 'Slow-cooked black lentils in butter and cream.', 249.00, 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400', 4.4, FALSE, TRUE),
(4, 4, 'Tandoori Roti', 'Whole wheat bread baked in tandoor oven.', 49.00, 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400', 4.2, FALSE, TRUE),

-- Sweet Tooth
(5, 5, 'Chocolate Lava Cake', 'Warm chocolate cake with a molten center, served with ice cream.', 299.00, 'https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=400', 4.6, TRUE, TRUE),
(5, 5, 'Tiramisu', 'Classic Italian dessert with layers of mascarpone and coffee.', 349.00, 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400', 4.5, FALSE, TRUE),
(5, 5, 'Mango Lassi', 'Refreshing yogurt smoothie blended with ripe mangoes.', 149.00, 'https://images.unsplash.com/photo-1527661591475-527312dd65f5?w=400', 4.3, TRUE, TRUE),
(5, 6, 'Cold Coffee', 'Chilled coffee blended with milk and ice cream.', 179.00, 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400', 4.4, TRUE, TRUE),
(5, 6, 'Fresh Orange Juice', 'Freshly squeezed orange juice with no added sugar.', 129.00, 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=400', 4.2, FALSE, TRUE),
(5, 6, 'Masala Chai', 'Traditional Indian tea brewed with aromatic spices.', 79.00, 'https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=400', 4.5, FALSE, TRUE);

-- Sample Reviews
INSERT INTO reviews (user_id, food_id, rating, comment) VALUES
(2, 1, 5, 'Best margherita pizza I have ever had! The crust was perfect.'),
(3, 1, 4, 'Really good pizza. Fresh ingredients and quick delivery.'),
(2, 5, 5, 'The classic cheeseburger is absolutely delicious!'),
(3, 13, 5, 'Butter chicken here is legendary. Must try!'),
(2, 15, 4, 'Biryani was flavorful and well-cooked. Great portions.'),
(3, 19, 5, 'Chocolate lava cake is to die for! Perfect dessert.');