import cors from "cors";
import "dotenv/config";
import express from "express";
import Stripe from "stripe";
import { fallbackProducts } from "./data/fallbackProducts.js";
import { connectDatabase } from "./db.js";
import { Order } from "./models/Order.js";
import { Product } from "./models/Product.js";

const app = express();
const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;
const hasDatabase = Boolean(process.env.MONGODB_URI);

app.use(cors({ origin: process.env.CLIENT_URL || "*" }));
app.use(express.json());

app.get("/api/health", (_request, response) => {
  response.json({ ok: true, service: "mg69-api" });
});

app.get("/api/products", async (request, response) => {
  const { category, collection } = request.query;
  const filter = { active: true };

  if (category && category !== "All") filter.category = category;
  if (collection && collection !== "All") filter.collection = collection;

  if (!hasDatabase) {
    const products = fallbackProducts.filter((product) => {
      const categoryMatch = !filter.category || product.category === filter.category;
      const collectionMatch = !filter.collection || product.collection === filter.collection;
      return product.active && categoryMatch && collectionMatch;
    });
    response.json(products);
    return;
  }

  const products = await Product.find(filter).sort({ createdAt: -1 });
  response.json(products);
});

app.post("/api/orders", async (request, response) => {
  if (!hasDatabase) {
    response.status(202).json({
      ...request.body,
      id: `local-${Date.now()}`,
      status: "pending-payment"
    });
    return;
  }

  const order = await Order.create({
    ...request.body,
    status: "pending-payment"
  });

  response.status(201).json(order);
});

app.post("/api/checkout/session", async (request, response) => {
  if (!stripe) {
    response.status(503).json({ error: "Stripe is not configured. Set STRIPE_SECRET_KEY." });
    return;
  }

  const { items = [], customerEmail } = request.body;
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: customerEmail,
    success_url: `${process.env.CLIENT_URL}/#checkout-success`,
    cancel_url: `${process.env.CLIENT_URL}/#checkout`,
    line_items: items.map((item) => ({
      quantity: item.quantity,
      price_data: {
        currency: "usd",
        product_data: { name: `${item.name} / ${item.size} / ${item.color}` },
        unit_amount: Math.round(item.price * 100)
      }
    }))
  });

  response.json({ url: session.url, id: session.id });
});

app.post("/api/products/seed", async (_request, response) => {
  if (!hasDatabase) {
    response.status(503).json({ error: "MongoDB is not configured. Set MONGODB_URI before seeding products." });
    return;
  }

  await Product.deleteMany({});
  const products = await Product.insertMany(fallbackProducts);
  response.status(201).json({ count: products.length });
});

const port = process.env.PORT || 8080;

connectDatabase()
  .then(() => {
    app.listen(port, () => {
      console.log(`MG69 API listening on http://localhost:${port}`);
    });
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
