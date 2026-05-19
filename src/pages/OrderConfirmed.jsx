import { useEffect, useState } from "react";
import { fetchOrderSession } from "../api/checkout.js";

function parseItems(order) {
  try {
    return JSON.parse(order?.metadata?.items || "[]");
  } catch {
    return [];
  }
}

export default function OrderConfirmed({ onClearCart }) {
  const [error, setError] = useState("");
  const [order, setOrder] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.hash.split("?")[1] || "");
    const sessionId = params.get("session_id");

    if (!sessionId) {
      setError("No Stripe session was found for this order.");
      return;
    }

    fetchOrderSession(sessionId)
      .then((session) => {
        setOrder(session);
        window.localStorage.removeItem("mg69-cart");
        onClearCart?.();
      })
      .catch(() => setError("Could not load order details."));
  }, [onClearCart]);

  if (error) {
    return (
      <section className="order-confirmed">
        <p className="eyebrow">Checkout</p>
        <h1>Order lookup failed</h1>
        <p className="order-subhead">{error}</p>
        <a className="continue-btn" href="#shop">Return to shop</a>
      </section>
    );
  }

  if (!order) {
    return (
      <section className="order-confirmed">
        <div className="order-skeleton" aria-hidden="true" />
        <p className="order-subhead">Loading order confirmation.</p>
      </section>
    );
  }

  const items = parseItems(order);
  const total = ((order.amount_total || 0) / 100).toFixed(2);

  return (
    <section className="order-confirmed">
      <div className="confirmed-icon">OK</div>
      <p className="eyebrow">Stripe checkout</p>
      <h1>Order confirmed</h1>
      <p className="order-subhead">
        Thank you{order.customer_details?.name ? `, ${order.customer_details.name}` : ""}. A receipt has been sent to{" "}
        {order.customer_details?.email || "your email"}.
      </p>

      <div className="order-items">
        {items.map((item, index) => (
          <div className="order-item-row" key={`${item.id || item.name}-${index}`}>
            <span className="order-item-name">{item.name}</span>
            <span className="order-item-meta">{item.size} / Qty {item.quantity}</span>
            <span className="order-item-price">${(item.price * item.quantity).toFixed(2)}</span>
          </div>
        ))}
      </div>

      <div className="order-total">
        <span>Total</span>
        <strong>${total}</strong>
      </div>

      <a className="continue-btn" href="#shop">Continue shopping</a>
    </section>
  );
}
