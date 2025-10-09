const BASE = import.meta.env.VITE_API_URL ?? "http://localhost:8000";
const PRODUCTS_PATH = import.meta.env.VITE_PRODUCTS_PATH ?? "/api/productos";

export async function apiGetProducts({ q = "" } = {}) {
  const url = new URL(BASE + PRODUCTS_PATH);
  if (q) url.searchParams.set("q", q);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`GET productos ${res.status}`);
  const data = await res.json();
  const total = res.headers.get("X-Total-Count");
  return { data, total: total ? Number(total) : data.length };
}

export async function apiCreateProduct(payload) {
  const res = await fetch(BASE + PRODUCTS_PATH, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const body = await safeJson(res);
  if (!res.ok) throw new Error(formatDetail(body?.detail) || `POST productos ${res.status}`);
  return body;
}

async function safeJson(res) { try { return await res.json(); } catch { return null; } }
function formatDetail(detail) {
  if (!detail) return "";
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) return detail.map(d => d?.msg || JSON.stringify(d)).join(" | ");
  return JSON.stringify(detail);
}
// ... (código existente de api.js)

// --- Funciones de autenticación ---

const TOKEN_KEY = "auth_token";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    clearToken();
  }
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

// Ahora, tu archivo ProtectedRoute.jsx podrá importar y usar getToken
// ...