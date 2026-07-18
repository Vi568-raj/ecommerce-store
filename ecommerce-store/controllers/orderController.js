// controllers/orderController.js
// Handles creating orders at checkout and retrieving a user's order history.

const Order = require('../models/Order');
const Product = require('../models/Product');
const asyncHandler = require('../utils/asyncHandler');
const { isMongoConnected, getDemoOrdersForUser, getDemoOrderById, createDemoOrder, getDemoProductById } = require('../utils/fallbackStore');

// @desc    Create a new order (checkout)
// @route   POST /api/orders
// @access  Private
const createOrder = asyncHandler(async (req, res) => {
  const { orderItems, shippingAddress, paymentMethod } = req.body;

  if (!orderItems || orderItems.length === 0) {
    return res.status(400).json({ success: false, message: 'No order items provided' });
  }

  if (!isMongoConnected()) {
    const items = [];
    let itemsPrice = 0;

    for (const item of orderItems) {
      const product = getDemoProductById(item.product);
      if (!product) {
        return res.status(404).json({ success: false, message: `Product not found: ${item.product}` });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({ success: false, message: `Insufficient stock for "${product.name}"` });
      }

      items.push({
        product: product._id,
        name: product.name,
        image: product.image,
        price: product.price,
        quantity: item.quantity,
      });
      itemsPrice += product.price * item.quantity;
    }

    const shippingPrice = itemsPrice > 999 ? 0 : 49;
    const taxPrice = Number((itemsPrice * 0.05).toFixed(2));
    const totalPrice = Number((itemsPrice + shippingPrice + taxPrice).toFixed(2));
    const order = createDemoOrder({
      userId: req.user._id,
      orderItems: items,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      shippingPrice,
      taxPrice,
      totalPrice,
    });
    return res.status(201).json({ success: true, message: 'Order placed successfully', order });
  }

  const items = [];
  let itemsPrice = 0;

  for (const item of orderItems) {
    const product = await Product.findById(item.product);

    if (!product) {
      return res.status(404).json({ success: false, message: `Product not found: ${item.product}` });
    }
    if (product.stock < item.quantity) {
      return res.status(400).json({ success: false, message: `Insufficient stock for "${product.name}"` });
    }

    items.push({
      product: product._id,
      name: product.name,
      image: product.image,
      price: product.price,
      quantity: item.quantity,
    });

    itemsPrice += product.price * item.quantity;
    product.stock -= item.quantity;
    await product.save();
  }

  const shippingPrice = itemsPrice > 999 ? 0 : 49;
  const taxPrice = Number((itemsPrice * 0.05).toFixed(2));
  const totalPrice = Number((itemsPrice + shippingPrice + taxPrice).toFixed(2));

  const order = await Order.create({
    user: req.user._id,
    orderItems: items,
    shippingAddress,
    paymentMethod,
    itemsPrice,
    shippingPrice,
    taxPrice,
    totalPrice,
    isPaid: paymentMethod !== 'COD',
    paidAt: paymentMethod !== 'COD' ? Date.now() : undefined,
  });

  res.status(201).json({ success: true, message: 'Order placed successfully', order });
});

// @desc    Get logged-in user's own orders
// @route   GET /api/orders/my
// @access  Private
const getMyOrders = asyncHandler(async (req, res) => {
  if (!isMongoConnected()) {
    const orders = getDemoOrdersForUser(req.user._id);
    return res.json({ success: true, count: orders.length, orders });
  }

  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json({ success: true, count: orders.length, orders });
});

// @desc    Get a single order by id (owner or admin only)
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = asyncHandler(async (req, res) => {
  if (!isMongoConnected()) {
    const order = getDemoOrderById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const user = req.user;
    const isOwner = order.user.toString() === user._id.toString();
    if (!isOwner && user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to view this order' });
    }

    return res.json({ success: true, order });
  }

  const order = await Order.findById(req.params.id).populate('user', 'name email');

  if (!order) {
    return res.status(404).json({ success: false, message: 'Order not found' });
  }

  const isOwner = order.user._id.toString() === req.user._id.toString();
  if (!isOwner && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Not authorized to view this order' });
  }

  res.json({ success: true, order });
});

module.exports = { createOrder, getMyOrders, getOrderById };
