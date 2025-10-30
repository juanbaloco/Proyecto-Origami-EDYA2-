// src/api.js
const join = (a, b) => {
  const baseClean = String(a).replace(/\/+$/, '');
  const pathClean = String(b).replace(/^\/+/, '');
  return `${baseClean}/${pathClean}`;
};
export const BASE = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000";
export const PRODUCTS_PATH = import.meta.env.VITE_PRODUCTS_PATH ?? "/api/productos";

export function setToken(t){ localStorage.setItem("auth_token", t); }
export function getToken(){ return localStorage.getItem("auth_token"); }
export function clearToken(){ localStorage.removeItem("auth_token"); }

function authHeader(){ const t=getToken(); return t?{Authorization:`Bearer ${t}`}:{}; }
async function safeJson(res){ try{return await res.json();}catch{return null;} }
const detail = (d)=> Array.isArray(d)? d[0]?.msg : (typeof d==='string'?d : d?.detail);
const err = (res, body, fallback)=> { throw new Error(detail(body)||`${fallback} ${res.status}`); };

// Auth
export async function apiLogin(email, password){
  const res = await fetch(join(BASE,"/api/auth/login"), {
    method:"POST", headers:{ "Content-Type":"application/x-www-form-urlencoded" },
    body: new URLSearchParams({ username: email, password })
  });
  const body = await safeJson(res); if(!res.ok) err(res, body, "POST login");
  setToken(body.access_token); return body;
}

export async function apiRegister({username,email,password}){
  const res = await fetch(join(BASE,"/api/auth/register"), {
    method:"POST", headers:{ "Content-Type":"application/json" },
    body: JSON.stringify({ username, email, password })
  });
  const body = await safeJson(res); if(!res.ok) err(res, body, "POST register");
  return body;
}

export async function apiMe(){
  const res = await fetch(join(BASE,"/api/auth/me"), { headers:{...authHeader()} });
  const body = await safeJson(res); if(!res.ok) err(res, body, "GET me");
  return body;
}

// Productos
export async function apiGetProducts({ q="", categoria="", offset=0, limit=12 } = {}){
  // No agregues barra final manualmente
  const url = new URL(join(BASE, PRODUCTS_PATH));
  if(q) url.searchParams.set("q", q);
  if(categoria) url.searchParams.set("categoria", categoria);
  url.searchParams.set("offset", offset);
  url.searchParams.set("limit", limit);
  
  const res = await fetch(url, { headers:{...authHeader()} });
  if(!res.ok) throw new Error(`GET productos ${res.status}`);
  return { data: await res.json(), total: Number(res.headers.get("X-Total-Count"))||0 };
}

export async function apiCreateProduct(payload){
  const res = await fetch(join(BASE, PRODUCTS_PATH), {
    method:"POST", headers:{ "Content-Type":"application/json", ...authHeader() },
    body: JSON.stringify({ ...payload, precio: Number(payload.precio), stock: Number(payload.stock ?? 0) }),
  });
  const body = await safeJson(res);
  if(!res.ok) err(res, body, "POST productos");
  return body;
}

// Pedidos
export async function apiCreateOrder({ contacto, items }){
  const res = await fetch(join(BASE,"/api/pedidos"), {
    method:"POST", headers:{ "Content-Type":"application/json", ...authHeader() },
    body: JSON.stringify({ contacto, items })
  });
  const body = await safeJson(res); if(!res.ok) err(res, body, "POST pedidos");
  return body;
}

export async function apiCreateCustomOrder({ contacto, descripcion, imagen_referencia }){
  const res = await fetch(join(BASE,"/api/pedidos/personalizado"), {
    method:"POST", headers:{ "Content-Type":"application/json", ...authHeader() },
    body: JSON.stringify({ contacto, descripcion, imagen_referencia })
  });
  const body = await safeJson(res); if(!res.ok) err(res, body, "POST personalizado");
  return body;
}

export async function apiMyOrders(){
  const res = await fetch(join(BASE,"/api/pedidos/mis-pedidos"), { headers:{...authHeader()} });
  const body = await safeJson(res); if(!res.ok) err(res, body, "GET mis-pedidos");
  return body;
}

export async function apiAllOrders(){
  const res = await fetch(join(BASE,"/api/pedidos"), { headers:{...authHeader()} });
  const body = await safeJson(res); if(!res.ok) err(res, body, "GET pedidos");
  return body;
}

export async function apiUpdateOrderStatus(id, estado){
  const res = await fetch(join(BASE, `/api/pedidos/${id}/estado`), {
    method:"PUT", headers:{ "Content-Type":"application/json", ...authHeader() },
    body: JSON.stringify({ estado })
  });
  const body = await safeJson(res); if(!res.ok) err(res, body, "PUT estado");
  return body;
}
