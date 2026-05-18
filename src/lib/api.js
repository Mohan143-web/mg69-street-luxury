const apiUrl = import.meta.env.VITE_API_URL?.replace(/\/$/, "");

export const hasApi = Boolean(apiUrl);

async function apiRequest(path, options = {}) {
  if (!apiUrl) return null;

  const response = await fetch(`${apiUrl}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers
    },
    ...options
  });

  if (!response.ok) {
    throw new Error(`MG69 API request failed: ${response.status}`);
  }

  return response.json();
}

export function fetchProducts() {
  return apiRequest("/api/products");
}

export function saveOrder(order) {
  return apiRequest("/api/orders", {
    body: JSON.stringify(order),
    method: "POST"
  });
}

export function createCheckoutSession(payload) {
  return apiRequest("/api/checkout/session", {
    body: JSON.stringify(payload),
    method: "POST"
  });
}
