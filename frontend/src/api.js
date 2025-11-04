// ============================================
// CONFIGURATION
// ============================================

const API_BASE_URL = "http://localhost:8000/api";

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

// ✅ FUNCIÓN MEJORADA para extraer mensajes de error de FastAPI
const extractErrorMessage = (data) => {
  // FastAPI 422 validation errors (array de errores)
  if (Array.isArray(data)) {
    return data.map(e => `${e.loc?.join('→') || 'campo'}: ${e.msg}`).join(', ');
  }
  
  // FastAPI detail property
  if (data?.detail) {
    if (typeof data.detail === 'string') return data.detail;
    if (Array.isArray(data.detail)) {
      return data.detail.map(e => `${e.loc?.join('→') || 'campo'}: ${e.msg}`).join(', ');
    }
  }
  
  // String directo
  if (typeof data === 'string') return data;
  
  // Fallback
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

  // ✅ NO agregues Content-Type si es FormData (el navegador lo hace automático)
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

// ✅ NUEVO: Crear pedido como invitado (sin autenticación)
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
// ORDERS
// ============================================

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

export async function apiUpdateOrderStatus(orderId, status) {
  const res = await fetch(`${API_BASE_URL}/pedidos/${orderId}/estado`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify({ estado: status }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(extractErrorMessage(error) || "Failed to update order status");
  }

  return res.json();
}

export async function apiCreateOrder(orderData) {
  const res = await fetch(`${API_BASE_URL}/pedidos`, {
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
// ALIASES FOR COMPATIBILITY
// ============================================

export { apiMyOrders as apiGetMyOrders };
export { apiCustomOrder as apiCreateCustomOrder };
