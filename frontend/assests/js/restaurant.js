/**
 * FoodieHub - Restaurant Detail Page JavaScript
 * Loads restaurant info, menu, and reviews
 */

let restaurantFoods = [];

// ===== LOAD RESTAURANT =====
async function loadRestaurant() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');

    if (!id) {
        showToast('Restaurant not found', 'error');
        setTimeout(() => window.location.href = 'menu.html', 1000);
        return;
    }

    try {
        const response = await apiCall(`/api/restaurants.php?id=${id}`);
        if (response.success) {
            const restaurant = response.data;
            populateRestaurantInfo(restaurant);
            restaurantFoods = restaurant.foods || [];
            renderRestaurantFoods(restaurantFoods);
            setupCategoryTabs(restaurantFoods);
            loadReviews(restaurantFoods);
        }
    } catch (error) {
        showToast('Failed to load restaurant', 'error');
    }
}

function populateRestaurantInfo(r) {
    document.title = `${r.restaurant_name} | FoodieHub`;
    const img = document.getElementById('restaurant-image');
    const name = document.getElementById('restaurant-name');
    const desc = document.getElementById('restaurant-description');
    const rating = document.getElementById('restaurant-rating');
    const time = document.getElementById('restaurant-time');
    const location = document.getElementById('restaurant-location');
    const cuisine = document.getElementById('restaurant-cuisine');

    if (img) img.src = r.image || 'https://via.placeholder.com/1200x300/1a1a2e/ff6b35?text=Restaurant';
    if (name) name.textContent = r.restaurant_name;
    if (desc) desc.textContent = r.description || '';
    if (rating) rating.textContent = parseFloat(r.rating).toFixed(1);
    if (time) time.textContent = r.delivery_time;
    if (location) location.textContent = r.location;
    if (cuisine) cuisine.textContent = r.cuisine_type;
}

// ===== RENDER FOODS =====
function renderRestaurantFoods(foods) {
    const grid = document.getElementById('restaurant-foods-grid');
    if (!grid) return;

    if (foods.length === 0) {
        grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1"><i class="fas fa-utensils"></i><h3>No items available</h3><p>Check back later for delicious dishes!</p></div>`;
        return;
    }

    grid.innerHTML = foods.map(food => renderFoodCard(food, false)).join('');
}

// ===== CATEGORY TABS =====
function setupCategoryTabs(foods) {
    const container = document.getElementById('restaurant-category-tabs');
    if (!container) return;

    // Get unique categories
    const categories = {};
    foods.forEach(food => {
        const cat = food.category_name || 'Other';
        if (!categories[cat]) categories[cat] = 0;
        categories[cat]++;
    });

    let html = `<button class="filter-chip active" data-category="all">All Items (${foods.length})</button>`;
    Object.entries(categories).forEach(([name, count]) => {
        html += `<button class="filter-chip" data-category="${name}">${name} (${count})</button>`;
    });
    container.innerHTML = html;

    // Click handlers
    container.querySelectorAll('.filter-chip').forEach(chip => {
        chip.addEventListener('click', () => {
            container.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            const cat = chip.dataset.category;
            if (cat === 'all') {
                renderRestaurantFoods(restaurantFoods);
            } else {
                renderRestaurantFoods(restaurantFoods.filter(f => f.category_name === cat));
            }
        });
    });
}

// ===== REVIEWS =====
async function loadReviews(foods) {
    const container = document.getElementById('reviews-container');
    const formContainer = document.getElementById('review-form-container');
    if (!container) return;

    // Show review form if logged in
    const user = await checkAuth();
    if (user && formContainer) {
        formContainer.style.display = 'block';
        setupReviewForm(foods);
    }

    // Load reviews for all foods in this restaurant
    let allReviews = [];
    for (const food of foods.slice(0, 5)) {
        try {
            const response = await apiCall(`/api/reviews.php?food_id=${food.food_id}`);
            if (response.success && response.data.length > 0) {
                response.data.forEach(r => { r.food_name = food.food_name; });
                allReviews = allReviews.concat(response.data);
            }
        } catch (e) { /* skip */ }
    }

    if (allReviews.length > 0) {
        container.innerHTML = allReviews.map(review => `
            <div class="testimonial-card" style="margin-bottom:var(--space-md)">
                <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:var(--space-sm)">
                    <div class="testimonial-author">
                        <div class="testimonial-avatar">${review.user_name ? review.user_name.charAt(0).toUpperCase() : 'U'}</div>
                        <div>
                            <h5>${review.user_name || 'Anonymous'}</h5>
                            <span>${formatDate(review.created_at)}</span>
                        </div>
                    </div>
                    <div class="food-card-rating"><span class="stars">${renderStars(review.rating)}</span></div>
                </div>
                <p style="font-style:normal;margin-bottom:var(--space-xs)">${review.comment || ''}</p>
                <span style="font-size:0.8rem;color:var(--accent)">on ${review.food_name}</span>
            </div>
        `).join('');
    }
}

function setupReviewForm(foods) {
    const btn = document.getElementById('submit-review-btn');
    if (!btn || foods.length === 0) return;

    btn.addEventListener('click', async () => {
        const rating = document.getElementById('review-rating').value;
        const comment = document.getElementById('review-comment').value.trim();
        const foodId = foods[0].food_id; // Review first food item

        if (!comment) {
            showToast('Please write a comment', 'warning');
            return;
        }

        btn.classList.add('loading');
        btn.disabled = true;

        try {
            const response = await apiCall('/api/reviews.php', 'POST', {
                food_id: foodId,
                rating: parseInt(rating),
                comment
            });
            if (response.success) {
                showToast('Review submitted! Thank you 🙏', 'success');
                document.getElementById('review-comment').value = '';
                loadReviews(foods);
            }
        } catch (error) {
            showToast(error.message || 'Failed to submit review', 'error');
        }
        btn.classList.remove('loading');
        btn.disabled = false;
    });
}

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
    loadRestaurant();
});
