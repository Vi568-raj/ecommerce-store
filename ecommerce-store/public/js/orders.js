/* ==========================================================================
   orders.js — Order history page: lists the logged-in user's past orders.
   ========================================================================== */

function orderCardHtml(order) {
  return `
    <div class="order-card" id="order-${order._id}">
      <div class="order-head">
        <div>
          <div class="order-id">Order #${order._id.slice(-8).toUpperCase()}</div>
          <div class="unit-price">Placed on ${formatDate(order.createdAt)}</div>
        </div>
        <span class="badge ${order.status}">${order.status}</span>
      </div>
      ${order.orderItems.map((i) => `
        <div class="order-line">
          <img src="${escapeHtml(i.image)}" alt="${escapeHtml(i.name)}" />
          <div style="flex:1;">
            <div>${escapeHtml(i.name)}</div>
            <div class="unit-price">Qty: ${i.quantity} × ${formatPrice(i.price)}</div>
          </div>
        </div>`).join('')}
      <div class="summary-row total" style="margin-top:10px;">
        <span>Total (${order.paymentMethod})</span><span>${formatPrice(order.totalPrice)}</span>
      </div>
      <div class="unit-price">Shipping to: ${escapeHtml(order.shippingAddress.address)}, ${escapeHtml(order.shippingAddress.city)}, ${escapeHtml(order.shippingAddress.country)}</div>
    </div>
  `;
}

async function loadOrders() {
  const list = document.getElementById('ordersList');
  list.innerHTML = '<div class="spinner"></div>';
  try {
    const data = await apiRequest('/orders/my', { auth: true });
    list.innerHTML = data.orders.length
      ? data.orders.map(orderCardHtml).join('')
      : `<div class="empty-state"><h3>No orders yet</h3><p>Your placed orders will show up here.</p><br/><a href="products.html" class="btn btn-primary">Start Shopping</a></div>`;

    const highlight = new URLSearchParams(window.location.search).get('highlight');
    if (highlight) {
      document.getElementById(`order-${highlight}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  } catch (err) {
    list.innerHTML = `<div class="empty-state"><h3>Couldn't load orders</h3><p>${escapeHtml(err.message)}</p></div>`;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  if (!Auth.isLoggedIn()) {
    window.location.href = 'login.html?redirect=orders.html';
    return;
  }
  loadOrders();
});
