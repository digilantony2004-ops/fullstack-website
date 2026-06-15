/**
 * FoodieHub - Favorites Page JavaScript
 * Display and manage favorite food items
 */

// ===== LOAD FAVORITES =====
async function loadFavorites() {
    const grid = document.getElementById('favorites-grid');
    if (!grid) return;

    try {
        const user = await checkAuth();
        if (!user) {
            grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1"><i class="fas fa-lock"></i><h3>Please login to view favorites</h3><p>Save your favorite dishes for quick access.</p><a href="login.html" class="btn btn-primary"><i class="fas fa-sign-in-alt"></i> Login</a></div>`;
            return;
        }

        const response = await apiCall('/api/favorites.php');
        if (response.success && response.data.length > 0) {
            grid.innerHTML = response.data.map(fav => renderFavoriteCard(fav)).join('');
        } else {
            grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1"><i class="fas fa-heart"></i><h3>No favorites yet</h3><p>Start saving dishes you love by clicking the heart icon!</p><a href="menu.html" class="btn btn-primary"><i class="fas fa-utensils"></i> Browse Menu</a></div>`;
        }
    } catch (error) {
        grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1"><i class="fas fa-exclamation-circle"></i><h3>Unable to load favorites</h3><p>Please try again later.</p></div>`;
    }
}

function renderFavoriteCard(fav) {
    return `
        <div class="food-card" id="fav-card-${fav.food_id}">
            <div class="food-card-image">
                <img src="${fav.image || 'https://via.placeholder.com/400x300/1a1a2e/ff6b35?text=Food'}" alt="${fav.food_name}" loading="lazy">
                <button class="food-card-favorite active" onclick="event.stopPropagation();removeFavorite(${fav.food_id})" title="Remove from favorites">
                    <i class="fas fa-heart"></i>
                </button>
            </div>
            <div class="food-card-body">
                <h4>${fav.food_name}</h4>
                ${fav.restaurant_name ? `<div class="food-card-restaurant"><i class="fas fa-store"></i> ${fav.restaurant_name}</div>` : ''}
                <div class="food-card-rating">
                    <span class="stars">${renderStars(fav.rating || 4)}</span>
                    <span>${parseFloat(fav.rating || 4).toFixed(1)}</span>
                </div>
            </div>
            <div class="food-card-footer">
                <div class="food-price"><small>₹</small>${parseFloat(fav.price).toFixed(0)}</div>
                <button class="add-to-cart-btn" onclick="event.stopPropagation();addToCart(${fav.food_id})">
                    <i class="fas fa-plus"></i> Add
                </button>
            </div>
        </div>
    `;
}

// ===== REMOVE FAVORITE =====
async function removeFavorite(foodId) {
    try {
        const response = await apiCall('/api/favorites.php', 'POST', { food_id: foodId });
        if (response.success) {
            const card = document.getElementById(`fav-card-${foodId}`);
            if (card) {
                card.style.opacity = '0';
                card.style.transform = 'scale(0.8)';
                card.style.transition = '0.3s ease';
                setTimeout(() => {
                    card.remove();
                    // Check if grid is empty
                    const grid = document.getElementById('favorites-grid');
                    if (grid && grid.children.length === 0) {
                        grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1"><i class="fas fa-heart"></i><h3>No favorites yet</h3><p>Start saving dishes you love!</p><a href="menu.html" class="btn btn-primary"><i class="fas fa-utensils"></i> Browse Menu</a></div>`;
                    }
                }, 300);
            }
            showToast('Removed from favorites', 'info');
        }
    } catch (error) {
        showToast('Failed to update favorites', 'error');
    }
}

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
    loadFavorites();
});
