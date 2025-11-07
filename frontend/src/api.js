// ============================================
// CONFIGURATION
// ============================================
const API_BASE_URL = "http://localhost:8000/api";
const API_URL = "http://localhost:8000";

// ============================================
// TOKEN MANAGEMENT
// ============================================
export function getToken() {
  return localStorage.getItem("token");
}

export function setToken(token) {
  localStorage.setItem("token", token);
}

export function clearToken() {
  localStorage.removeItem("token");
}

function getHeaders(includeContentType = true) {
  const token = getToken();
  const headers = {};
  
  if (includeContentType) {
    headers["Content-Type"] = "application/json";
  }
  
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  
  return headers;
}

// ============================================
// ERROR HANDLING
// ============================================
const extractErrorMessage = (data) => {
  if (Array.isArray(data)) {
    return data.map(e => `${e.loc?.join('→') || 'campo'}: ${e.msg}`).join(', ');
  }
  if (data?.detail) {
    if (typeof data.detail === 'string') return data.detail;
    if (Array.isArray(data.detail)) {
      return data.detail.map(e => `${e.loc?.join('→') || 'campo'}: ${e.msg}`).join(', ');
    }
  }
  if (typeof data === 'string') return data;
  return JSON.stringify(data);
};

// ============================================
// AUTHENTICATION
// ============================================
export async function apiLogin(username, password) {
  const formData = new URLSearchParams();
  formData.append("username", username);
  formData.append("password", password);

  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: formData,
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(extractErrorMessage(error) || "Login failed");
  }

  const data = await res.json();
  setToken(data.access_token);
  return data;
}

export async function apiRegister(data) {
  const res = await fetch(`${API_BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(extractErrorMessage(error) || "Registration failed");
  }

  return res.json();
}

export async function apiMe() {
  const res = await fetch(`${API_BASE_URL}/auth/me`, {
    headers: getHeaders(),
  });

  if (!res.ok) {
    throw new Error("Failed to fetch user data");
  }

  return res.json();
}

// ============================================
// PRODUCTS
// ============================================
export async function apiGetProducts() {
  const res = await fetch(`${API_BASE_URL}/productos`, {
    headers: getHeaders(),
  });

  if (!res.ok) {
    throw new Error("Failed to fetch products");
  }

  return res.json();
}

export async function apiCreateProduct(data) {
  const token = getToken();
  if (!token) throw new Error("No hay token");

  const headers = {
    Authorization: `Bearer ${token}`,
  };

  if (!(data instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  console.log("📦 Enviando producto:", data);

  const res = await fetch(`${API_BASE_URL}/productos`, {
    method: "POST",
    headers,
    body: data instanceof FormData ? data : JSON.stringify(data),
  });

  if (res.status === 401) {
    clearToken();
    throw new Error("Sesión expirada");
  }

  if (!res.ok) {
    const error = await res.json();
    console.error("❌ Error del servidor:", error);
    throw new Error(extractErrorMessage(error) || "Failed to create product");
  }

  const result = await res.json();
  console.log("✅ Producto creado exitosamente:", result);
  return result;
}

export async function apiUpdateProduct(productId, productData) {
  const res = await fetch(`${API_BASE_URL}/productos/${productId}`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify(productData),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(extractErrorMessage(error) || "Failed to update product");
  }

  return res.json();
}

export async function apiDeleteProduct(productId) {
  const res = await fetch(`${API_BASE_URL}/productos/${productId}`, {
    method: "DELETE",
    headers: getHeaders(),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(extractErrorMessage(error) || "Failed to delete product");
  }

  return res.ok;
}

// ============================================
// ORDERS (GUEST USER)
// ============================================
export async function apiCreateGuestOrder(orderData) {
  const res = await fetch(`${API_BASE_URL}/pedidos/guest`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(orderData),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(extractErrorMessage(error) || "Error al crear pedido de invitado");
  }

  return res.json();
}

// ============================================
// ORDERS (AUTHENTICATED USER)
// ============================================
export async function apiCreateOrder(orderData) {
  const res = await fetch(`${API_BASE_URL}/pedidos/`, {  // ✅ Con barra al final
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(orderData),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(extractErrorMessage(error) || "Failed to create order");
  }

  return res.json();
}

export async function apiAllOrders() {
  const res = await fetch(`${API_BASE_URL}/pedidos/`, {
    headers: getHeaders(),
  });

  if (!res.ok) {
    throw new Error("Failed to fetch orders");
  }

  return res.json();
}

export async function apiMyOrders() {
  const res = await fetch(`${API_BASE_URL}/pedidos/mis-pedidos`, {
    headers: getHeaders(),
  });

  if (!res.ok) {
    throw new Error("Failed to fetch my orders");
  }

  return res.json();
}

// ✅ CORRECTED: Using API_BASE_URL instead of API_URL
export const apiUpdateOrderStatus = async (pedidoId, nuevoEstado) => {
  const response = await fetch(`${API_BASE_URL}/pedidos/${pedidoId}/estado`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    body: JSON.stringify({ estado: nuevoEstado }),
  });

  if (response.status === 401) throw new Error("Sesión expirada");
  if (!response.ok) throw new Error(await response.text());
  return await response.json();
};

// ============================================
// CUSTOM ORDERS
// ============================================
export async function apiCustomOrder(customOrderData) {
  const res = await fetch(`${API_BASE_URL}/pedidos/personalizado`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(customOrderData),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(extractErrorMessage(error) || "Failed to create custom order");
  }

  return res.json();
}

// ============================================
// LOYALTY
// ============================================
export async function apiGetLoyalty() {
  const res = await fetch(`${API_BASE_URL}/fidelizacion/mi-puntos`, {
    headers: getHeaders(),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(extractErrorMessage(error) || "Failed to fetch loyalty points");
  }

  return res.json();
}

// ============================================
// CATEGORIES
// ============================================
export async function apiGetCategories() {
  const res = await fetch(`${API_BASE_URL}/categorias`, {
    headers: getHeaders(),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(extractErrorMessage(error) || "Failed to fetch categories");
  }

  return res.json();
}

// ============================================
// ADMIN ORDERS
// ============================================
export const apiGetPedidosNormales = () => {
  const token = localStorage.getItem("token");
  return fetch(`${API_BASE_URL}/pedidos/normales`, {  // ✅ Usando API_BASE_URL
    headers: { Authorization: `Bearer ${token}` },
  }).then((r) => r.json());
};

export const apiGetPedidosPersonalizados = () => {
  const token = localStorage.getItem("token");
  return fetch(`${API_BASE_URL}/pedidos/personalizados`, {  // ✅ Usando API_BASE_URL
    headers: { Authorization: `Bearer ${token}` },
  }).then((r) => r.json());
};

export async function apiUpdatePedidoPersonalizado(pedidoId, data) {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API_BASE_URL}/pedidos/${pedidoId}/personalizado`, {  // ✅ Usando API_BASE_URL
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Error actualizando pedido personalizado");
  return await res.json();
}

// ============================================
// ALIASES
// ============================================
export { apiMyOrders as apiGetMyOrders };
export { apiCustomOrder as apiCreateCustomOrder };
