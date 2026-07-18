/* ==========================================================================
   admin.js — Admin dashboard: stats overview, product CRUD (add/edit/delete),
   and order status management. All requests use the JWT of a logged-in admin.
   ========================================================================== */

let editingProductId = null;

function switchTab(tab) {
  document.querySelectorAll('.admin-sidebar button').forEach((b) => b.classList.toggle('active', b.dataset.tab === tab));
  document.querySelectorAll('.admin-panel').forEach((p) => (p.style.display = p.id === `panel-${tab}` ? 'block' : 'none'));
  if (tab === 'dashboard') loadStats();
  if (tab === 'products') loadAdminProducts();
  if (tab === 'orders') loadAdminOrders();
}

/* ---------------- Dashboard stats ---------------- */
async function loadStats() {
  const grid = document.getElementById('statGrid');
  grid.innerHTML = '<div class="spinner"></div>';
  try {
    const data = await apiRequest('/admin/stats', { auth: true });
    const s = data.stats;
    grid.innerHTML = `
      <div class="stat-card"><div class="label">Total Products</div><div class="value">${s.totalProducts}</div></div>
      <div class="stat-card"><div class="label">Total Orders</div><div class="value">${s.totalOrders}</div></div>
      <div class="stat-card"><div class="label">Total Revenue</div><div class="value">${formatPrice(s.totalRevenue)}</div></div>
      <div class="stat-card"><div class="label">Low Stock Items</div><div class="value">${s.lowStockProducts}</div></div>
    `;
  } catch (err) {
    grid.innerHTML = `<p>${escapeHtml(err.message)}</p>`;
  }
}

/* ---------------- Product management ---------------- */
async function loadAdminProducts() {
  const tbody = document.getElementById('productsTableBody');
  tbody.innerHTML = '<tr><td colspan="6">Loading...</td></tr>';
  try {
    const data = await apiRequest('/products?limit=200');
    tbody.innerHTML = data.products.length
      ? data.products.map((p) => `
        <tr>
          <td><img src="${escapeHtml(p.image)}" alt="${escapeHtml(p.name)}" /></td>
          <td>${escapeHtml(p.name)}</td>
          <td>${escapeHtml(p.category)}</td>
          <td>${formatPrice(p.price)}</td>
          <td>${p.stock}</td>
          <td class="table-actions">
            <button class="btn btn-outline btn-sm" onclick="openProductModal('${p._id}')">Edit</button>
            <button class="btn btn-danger btn-sm" onclick="deleteProduct('${p._id}')">Delete</button>
          </td>
        </tr>`).join('')
      : '<tr><td colspan="6">No products yet. Click "Add Product" to create one.</td></tr>';
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="6">${escapeHtml(err.message)}</td></tr>`;
  }
}

async function openProductModal(id = null) {
  editingProductId = id;
  const modal = document.getElementById('productModal');
  const form = document.getElementById('productForm');
  form.reset();
  document.getElementById('productModalTitle').textContent = id ? 'Edit Product' : 'Add Product';

  if (id) {
    try {
      const data = await apiRequest(`/products/${id}`);
      const p = data.product;
      form.name.value = p.name;
      form.description.value = p.description;
      form.price.value = p.price;
      form.category.value = p.category;
      form.brand.value = p.brand;
      form.image.value = p.image;
      form.stock.value = p.stock;
    } catch (err) {
      showToast(err.message, 'error');
      return;
    }
  }
  modal.classList.add('show');
}

function closeProductModal() {
  document.getElementById('productModal').classList.remove('show');
  editingProductId = null;
}

async function handleProductFormSubmit(e) {
  e.preventDefault();
  const form = e.target;
  const payload = {
    name: form.name.value.trim(),
    description: form.description.value.trim(),
    price: Number(form.price.value),
    category: form.category.value.trim(),
    brand: form.brand.value.trim(),
    image: form.image.value.trim() || undefined,
    stock: Number(form.stock.value),
  };

  const submitBtn = form.querySelector('button[type="submit"]');
  submitBtn.disabled = true;
  submitBtn.textContent = 'Saving...';

  try {
    if (editingProductId) {
      await apiRequest(`/admin/products/${editingProductId}`, { method: 'PUT', auth: true, body: payload });
      showToast('Product updated', 'success');
    } else {
      await apiRequest('/admin/products', { method: 'POST', auth: true, body: payload });
      showToast('Product created', 'success');
    }
    closeProductModal();
    loadAdminProducts();
  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Save Product';
  }
}

async function deleteProduct(id) {
  if (!confirm('Are you sure you want to delete this product? This cannot be undone.')) return;
  try {
    await apiRequest(`/admin/products/${id}`, { method: 'DELETE', auth: true });
    showToast('Product deleted', 'success');
    loadAdminProducts();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

/* ---------------- Order management ---------------- */
const STATUS_OPTIONS = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

async function loadAdminOrders() {
  const tbody = document.getElementById('ordersTableBody');
  tbody.innerHTML = '<tr><td colspan="6">Loading...</td></tr>';
  try {
    const data = await apiRequest('/admin/orders', { auth: true });
    tbody.innerHTML = data.orders.length
      ? data.orders.map((o) => `
        <tr>
          <td>#${o._id.slice(-8).toUpperCase()}</td>
          <td>${escapeHtml(o.user?.name || 'Unknown')}<br/><span class="unit-price">${escapeHtml(o.user?.email || '')}</span></td>
          <td>${formatDate(o.createdAt)}</td>
          <td>${formatPrice(o.totalPrice)}</td>
          <td><span class="badge ${o.status}">${o.status}</span></td>
          <td>
            <select onchange="updateOrderStatus('${o._id}', this.value)">
              ${STATUS_OPTIONS.map((s) => `<option value="${s}" ${s === o.status ? 'selected' : ''}>${s}</option>`).join('')}
            </select>
          </td>
        </tr>`).join('')
      : '<tr><td colspan="6">No orders placed yet.</td></tr>';
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="6">${escapeHtml(err.message)}</td></tr>`;
  }
}

async function updateOrderStatus(id, status) {
  try {
    await apiRequest(`/admin/orders/${id}/status`, { method: 'PUT', auth: true, body: { status } });
    showToast('Order status updated', 'success');
    loadAdminOrders();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

/* ---------------- Init ---------------- */
document.addEventListener('DOMContentLoaded', () => {
  if (!Auth.isLoggedIn() || !Auth.isAdmin()) {
    showToast('Admin access only', 'error');
    window.location.href = 'index.html';
    return;
  }

  document.querySelectorAll('.admin-sidebar button').forEach((b) => {
    b.addEventListener('click', () => switchTab(b.dataset.tab));
  });
  document.getElementById('addProductBtn').addEventListener('click', () => openProductModal(null));
  document.getElementById('productForm').addEventListener('submit', handleProductFormSubmit);
  document.getElementById('closeModalBtn').addEventListener('click', closeProductModal);
  document.getElementById('cancelModalBtn').addEventListener('click', closeProductModal);

  switchTab('dashboard');
});
