/* ==========================================================================
   home.js — Renders featured products and the category chips on index.html
   ========================================================================== */

function productCardHtml(p) {
  const stockLabel = p.stock === 0 ? 'Out of stock' : p.stock <= 5 ? `Only ${p.stock} left` : 'In stock';
  const stockClass = p.stock === 0 ? 'out' : p.stock <= 5 ? 'low' : 'ok';
  return `
    <a class="product-card" href="product.html?id=${p._id}">
      <div class="thumb"><img src="${escapeHtml(p.image)}" alt="${escapeHtml(p.name)}" loading="lazy" /></div>
      <div class="info">
        <span class="cat">${escapeHtml(p.category)}</span>
        <h3>${escapeHtml(p.name)}</h3>
        <span class="stock-tag ${stockClass}">${stockLabel}</span>
        <div class="price-row">
          <span class="price">${formatPrice(p.price)}</span>
          <span class="rating">⭐ ${p.rating?.toFixed(1) || '0.0'}</span>
        </div>
      </div>
    </a>
  `;
}

async function loadFeaturedProducts() {
  const grid = document.getElementById('featuredGrid');
  if (!grid) return;
  grid.innerHTML = '<div class="spinner"></div>';
  try {
    const data = await apiRequest('/products?limit=8&sort=rating');
    grid.innerHTML = data.products.length
      ? data.products.map(productCardHtml).join('')
      : '<div class="empty-state"><h3>No products yet</h3><p>Check back soon!</p></div>';
  } catch (err) {
    grid.innerHTML = `<div class="empty-state"><h3>Couldn't load products</h3><p>${escapeHtml(err.message)}</p></div>`;
  }
}

async function loadCategoryChips() {
  const row = document.getElementById('categoryChips');
  if (!row) return;
  try {
    const data = await apiRequest('/products/meta/categories');
    row.innerHTML =
      `<a class="chip active" href="products.html">All</a>` +
      data.categories.map((c) => `<a class="chip" href="products.html?category=${encodeURIComponent(c)}">${escapeHtml(c)}</a>`).join('');
  } catch (err) {
    row.innerHTML = '';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  loadFeaturedProducts();
  loadCategoryChips();
});
