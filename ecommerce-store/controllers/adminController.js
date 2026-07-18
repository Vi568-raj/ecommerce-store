// controllers/adminController.js
// Admin-only endpoints: manage products (CRUD) and view/update all orders.
// All routes here are protected by both `protect` and `admin` middleware.

const Product = require('../models/Product');
const Order = require('../models/Order');
const asyncHandler = require('../utils/asyncHandler');
const { isMongoConnected, createDemoProduct, updateDemoProduct, deleteDemoProduct, getAllDemoOrders, updateDemoOrderStatus, getDemoStats } = require('../utils/fallbackStore');

// @desc    Create a new product
// @route   POST /api/admin/products
// @access  Private/Admin
const createProduct = asyncHandler(async (req, res) => {
  const { name, description, price, category, brand, image, stock } = req.body;

  if (!isMongoConnected()) {
    const product = createDemoProduct({
      name,
      description,
      price,
      category,
      brand,
      image,
      stock,
    }, req.user._id);
    return res.status(201).json({ success: true, message: 'Product created', product });
  }

  const product = await Product.create({
    name,
    description,
    price,
    category,
    brand,
    image,
    stock,
    createdBy: req.user._id,
  });

  res.status(201).json({ success: true, message: 'Product created', product });
});

// @desc    Update an existing product
// @route   PUT /api/admin/products/:id
// @access  Private/Admin
const updateProduct = asyncHandler(async (req, res) => {
  if (!isMongoConnected()) {
    const updated = updateDemoProduct(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    return res.json({ success: true, message: 'Product updated', product: updated });
  }

  const product = await Product.findById(req.params.id);
  if (!product) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }

  const fields = ['name', 'description', 'price', 'category', 'brand', 'image', 'stock'];
  fields.forEach((field) => {
    if (req.body[field] !== undefined) product[field] = req.body[field];
  });

  const updated = await product.save();
  res.json({ success: true, message: 'Product updated', product: updated });
});

// @desc    Delete a product
// @route   DELETE /api/admin/products/:id
// @access  Private/Admin
const deleteProduct = asyncHandler(async (req, res) => {
  if (!isMongoConnected()) {
    const deleted = deleteDemoProduct(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    return res.json({ success: true, message: 'Product deleted' });
  }

  const product = await Product.findById(req.params.id);
  if (!product) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }

  await product.deleteOne();
  res.json({ success: true, message: 'Product deleted' });
});

// @desc    Get all orders (admin view)
// @route   GET /api/admin/orders
// @access  Private/Admin
const getAllOrders = asyncHandler(async (req, res) => {
  if (!isMongoConnected()) {
    const orders = getAllDemoOrders();
    return res.json({ success: true, count: orders.length, orders });
  }

  const orders = await Order.find({}).populate('user', 'name email').sort({ createdAt: -1 });
  res.json({ success: true, count: orders.length, orders });
});

// @desc    Update an order's status
// @route   PUT /api/admin/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  if (!isMongoConnected()) {
    const updated = updateDemoOrderStatus(req.params.id, status);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    return res.json({ success: true, message: 'Order status updated', order: updated });
  }

  const order = await Order.findById(req.params.id);
  if (!order) {
    return res.status(404).json({ success: false, message: 'Order not found' });
  }

  order.status = status;
  if (status === 'Delivered') order.isPaid = true;

  const updated = await order.save();
  res.json({ success: true, message: 'Order status updated', order: updated });
});

// @desc    Get dashboard summary stats
// @route   GET /api/admin/stats
// @access  Private/Admin
const getDashboardStats = asyncHandler(async (req, res) => {
  if (!isMongoConnected()) {
    const stats = getDemoStats();
    return res.json({ success: true, stats });
  }

  const [totalProducts, totalOrders, revenueAgg, lowStock] = await Promise.all([
    Product.countDocuments(),
    Order.countDocuments(),
    Order.aggregate([{ $group: { _id: null, total: { $sum: '$totalPrice' } } }]),
    Product.countDocuments({ stock: { $lte: 5 } }),
  ]);

  res.json({
    success: true,
    stats: {
      totalProducts,
      totalOrders,
      totalRevenue: revenueAgg[0]?.total || 0,
      lowStockProducts: lowStock,
    },
  });
});

module.exports = {
  createProduct,
  updateProduct,
  deleteProduct,
  getAllOrders,
  updateOrderStatus,
  getDashboardStats,
};
