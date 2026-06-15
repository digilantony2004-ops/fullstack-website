/**
 * FoodieHub - Checkout Page JavaScript
 * Order placement with form validation and success modal
 */

// ===== LOAD ORDER SUMMARY =====
async function loadOrderSummary() {
    try {
        const response = await apiCall('/api/cart.php');
        if (response.success && response.data.items.length > 0) {
            const items = response.data.items;
            const subtotal = response.data.subtotal;
            const deliveryFee = subtotal >= 500 ? 0 : 40;
            const tax = subtotal * 0.05;
            const total = subtotal + deliveryFee + tax;

            const itemsContainer = document.getElementById('checkout-items');
            if (itemsContainer) {
                itemsContainer.innerHTML = items.map(item => `
                    <div class="order-item-row">
                        <div class="order-item-img"><img src="${item.image || ''}" alt="${item.food_name}"></div>
                        <div class="order-item-name">${item.food_name}</div>
                        <div class="order-item-qty">x${item.quantity}</div>
                        <div class="order-item-price">${formatPrice(item.price * item.quantity)}</div>
                    </div>
                `).join('');
            }

            const subtotalEl = document.getElementById('checkout-subtotal');
            const deliveryEl = document.getElementById('checkout-delivery');
            const taxEl = document.getElementById('checkout-tax');
            const totalEl = document.getElementById('checkout-total');

            if (subtotalEl) subtotalEl.textContent = formatPrice(subtotal);
            if (deliveryEl) {
                deliveryEl.textContent = deliveryFee === 0 ? 'FREE' : formatPrice(deliveryFee);
                deliveryEl.style.color = deliveryFee === 0 ? 'var(--success)' : '';
            }
            if (taxEl) taxEl.textContent = formatPrice(tax);
            if (totalEl) totalEl.textContent = formatPrice(total);
        } else {
            showToast('Your cart is empty', 'warning');
            setTimeout(() => window.location.href = 'cart.html', 1000);
        }
    } catch (error) {
        console.log('Could not load order summary:', error.message);
    }
}

// ===== PAYMENT METHOD =====
function setupPaymentMethods() {
    document.querySelectorAll('.payment-card').forEach(card => {
        card.addEventListener('click', () => {
            document.querySelectorAll('.payment-card').forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
            card.querySelector('input[type="radio"]').checked = true;
        });
    });
}

// ===== FORM VALIDATION =====
function validateCheckoutForm() {
    let valid = true;
    const address = document.getElementById('delivery-address');
    const addressError = document.getElementById('address-error');

    if (!address.value.trim() || address.value.trim().length < 10) {
        address.classList.add('error');
        if (addressError) { addressError.textContent = 'Please enter a complete delivery address (min 10 chars)'; addressError.classList.add('show'); }
        valid = false;
    } else {
        address.classList.remove('error');
        if (addressError) addressError.classList.remove('show');
    }
    return valid;
}

// ===== PLACE ORDER =====
async function placeOrder() {
    if (!validateCheckoutForm()) return;

    const btn = document.getElementById('place-order-btn');
    btn.classList.add('loading');
    btn.disabled = true;

    const address = document.getElementById('delivery-address').value.trim();
    const paymentMethod = document.querySelector('input[name="payment"]:checked')?.value || 'cod';

    try {
        const response = await apiCall('/orders/place_order.php', 'POST', {
            delivery_address: address,
            payment_method: paymentMethod
        });

        if (response.success) {
            updateCartBadge();
            showSuccessModal(response.data.order_id, response.data.total_amount);
        }
    } catch (error) {
        showToast(error.message || 'Failed to place order', 'error');
        btn.classList.remove('loading');
        btn.disabled = false;
    }
}

// ===== SUCCESS MODAL =====
function showSuccessModal(orderId, total) {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay show';
    overlay.innerHTML = `
        <div class="modal">
            <div class="modal-icon" style="animation: checkmark 0.5s ease">
                <i class="fas fa-check"></i>
            </div>
            <h3>Order Placed Successfully! 🎉</h3>
            <p>Your order <strong>#${orderId}</strong> has been confirmed.<br>Total: <strong>${formatPrice(total)}</strong></p>
            <div class="modal-buttons">
                <a href="orders.html" class="btn btn-primary"><i class="fas fa-receipt"></i> View Orders</a>
                <a href="menu.html" class="btn btn-secondary"><i class="fas fa-utensils"></i> Continue Shopping</a>
            </div>
        </div>
    `;
    document.body.appendChild(overlay);
}

// ===== INIT =====
document.addEventListener('DOMContentLoaded', async () => {
    const user = await checkAuth();
    if (!user) {
        showToast('Please login to checkout', 'warning');
        setTimeout(() => window.location.href = 'login.html', 1000);
        return;
    }
    loadOrderSummary();
    setupPaymentMethods();

    const placeBtn = document.getElementById('place-order-btn');
    if (placeBtn) placeBtn.addEventListener('click', placeOrder);
});
