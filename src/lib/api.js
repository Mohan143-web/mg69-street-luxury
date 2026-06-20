const apiUrl = import.meta.env.VITE_API_URL?.replace(/\/$/, "");

export const hasApi = Boolean(apiUrl);

const TOKEN_KEY = "mg69-token";

export function getToken() {
  try {
    return window.localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token) {
  try {
    if (token) window.localStorage.setItem(TOKEN_KEY, token);
    else window.localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* ignore storage errors */
  }
}

async function apiRequest(path, options = {}) {
  if (!apiUrl) return null;

  const token = getToken();
  const response = await fetch(`${apiUrl}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers
    }
  });

  if (response.status === 204) return null;

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.error || `MG69 API request failed: ${response.status}`);
  }

  return data;
}

/* ----------------------------- Catalog ----------------------------- */

export function fetchProducts() {
  return apiRequest("/api/products");
}

export function createProduct(product) {
  return apiRequest("/api/products", { method: "POST", body: JSON.stringify(product) });
}

export function updateProduct(id, updates) {
  return apiRequest(`/api/products/${id}`, { method: "PUT", body: JSON.stringify(updates) });
}

export function deleteProduct(id) {
  return apiRequest(`/api/products/${id}`, { method: "DELETE" });
}

/* ----------------------------- Orders ------------------------------ */

export function fetchOrders() {
  return apiRequest("/api/orders");
}

/* ------------------------------ Auth ------------------------------- */

export function registerUser(payload) {
  return apiRequest("/api/auth/register", { method: "POST", body: JSON.stringify(payload) });
}

export function loginUser(payload) {
  return apiRequest("/api/auth/login", { method: "POST", body: JSON.stringify(payload) });
}

export function fetchMe() {
  return apiRequest("/api/auth/me");
}

export function syncWishlist(wishlist) {
  return apiRequest("/api/auth/me/wishlist", { method: "PUT", body: JSON.stringify({ wishlist }) });
}
