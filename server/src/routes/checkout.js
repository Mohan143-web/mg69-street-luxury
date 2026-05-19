import express from "express";
import mongoose from "mongoose";
import Stripe from "stripe";
import { Order } from "../models/Order.js";

const router = express.Router();

function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) return null;
  return new Stripe(process.env.STRIPE_SECRET_KEY);
}

function getClientUrl() {
  return process.env.CLIENT_URL?.split(",")[0]?.trim() || "http://localhost:5173";
}

function toStripeImageUrl(image, clientUrl) {
  if (!image) return [];

  try {
    return [new URL(image, clientUrl).href];
  } catch {
    return [];
  }
}

router.post("/session", async (request, response) => {
  const stripe = getStripe();

  if (!stripe) {
    response.status(503).json({ error: "Stripe is not configured. Set STRIPE_SECRET_KEY." });
    return;
  }

  try {
    const { address, customerName, email, items = [] } = request.body;

    if (!items.length) {
      response.status(400).json({ error: "Cart is empty." });
      return;
    }

    const clientUrl = getClientUrl();
    const lineItems = items.map((item) => ({
      price_data: {
        currency: "usd",
        product_data: {
          name: item.name,
          description: `Size: ${item.size}${item.color ? ` | Color: ${item.color}` : ""}`,
          images: toStripeImageUrl(item.image, clientUrl),
          metadata: {
            productId: String(item.id || item.productId || "")
          }
        },
        unit_amount: Math.round(Number(item.price) * 100)
      },
      quantity: Number(item.quantity)
    }));

    const metadataItems = items.map((item) => ({
      id: item.id || item.productId,
      name: item.name,
      size: item.size,
      color: item.color,
      quantity: item.quantity,
      price: item.price
    }));

    const session = await stripe.checkout.sessions.create({
      billing_address_collection: "auto",
      customer_email: email || undefined,
      line_items: lineItems,
      metadata: {
        address: address || "",
        customerName: customerName || "",
        items: JSON.stringify(metadataItems)
      },
      mode: "payment",
      payment_method_types: ["card"],
      success_url: `${clientUrl}/#/order-confirmed?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${clientUrl}/#checkout`
    });

    response.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error("Stripe session error:", error);
    response.status(500).json({ error: error.message });
  }
});

router.get("/session/:id", async (request, response) => {
  const stripe = getStripe();

  if (!stripe) {
    response.status(503).json({ error: "Stripe is not configured. Set STRIPE_SECRET_KEY." });
    return;
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(request.params.id, {
      expand: ["customer", "line_items"]
    });

    response.json(session);
  } catch (error) {
    response.status(500).json({ error: error.message });
  }
});

router.post("/webhook", express.raw({ type: "application/json" }), async (request, response) => {
  const stripe = getStripe();

  if (!stripe) {
    response.status(503).json({ error: "Stripe is not configured. Set STRIPE_SECRET_KEY." });
    return;
  }

  const signature = request.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(request.body, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (error) {
    console.error("Webhook signature error:", error.message);
    response.status(400).send(`Webhook Error: ${error.message}`);
    return;
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

    try {
      const items = JSON.parse(session.metadata?.items || "[]");

      if (mongoose.connection.readyState === 1) {
        await Order.create({
          address: session.metadata?.address || session.customer_details?.address || "",
          customerName: session.metadata?.customerName || session.customer_details?.name || "Guest",
          email: session.customer_details?.email || "",
          items,
          status: "paid",
          stripeSessionId: session.id,
          total: (session.amount_total || 0) / 100
        });
      }
    } catch (error) {
      console.error("Order save error:", error);
    }
  }

  response.json({ received: true });
});

export default router;
