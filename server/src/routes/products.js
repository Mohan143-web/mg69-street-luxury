import express from "express";
import { requireAdmin } from "../auth.js";
import { fallbackProducts } from "../data/fallbackProducts.js";
import { productsRepo } from "../store.js";

const router = express.Router();

/** Coerce/normalize an incoming product payload before persisting. */
function normalizePayload(body = {}) {
  const payload = { ...body };
  if (payload.price !== undefined) payload.price = Number(payload.price) || 0;
  if (payload.stock !== undefined) payload.stock = Number(payload.stock) || 0;
  if (typeof payload.sizes === "string") {
    payload.sizes = payload.sizes.split(",").map((size) => size.trim()).filter(Boolean);
  }
  delete payload._id;
  return payload;
}

// Public: list catalog (supports ?category= & ?collection= filters).
router.get("/", async (request, response) => {
  const { category, collection } = request.query;
  const products = await productsRepo.list({ category, collection });
  response.json(products);
});

// Public: single product.
router.get("/:id", async (request, response) => {
  const product = await productsRepo.findById(request.params.id);
  if (!product) {
    response.status(404).json({ error: "Product not found." });
    return;
  }
  response.json(product);
});

// Admin: create a product.
router.post("/", requireAdmin, async (request, response) => {
  const payload = normalizePayload(request.body);
  if (!payload.name || payload.price === undefined) {
    response.status(400).json({ error: "Product name and price are required." });
    return;
  }
  if (!payload.category) payload.category = "Men";
  if (!payload.collection) payload.collection = "Drop 001";
  const product = await productsRepo.create(payload);
  response.status(201).json(product);
});

// Admin: update a product.
router.put("/:id", requireAdmin, async (request, response) => {
  const product = await productsRepo.update(request.params.id, normalizePayload(request.body));
  if (!product) {
    response.status(404).json({ error: "Product not found." });
    return;
  }
  response.json(product);
});

// Admin: delete a product.
router.delete("/:id", requireAdmin, async (request, response) => {
  const removed = await productsRepo.remove(request.params.id);
  if (!removed) {
    response.status(404).json({ error: "Product not found." });
    return;
  }
  response.status(204).end();
});

// Admin: (re)seed the catalog from the bundled MG69 fallback collection.
router.post("/seed", requireAdmin, async (_request, response) => {
  const existingCount = await productsRepo.count();
  if (existingCount > 0 && process.env.ALLOW_RESEED !== "true") {
    response.status(409).json({
      error: "Products already exist. Set ALLOW_RESEED=true to replace the catalog.",
      count: existingCount
    });
    return;
  }
  const seeded = await productsRepo.seed(fallbackProducts);
  response.status(201).json({ count: seeded.length });
});

export default router;
