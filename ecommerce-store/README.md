# UrbanCart — Full Stack E-Commerce Store

A complete full stack e-commerce web application built with **HTML, CSS, vanilla JavaScript** on the frontend and **Node.js, Express.js, MongoDB (Mongoose)** on the backend, using **JWT authentication**. Built as an internship project to demonstrate REST API design, database modelling, authentication, and a responsive UI — without any frontend framework.

---

## ✨ Features

- **User Authentication** — Register/Login with JWT, passwords hashed with bcrypt
- **Home Page** — Hero banner, category chips, featured products
- **Product Listing** — Paginated grid of products
- **Search & Filter** — Search by keyword, filter by category & price range, sort by price/rating/name
- **Product Details Page** — Full description, quantity selector, add to cart / buy now
- **Shopping Cart** — Persisted in `localStorage`, quantity controls, live totals
- **Checkout Page** — Shipping address form with validation, payment method selection, order summary
- **Order History** — View all past orders with status badges
- **Admin Dashboard** — Stats overview, full product CRUD (add/edit/delete), order status management
- **Responsive UI** — Works on mobile, tablet and desktop
- **Form Validation** — Both client-side (JS) and server-side (express-validator)
- **Centralized Error Handling** — Consistent JSON error responses
- **REST API** — Clean, resource-based Express routes
- **MongoDB Integration** — Mongoose schemas/models with indexes and validation
- **Environment Variables** — Configuration via `.env`
- **Seed Script** — One command to populate sample users & products
- **Well-commented code** throughout

---

## 🗂️ Folder Structure

```
ecommerce-store/
├── config/
│   └── db.js                  # MongoDB connection setup
├── controllers/
│   ├── authController.js      # Register / Login / Get profile
│   ├── productController.js   # Public product listing & detail
│   ├── orderController.js     # Checkout & order history
│   └── adminController.js     # Admin product CRUD + order management
├── middleware/
│   ├── auth.js                 # JWT verification (protect route)
│   ├── admin.js                 # Admin-only route guard
│   ├── validate.js              # express-validator error formatter
│   └── errorHandler.js          # Centralized error + 404 handler
├── models/
│   ├── User.js                  # User schema (bcrypt hashing built-in)
│   ├── Product.js               # Product schema (with text search index)
│   └── Order.js                 # Order schema (embedded items/address)
├── routes/
│   ├── authRoutes.js
│   ├── productRoutes.js
│   ├── orderRoutes.js
│   └── adminRoutes.js
├── seed/
│   ├── seedData.js              # Sample users + 12 sample products
│   └── seed.js                  # Import / destroy script
├── utils/
│   ├── generateToken.js
│   └── asyncHandler.js
├── public/                      # Frontend (HTML/CSS/JS) served statically by Express
│   ├── index.html                # Home page
│   ├── products.html             # Listing + search/filter
│   ├── product.html              # Product details
│   ├── cart.html                 # Shopping cart
│   ├── checkout.html             # Checkout form
│   ├── login.html / register.html
│   ├── orders.html               # Order history
│   ├── admin.html                # Admin dashboard
│   ├── css/style.css
│   └── js/
│       ├── api.js                # Shared fetch wrapper, auth/cart storage, navbar
│       ├── auth.js
│       ├── home.js
│       ├── products.js
│       ├── product.js
│       ├── cart.js
│       ├── checkout.js
│       ├── orders.js
│       └── admin.js
├── server.js                    # Express app entry point
├── package.json
├── .env.example
└── .gitignore
```

---

## 🧰 Tech Stack

| Layer      | Technology                                   |
| ---------- | -------------------------------------------- |
| Frontend   | HTML5, CSS3 (custom, responsive), vanilla JS |
| Backend    | Node.js, Express.js                          |
| Database   | MongoDB with Mongoose ODM                    |
| Auth       | JSON Web Tokens (JWT) + bcryptjs             |
| Validation | express-validator                            |

---

## ⚙️ Prerequisites

