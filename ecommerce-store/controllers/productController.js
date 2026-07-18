// controllers/productController.js
// Public read endpoints for products: listing (with search/filter/pagination)
// and single product detail.

const Product = require('../models/Product');
const asyncHandler = require('../utils/asyncHandler');
const { isMongoConnected, getDemoProducts, getDemoProductById, getDemoCategories } = require('../utils/fallbackStore');

// @desc    Get all products with optional search, category filter, price range and pagination
// @route   GET /api/products?keyword=&category=&minPrice=&maxPrice=&sort=&page=&limit=
// @access  Public
const getProducts = asyncHandler(async (req, res) => {
  if (!isMongoConnected()) {
    const { total, page, pages, products } = getDemoProducts(req.query);
    return res.json({
      success: true,
      count: products.length,
      total,
      page,
      pages,
      products,
    });
  }

  const { keyword, category, minPrice, maxPrice, sort, page = 1, limit = 12 } = req.query;
  const query = {};

  if (keyword) {
    query.$or = [
      { name: { $regex: keyword, $options: 'i' } },
      { description: { $regex: keyword, $options: 'i' } },
      { brand: { $regex: keyword, $options: 'i' } },
    ];
  }

  if (category && category !== 'All') {
    query.category = category;
  }

  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = Number(minPrice);
    if (maxPrice) query.price.$lte = Number(maxPrice);
  }

  let sortOption = { createdAt: -1 };
  if (sort === 'price_asc') sortOption = { price: 1 };
  if (sort === 'price_desc') sortOption = { price: -1 };
  if (sort === 'rating') sortOption = { rating: -1 };
  if (sort === 'name') sortOption = { name: 1 };

  const pageNum = Math.max(Number(page), 1);
  const limitNum = Math.max(Number(limit), 1);
  const skip = (pageNum - 1) * limitNum;

  const [products, total] = await Promise.all([
    Product.find(query).sort(sortOption).skip(skip).limit(limitNum),
    Product.countDocuments(query),
  ]);

  res.json({
    success: true,
    count: products.length,
    total,
    page: pageNum,
    pages: Math.ceil(total / limitNum),
    products,
  });
});

// @desc    Get a single product by id
// @route   GET /api/products/:id
// @access  Public
const getProductById = asyncHandler(async (req, res) => {
  if (!isMongoConnected()) {
    const product = getDemoProductById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    return res.json({ success: true, product });
  }

  const product = await Product.findById(req.params.id);
  if (!product) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }

  res.json({ success: true, product });
});

// @desc    Get list of distinct categories (used to build the filter dropdown)
// @route   GET /api/products/meta/categories
// @access  Public
const getCategories = asyncHandler(async (req, res) => {
  if (!isMongoConnected()) {
    return res.json({ success: true, categories: getDemoCategories() });
  }

  const categories = await Product.distinct('category');
  res.json({ success: true, categories });
});

module.exports = { getProducts, getProductById, getCategories };
