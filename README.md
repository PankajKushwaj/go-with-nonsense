# Go with Nonsense

Full-stack e-commerce website for **Go with Nonsense** - Handmade Resin Art & Creative Crafts.

## Tech Stack

- Frontend: React, Vite, Tailwind CSS
- Backend: Node.js, Express.js
- Database: MongoDB with Mongoose
- Authentication: JWT admin auth
- Uploads: Cloudinary
- Payments: Razorpay
- Deployment: Frontend ready for Netlify/Vercel, backend ready for Render/Railway

## Project Structure

```text
frontend/
  src/
    api/
    components/
    config/
    context/
    data/
    hooks/
    pages/
backend/
  src/
    config/
    controllers/
    data/
    middleware/
    models/
    routes/
    seed/
    utils/
```

## Local Setup

### Backend

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

Set real values in `backend/.env`, especially:

```env
PORT=5000
MONGO_URI=
MONGO_DNS_SERVERS=1.1.1.1,8.8.8.8
JWT_SECRET=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
```

Seed sample products and an admin user after `MONGO_URI` is configured:

```bash
cd backend
npm run seed
```

Optional seed admin env vars:

```env
ADMIN_NAME=Go with Nonsense Admin
ADMIN_EMAIL=admin@gowithnonsense.com
ADMIN_PASSWORD=ChangeMe123!
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Frontend env vars:

```env
VITE_API_URL=http://localhost:5000/api
VITE_RAZORPAY_KEY_ID=
VITE_WHATSAPP_NUMBER=
VITE_INSTAGRAM_URL=
```

The frontend includes sample product fallback data, so the shop still displays while the backend and MongoDB are being connected.

## Main Features

- Home, shop, product detail, custom order, cart, checkout, about, contact, login, and admin dashboard pages
- Responsive navbar and mobile-first layouts
- Product categories, search, featured products, product detail view
- Cart with add, remove, and quantity update
- Checkout with WhatsApp, COD, and Razorpay options
- Custom order form with reference image upload
- Contact form saved to MongoDB
- Admin login with JWT
- Admin dashboard stats, product CRUD, order management, custom order management, and message inbox
- Cloudinary image upload support for products and custom order references
- Razorpay order creation and payment verification APIs

## API Routes

### Auth

- `POST /api/auth/login`
- `GET /api/auth/me`

### Products

- `GET /api/products`
- `GET /api/products/:id`
- `POST /api/products` admin
- `PATCH /api/products/:id` admin
- `DELETE /api/products/:id` admin

Query filters:

- `category`
- `search`
- `featured=true`

### Orders

- `POST /api/orders`
- `GET /api/orders` admin
- `GET /api/orders/:id` admin
- `PATCH /api/orders/:id` admin
- `DELETE /api/orders/:id` admin

### Custom Orders

- `POST /api/custom-orders`
- `GET /api/custom-orders` admin
- `PATCH /api/custom-orders/:id` admin
- `DELETE /api/custom-orders/:id` admin

### Contact

- `POST /api/contact`
- `GET /api/contact` admin
- `DELETE /api/contact/:id` admin

### Payments

- `POST /api/payments/create-order`
- `POST /api/payments/verify`

### Admin

- `GET /api/admin/stats`

## Deployment

### Frontend on Netlify or Vercel

- Root directory: `frontend`
- Build command: `npm run build`
- Output directory: `dist`
- Environment variables:
  - `VITE_API_URL`
  - `VITE_RAZORPAY_KEY_ID`
  - `VITE_WHATSAPP_NUMBER`
  - `VITE_INSTAGRAM_URL`

### Backend on Render or Railway

- Root directory: `backend`
- Build command: `npm install`
- Start command: `npm start`
- Environment variables:
  - `PORT`
  - `MONGO_URI`
  - `JWT_SECRET`
  - `CLOUDINARY_CLOUD_NAME`
  - `CLOUDINARY_API_KEY`
  - `CLOUDINARY_API_SECRET`
  - `RAZORPAY_KEY_ID`
  - `RAZORPAY_KEY_SECRET`
  - `CLIENT_URL`

Set `CLIENT_URL` to the deployed frontend URL so CORS allows browser requests.

If Atlas SRV DNS lookup fails locally with `querySrv ECONNREFUSED`, keep `MONGO_DNS_SERVERS=1.1.1.1,8.8.8.8` in `backend/.env` or change your computer/router DNS to Cloudflare or Google DNS.

## Commands

Frontend:

```bash
npm install
npm run dev
```

Backend:

```bash
npm install
npm run dev
```
