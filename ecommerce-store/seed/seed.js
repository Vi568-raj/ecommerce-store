// seed/seed.js
// Populates (or wipes) the database with sample users and products.
//
// Usage:
//   npm run seed          -> import sample data
//   npm run seed:destroy  -> delete all data
//
// This mirrors what "node seed/seed.js" and "node seed/seed.js -d" do.

const dotenv = require('dotenv');
dotenv.config();

const connectDB = require('../config/db');
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const { users, products } = require('./seedData');

const importData = async () => {
  try {
    await connectDB();

    await Order.deleteMany();
    await Product.deleteMany();
    await User.deleteMany();

    // Insert users individually so the pre-save password-hashing hook runs for each
    const createdUsers = [];
    for (const userData of users) {
      const user = await User.create(userData);
      createdUsers.push(user);
    }
    const adminUser = createdUsers.find((u) => u.role === 'admin');

    const productsWithCreator = products.map((p) => ({ ...p, createdBy: adminUser._id }));
    await Product.insertMany(productsWithCreator);

    console.log('✅ Sample data imported successfully!');
    console.log(`   Users created: ${createdUsers.length}`);
    console.log(`   Products created: ${productsWithCreator.length}`);
    console.log('');
    console.log('   Admin login  -> email: admin@store.com    password: admin123');
    console.log('   Customer login -> email: customer@store.com password: customer123');

    process.exit(0);
  } catch (error) {
    console.error(`❌ Error importing data: ${error.message}`);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await connectDB();

    await Order.deleteMany();
    await Product.deleteMany();
    await User.deleteMany();

    console.log('🗑️  All data destroyed successfully!');
    process.exit(0);
  } catch (error) {
    console.error(`❌ Error destroying data: ${error.message}`);
    process.exit(1);
  }
};

if (process.argv[2] === '-d') {
  destroyData();
} else {
  importData();
}
