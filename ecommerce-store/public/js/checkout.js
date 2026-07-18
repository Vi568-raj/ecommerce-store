/* ==========================================================================
   checkout.js — Checkout form: shipping address + payment method,
   validates input, submits the order, then clears the cart.
   ========================================================================== */

function renderCheckoutSummary() {
  const items = Cart.get();
  const box = document.getElementById('checkoutSummary');

  if (items.length === 0) {
    window.location.href = 'cart.html';
    return;
  }

  const subtotal = Cart.subtotal();
  const shipping = subtotal > 999 ? 0 : 49;
  const tax = Number((subtotal * 0.05).toFixed(2));
  const total = Number((subtotal + shipping + tax).toFixed(2));

  box.innerHTML = `
    <h3>Order Summary</h3>
    ${items.map((i) => `
      <div class="order-line">
        <img src="${escapeHtml(i.image)}" alt="${escapeHtml(i.name)}" />
        <div style="flex:1;">
          <div>${escapeHtml(i.name)}</div>
          <div class="unit-price">Qty: ${i.quantity}</div>
        </div>
        <strong>${formatPrice(i.price * i.quantity)}</strong>
      </div>`).join('')}
    <div class="summary-row" style="margin-top:12px;"><span>Subtotal</span><span>${formatPrice(subtotal)}</span></div>
    <div class="summary-row"><span>Shipping</span><span>${shipping === 0 ? 'FREE' : formatPrice(shipping)}</span></div>
    <div class="summary-row"><span>Tax (5%)</span><span>${formatPrice(tax)}</span></div>
    <div class="summary-row total"><span>Total</span><span>${formatPrice(total)}</span></div>
  `;
}

function setFieldError(inputEl, message) {
  const group = inputEl.closest('.form-group');
  if (!group) return;
  group.classList.add('invalid');
  const errEl = group.querySelector('.field-error');
  if (errEl) errEl.textContent = message;
}
function clearAllErrors(form) {
  form.querySelectorAll('.form-group').forEach((g) => g.classList.remove('invalid'));
}

async function handleCheckoutSubmit(e) {
  e.preventDefault();
  const form = e.target;
  clearAllErrors(form);

  const fullName = document.getElementById('fullName');
  const address = document.getElementById('address');
  const city = document.getElementById('city');
  const postalCode = document.getElementById('postalCode');
  const country = document.getElementById('country');
  const phone = document.getElementById('phone');
  const paymentMethod = document.getElementById('paymentMethod');

  let valid = true;
  [fullName, address, city, postalCode, country].forEach((el) => {
    if (!el.value.trim()) {
      setFieldError(el, 'This field is required');
      valid = false;
    }
  });
  if (!/^[0-9+\-\s]{7,15}$/.test(phone.value.trim())) {
    setFieldError(phone, 'Please enter a valid phone number');
    valid = false;
  }
  if (!valid) return;

  const orderItems = Cart.get().map((i) => ({ product: i.product, quantity: i.quantity }));

  const submitBtn = form.querySelector('button[type="submit"]');
  submitBtn.disabled = true;
  submitBtn.textContent = 'Placing order...';

  try {
    const data = await apiRequest('/orders', {
      method: 'POST',
      auth: true,
      body: {
        orderItems,
        shippingAddress: {
          fullName: fullName.value.trim(),
          address: address.value.trim(),
          city: city.value.trim(),
          postalCode: postalCode.value.trim(),
          country: country.value.trim(),
          phone: phone.value.trim(),
        },
        paymentMethod: paymentMethod.value,
      },
    });

    Cart.clear();
    showToast('Order placed successfully!', 'success');
    setTimeout(() => (window.location.href = `orders.html?highlight=${data.order._id}`), 800);
  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Place Order';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  if (!Auth.isLoggedIn()) {
    window.location.href = 'login.html?redirect=checkout.html';
    return;
  }
  renderCheckoutSummary();

  const user = Auth.getUser();
  if (user && document.getElementById('fullName')) {
    document.getElementById('fullName').value = user.name;
  }

  document.getElementById('checkoutForm').addEventListener('submit', handleCheckoutSubmit);
});
