import express from "express";
import { requireAdmin } from "../auth.js";
import { ordersRepo } from "../store.js";

const router = express.Router();

// Admin: list all orders (most recent first).
router.get("/", requireAdmin, async (_request, response) => {
  const orders = await ordersRepo.list();
  response.json(orders);
});

// Admin: single order.
router.get("/:id", requireAdmin, async (request, response) => {
  const order = await ordersRepo.findById(request.params.id);
  if (!order) {
    response.status(404).json({ error: "Order not found." });
    return;
  }
  response.json(order);
});

// Note: orders are created server-side by the Stripe checkout flow
// (POST /api/checkout/session persists the order; the webhook marks it paid),
// so there is intentionally no public order-creation endpoint.

export default router;
