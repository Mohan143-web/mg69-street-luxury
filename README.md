# MG69 Street Luxury Ecommerce

React + Vite ecommerce storefront for MG69, built around a luxury minimal streetwear direction.

![React](https://img.shields.io/badge/React-18-61DAFB?style=flat&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=flat&logo=vite&logoColor=white)
![Stripe](https://img.shields.io/badge/Stripe-Checkout-635BFF?style=flat&logo=stripe&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat&logo=mongodb&logoColor=white)
![GitHub Pages](https://img.shields.io/badge/Deployed-GitHub_Pages-222?style=flat&logo=github&logoColor=white)

Live demo: [MG69 Street Luxury](https://mohan143-web.github.io/mg69-street-luxury/)

![MG69 Street Luxury preview](./public/og-preview.png)

## Current Upgrade

- Original generated front/back product imagery for tee, hoodie, jersey, and coat
- Product gallery thumbnails for front/back shots
- Men, Women, and Drop 001 hash collection routes
- Customer/Admin mode dashboards with visible storefront and command data
- Client-side product search across name, tags, category, and collection
- Size, color, quantity, per-size stock messaging, and sold-out size states
- Persistent cart and wishlist via `localStorage`
- Stripe Checkout session flow with order confirmation route
- GitHub Pages 404 fallback, favicon, manifest, and Open Graph preview metadata
- Optional API product hydration through `VITE_API_URL`

## Frontend

```bash
npm install
npm run dev
```

Create `.env` from `.env.example` when running the API locally:

```bash
VITE_API_URL=http://localhost:8080
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

Copy `server/.env.example` to `server/.env` and fill in MongoDB Atlas, Stripe, and client URL values.

| Variable | Example | Purpose |
| --- | --- | --- |
| `PORT` | `8080` | Local API port |
| `NODE_ENV` | `development` | Disables seed endpoint in production |
| `CLIENT_URL` | `http://localhost:5173/mg69-street-luxury,https://mohan143-web.github.io/mg69-street-luxury` | Frontend redirect URLs; first value is used for Stripe success/cancel redirects |
| `MONGODB_URI` | `mongodb+srv://USER:PASSWORD@cluster.mongodb.net/mg69` | MongoDB Atlas connection |
| `STRIPE_SECRET_KEY` | `sk_test_...` | Stripe Checkout test secret |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` | Stripe CLI/webhook signing secret |
| `ALLOW_RESEED` | `false` | Set `true` locally to replace seeded products |

Use `POST /api/products/seed` after MongoDB is connected to seed the first MG69 catalog. The seed endpoint is blocked in production and refuses to overwrite an existing catalog unless `ALLOW_RESEED=true`.

## Stripe Test Checkout

1. Start the frontend with `npm run dev`.
2. Start the API with `cd server && npm run dev`.
3. In another terminal, run `stripe listen --forward-to localhost:8080/api/checkout/webhook`.
4. Copy the printed webhook secret into `server/.env` as `STRIPE_WEBHOOK_SECRET`.
5. Add a product to the bag and check out with Stripe test card `4242 4242 4242 4242`, any future expiry, and any CVC.

Successful checkout redirects to `#/order-confirmed?session_id=...`, fetches the Stripe session, clears the local cart, and shows the order summary. `CLIENT_URL` values may include the GitHub Pages path; the API normalizes them to origins for CORS.

## Data Models

- `Products`: name, price, sizes, colors, images, category, collection, stock, specs
- `Orders`: customer, email, address, items, total, Stripe session, status
- `Users`: name, email, auth provider id, wishlist

## Deploy

GitHub Pages should be configured to serve from `main` / `docs`.

The app uses hash routes for internal navigation and ships `public/404.html` as a Pages fallback for direct refreshes.
