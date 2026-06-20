// Empty when no API is configured. These functions are only invoked once an API
// is wired (the storefront guards on it), so the production bundle ships no
// hardcoded localhost fallback.
const API = import.meta.env.VITE_API_URL?.replace(/\/$/, "") || "";

export async function createCheckoutSession(cartItems, email, customer = {}) {
  const items = cartItems.map((item) => ({
    color: item.color || null,
    id: item.productId || item.id,
    image: item.image || null,
    name: item.name,
    price: item.price,
    quantity: item.quantity,
    size: item.size
  }));

  const response = await fetch(`${API}/api/checkout/session`, {
    body: JSON.stringify({
      address: customer.address,
      customerName: customer.customerName,
      email,
      items
    }),
    headers: { "Content-Type": "application/json" },
    method: "POST"
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || "Checkout failed.");
  }

  return response.json();
}

export async function fetchOrderSession(sessionId) {
  const response = await fetch(`${API}/api/checkout/session/${sessionId}`);

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || "Could not fetch order.");
  }

  return response.json();
}
