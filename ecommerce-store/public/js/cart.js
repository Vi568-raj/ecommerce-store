/* ==========================================================================
   cart.js — Renders and manages the shopping cart page.
   ========================================================================== */

function renderCart() {
  const items = Cart.get();
  const list = document.getElementById('cartList');
  const summary = document.getElementById('cartSummary');

  if (items.length === 0) {
    list.innerHTML = `
      <div class="empty-state">
        <h3>Your cart is empty</h3>
        <p>Looks like you haven't added anything yet.</p>
        <br/>
        <a href="products.html" class="btn btn-primary">Continue Shopping</a>
      </div>`;
    summary.innerHTML = '';
    return;
  }

  list.innerHTML = items
    .map(
      (i) => `
    <div class="cart-item" data-id="${i.product}">
      <img src="${escapeHtml(i.image)}" alt="${escapeHtml(i.name)}" />
      <div>
        <h4>${escapeHtml(i.name)}</h4>
        <p class="unit-price">${formatPrice(i.price)} each</p>
        <div class="qty-control" style="margin-top:6px;">
          <button class="qty-minus" aria-label="Decrease quantity">−</button>
          <span>${i.quantity}</span>
          <button class="qty-plus" aria-label="Increase quantity">+</button>
        </div>
      </div>
      <strong>${formatPrice(i.price * i.quantity)}</strong>
      <button class="remove-btn">Remove</button>
    </div>`
    )
    .join('');

  const subtotal = Cart.subtotal();
  const shipping = subtotal > 999 || subtotal === 0 ? 0 : 49;
  const tax = Number((subtotal * 0.05).toFixed(2));
  const total = Number((subtotal + shipping + tax).toFixed(2));

  summary.innerHTML = `
    <h3>Order Summary</h3>
    <div class="summary-row"><span>Subtotal</span><span>${formatPrice(subtotal)}</span></div>
    <div class="summary-row"><span>Shipping</span><span>${shipping === 0 ? 'FREE' : formatPrice(shipping)}</span></div>
    <div class="summary-row"><span>Tax (5%)</span><span>${formatPrice(tax)}</span></div>
    <div class="summary-row total"><span>Total</span><span>${formatPrice(total)}</span></div>
    <button id="checkoutBtn" class="btn btn-accent btn-block" style="margin-top:16px;">Proceed to Checkout</button>
  `;

  document.getElementById('checkoutBtn').addEventListener('click', () => {
    if (!Auth.isLoggedIn()) {
      showToast('Please login to checkout', 'error');
      window.location.href = 'login.html?redirect=checkout.html';
      return;
    }
    window.location.href = 'checkout.html';
  });

  // Wire up per-item controls
  list.querySelectorAll('.cart-item').forEach((row) => {
    const id = row.dataset.id;
    const item = items.find((i) => i.product === id);

    row.querySelector('.qty-plus').addEventListener('click', () => {
      if (item.quantity < item.stock) {
        Cart.updateQty(id, item.quantity + 1);
        renderCart();
      } else {
        showToast(`Only ${item.stock} in stock`, 'error');
      }
    });
    row.querySelector('.qty-minus').addEventListener('click', () => {
      if (item.quantity > 1) {
        Cart.updateQty(id, item.quantity - 1);
        renderCart();
      }
    });
    row.querySelector('.remove-btn').addEventListener('click', () => {
      Cart.remove(id);
      renderCart();
      showToast('Item removed from cart', 'success');
    });
  });
}

document.addEventListener('DOMContentLoaded', renderCart);
