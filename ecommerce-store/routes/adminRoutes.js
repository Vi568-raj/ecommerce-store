// routes/adminRoutes.js
const express = require('express');
const { body } = require('express-validator');
const {
  createProduct,
  updateProduct,
  deleteProduct,
  getAllOrders,
  updateOrderStatus,
  getDashboardStats,
} = require('../controllers/adminController');
const { protect } = require('../middleware/auth');
const { admin } = require('../middleware/admin');
const { validate } = require('../middleware/validate');

const router = express.Router();

router.use(protect, admin); // every admin route requires a logged-in admin

const productValidation = [
  body('name').trim().notEmpty().withMessage('Product name is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('category').trim().notEmpty().withMessage('Category is required'),
  body('stock').isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),
];

router.post('/products', productValidation, validate, createProduct);
router.put('/products/:id', updateProduct);
router.delete('/products/:id', deleteProduct);

router.get('/orders', getAllOrders);
router.put(
  '/orders/:id/status',
  [body('status').isIn(['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'])],
  validate,
  updateOrderStatus
);

router.get('/stats', getDashboardStats);

module.exports = router;
