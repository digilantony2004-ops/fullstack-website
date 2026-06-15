/**
 * FoodieHub - Core Application JavaScript
 * Shared utilities loaded on every page
 */

// ===== CONFIGURATION =====
const API_BASE = 'http://localhost/fullstack-website/backend';

// ===== TOAST NOTIFICATIONS =====
function initToastContainer() {
    if (!document.querySelector('.toast-container')) {
        const container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
    }
}

function showToast(message, type = 'success', duration = 3000) {
    initToastContainer();
    const container = document.querySelector('.toast-container');
    const icons = { success: 'fa-check-circle', error: 'fa-times-circle', warning: 'fa-exclamation-triangle', info: 'fa-info-circle' };
    
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <i class="fas ${icons[type] || icons.info} toast-icon"></i>
        <span class="toast-message">${message}</span>
        <button class="toast-close" onclick="this.parentElement.classList.add('removing');setTimeout(()=>this.parentElement.remove(),300)"><i class="fas fa-times"></i></button>
    `;
    container.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('removing');
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

// ===== API HELPER =====
async function apiCall(endpoint, method = 'GET', body = null) {
    try {
        const options = {
            method,
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include'
        };
        if (body && method !== 'GET') {
            options.body = JSON.stringify(body);
        }
        const response = await fetch(`${API_BASE}${endpoint}`, options);
        const data = await response.json();
        
        if (!response.ok && !data.success) {
            throw new Error(data.message || 'Request failed');
        }
        return data;
    } catch (error) {
        console.error(`API Error [${method} ${endpoint}]:`, error);
        throw error;
    }
}

// ===== AUTH STATE =====
async function checkAuth() {
    try {
        const cached = sessionStorage.getItem('foodiehub_user');
        if (cached) {
            const user = JSON.parse(cached);
            updateNavbar(user);
            return user;
        }
        const response = await apiCall('/auth/session.php');
        if (response.success) {
            sessionStorage.setItem('foodiehub_user', JSON.stringify(response.data));
            updateNavbar(response.data);
            return response.data;
        }
    } catch (e) {
        // Not logged in
    }
    updateNavbar(null);
    return null;
}

function updateNavbar(user) {
    const authBtns = document.getElementById('auth-buttons');
    const userDropdown = document.getElementById('user-dropdown');
    const userName = document.getElementById('user-name');

    if (!authBtns || !userDropdown) return;

    if (user) {
        authBtns.style.display = 'none';
        userDropdown.style.display = 'block';
        userDropdown.classList.add('active');
        if (userName) userName.textContent = user.name;
    } else {
        authBtns.style.display = 'flex';
        userDropdown.style.display = 'none';
        userDropdown.classList.remove('active');
    }
}

async function logout() {
    try {
        await apiCall('/auth/logout.php', 'POST');
    } catch (e) { /* ignore */ }
    sessionStorage.removeItem('foodiehub_user');
    showToast('Logged out successfully', 'success');
    setTimeout(() => {
        const isInPages = window.location.pathname.includes('/pages/');
        window.location.href = isInPages ? 'login.html' : 'pages/login.html';
    }, 500);
}

// ===== NAVBAR =====
function setupNavbar() {
    // Hamburger toggle
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('nav-links');
    if (hamburger && navLinks) {
        hamburger.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });
        // Close on outside click
        document.addEventListener('click', (e) => {
            if (!hamburger.contains(e.target) && !navLinks.contains(e.target)) {
                navLinks.classList.remove('active');
            }
        });
    }

    // Scroll effect
    const navbar = document.getElementById('navbar');
    if (navbar && !navbar.classList.contains('scrolled')) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });
    }

    // User dropdown toggle
    const dropdownBtn = document.getElementById('user-dropdown-btn');
    const dropdownMenu = document.getElementById('user-dropdown-menu');
    if (dropdownBtn && dropdownMenu) {
        dropdownBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdownMenu.classList.toggle('show');
        });
        document.addEventListener('click', () => {
            dropdownMenu.classList.remove('show');
        });
    }
}

// ===== CART BADGE =====
async function updateCartBadge() {
    const badge = document.getElementById('cart-badge');
    if (!badge) return;
    try {
        const response = await apiCall('/api/cart.php');
        if (response.success && response.data.count > 0) {
            badge.textContent = response.data.count;
            badge.classList.remove('hidden');
        } else {
            badge.classList.add('hidden');
        }
    } catch (e) {
        badge.classList.add('hidden');
    }
}

// ===== SCROLL ANIMATIONS =====
function setupScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.classList.add('animated');
                }, index * 100);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.animate-on-scroll').forEach(el => observer.observe(el));
}

// ===== UTILITIES =====
function formatPrice(amount) {
    return `₹${parseFloat(amount).toFixed(2)}`;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
        year: 'numeric', month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });
}

function debounce(func, delay = 300) {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(null, args), delay);
    };
}

function renderStars(rating) {
    const full = Math.floor(rating);
    const half = rating % 1 >= 0.5 ? 1 : 0;
    const empty = 5 - full - half;
    let html = '';
    for (let i = 0; i < full; i++) html += '<i class="fas fa-star"></i>';
    if (half) html += '<i class="fas fa-star-half-alt"></i>';
    for (let i = 0; i < empty; i++) html += '<i class="far fa-star"></i>';
    return html;
}

function createSkeletonCards(count, container) {
    let html = '';
    for (let i = 0; i < count; i++) {
        html += `<div class="skeleton-card skeleton"><div class="skeleton-image skeleton"></div><div class="skeleton-text skeleton"></div><div class="skeleton-text skeleton short"></div></div>`;
    }
    container.innerHTML = html;
}

function showEmptyState(container, message, icon = 'fa-box-open') {
    container.innerHTML = `
        <div class="empty-state">
            <i class="fas ${icon}"></i>
            <h3>${message}</h3>
            <p>Looks like there's nothing here yet.</p>
            <a href="${window.location.pathname.includes('/pages/') ? 'menu.html' : 'pages/menu.html'}" class="btn btn-primary"><i class="fas fa-utensils"></i> Browse Menu</a>
        </div>
    `;
}

function renderFoodCard(food, showRestaurant = true) {
    const badges = [];
    if (food.is_vegetarian == 1) badges.push('<span class="badge badge-veg"><i class="fas fa-leaf"></i> Veg</span>');
    if (food.is_popular == 1) badges.push('<span class="badge badge-popular"><i class="fas fa-fire"></i> Popular</span>');
    
    return `
        <div class="food-card" data-food-id="${food.food_id}">
            <div class="food-card-image">
                <img src="${food.image || 'https://via.placeholder.com/400x300/1a1a2e/ff6b35?text=Food'}" alt="${food.food_name}" loading="lazy">
                <div class="food-card-badges">${badges.join('')}</div>
                <button class="food-card-favorite" onclick="event.stopPropagation();toggleFavoriteBtn(${food.food_id}, this)" title="Add to favorites">
                    <i class="far fa-heart"></i>
                </button>
            </div>
            <div class="food-card-body">
                <h4>${food.food_name}</h4>
                ${showRestaurant && food.restaurant_name ? `<div class="food-card-restaurant"><i class="fas fa-store"></i> ${food.restaurant_name}</div>` : ''}
                <div class="food-card-rating">
                    <span class="stars">${renderStars(food.rating || 4)}</span>
                    <span>${parseFloat(food.rating || 4).toFixed(1)}</span>
                </div>
            </div>
            <div class="food-card-footer">
                <div class="food-price"><small>₹</small>${parseFloat(food.price).toFixed(0)}</div>
                <button class="add-to-cart-btn" onclick="event.stopPropagation();addToCart(${food.food_id})">
                    <i class="fas fa-plus"></i> Add
                </button>
            </div>
        </div>
    `;
}

// ===== ADD TO CART (Global) =====
async function addToCart(foodId) {
    try {
        const user = await checkAuth();
        if (!user) {
            showToast('Please login to add items to cart', 'warning');
            setTimeout(() => {
                const isInPages = window.location.pathname.includes('/pages/');
                window.location.href = isInPages ? 'login.html' : 'pages/login.html';
            }, 1000);
            return;
        }
        const response = await apiCall('/api/cart.php', 'POST', { food_id: foodId, quantity: 1 });
        if (response.success) {
            showToast('Added to cart! 🛒', 'success');
            updateCartBadge();
        }
    } catch (error) {
        showToast(error.message || 'Failed to add to cart', 'error');
    }
}

// ===== TOGGLE FAVORITE (Global) =====
async function toggleFavoriteBtn(foodId, btn) {
    try {
        const user = await checkAuth();
        if (!user) {
            showToast('Please login to save favorites', 'warning');
            return;
        }
        const response = await apiCall('/api/favorites.php', 'POST', { food_id: foodId });
        if (response.success) {
            const icon = btn.querySelector('i');
            if (response.data.is_favorite) {
                icon.classList.replace('far', 'fas');
                btn.classList.add('active');
                showToast('Added to favorites ❤️', 'success');
            } else {
                icon.classList.replace('fas', 'far');
                btn.classList.remove('active');
                showToast('Removed from favorites', 'info');
            }
        }
    } catch (error) {
        showToast(error.message || 'Failed to update favorites', 'error');
    }
}

// ===== PASSWORD TOGGLE (Global) =====
function togglePassword(inputId, btn) {
    const input = document.getElementById(inputId);
    const icon = btn.querySelector('i');
    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.replace('fa-eye', 'fa-eye-slash');
    } else {
        input.type = 'password';
        icon.classList.replace('fa-eye-slash', 'fa-eye');
    }
}

// ===== BACK TO TOP =====
function setupBackToTop() {
    const btn = document.getElementById('back-to-top');
    if (!btn) return;
    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            btn.classList.add('show');
        } else {
            btn.classList.remove('show');
        }
    });
    btn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
    setupNavbar();
    setupScrollAnimations();
    setupBackToTop();
    checkAuth();
    updateCartBadge();
});
