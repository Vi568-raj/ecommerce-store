// utils/fallbackStore.js
// In-memory demo data used when MongoDB is unavailable so the app still runs locally.

const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const { users: seedUsers, products: seedProducts } = require('../seed/seedData');

const demoUsers = seedUsers.map((user, index) => ({
  _id: `demo-user-${index + 1}`,
  ...user,
  password: user.password,
  createdAt: new Date(),
  updatedAt: new Date(),
}));

const demoProducts = seedProducts.map((product, index) => ({
  _id: `demo-product-${index + 1}`,
  ...product,
  createdAt: new Date(),
  updatedAt: new Date(),
}));

let demoOrders = [];

const isMongoConnected = () => mongoose.connection.readyState === 1;

async function comparePassword(plainPassword, hashedPassword) {
  return bcrypt.compare(plainPassword, hashedPassword);
}

async function createDemoUser({ name, email, password, role = 'customer' }) {
  const existing = demoUsers.find((user) => user.email.toLowerCase() === email.toLowerCase());
  if (existing) return null;

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = {
    _id: `demo-user-${Date.now()}`,
    name,
    email: email.toLowerCase(),
    password: hashedPassword,
    role,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  demoUsers.push(user);
  return user;
}

function findDemoUserByEmail(email) {
  return demoUsers.find((user) => user.email.toLowerCase() === email.toLowerCase()) || null;
}

function findDemoUserById(id) {
  return demoUsers.find((user) => user._id.toString() === id.toString()) || null;
}

function getDemoProducts(query = {}) {
  let items = [...demoProducts];
  const { keyword, category, minPrice, maxPrice, sort, page = 1, limit = 12 } = query;

  if (keyword) {
    const regex = new RegExp(keyword, 'i');
    items = items.filter((product) => regex.test(product.name) || regex.test(product.description) || regex.test(product.brand));
  }

  if (category && category !== 'All') {
    items = items.filter((product) => product.category === category);
  }

  if (minPrice || maxPrice) {
    items = items.filter((product) => {
      if (minPrice && product.price < Number(minPrice)) return false;
      if (maxPrice && product.price > Number(maxPrice)) return false;
      return true;
    });
  }

  if (sort === 'price_asc') items.sort((a, b) => a.price - b.price);
  else if (sort === 'price_desc') items.sort((a, b) => b.price - a.price);
  else if (sort === 'rating') items.sort((a, b) => (b.rating || 0) - (a.rating || 0));
  else if (sort === 'name') items.sort((a, b) => a.name.localeCompare(b.name));
  else items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const pageNum = Math.max(Number(page), 1);
  const limitNum = Math.max(Number(limit), 1);
  const skip = (pageNum - 1) * limitNum;

  const paged = items.slice(skip, skip + limitNum);
  return {
    total: items.length,
    page: pageNum,
    pages: Math.ceil(items.length / limitNum),
    products: paged,
  };
}

function getDemoProductById(id) {
  return demoProducts.find((product) => product._id.toString() === id.toString()) || null;
}

function getDemoCategories() {
  return [...new Set(demoProducts.map((product) => product.category))].sort();
}

function createDemoProduct(payload, createdBy) {
  const product = {
    _id: `demo-product-${Date.now()}`,
    ...payload,
    createdBy,
    rating: 0,
    numReviews: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  demoProducts.push(product);
  return product;
}

function updateDemoProduct(id, updates) {
  const index = demoProducts.findIndex((product) => product._id.toString() === id.toString());
  if (index === -1) return null;
  demoProducts[index] = { ...demoProducts[index], ...updates, updatedAt: new Date() };
  return demoProducts[index];
}

function deleteDemoProduct(id) {
  const index = demoProducts.findIndex((product) => product._id.toString() === id.toString());
  if (index === -1) return false;
  demoProducts.splice(index, 1);
  return true;
}

function getDemoOrdersForUser(userId) {
  return demoOrders.filter((order) => order.user.toString() === userId.toString()).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

function getDemoOrderById(id) {
  return demoOrders.find((order) => order._id.toString() === id.toString()) || null;
}

function createDemoOrder({ userId, orderItems, shippingAddress, paymentMethod, itemsPrice, shippingPrice, taxPrice, totalPrice }) {
  const order = {
    _id: `demo-order-${Date.now()}`,
    user: userId,
    orderItems,
    shippingAddress,
    paymentMethod,
    itemsPrice,
    shippingPrice,
    taxPrice,
    totalPrice,
    isPaid: paymentMethod !== 'COD',
    paidAt: paymentMethod !== 'COD' ? new Date() : null,
    status: 'Pending',
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  demoOrders.push(order);
  return order;
}

function getAllDemoOrders() {
  return [...demoOrders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

function updateDemoOrderStatus(id, status) {
  const order = getDemoOrderById(id);
  if (!order) return null;
  order.status = status;
  order.updatedAt = new Date();
  if (status === 'Delivered') order.isPaid = true;
  return order;
}

function getDemoStats() {
  const totalProducts = demoProducts.length;
  const totalOrders = demoOrders.length;
  const totalRevenue = demoOrders.reduce((sum, order) => sum + Number(order.totalPrice || 0), 0);
  const lowStockProducts = demoProducts.filter((product) => product.stock <= 5).length;
  return { totalProducts, totalOrders, totalRevenue, lowStockProducts };
}

module.exports = {
  isMongoConnected,
  comparePassword,
  createDemoUser,
  findDemoUserByEmail,
  findDemoUserById,
  getDemoProducts,
  getDemoProductById,
  getDemoCategories,
  createDemoProduct,
  updateDemoProduct,
  deleteDemoProduct,
  getDemoOrdersForUser,
  getDemoOrderById,
  createDemoOrder,
  getAllDemoOrders,
  updateDemoOrderStatus,
  getDemoStats,
};
