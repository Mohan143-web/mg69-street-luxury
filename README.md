# MG69 Street Luxury Ecommerce

React + Vite ecommerce storefront for MG69, built around a luxury minimal streetwear direction.

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

The `server/` folder contains an Express API scaffold with MongoDB/Mongoose models and a Stripe checkout-session endpoint.

```bash
cd server
npm install
npm run dev
```

Copy `.env.example` and fill in MongoDB Atlas, Stripe, and client URL values.

## Data Models

- `Products`: name, price, sizes, colors, category, collection, stock
- `Orders`: customer, email, address, items, total, Stripe session, status
- `Users`: name, email, auth provider id, wishlist

## Deploy

GitHub Pages should be configured to serve from `main` / `docs`.
