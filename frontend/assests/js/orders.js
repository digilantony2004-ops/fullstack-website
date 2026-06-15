/**
 * FoodieHub - Orders Page JavaScript
 * Order history with expandable details and status tracking
 */

const STATUS_CONFIG = {
    pending: { label: 'Pending', class: 'status-pending', icon: 'fa-clock', step: 0 },
    confirmed: { label: 'Confirmed', class: 'status-confirmed', icon: 'fa-check', step: 1 },
    preparing: { label: 'Preparing', class: 'status-preparing', icon: 'fa-fire', step: 2 },
    out_for_delivery: { label: 'Out for Delivery', class: 'status-out_for_delivery', icon: 'fa-truck', step: 3 },
    delivered: { label: 'Delivered', class: 'status-delivered', icon: 'fa-check-double', step: 4 },
    cancelled: { label: 'Cancelled', class: 'status-cancelled', icon: 'fa-times', step: -1 }
};

const TIMELINE_STEPS = ['Pending', 'Confirmed', 'Preparing', 'Out for Delivery', 'Delivered'];

// ===== LOAD ORDERS =====
async function loadOrders() {
    const container = document.getElementById('orders-container');
    if (!container) return;

    try {
        const user = await checkAuth();
        if (!user) {
            container.innerHTML = `<div class="empty-state"><i class="fas fa-lock"></i><h3>Please login to view orders</h3><p>You need to be logged in to see your order history.</p><a href="login.html" class="btn btn-primary"><i class="fas fa-sign-in-alt"></i> Login</a></div>`;
            return;
        }

        const response = await apiCall('/orders/get_orders.php');
        if (response.success && response.data.length > 0) {
            container.innerHTML = response.data.map(order => renderOrderCard(order)).join('');
        } else {
            container.innerHTML = `<div class="empty-state"><i class="fas fa-receipt"></i><h3>No orders yet</h3><p>Start ordering delicious food from our menu!</p><a href="menu.html" class="btn btn-primary"><i class="fas fa-utensils"></i> Browse Menu</a></div>`;
        }
    } catch (error) {
        container.innerHTML = `<div class="empty-state"><i class="fas fa-exclamation-circle"></i><h3>Unable to load orders</h3><p>Please try again later.</p></div>`;
    }
}

// ===== RENDER ORDER CARD =====
function renderOrderCard(order) {
    const status = STATUS_CONFIG[order.order_status] || STATUS_CONFIG.pending;
    const itemsSummary = (order.items || []).map(item => `
        <div class="order-item-row">
            <div class="order-item-img"><img src="${item.image || 'https://via.placeholder.com/50/1a1a2e/ff6b35?text=F'}" alt="${item.food_name}"></div>
            <div class="order-item-name">${item.food_name}</div>
            <div class="order-item-qty">x${item.quantity}</div>
            <div class="order-item-price">${formatPrice(item.price * item.quantity)}</div>
        </div>
    `).join('');

    const timeline = renderTimeline(order.order_status);

    return `
        <div class="order-card" id="order-${order.order_id}">
            <div class="order-card-header" onclick="toggleOrderDetails(${order.order_id})">
                <div class="order-card-info">
                    <h4>Order #${order.order_id}</h4>
                    <span>${formatDate(order.order_date)}</span>
                </div>
                <div class="order-card-right">
                    <span class="status-badge ${status.class}"><i class="fas ${status.icon}"></i> ${status.label}</span>
                    <span class="order-total">${formatPrice(order.total_amount)}</span>
                    <i class="fas fa-chevron-down" style="color:var(--text-muted);transition:var(--transition)" id="chevron-${order.order_id}"></i>
                </div>
            </div>
            <div class="order-card-details" id="details-${order.order_id}">
                <div class="order-card-details-inner">
                    ${timeline}
                    <div class="order-items-list">${itemsSummary}</div>
                    <div style="margin-top:var(--space-lg);display:flex;gap:var(--space-xl);font-size:0.85rem;color:var(--text-muted);flex-wrap:wrap">
                        <span><i class="fas fa-map-marker-alt" style="color:var(--accent)"></i> ${order.delivery_address || 'N/A'}</span>
                        <span><i class="fas fa-credit-card" style="color:var(--accent)"></i> ${(order.payment_method || 'cod').toUpperCase()}</span>
                        <span><i class="fas fa-truck" style="color:var(--accent)"></i> Delivery: ${order.delivery_fee > 0 ? formatPrice(order.delivery_fee) : 'FREE'}</span>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// ===== ORDER TIMELINE =====
function renderTimeline(currentStatus) {
    if (currentStatus === 'cancelled') {
        return `<div style="text-align:center;padding:var(--space-lg);color:var(--error)"><i class="fas fa-times-circle" style="font-size:2rem;margin-bottom:var(--space-sm)"></i><p>This order was cancelled</p></div>`;
    }

    const currentStep = STATUS_CONFIG[currentStatus]?.step || 0;
    const steps = TIMELINE_STEPS.map((label, index) => {
        let cls = '';
        if (index < currentStep) cls = 'completed';
        else if (index === currentStep) cls = 'active';
        const icons = ['fa-clock', 'fa-check', 'fa-fire', 'fa-truck', 'fa-check-double'];
        return `
            <div class="timeline-step ${cls}">
                <div class="timeline-dot"><i class="fas ${icons[index]}"></i></div>
                <span>${label}</span>
            </div>
        `;
    }).join('');

    return `<div class="order-timeline">${steps}</div>`;
}

// ===== TOGGLE DETAILS =====
function toggleOrderDetails(orderId) {
    const details = document.getElementById(`details-${orderId}`);
    const chevron = document.getElementById(`chevron-${orderId}`);
    if (!details) return;

    details.classList.toggle('show');
    if (chevron) {
        chevron.style.transform = details.classList.contains('show') ? 'rotate(180deg)' : 'rotate(0)';
    }
}

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
    loadOrders();
});
