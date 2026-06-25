import cors from "cors";
import "dotenv/config";
import express from "express";
import { attachUser, ensureAdminUser } from "./auth.js";
import { connectDatabase } from "./db.js";
import { dbConnected, ensureProductsSeeded } from "./store.js";
import authRouter from "./routes/auth.js";
import checkoutRouter from "./routes/checkout.js";
import ordersRouter from "./routes/orders.js";
import productsRouter from "./routes/products.js";
import subscribeRouter from "./routes/subscribe.js";

const app = express();

function normalizeOrigin(value) {
  try {
    return new URL(value).origin;
  } catch {
    return value;
  }
}

const allowedOrigins = (process.env.CLIENT_URL || "https://mohan143-web.github.io/mg69-street-luxury,http://localhost:5173,http://127.0.0.1:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean)
  .map(normalizeOrigin);

const isDevEnv = process.env.NODE_ENV !== "production";

function isAllowedOrigin(origin) {
  if (!origin) return true;
  if (allowedOrigins.includes(origin)) return true;
  // In development, allow any localhost / 127.0.0.1 origin regardless of port.
  if (isDevEnv && /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) return true;
  return false;
}

app.use(
  cors({
    // Return false (not an error) for disallowed origins so preflights don't 500.
    origin(origin, callback) {
      callback(null, isAllowedOrigin(origin));
    }
  })
);

// Stripe webhook needs the raw body for signature verification — register before express.json().
app.use("/api/checkout/webhook", express.raw({ type: "application/json" }));
app.use(express.json());
app.use(attachUser);

app.get("/api/health", (_request, response) => {
  response.json({ ok: true, service: "mg69-api", database: dbConnected() ? "mongodb" : "in-memory" });
});

app.use("/api/auth", authRouter);
app.use("/api/products", productsRouter);
app.use("/api/orders", ordersRouter);
app.use("/api/checkout", checkoutRouter);
app.use("/api/subscribe", subscribeRouter);

// Centralized error handler so thrown errors return JSON, not stack traces.
app.use((error, _request, response, _next) => {
  console.error("Unhandled API error:", error);
  response.status(500).json({ error: "Internal server error." });
});

const port = process.env.PORT || 8080;

connectDatabase()
  .then(async () => {
    await ensureAdminUser();
    await ensureProductsSeeded();
    app.listen(port, () => {
      console.log(`MG69 API listening on http://localhost:${port} (${dbConnected() ? "MongoDB" : "in-memory"} store)`);
    });
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
