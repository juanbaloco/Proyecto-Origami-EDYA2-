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
  const token = getToken();
  if (!token) throw new Error("No hay token");
  
  const headers = {
    Authorization: `Bearer ${token}`,
  };
  
  // No agregar Content-Type si es FormData
  // El navegador lo agregará automáticamente con el boundary correcto
  if (!(productData instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }
  
  console.log("📦 Actualizando producto:", productId);
  
  const res = await fetch(`${API_BASE_URL}/productos/${productId}`, {
    method: "PUT",
    headers,
    body: productData instanceof FormData ? productData : JSON.stringify(productData),
  });
  
  if (res.status === 401) {
    clearToken();
    throw new Error("Sesión expirada");
  }
  
  if (!res.ok) {
    const error = await res.json();
    console.error("❌ Error del servidor:", error);
    throw new Error(extractErrorMessage(error) || "Failed to update product");
  }
  
  const result = await res.json();
  console.log("✅ Producto actualizado exitosamente:", result);
  return result;
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

export const apiUpdateOrderStatus = async (pedidoId, nuevoEstado, comentario_cancelacion) => {
  const body = { estado: nuevoEstado };
  // Solo incluye el comentario si se provee
  if (comentario_cancelacion) body.comentario_cancelacion = comentario_cancelacion;

  const response = await fetch(`${API_BASE_URL}/pedidos/${pedidoId}/estado`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    body: JSON.stringify(body),
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
// FIDELIZADOS (ADMIN + CLIENT)
// ============================================
export async function apiGetFidelizados() {
  const token = getToken();
  const res = await fetch(`${API_BASE_URL}/fidelizacion`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(extractErrorMessage(error) || "Failed to fetch fidelizados");
  }
  return res.json();
}

export async function apiAcceptFidelizado(correo) {
  const token = getToken();
  const res = await fetch(`${API_BASE_URL}/fidelizacion/${encodeURIComponent(correo)}/accept`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(extractErrorMessage(error) || 'Failed to accept fidelizado');
  }
  return res.json();
}

export async function apiPayFidelizacion(correo) {
  // Detectar entorno de desarrollo: hostname localhost/127.0.0.1 o NODE_ENV != 'production'
  const isDev = (typeof window !== 'undefined' && window.location && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'))
    || (typeof process !== 'undefined' && process.env && process.env.NODE_ENV !== 'production');

  try {
    const res = await fetch(`${API_BASE_URL}/fidelizacion/${encodeURIComponent(correo)}/pagar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });

    if (res.status === 404) {
      // Endpoint no existe: simular sólo en desarrollo
      const msg = `apiPayFidelizacion: endpoint not found (404) for ${correo}`;
      if (isDev) {
        console.warn(msg + ', returning simulated success (dev mode).');
        return { simulated: true };
      }
      const error = await res.json().catch(() => ({ message: 'Not Found' }));
      throw new Error(extractErrorMessage(error) || 'Not Found');
    }

    if (!res.ok) {
      const error = await res.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(extractErrorMessage(error) || 'Failed to process fidelizacion payment');
    }

    return res.json();
  } catch (err) {
    // Si fallo de red o CORS: en dev permitimos simulación, en producción relanzar el error
    if (isDev) {
      console.warn('apiPayFidelizacion: request failed, returning simulated success (dev). Error:', err);
      return { simulated: true };
    }
    throw err;
  }
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