- [Node.js](https://nodejs.org/) v18 or later
- [MongoDB](https://www.mongodb.com/try/download/community) running locally, **or** a free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster
- npm (comes with Node.js)

---

## 🚀 Getting Started (Run Locally in VS Code)

### 1. Open the project

Open the `ecommerce-store` folder in VS Code.

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Copy the example file and fill in your own values:

```bash
cp .env.example .env
```

Then edit `.env`:

```
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/ecommerce_store
JWT_SECRET=replace_this_with_a_long_random_secret_key
JWT_EXPIRES_IN=7d
NODE_ENV=development
```

> If you're using MongoDB Atlas, replace `MONGO_URI` with your connection string, e.g.
> `mongodb+srv://<user>:<password>@<cluster>.mongodb.net/ecommerce_store`

### 4. Seed the database with sample data

This creates an admin account, a test customer account, and 12 sample products.

```bash
npm run seed
```

To wipe all data later: `npm run seed:destroy`

**Demo accounts created by the seed script:**
| Role | Email | Password |
|----------|---------------------|--------------|
| Admin | admin@store.com | admin123 |
| Customer | customer@store.com | customer123 |

### 5. Start the server

```bash
npm start
```

For auto-restart during development (requires the `nodemon` devDependency already listed in `package.json`):

```bash
npm run dev
```

> If MongoDB is not running yet, the app automatically switches to a built-in demo mode so you can still explore the storefront immediately. For production, point `MONGO_URI` at a live MongoDB instance.

### 6. Open the app

Visit **http://localhost:5000** in your browser. The Express server serves both the REST API (`/api/...`) and the static frontend (`/public`) from the same port — no separate frontend server needed.

---

## 🔌 REST API Reference

Base URL: `http://localhost:5000/api`

### Auth

| Method | Endpoint         | Access  | Description              |
| ------ | ---------------- | ------- | ------------------------ |
| POST   | `/auth/register` | Public  | Register a new customer  |
| POST   | `/auth/login`    | Public  | Login, returns JWT       |
| GET    | `/auth/me`       | Private | Get current user profile |

### Products

| Method | Endpoint                    | Access | Description                                                                            |
| ------ | --------------------------- | ------ | -------------------------------------------------------------------------------------- |
| GET    | `/products`                 | Public | List products (`keyword`, `category`, `minPrice`, `maxPrice`, `sort`, `page`, `limit`) |
| GET    | `/products/:id`             | Public | Get a single product                                                                   |
| GET    | `/products/meta/categories` | Public | Get distinct category list                                                             |

### Orders (requires `Authorization: Bearer <token>`)

| Method | Endpoint      | Access  | Description                    |
| ------ | ------------- | ------- | ------------------------------ |
| POST   | `/orders`     | Private | Place a new order (checkout)   |
| GET    | `/orders/my`  | Private | Get logged-in user's orders    |
| GET    | `/orders/:id` | Private | Get one order (owner or admin) |

### Admin (requires admin JWT)

| Method | Endpoint                   | Description              |
| ------ | -------------------------- | ------------------------ |
| POST   | `/admin/products`          | Create product           |
| PUT    | `/admin/products/:id`      | Update product           |
| DELETE | `/admin/products/:id`      | Delete product           |
| GET    | `/admin/orders`            | List all orders          |
| PUT    | `/admin/orders/:id/status` | Update an order's status |
| GET    | `/admin/stats`             | Dashboard summary stats  |

All responses follow the shape `{ success, message?, ...data }`. Errors are returned as `{ success: false, message }`.

---

## 🔐 Authentication Flow

1. User registers or logs in → server returns a signed JWT.
2. Frontend stores the JWT + user object in `localStorage`.
3. Protected requests attach `Authorization: Bearer <token>` (see `apiRequest` in `public/js/api.js`).
4. `middleware/auth.js` verifies the token and attaches `req.user`.
5. `middleware/admin.js` additionally checks `req.user.role === 'admin'` for admin-only routes.

---

## 🧪 Testing the App Manually

1. Register a new account, or log in with the seeded customer account.
2. Browse **Shop**, use search/filters, open a product, add it to your cart.
3. Go to **Cart**, adjust quantities, proceed to **Checkout**, fill in the shipping form, place the order.
4. View it under **My Orders**.
5. Log out, log back in as `admin@store.com`, open **Admin** from the navbar.
6. Add/edit/delete products, and update order statuses from the Orders tab.

---

## 🌐 Deployment Instructions

### Option A — Render / Railway / Fly.io (Node hosting)

1. Push this project to a GitHub repository (see below).
2. Create a new **Web Service** on [Render](https://render.com) (or similar) and connect your repo.
3. Set the build command to `npm install` and the start command to `npm start`.
4. Add environment variables in the host's dashboard (`MONGO_URI`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `NODE_ENV=production`). Do **not** commit your real `.env` file.
5. Use a **MongoDB Atlas** connection string for `MONGO_URI` (a local `mongodb://127.0.0.1` URI won't work on a remote host).
6. Deploy. Once live, run the seed script once via the host's shell/console if you want sample data: `node seed/seed.js`.

### Option B — MongoDB Atlas setup (needed for any cloud deployment)

1. Create a free cluster at https://www.mongodb.com/cloud/atlas
2. Under **Database Access**, create a database user with a username/password.
3. Under **Network Access**, allow access from anywhere (`0.0.0.0/0`) for simplicity, or your host's IP range.
4. Copy the connection string from **Connect → Drivers**, replace `<password>` and add your database name, and use it as `MONGO_URI`.

### Option C — VPS (e.g. an Ubuntu server)

1. Install Node.js and MongoDB (or point to Atlas).
2. Clone your repo, run `npm install`, create `.env`.
3. Run with a process manager so it survives restarts:
   ```bash
   npm install -g pm2
   pm2 start server.js --name urbancart
   pm2 save
   ```
4. Put Nginx in front as a reverse proxy to port 5000, and set up HTTPS with Let's Encrypt/Certbot.

---

## 📤 Pushing to GitHub

```bash
git init
git add .
git commit -m "Initial commit: UrbanCart full stack e-commerce store"
git branch -M main
git remote add origin https://github.com/<your-username>/<your-repo-name>.git
git push -u origin main
```

The included `.gitignore` already excludes `node_modules/` and `.env`, so your secrets stay local. Remember to add a `.env` file (based on `.env.example`) on any machine or host where you run the project.

---

## 📸 Screenshots

This project ships as source code — screenshots aren't pre-generated in this repo. Once the app is running (`npm start`), you can capture your own screenshots of:

- Home page (`/`)
- Product listing with filters (`/products.html`)
- Product details (`/product.html?id=...`)
- Cart & Checkout (`/cart.html`, `/checkout.html`)
- Order history (`/orders.html`)
- Admin dashboard (`/admin.html`)

Add them to a `/screenshots` folder and reference them here, e.g.:

```md
![Home Page](screenshots/home.png)
![Admin Dashboard](screenshots/admin.png)
```

---

## 🛠️ Troubleshooting

- **"MongoDB Connected" never appears / connection error** → Make sure MongoDB is running locally (`mongod`) or that your Atlas `MONGO_URI` and IP allowlist are correct.
- **401 Unauthorized on protected routes** → Your token may have expired; log out and log in again.
- **Port already in use** → Change `PORT` in `.env`, or stop the process using that port.
- **Products page shows nothing** → Run `npm run seed` to populate sample data.

---

## 📄 License

MIT — free to use for learning and internship submissions.
