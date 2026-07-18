/* ==========================================================================
   products.js — Product listing page with search, category/price filters,
   sorting, and pagination.
   ========================================================================== */

let currentPage = 1;

function getFiltersFromUI() {
  return {
    keyword: document.getElementById('filterKeyword').value.trim(),
    category: document.getElementById('filterCategory').value,
    minPrice: document.getElementById('filterMinPrice').value,
    maxPrice: document.getElementById('filterMaxPrice').value,
    sort: document.getElementById('filterSort').value,
  };
}

function buildQueryString(filters, page) {
  const params = new URLSearchParams();
  if (filters.keyword) params.set('keyword', filters.keyword);
  if (filters.category && filters.category !== 'All') params.set('category', filters.category);
  if (filters.minPrice) params.set('minPrice', filters.minPrice);
  if (filters.maxPrice) params.set('maxPrice', filters.maxPrice);
  if (filters.sort) params.set('sort', filters.sort);
  params.set('page', page);
  params.set('limit', 12);
  return params.toString();
}

async function loadProducts(page = 1) {
  currentPage = page;
  const grid = document.getElementById('productGrid');
  const pagination = document.getElementById('pagination');
  grid.innerHTML = '<div class="spinner"></div>';
  pagination.innerHTML = '';

  const filters = getFiltersFromUI();
  const qs = buildQueryString(filters, page);

  // Reflect filters in the URL so it's shareable/bookmarkable
  history.replaceState(null, '', `products.html?${qs}`);

  try {
    const data = await apiRequest(`/products?${qs}`);
    grid.innerHTML = data.products.length
      ? data.products.map(productCardHtml).join('')
      : '<div class="empty-state"><h3>No products found</h3><p>Try adjusting your search or filters.</p></div>';

    renderPagination(data.page, data.pages);
  } catch (err) {
    grid.innerHTML = `<div class="empty-state"><h3>Something went wrong</h3><p>${escapeHtml(err.message)}</p></div>`;
  }
}

function renderPagination(page, pages) {
  const pagination = document.getElementById('pagination');
  if (pages <= 1) return;

  let html = '';
  for (let i = 1; i <= pages; i++) {
    html += `<button class="btn ${i === page ? 'btn-primary' : 'btn-outline'} btn-sm" data-page="${i}">${i}</button>`;
  }
  pagination.innerHTML = html;
  pagination.querySelectorAll('button').forEach((btn) => {
    btn.addEventListener('click', () => loadProducts(Number(btn.dataset.page)));
  });
}

async function populateCategoryFilter() {
  const select = document.getElementById('filterCategory');
  try {
    const data = await apiRequest('/products/meta/categories');
    select.innerHTML =
      '<option value="All">All Categories</option>' +
      data.categories.map((c) => `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join('');
  } catch {
    select.innerHTML = '<option value="All">All Categories</option>';
  }
}

function applyUrlParamsToFilters() {
  const params = new URLSearchParams(window.location.search);
  if (params.get('keyword')) document.getElementById('filterKeyword').value = params.get('keyword');
  if (params.get('category')) document.getElementById('filterCategory').value = params.get('category');
  if (params.get('minPrice')) document.getElementById('filterMinPrice').value = params.get('minPrice');
  if (params.get('maxPrice')) document.getElementById('filterMaxPrice').value = params.get('maxPrice');
  if (params.get('sort')) document.getElementById('filterSort').value = params.get('sort');
}

document.addEventListener('DOMContentLoaded', async () => {
  await populateCategoryFilter();
  applyUrlParamsToFilters();
  loadProducts(1);

  document.getElementById('filtersForm').addEventListener('submit', (e) => {
    e.preventDefault();
    loadProducts(1);
  });

  document.getElementById('resetFiltersBtn').addEventListener('click', () => {
    document.getElementById('filtersForm').reset();
    loadProducts(1);
  });
});
