/**
 * FoodieHub - Home Page JavaScript
 * Loads popular foods, featured restaurants, and animated counters
 */

// ===== LOAD POPULAR FOODS =====
async function loadPopularFoods() {
    const grid = document.getElementById('popular-foods-grid');
    if (!grid) return;

    try {
        const response = await apiCall('/api/foods.php?popular=1');
        if (response.success && response.data.length > 0) {
            grid.innerHTML = response.data.map(food => renderFoodCard(food)).join('');
        } else {
            grid.innerHTML = '<p style="text-align:center;color:var(--text-muted);grid-column:1/-1">No popular dishes found. Check back soon!</p>';
        }
    } catch (error) {
        console.log('Could not load popular foods:', error.message);
        grid.innerHTML = `
            <div class="food-card">
                <div class="food-card-image"><img src="https://images.unsplash.com/photo-1604382355076-af4b0eb60143?w=400" alt="Margherita Pizza"></div>
                <div class="food-card-body"><h4>Margherita Pizza</h4><div class="food-card-restaurant"><i class="fas fa-store"></i> Pizza Paradise</div><div class="food-card-rating"><span class="stars"><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star-half-alt"></i></span><span>4.5</span></div></div>
                <div class="food-card-footer"><div class="food-price"><small>₹</small>299</div><button class="add-to-cart-btn"><i class="fas fa-plus"></i> Add</button></div>
            </div>
            <div class="food-card">
                <div class="food-card-image"><img src="https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400" alt="Classic Cheeseburger"></div>
                <div class="food-card-body"><h4>Classic Cheeseburger</h4><div class="food-card-restaurant"><i class="fas fa-store"></i> Burger Barn</div><div class="food-card-rating"><span class="stars"><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star-half-alt"></i></span><span>4.5</span></div></div>
                <div class="food-card-footer"><div class="food-price"><small>₹</small>249</div><button class="add-to-cart-btn"><i class="fas fa-plus"></i> Add</button></div>
            </div>
            <div class="food-card">
                <div class="food-card-image"><img src="https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=400" alt="Butter Chicken"></div>
                <div class="food-card-body"><h4>Butter Chicken</h4><div class="food-card-restaurant"><i class="fas fa-store"></i> Spice Garden</div><div class="food-card-rating"><span class="stars"><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i></span><span>4.8</span></div></div>
                <div class="food-card-footer"><div class="food-price"><small>₹</small>349</div><button class="add-to-cart-btn"><i class="fas fa-plus"></i> Add</button></div>
            </div>
            <div class="food-card">
                <div class="food-card-image"><img src="https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=400" alt="California Roll"></div>
                <div class="food-card-body"><h4>California Roll</h4><div class="food-card-restaurant"><i class="fas fa-store"></i> Sakura Sushi</div><div class="food-card-rating"><span class="stars"><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star-half-alt"></i></span><span>4.6</span></div></div>
                <div class="food-card-footer"><div class="food-price"><small>₹</small>499</div><button class="add-to-cart-btn"><i class="fas fa-plus"></i> Add</button></div>
            </div>
        `;
    }
}

// ===== LOAD FEATURED RESTAURANTS =====
async function loadFeaturedRestaurants() {
    const grid = document.getElementById('featured-restaurants-grid');
    if (!grid) return;

    try {
        const response = await apiCall('/api/restaurants.php');
        if (response.success && response.data.length > 0) {
            grid.innerHTML = response.data.map(r => `
                <a href="pages/restaurant.html?id=${r.restaurant_id}" class="restaurant-card">
                    <div class="restaurant-card-image">
                        <img src="${r.image || 'https://via.placeholder.com/400x200/1a1a2e/ff6b35?text=Restaurant'}" alt="${r.restaurant_name}" loading="lazy">
                        <span class="restaurant-card-cuisine">${r.cuisine_type || 'Multi-cuisine'}</span>
                    </div>
                    <div class="restaurant-card-body">
                        <h4>${r.restaurant_name}</h4>
                        <div class="restaurant-card-meta">
                            <span class="rating-badge"><i class="fas fa-star"></i> ${parseFloat(r.rating).toFixed(1)}</span>
                            <span><i class="fas fa-clock"></i> ${r.delivery_time}</span>
                            <span><i class="fas fa-map-marker-alt"></i> ${r.location}</span>
                        </div>
                    </div>
                </a>
            `).join('');
        }
    } catch (error) {
        console.log('Could not load restaurants:', error.message);
        grid.innerHTML = `
            <a href="#" class="restaurant-card"><div class="restaurant-card-image"><img src="https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400" alt="Pizza Paradise"><span class="restaurant-card-cuisine">Italian</span></div><div class="restaurant-card-body"><h4>Pizza Paradise</h4><div class="restaurant-card-meta"><span class="rating-badge"><i class="fas fa-star"></i> 4.5</span><span><i class="fas fa-clock"></i> 25-35 min</span><span><i class="fas fa-map-marker-alt"></i> MG Road</span></div></div></a>
            <a href="#" class="restaurant-card"><div class="restaurant-card-image"><img src="https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400" alt="Spice Garden"><span class="restaurant-card-cuisine">Indian</span></div><div class="restaurant-card-body"><h4>Spice Garden</h4><div class="restaurant-card-meta"><span class="rating-badge"><i class="fas fa-star"></i> 4.6</span><span><i class="fas fa-clock"></i> 30-40 min</span><span><i class="fas fa-map-marker-alt"></i> Jayanagar</span></div></div></a>
            <a href="#" class="restaurant-card"><div class="restaurant-card-image"><img src="https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400" alt="Burger Barn"><span class="restaurant-card-cuisine">American</span></div><div class="restaurant-card-body"><h4>Burger Barn</h4><div class="restaurant-card-meta"><span class="rating-badge"><i class="fas fa-star"></i> 4.3</span><span><i class="fas fa-clock"></i> 20-30 min</span><span><i class="fas fa-map-marker-alt"></i> Koramangala</span></div></div></a>
        `;
    }
}

// ===== ANIMATED COUNTERS =====
function animateCounter(element, target, duration = 2000) {
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
        start += step;
        if (start >= target) {
            start = target;
            clearInterval(timer);
        }
        if (target >= 1000) {
            element.textContent = Math.floor(start / 1000) + 'K+';
        } else {
            element.textContent = Math.floor(start) + '+';
        }
    }, 16);
}

function setupCounters() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = parseInt(entry.target.dataset.target);
                animateCounter(entry.target, target);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    document.querySelectorAll('.stat-number').forEach(el => observer.observe(el));
}

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
    loadPopularFoods();
    loadFeaturedRestaurants();
    setupCounters();
});
