export const BASE = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000";
export const PRODUCTS_PATH = import.meta.env.VITE_PRODUCTS_PATH ?? "/api/productos";

export async function apiGetProducts({ q = "" } = {}) {
const url = new URL(BASE + PRODUCTS_PATH);
if (q) url.searchParams.set("q", q);
const res = await fetch(url, {
headers: { ...authHeader() }
});
if (!res.ok) throw new Error(`GET productos ${res.status}`);
const data = await res.json();
const total = res.headers.get("X-Total-Count");
return { data, total: total ? Number(total) : data.length };
}

export async function apiCreateProduct(payload) {
const res = await fetch(BASE + PRODUCTS_PATH, {
method: "POST",
headers: { "Content-Type": "application/json", ...authHeader() },
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

// --- Auth ---
const TOKEN_KEY = "auth_token";

export function getToken() { return localStorage.getItem(TOKEN_KEY); }
export function setToken(token) { token ? localStorage.setItem(TOKEN_KEY, token) : clearToken(); }
export function clearToken() { localStorage.removeItem(TOKEN_KEY); }
export const saveToken = setToken;

export function authHeader() {
const t = getToken();
return t ? { Authorization: "Bearer " + t } : {};
}

export async function apiLogin(email, password) {
const url = new URL((import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000") + "/api/auth/login");
const body = new URLSearchParams();
body.append("username", email);
body.append("password", password);
const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body });
const data = await res.json().catch(() => null);
if (!res.ok) throw new Error(data?.detail ? String(data.detail) : "Login " + res.status);
const token = data?.access_token;
if (!token) throw new Error("Respuesta de login sin token");
setToken(token);
return data;
}

export async function apiRegister({ username, email, password }) {
const base = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000";
const res = await fetch(base + "/api/auth/register", {
method: "POST",
headers: { "Content-Type": "application/json" },
body: JSON.stringify({ username, email, password })
});
const data = await res.json().catch(() => null);
if (!res.ok) throw new Error(data?.detail ? String(data.detail) : "Registro " + res.status);
return data;
}

export async function apiMe() {
const base = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000";
const res = await fetch(base + "/api/auth/me", { headers: { ...authHeader() } });
const data = await res.json().catch(() => null);
if (!res.ok) throw new Error(data?.detail ? String(data.detail) : "Me " + res.status);
return data; // { id, username, email, is_admin }
}