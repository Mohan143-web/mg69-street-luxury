# MG69 Street Luxury

> Luxury minimal streetwear ecommerce — drop-based shopping, variant-aware cart,
> Stripe checkout, and MongoDB order persistence.

**[Live Demo →](https://mohan143-web.github.io/mg69-street-luxury/)**

![React](https://img.shields.io/badge/React-18-61DAFB?style=flat&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=flat&logo=vite&logoColor=white)
![Stripe](https://img.shields.io/badge/Stripe-Checkout-635BFF?style=flat&logo=stripe&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat&logo=mongodb)
![GitHub Pages](https://img.shields.io/badge/Deployed-GitHub_Pages-222?style=flat&logo=github)

[![MG69 Preview](public/og-preview.png)](https://mohan143-web.github.io/mg69-street-luxury/)

## Current Upgrade

- **JWT authentication** — customer register/login and an admin role, with a seeded first admin
- **Real admin dashboard** — create / edit / delete products and adjust per-size stock, persisted through the API
- **Live orders** — checkout creates a server order that the Stripe webhook flips to `paid`; admins see the real orders list
- **Admin gating** — admin mode is gated behind an authenticated admin account once an API is wired (open in the no-backend demo)
- **Zero-setup backend** — the API runs on an in-memory store with no database, and switches to MongoDB automatically when `MONGODB_URI` is set
- Men's and Women's collection landings, product galleries with zoom + lightbox + swipe
- Client-side product search across name, tags, category, and collection
- Size, color, quantity, per-size stock messaging, and sold-out size states
- Persistent cart and wishlist via `localStorage` (wishlist syncs to the account on login)
- Stripe Checkout session flow with order confirmation route
- GitHub Pages 404 fallback, favicon, manifest, `robots.txt`, `sitemap.xml`, and Open Graph metadata
- Optional API hydration through `VITE_API_URL`

## Frontend

```bash
npm install
npm run dev
```

For local API hydration, create `.env.local` (already git-ignored):

```bash
VITE_API_URL=http://localhost:8080
```

The frontend works **without** an API (local fallback catalog). When `VITE_API_URL` is set it hydrates the catalog from the API and enables auth, the real admin, and live orders.

Build output is written to `docs/` so GitHub Pages can serve the app from the `main` branch. To point the production build at a hosted API, set `VITE_API_URL` at build time:

```bash
npm run build
# or, wired to your deployed API:
VITE_API_URL=https://your-mg69-api.onrender.com npm run build
```

## Backend API

The `server/` folder is an Express API with a data layer that runs **in-memory by default** (zero setup) and switches to **MongoDB** automatically when `MONGODB_URI` is set. It provides JWT auth, product CRUD, an orders store, and Stripe checkout.

```bash
cd server
npm install
npm run dev
```

Copy `server/.env.example` to `server/.env`. Every value is optional for local development.

| Variable | Example | Purpose |
| --- | --- | --- |
| `PORT` | `8080` | Local API port |
| `NODE_ENV` | `development` | Production hardening flags |
| `CLIENT_URL` | `http://localhost:5173,https://mohan143-web.github.io/mg69-street-luxury` | Allowed CORS origins; first value drives Stripe redirects. Any localhost origin is allowed in development. |
| `MONGODB_URI` | `mongodb+srv://USER:PASSWORD@cluster.mongodb.net/mg69` | MongoDB Atlas connection (omit to use the in-memory store) |
| `JWT_SECRET` | `long-random-string` | Signs auth tokens — **change in production** |
| `JWT_EXPIRES_IN` | `7d` | Token lifetime |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | `admin@mg69.com` / `mg69admin` | First admin account, seeded on startup |
| `STRIPE_SECRET_KEY` | `sk_test_...` | Stripe Checkout secret (omit to disable checkout) |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` | Stripe webhook signing secret |
| `ALLOW_RESEED` | `false` | Set `true` to let `POST /api/products/seed` replace an existing catalog |

### API reference

| Method | Endpoint | Auth | Purpose |
| --- | --- | --- | --- |
| `POST` | `/api/auth/register` | — | Create a customer account, returns a JWT |
| `POST` | `/api/auth/login` | — | Log in, returns a JWT |
| `GET` | `/api/auth/me` | user | Current user from token |
| `PUT` | `/api/auth/me/wishlist` | user | Persist the account wishlist |
| `GET` | `/api/products` | — | List catalog (`?category=`, `?collection=`) |
| `POST` / `PUT` / `DELETE` | `/api/products(/:id)` | **admin** | Create / update / delete a product |
| `POST` | `/api/products/seed` | **admin** | Seed the bundled MG69 catalog |
| `GET` | `/api/orders` | **admin** | List all orders |
| `POST` | `/api/checkout/session` | — | Create a Stripe Checkout session (persists the order) |
| `POST` | `/api/checkout/webhook` | Stripe sig | Marks the order `paid` |

## Auth & Admin

- On startup the API ensures an admin account exists (`ADMIN_EMAIL` / `ADMIN_PASSWORD`).
- Sign in from the storefront header. Logging in with the admin account unlocks the admin dashboard and redirects to it.
- With an API configured, admin mode is **gated** — non-admins see a sign-in prompt instead of the dashboard. Without an API (the static demo) admin mode stays open for exploration.
- Admin create / edit / delete / stock changes persist through the API and survive reload (with MongoDB) or until restart (in-memory).

## Stripe Test Checkout

1. Start the frontend with `npm run dev`.
2. Start the API with `cd server && npm run dev`.
3. In another terminal, run `stripe listen --forward-to localhost:8080/api/checkout/webhook`.
4. Copy the printed webhook secret into `server/.env` as `STRIPE_WEBHOOK_SECRET`.
5. Add a product to the bag and check out with Stripe test card `4242 4242 4242 4242`, any future expiry, and any CVC.

Successful checkout redirects to `#/order-confirmed?session_id=...`, fetches the Stripe session, clears the local cart, and shows the order summary. `CLIENT_URL` values may include the GitHub Pages path; the API normalizes them to origins for CORS.

## Data Models

- `Products`: id, name, price, sizes, colors, images, colorVariants, category, collection, stock, sizeStock, specs
- `Orders`: customer, email, address, items, total, Stripe session, status (`pending-payment` → `paid`)
- `Users`: name, email, **passwordHash**, **role** (`customer` / `admin`), wishlist

## Deploy

### Frontend (GitHub Pages)

Pages is configured to serve from `main` / `docs`. Build with your hosted API URL so the live site can reach it, then commit `docs/`:

```bash
VITE_API_URL=https://your-mg69-api.onrender.com npm run build
```

The app uses hash routes for internal navigation and ships `public/404.html` as a Pages fallback for direct refreshes.

### Backend (Render / Docker)

- **Render:** the included [`render.yaml`](render.yaml) is a Blueprint — create a new Blueprint from the repo, then set `MONGODB_URI`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, and `ADMIN_*` in the dashboard. `JWT_SECRET` is generated automatically.
- **Any container host:** build [`server/Dockerfile`](server/Dockerfile) and run it (Railway, Fly.io, Cloud Run, etc.).
- Point the frontend at the deployed URL via `VITE_API_URL` (above) and add your Pages origin to `CLIENT_URL` on the API.

> The free Render tier (and the in-memory store) reset on sleep. Set `MONGODB_URI` for durable products, orders, and accounts.
