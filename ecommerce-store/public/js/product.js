/* ==========================================================================
   product.js — Product details page: fetch single product, quantity
   selector, add to cart.
   ========================================================================== */

let currentProduct = null;
let selectedQty = 1;

function getProductIdFromUrl() {
  return new URLSearchParams(window.location.search).get('id');
}

function renderProduct(p) {
  document.title = `${p.name} — UrbanCart`;

  const stockLabel = p.stock === 0 ? 'Out of stock' : p.stock <= 5 ? `Only ${p.stock} left in stock` : 'In stock';
  const stockClass = p.stock === 0 ? 'out' : p.stock <= 5 ? 'low' : 'ok';

  document.getElementById('pdWrap').innerHTML = `
    <div class="pd-image"><img src="${escapeHtml(p.image)}" alt="${escapeHtml(p.name)}" /></div>
    <div class="pd-info">
      <span class="cat">${escapeHtml(p.category)}</span>
      <h1>${escapeHtml(p.name)}</h1>
      <p class="brand">by ${escapeHtml(p.brand || 'Generic')} &nbsp;•&nbsp; ⭐ ${p.rating?.toFixed(1) || '0.0'} (${p.numReviews || 0} reviews)</p>
      <p class="price">${formatPrice(p.price)}</p>
      <span class="stock-tag ${stockClass}">${stockLabel}</span>
      <p class="desc">${escapeHtml(p.description)}</p>

      <div class="qty-row">
        <span>Quantity:</span>
        <div class="qty-control">
          <button id="qtyMinus" aria-label="Decrease quantity">−</button>
          <span id="qtyValue">1</span>
          <button id="qtyPlus" aria-label="Increase quantity">+</button>
        </div>
      </div>

      <div class="pd-actions">
        <button id="addToCartBtn" class="btn btn-accent" ${p.stock === 0 ? 'disabled' : ''}>Add to Cart</button>
        <button id="buyNowBtn" class="btn btn-primary" ${p.stock === 0 ? 'disabled' : ''}>Buy Now</button>
      </div>
    </div>
  `;

  document.getElementById('qtyMinus').addEventListener('click', () => {
    if (selectedQty > 1) {
      selectedQty--;
      document.getElementById('qtyValue').textContent = selectedQty;
    }
  });
  document.getElementById('qtyPlus').addEventListener('click', () => {
    if (selectedQty < p.stock) {
      selectedQty++;
      document.getElementById('qtyValue').textContent = selectedQty;
    } else {
      showToast(`Only ${p.stock} in stock`, 'error');
    }
  });
  document.getElementById('addToCartBtn').addEventListener('click', () => {
    Cart.add(p, selectedQty);
    showToast(`Added ${selectedQty} × ${p.name} to cart`, 'success');
  });
  document.getElementById('buyNowBtn').addEventListener('click', () => {
    Cart.add(p, selectedQty);
    window.location.href = 'cart.html';
  });
}

async function loadProduct() {
  const id = getProductIdFromUrl();
  const wrap = document.getElementById('pdWrap');
  if (!id) {
    wrap.innerHTML = '<div class="empty-state"><h3>Product not specified</h3></div>';
    return;
  }
  wrap.innerHTML = '<div class="spinner"></div>';
  try {
    const data = await apiRequest(`/products/${id}`);
    currentProduct = data.product;
    renderProduct(currentProduct);
  } catch (err) {
    wrap.innerHTML = `<div class="empty-state"><h3>Product not found</h3><p>${escapeHtml(err.message)}</p></div>`;
  }
}

document.addEventListener('DOMContentLoaded', loadProduct);
