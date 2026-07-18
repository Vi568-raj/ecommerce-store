// routes/orderRoutes.js
const express = require('express');
const { body } = require('express-validator');
const { createOrder, getMyOrders, getOrderById } = require('../controllers/orderController');
const { protect } = require('../middleware/auth');
const { validate } = require('../middleware/validate');

const router = express.Router();

router.use(protect); // every order route requires authentication

router.post(
  '/',
  [
    body('orderItems').isArray({ min: 1 }).withMessage('Order must contain at least one item'),
    body('shippingAddress.fullName').notEmpty().withMessage('Full name is required'),
    body('shippingAddress.address').notEmpty().withMessage('Address is required'),
    body('shippingAddress.city').notEmpty().withMessage('City is required'),
    body('shippingAddress.postalCode').notEmpty().withMessage('Postal code is required'),
    body('shippingAddress.country').notEmpty().withMessage('Country is required'),
    body('shippingAddress.phone').notEmpty().withMessage('Phone number is required'),
    body('paymentMethod').isIn(['COD', 'Card', 'UPI']).withMessage('Invalid payment method'),
  ],
  validate,
  createOrder
);

router.get('/my', getMyOrders);
router.get('/:id', getOrderById);

module.exports = router;
