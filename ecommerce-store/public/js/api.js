/* ==========================================================================
   api.js — Shared helpers used by every page: API calls, auth/token storage,
   cart storage (localStorage), and small UI utilities (toast, navbar).
   Loaded before any other page-specific script.
   ========================================================================== */

const API_BASE = '/api';

/* ---------------- Toast notifications ---------------- */
function showToast(message, type = 'success') {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.className = `show ${type}`;
  clearTimeout(window.__toastTimer);
  window.__toastTimer = setTimeout(() => {
    toast.className = '';
  }, 3200);
}

/* ---------------- Auth/token storage ---------------- */
const Auth = {
  getToken() { return localStorage.getItem('token'); },
  getUser() {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  },
  isLoggedIn() { return !!Auth.getToken(); },
  isAdmin() {
    const u = Auth.getUser();
    return u && u.role === 'admin';
  },
  save(token, user) {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
  },
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'index.html';
  },
};

/* ---------------- Generic fetch wrapper ---------------- */
async function apiRequest(endpoint, { method = 'GET', body, auth = false } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (auth) {
    const token = Auth.getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  let response;
  try {
    response = await fetch(`${API_BASE}${endpoint}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (networkError) {
    throw new Error('Could not reach the server. Please check your connection and try again.');
  }

  let data;
  try {
    data = await response.json();
  } catch {
    data = {};
  }

  if (!response.ok) {
    // Auto logout on expired/invalid token
    if (response.status === 401 && auth) {
      Auth.logout();
    }
    const err = new Error(data.message || 'Something went wrong. Please try again.');
    err.errors = data.errors;
    throw err;
  }

  return data;
}

/* ---------------- Cart storage (localStorage, keyed per browser) ---------------- */
const Cart = {
  KEY: 'cart_items',
  get() {
    const raw = localStorage.getItem(Cart.KEY);
    return raw ? JSON.parse(raw) : [];
  },
  save(items) {
    localStorage.setItem(Cart.KEY, JSON.stringify(items));
    Cart.updateBadge();
  },
  add(product, qty = 1) {
    const items = Cart.get();
    const existing = items.find((i) => i.product === product._id);
    if (existing) {
      existing.quantity += qty;
    } else {
      items.push({
        product: product._id,
        name: product.name,
        image: product.image,
        price: product.price,
        stock: product.stock,
        quantity: qty,
      });
    }
    Cart.save(items);
  },
  updateQty(productId, qty) {
    let items = Cart.get();
    items = items.map((i) => (i.product === productId ? { ...i, quantity: qty } : i));
    Cart.save(items);
  },
  remove(productId) {
    const items = Cart.get().filter((i) => i.product !== productId);
    Cart.save(items);
  },
  clear() {
    localStorage.removeItem(Cart.KEY);
    Cart.updateBadge();
  },
  count() {
    return Cart.get().reduce((sum, i) => sum + i.quantity, 0);
  },
  subtotal() {
    return Cart.get().reduce((sum, i) => sum + i.price * i.quantity, 0);
  },
  updateBadge() {
    const badge = document.getElementById('cartCount');
    if (badge) badge.textContent = Cart.count();
  },
};

/* ---------------- Formatting helpers ---------------- */
function formatPrice(n) {
  return '₹' + Number(n).toLocaleString('en-IN', { maximumFractionDigits: 2 });
}

function formatDate(d) {
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function escapeHtml(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/* ---------------- Navbar rendering (shared across all pages) ---------------- */
function renderNavbar() {
  const mount = document.getElementById('navbar');
  if (!mount) return;

  const loggedIn = Auth.isLoggedIn();
  const isAdmin = Auth.isAdmin();

  mount.innerHTML = `
    <nav class="navbar">
      <div class="container">
        <a href="index.html" class="brand">Urban<span>Cart</span></a>

        <form class="nav-search" id="navSearchForm" role="search">
          <input type="search" id="navSearchInput" placeholder="Search products..." aria-label="Search products" />
          <button type="submit" aria-label="Search">🔍</button>
        </form>

        <button class="nav-toggle" id="navToggle" aria-label="Toggle menu">☰</button>

        <div class="nav-links" id="navLinks">
          <a href="products.html">Shop</a>
          ${loggedIn ? '<a href="orders.html">My Orders</a>' : ''}
          ${isAdmin ? '<a href="admin.html">Admin</a>' : ''}
          <a href="cart.html" class="cart-badge">🛒 Cart <span class="cart-count" id="cartCount">0</span></a>
          ${loggedIn
            ? `<button id="logoutBtn">Logout (${escapeHtml((Auth.getUser() || {}).name || 'User')})</button>`
            : '<a href="login.html">Login</a><a href="register.html">Sign Up</a>'
          }
        </div>
      </div>
    </nav>
  `;

  Cart.updateBadge();

  document.getElementById('navToggle')?.addEventListener('click', () => {
    document.getElementById('navLinks').classList.toggle('open');
  });

  document.getElementById('logoutBtn')?.addEventListener('click', Auth.logout);

  document.getElementById('navSearchForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const q = document.getElementById('navSearchInput').value.trim();
    window.location.href = `products.html?keyword=${encodeURIComponent(q)}`;
  });
}

document.addEventListener('DOMContentLoaded', () => {
  renderNavbar();
  Cart.updateBadge();
});
