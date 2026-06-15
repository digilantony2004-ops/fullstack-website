# 🍔 FoodieHub - Food Booking System

<div align="center">

![FoodieHub](https://img.shields.io/badge/FoodieHub-Food%20Booking%20System-FF6B35?style=for-the-badge&logo=firebase&logoColor=white)
![PHP](https://img.shields.io/badge/PHP-777BB4?style=for-the-badge&logo=php&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-005C84?style=for-the-badge&logo=mysql&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)

**A modern, full-stack food ordering platform with a stunning dark-mode UI, built with PHP, MySQL, and vanilla JavaScript.**

[Live Demo](#) • [Features](#-features) • [Setup](#-setup) • [Tech Stack](#-tech-stack)

</div>

---

## ✨ Features

### 🛍️ Customer Features
- **Browse Menu** — Explore 20+ dishes across 6 categories with search, filtering, and sorting
- **Restaurant Pages** — View individual restaurant menus, ratings, and delivery times
- **Shopping Cart** — Add, remove, and adjust quantities with real-time price updates
- **Secure Checkout** — Multiple payment options (COD, Card, UPI) with address management
- **Order Tracking** — Real-time order status with visual timeline (Pending → Confirmed → Preparing → Delivered)
- **Favorites** — Save favorite dishes with heart toggle for quick access
- **Reviews & Ratings** — Rate and review food items with star ratings
- **User Authentication** — Secure registration and login with password hashing

### 🎨 Design Features
- **Premium Dark Mode** — Stunning dark theme with glassmorphism and orange/amber accents
- **Micro-Animations** — Smooth transitions, hover effects, and scroll animations
- **Responsive Design** — Fully responsive across desktop, tablet, and mobile
- **Toast Notifications** — Elegant slide-in notifications for user feedback
- **Skeleton Loading** — Shimmer loading states for a polished experience
- **Custom Scrollbar** — Styled scrollbar matching the dark theme

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | HTML5, CSS3, Vanilla JavaScript (ES6+) |
| **Backend** | PHP 7+ with MySQLi |
| **Database** | MySQL with 9 tables |
| **Fonts** | Google Fonts (Outfit, Inter) |
| **Icons** | Font Awesome 6 |
| **Auth** | PHP Sessions + bcrypt password hashing |

---

## 📁 Project Structure

```
fullstack-website/
├── frontend/
│   ├── index.html              # Home/Landing page
│   ├── style.css               # Complete CSS design system (1200+ lines)
│   ├── pages/
│   │   ├── menu.html           # Browse all food items
│   │   ├── restaurant.html     # Restaurant detail view
│   │   ├── cart.html           # Shopping cart
│   │   ├── checkout.html       # Checkout & payment
│   │   ├── orders.html         # Order history & tracking
│   │   ├── login.html          # User login
│   │   ├── register.html       # User registration
│   │   └── favorites.html      # Saved favorites
│   └── assests/
│       └── js/
│           ├── app.js          # Core utilities & shared functions
│           ├── home.js         # Home page logic
│           ├── menu.js         # Menu filtering & search
│           ├── cart.js         # Cart management
│           ├── checkout.js     # Checkout flow
│           ├── orders.js       # Order tracking
│           ├── auth.js         # Login/Register
│           ├── favorites.js    # Favorites management
│           └── restaurant.js   # Restaurant detail
├── backend/
│   ├── config/
│   │   ├── db.php              # Database connection & helpers
│   │   └── cors.php            # CORS headers
│   ├── auth/
│   │   ├── register.php        # User registration
│   │   ├── login.php           # User login
│   │   ├── logout.php          # User logout
│   │   └── session.php         # Session check
│   ├── api/
│   │   ├── restaurants.php     # Restaurants CRUD
│   │   ├── foods.php           # Foods with filtering
│   │   ├── categories.php      # Categories API
│   │   ├── cart.php            # Cart CRUD
│   │   ├── favorites.php       # Favorites toggle
│   │   └── reviews.php         # Reviews API
│   └── orders/
│       ├── place_order.php     # Create order
│       ├── get_orders.php      # Order history
│       └── order_details.php   # Single order detail
├── foodiehub.sql               # Database schema + seed data
├── .gitignore
└── README.md
```

---

## 🚀 Setup

### Prerequisites
- **XAMPP/WAMP/LAMP** with Apache & MySQL
- **PHP 7.4+**
- **Git**

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/fullstack-website.git
   ```

2. **Move to your web server directory**
   ```bash
   # For XAMPP
   cp -r fullstack-website /xampp/htdocs/
   ```

3. **Import the database**
   - Open phpMyAdmin (`http://localhost/phpmyadmin`)
   - Create a new database named `foodiehub`
   - Import `foodiehub.sql`

4. **Configure database connection**
   - Edit `backend/config/db.php` if your MySQL credentials differ from default

5. **Open in browser**
   ```
   http://localhost/fullstack-website/frontend/
   ```

### Default Accounts
| Role | Email | Password |
|------|-------|----------|
| Admin | admin@foodiehub.com | admin123 |
| Customer | john@example.com | password |

---

## 📸 Screenshots

> Open `frontend/index.html` in your browser to see the stunning dark-mode interface!

---

## 🗄️ Database Schema

The application uses **9 tables**:
- `users` — User accounts with roles (customer/admin)
- `restaurants` — Restaurant listings with ratings
- `categories` — Food categories (Pizza, Burgers, etc.)
- `foods` — Menu items with pricing and availability
- `cart` — Shopping cart items per user
- `favorites` — User favorite dishes
- `reviews` — Food ratings and comments
- `orders` — Order records with status tracking
- `order_items` — Individual items in each order

---

## 👨‍💻 Author

**Digil Antony**

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
