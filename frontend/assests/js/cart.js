/**
 * FoodieHub - Cart Page JavaScript
 * Cart management with quantity controls and order summary
 */

let cartItems = [];

// ===== LOAD CART =====
async function loadCart() {
    const container = document.getElementById('cart-items');
    const summary = document.getElementById('order-summary');
    if (!container) return;

    try {
        const user = await checkAuth();
        if (!user) {
            container.innerHTML = `<div class="empty-state"><i class="fas fa-lock"></i><h3>Please login to view your cart</h3><p>You need to be logged in to manage your cart.</p><a href="login.html" class="btn btn-primary"><i class="fas fa-sign-in-alt"></i> Login</a></div>`;
            if (summary) summary.style.display = 'none';
            return;
        }

        const response = await apiCall('/api/cart.php');
        if (response.success && response.data.items.length > 0) {
            cartItems = response.data.items;
            renderCart();
        } else {
            cartItems = [];
            showEmptyState(container, 'Your cart is empty');
            if (summary) summary.style.display = 'none';
        }
    } catch (error) {
        showEmptyState(container, 'Unable to load cart');
        if (summary) summary.style.display = 'none';
    }
}

function renderCart() {
    const container = document.getElementById('cart-items');
    if (!container) return;

    container.innerHTML = cartItems.map(item => `
        <div class="cart-item" id="cart-item-${item.cart_id}">
            <div class="cart-item-image">
                <img src="${item.image || 'https://via.placeholder.com/100/1a1a2e/ff6b35?text=Food'}" alt="${item.food_name}">
            </div>
            <div class="cart-item-info">
                <h4>${item.food_name}</h4>
                <div class="restaurant">${item.restaurant_name || ''}</div>
                <div class="price">${formatPrice(item.price)} each</div>
                <div class="quantity-controls">
                    <button class="quantity-btn" onclick="updateQuantity(${item.cart_id}, ${item.quantity - 1})"><i class="fas fa-minus"></i></button>
                    <span class="quantity-value">${item.quantity}</span>
                    <button class="quantity-btn" onclick="updateQuantity(${item.cart_id}, ${item.quantity + 1})"><i class="fas fa-plus"></i></button>
                </div>
            </div>
            <div class="cart-item-actions">
                <div class="cart-item-total">${formatPrice(item.price * item.quantity)}</div>
                <button class="remove-btn" onclick="removeItem(${item.cart_id})"><i class="fas fa-trash-alt"></i> Remove</button>
            </div>
        </div>
    `).join('');

    updateSummary();
}

// ===== UPDATE QUANTITY =====
async function updateQuantity(cartId, newQty) {
    if (newQty <= 0) {
        removeItem(cartId);
        return;
    }

    try {
        await apiCall('/api/cart.php', 'PUT', { cart_id: cartId, quantity: newQty });
        const item = cartItems.find(i => i.cart_id == cartId);
        if (item) item.quantity = newQty;
        renderCart();
        updateCartBadge();
    } catch (error) {
        showToast('Failed to update quantity', 'error');
    }
}

// ===== REMOVE ITEM =====
async function removeItem(cartId) {
    try {
        const element = document.getElementById(`cart-item-${cartId}`);
        if (element) {
            element.style.opacity = '0';
            element.style.transform = 'translateX(50px)';
            element.style.transition = '0.3s ease';
        }

        await apiCall('/api/cart.php', 'DELETE', { cart_id: cartId });
        cartItems = cartItems.filter(i => i.cart_id != cartId);
        
        setTimeout(() => {
            if (cartItems.length === 0) {
                loadCart();
            } else {
                renderCart();
            }
        }, 300);

        showToast('Item removed from cart', 'info');
        updateCartBadge();
    } catch (error) {
        showToast('Failed to remove item', 'error');
    }
}

// ===== ORDER SUMMARY =====
function updateSummary() {
    const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const deliveryFee = subtotal >= 500 ? 0 : 40;
    const tax = subtotal * 0.05;
    const total = subtotal + deliveryFee + tax;

    const subtotalEl = document.getElementById('cart-subtotal');
    const deliveryEl = document.getElementById('cart-delivery');
    const taxEl = document.getElementById('cart-tax');
    const totalEl = document.getElementById('cart-total');
    const checkoutBtn = document.getElementById('checkout-btn');

    if (subtotalEl) subtotalEl.textContent = formatPrice(subtotal);
    if (deliveryEl) {
        deliveryEl.textContent = deliveryFee === 0 ? 'FREE' : formatPrice(deliveryFee);
        deliveryEl.style.color = deliveryFee === 0 ? 'var(--success)' : '';
    }
    if (taxEl) taxEl.textContent = formatPrice(tax);
    if (totalEl) totalEl.textContent = formatPrice(total);
    if (checkoutBtn) checkoutBtn.disabled = cartItems.length === 0;

    const summary = document.getElementById('order-summary');
    if (summary) summary.style.display = 'block';
}

// ===== CHECKOUT =====
function setupCheckout() {
    const checkoutBtn = document.getElementById('checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            window.location.href = 'checkout.html';
        });
    }
}

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
    loadCart();
    setupCheckout();
});
