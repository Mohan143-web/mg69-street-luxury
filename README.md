# MG69 Street Luxury Ecommerce

React + Vite ecommerce storefront for MG69, built around a luxury minimal streetwear direction.

## Current Upgrade

- Original generated front/back product imagery for tee, hoodie, jersey, and coat
- Product gallery thumbnails for front/back shots
- Men, Women, and Drop 001 hash collection routes
- Size, color, quantity, and stock-aware cart controls
- Persistent cart and wishlist via `localStorage`
- Optional API product hydration through `VITE_API_URL`

## Frontend

```bash
npm install
npm run dev
```

Build output is written to `docs/` so GitHub Pages can serve the app from the `main` branch.

```bash
npm run build
```

## Backend Scaffold

The `server/` folder contains an Express API scaffold with MongoDB/Mongoose product/order models, a Stripe checkout-session endpoint, and a safe fallback catalog when MongoDB is not configured.

```bash
cd server
npm install
npm run dev
```

Copy `.env.example` and fill in MongoDB Atlas, Stripe, and client URL values. Use `POST /api/products/seed` after MongoDB is connected to seed the first MG69 catalog.

## Data Models

- `Products`: name, price, sizes, colors, images, category, collection, stock, specs
- `Orders`: customer, email, address, items, total, Stripe session, status
- `Users`: name, email, auth provider id, wishlist

## Deploy

GitHub Pages should be configured to serve from `main` / `docs`.
