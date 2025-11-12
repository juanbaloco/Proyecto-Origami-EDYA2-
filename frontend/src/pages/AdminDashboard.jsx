import { useEffect, useState } from "react";
import {
  apiAllOrders,
  apiUpdateOrderStatus,
  apiGetProducts,
  apiCreateProduct,
  apiGetPedidosNormales,
  apiGetPedidosPersonalizados,
  apiUpdatePedidoPersonalizado,
  apiDeleteProduct,
  apiUpdateProduct
} from "../api";
import { useNavigate } from "react-router-dom";

export default function AdminDashboard() {
  const navigate = useNavigate();

  // Verificar autenticación
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
    }
  }, [navigate]);

  const [tab, setTab] = useState("productos");
  const [orders, setOrders] = useState([]);
  const [prods, setProds] = useState([]);
  const [showModal, setShowModal] = useState(false);
  
  // Estado del formulario con categoria usando slug
  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    categoria: "",
    precio: "",
    color: "",
    tamano: "",
    material: "",
    stock: "",
    activo: true,
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ✅ NUEVO: Estados para edición de pedidos personalizados
  const [editingOrder, setEditingOrder] = useState(null);
  const [editData, setEditData] = useState({
    nombre_personalizado: "",
    precio_personalizado: "",
    comentario_vendedor: "",
  });
  const [editingProduct, setEditingProduct] = useState(null);
  const [editFormData, setEditFormData] = useState({
    nombre: "",
    descripcion: "",
    categoria: "",
    precio: "",
    color: "",
    tamano: "",
    material: "",
    stock: "",
    activo: true,
  });
  const [editImageFile, setEditImageFile] = useState(null);
  const [editImagePreview, setEditImagePreview] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);
  
  // ✅ Función auxiliar para construir URLs de imagen
  const getImageUrl = (imagenUrl) => {
    if (!imagenUrl) return null;
    try {
      const s = String(imagenUrl);
      if (s.startsWith('http') || s.startsWith('data:')) return s;
      return `http://localhost:8000${s}`;
    } catch (e) {
      return null;
    }
  };

  // ✅ Cargar pedidos normales
  useEffect(() => {
    if (tab === "pedidos") {
      apiGetPedidosNormales()
        .then((d) => {
          console.log("Pedidos Normales recibidos:", d);
          setOrders(d);
        })
        .catch((e) => console.error(e));
    }
  }, [tab]);

  // ✅ Cargar pedidos personalizados
  useEffect(() => {
    if (tab === "personalizados") {
      apiGetPedidosPersonalizados()
        .then((d) => {
          console.log("Pedidos Personalizados recibidos:", d);
          setOrders(d);
        })
        .catch((e) => console.error(e));
    }
  }, [tab]);

  // ✅ Cargar lista de fidelizados (admin)
  const [fidelizados, setFidelizados] = useState([]);
  useEffect(() => {
    if (tab === 'fidelizados') {
      // lazy-load
      import('../api').then(({ apiGetFidelizados }) => {
        apiGetFidelizados().then(setFidelizados).catch((e) => console.error(e));
      });
    }
  }, [tab]);

  // Cargar productos si el tab es productos
  useEffect(() => {
    if (tab === "productos") {
      loadProducts();
    }
  }, [tab]);

  const loadProducts = async () => {
    try {
      const r = await apiGetProducts();
      setProds(r);
    } catch (err) {
      console.error("Error cargando productos:", err);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const fData = new FormData();
      fData.append("nombre", formData.nombre);
      fData.append("descripcion", formData.descripcion);
      fData.append("precio", formData.precio);
      fData.append("stock", formData.stock);
      fData.append("activo", formData.activo.toString());

      if (formData.categoria) {
        fData.append("categoria", formData.categoria);
      }
      if (formData.color) fData.append("color", formData.color);
      if (formData.tamano) fData.append("tamano", formData.tamano);
      if (formData.material) fData.append("material", formData.material);
      if (imageFile) fData.append("imagen", imageFile);

      await apiCreateProduct(fData);
      alert("Producto creado exitosamente");

      // Resetear formulario
      setFormData({
        nombre: "",
        descripcion: "",
        categoria: "",
        precio: "",
        color: "",
        tamano: "",
        material: "",
        stock: "",
        activo: true,
      });
      setImageFile(null);
      setImagePreview("");
      setShowModal(false);
      loadProducts();
    } catch (err) {
      console.error("Error creando producto:", err);
      setError(err.response?.data?.detail || "Error al crear el producto");
    } finally {
      setLoading(false);
    }
  };

  const changeStatus = (orderId, newStatus) => {
  if (newStatus === "cancelado") {
    const comentario = prompt("Escriba el motivo de la cancelación (obligatorio):");
    if (!comentario || comentario.trim().length < 3) {
      alert("Debes ingresar un motivo.");
      return;
    }
    apiUpdateOrderStatus(orderId, newStatus, comentario)
      .then(() => {
        setOrders(prev => prev.filter(o => o.pedido_id !== orderId));
        alert("Pedido cancelado y eliminado del panel.");
      })
      .catch((e) => {
        alert("Error cancelando el pedido");
        console.error(e);
      });
  } else {
    apiUpdateOrderStatus(orderId, newStatus)
      .then(() => {
        setOrders(prev => prev.map(o =>
          o.pedido_id === orderId ? { ...o, estado: newStatus } : o
        ));
        alert(`Pedido actualizado a: ${newStatus}`);
      })
      .catch((e) => {
        alert("Error actualizando el pedido");
        console.error(e);
      });
  }
};



 const deleteProduct = async (id) => {
  if (!confirm("¿Eliminar este producto?")) return;
  try {
    await apiDeleteProduct(id);  // ✅ Usar la función de api.js
    alert("Producto eliminado");
    loadProducts();
  } catch (e) {
    console.error("Error al eliminar producto:", e);
    alert(e.message || "Error al eliminar el producto");
  }
};
const handleEditProduct = (product) => {
  setEditingProduct(product.id);
  setEditFormData({
    nombre: product.nombre || "",
    descripcion: product.descripcion || "",
    categoria: product.categoria || "",
    precio: product.precio || "",
    color: product.color || "",
    tamano: product.tamano || "",
    material: product.material || "",
    stock: product.stock || "",
    activo: product.activo ?? true,
  });
  setEditImagePreview(product.imagen_url || "");
  setShowEditModal(true);
};

// ===== FUNCIÓN PARA MANEJAR CAMBIOS EN FORMULARIO =====
/**
 * Maneja los cambios en los campos del formulario de edición
 * @param {Event} e - Evento del input
 */
const handleEditChange = (e) => {
  const { name, value, type, checked } = e.target;
  setEditFormData({
    ...editFormData,
    [name]: type === "checkbox" ? checked : value,
  });
};

// ===== FUNCIÓN PARA MANEJAR CAMBIO DE IMAGEN =====
/**
 * Maneja la selección de una nueva imagen para el producto
 * @param {Event} e - Evento del input file
 */
const handleEditImageChange = (e) => {
  const file = e.target.files?.[0];  // Usar optional chaining
  
  if (file) {
    setEditImageFile(file);
    
    // Solo leer si el archivo es válido y es una imagen
    if (file instanceof File && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditImagePreview(reader.result);
      };
      reader.onerror = () => {
        console.error('Error al leer la imagen');
        setEditImagePreview('');
      };
      reader.readAsDataURL(file);
    }
  } else {
    // Si no hay archivo, limpiar
    setEditImageFile(null);
  }
};

// ===== FUNCIÓN PARA GUARDAR CAMBIOS =====
/**
 * Envía los cambios del producto al backend
 * @param {Event} e - Evento del formulario
 */
const handleEditSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError("");

  try {
    const fData = new FormData();
    
    // Solo agregar campos que tengan valor (opcionales)
    if (editFormData.nombre) fData.append("nombre", editFormData.nombre);
    if (editFormData.descripcion) fData.append("descripcion", editFormData.descripcion);
    if (editFormData.precio) fData.append("precio", editFormData.precio);
    if (editFormData.stock) fData.append("stock", editFormData.stock);
    if (editFormData.categoria) fData.append("categoria", editFormData.categoria);
    if (editFormData.color) fData.append("color", editFormData.color);
    if (editFormData.tamano) fData.append("tamano", editFormData.tamano);
    if (editFormData.material) fData.append("material", editFormData.material);
    
    fData.append("activo", editFormData.activo.toString());
    
    // ✅ CORRECCIÓN IMPORTANTE: Solo enviar si hay un archivo NUEVO
    if (editImageFile && editImageFile instanceof File) {
      fData.append("imagen", editImageFile);
      console.log("📸 Enviando nueva imagen:", editImageFile.name);
    } else {
      console.log("📸 Sin cambio de imagen (se mantendrá la actual)");
    }

    await apiUpdateProduct(editingProduct, fData);
    
    alert("Producto actualizado exitosamente");
    
    // Resetear formulario
    setEditFormData({
      nombre: "",
      descripcion: "",
      categoria: "",
      precio: "",
      color: "",
      tamano: "",
      material: "",
      stock: "",
      activo: true,
    });
    setEditImageFile(null);
    setEditImagePreview("");
    setShowEditModal(false);
    setEditingProduct(null);
    loadProducts();
  } catch (err) {
    console.error("Error actualizando producto:", err);
    setError(err.message || "Error al actualizar el producto");
  } finally {
    setLoading(false);
  }
};


  // ✅ NUEVO: Función para iniciar edición de pedido personalizado
  const handleEditOrder = (order) => {
    setEditingOrder(order.pedido_id);
    setEditData({
      nombre_personalizado: order.nombre_personalizado || "",
      precio_personalizado: order.precio_personalizado || "",
      comentario_vendedor: order.comentario_vendedor || "",
    });
  };

  // ✅ NUEVO: Función para guardar cambios de pedido personalizado
  const handleSaveCustomOrder = async (orderId) => {
    try {
      await apiUpdatePedidoPersonalizado(orderId, editData);
      // Recargar pedidos
      const updatedOrders = await apiGetPedidosPersonalizados();
      setOrders(updatedOrders);
      setEditingOrder(null);
      alert("Pedido actualizado correctamente");
    } catch (err) {
      console.error(err);
      alert("Error al actualizar el pedido");
    }
  };

  const regularOrders = orders;
  const customOrders = orders;

  return (
    <div style={{ padding: "40px 20px", maxWidth: "1200px", margin: "0 auto" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "30px",
        }}
      >
        <h1 style={{ fontSize: "28px", fontWeight: "bold", margin: 0 }}>
          Panel de Administración
        </h1>
        <button
          onClick={() => {
            localStorage.removeItem("token");
            navigate("/login");
          }}
          style={{
            padding: "10px 20px",
            background: "#ef4444",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: "500",
          }}
        >
          Cerrar Sesión
        </button>
      </div>

      {/* Nuevo tab: Fidelizados */}
      <button
        onClick={() => setTab('fidelizados')}
        style={{
          marginLeft: 12,
          padding: "12px 24px",
          background: tab === 'fidelizados' ? "#3b82f6" : "transparent",
          color: tab === 'fidelizados' ? "white" : "#6b7280",
          border: 'none',
          cursor: 'pointer',
          fontSize: 15,
          fontWeight: tab === 'fidelizados' ? 600 : 500,
        }}
      >
        Fidelizados
      </button>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "30px", borderBottom: "2px solid #e5e7eb" }}>
        {["productos", "pedidos", "personalizados"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              padding: "12px 24px",
              background: tab === t ? "#3b82f6" : "transparent",
              color: tab === t ? "white" : "#6b7280",
              border: "none",
              borderBottom: tab === t ? "2px solid #3b82f6" : "none",
              cursor: "pointer",
              fontSize: "15px",
              fontWeight: tab === t ? "600" : "500",
              transition: "all 0.2s",
            }}
          >
            {t === "productos"
              ? "Productos"
              : t === "pedidos"
              ? "Pedidos Normales"
              : "Pedidos Personalizados"}
          </button>
        ))}
      </div>

      {/* Tab de Fidelizados (Admin) */}
      {tab === 'fidelizados' && (
        <div style={{ background: 'white', borderRadius: 12, border: '1px solid #e5e7eb', padding: 20 }}>
          <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 12 }}>Clientes Fidelizados</h2>
          {fidelizados.length === 0 ? (
            <div style={{ padding: '1rem', textAlign: 'center' }}>No hay clientes fidelizados</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {fidelizados.map((f) => (
                <div key={f.id} style={{ border: '1px solid #e5e7eb', padding: 12, borderRadius: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 600 }}>{f.nombre_completo} <small style={{ color: '#6b7280' }}>({f.correo})</small></div>
                    <div style={{ fontSize: 13, color: '#374151' }}>Puntos: {f.puntos} {f.proximo_regalo ? `| Estado: ${f.proximo_regalo}` : ''}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <button
                      onClick={async () => {
                        try {
                          const api = await import('../api');
                          await api.apiAcceptFidelizado(f.correo);
                          // refresh list
                          const refreshed = await api.apiGetFidelizados();
                          setFidelizados(refreshed);
                          alert('Cliente aceptado en el programa');
                        } catch (err) {
                          console.error(err);
                          alert('Error al aceptar cliente');
                        }
                      }}
                      style={{ padding: '8px 12px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer' }}
                    >
                      Aceptar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab de Productos */}
      {tab === "productos" && (
        <>
          <button
            onClick={() => setShowModal(true)}
            style={{
              padding: "12px 24px",
              background: "#10b981",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "15px",
              fontWeight: "600",
              marginBottom: "20px",
            }}
          >
            + Crear Producto
          </button>

          <div
            style={{
              background: "white",
              borderRadius: "12px",
              border: "1px solid #e5e7eb",
              padding: "20px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            }}
          >
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid #e5e7eb" }}>
                  <th
                    style={{
                      textAlign: "left",
                      padding: "12px",
                      fontSize: "13px",
                      fontWeight: "600",
                      color: "#6b7280",
                      textTransform: "uppercase",
                    }}
                  >
                    Producto
                  </th>
                  <th
                    style={{
                      textAlign: "left",
                      padding: "12px",
                      fontSize: "13px",
                      fontWeight: "600",
                      color: "#6b7280",
                      textTransform: "uppercase",
                    }}
                  >
                    Descripción
                  </th>
                  <th
                    style={{
                      textAlign: "left",
                      padding: "12px",
                      fontSize: "13px",
                      fontWeight: "600",
                      color: "#6b7280",
                      textTransform: "uppercase",
                    }}
                  >
                    Categoría
                  </th>
                  <th
                    style={{
                      textAlign: "left",
                      padding: "12px",
                      fontSize: "13px",
                      fontWeight: "600",
                      color: "#6b7280",
                      textTransform: "uppercase",
                    }}
                  >
                    Precio
                  </th>
                  <th
                    style={{
                      textAlign: "left",
                      padding: "12px",
                      fontSize: "13px",
                      fontWeight: "600",
                      color: "#6b7280",
                      textTransform: "uppercase",
                    }}
                  >
                    Stock
                  </th>
                  <th
                    style={{
                      textAlign: "right",
                      padding: "12px",
                      fontSize: "13px",
                      fontWeight: "600",
                      color: "#6b7280",
                      textTransform: "uppercase",
                    }}
                  >
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {prods.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      style={{
                        textAlign: "center",
                        padding: "40px",
                        color: "#9ca3af",
                        fontSize: "14px",
                      }}
                    >
                      No hay productos registrados
                    </td>
                  </tr>
                ) : (
                  prods.map((p) => (
                    <tr
                      key={p.id}
                      style={{
                        borderBottom: "1px solid #f3f4f6",
                      }}
                    >
                      <td style={{ padding: "16px 12px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                          {p.imagen_url && (
                            <img
                              src={getImageUrl(p.imagen_url)}
                              alt={p.nombre}
                              style={{
                                width: "50px",
                                height: "50px",
                                objectFit: "cover",
                                borderRadius: "8px",
                                border: "1px solid #e5e7eb",
                              }}
                              onError={(e) => {
                                e.target.style.display = "none";
                              }}
                            />
                          )}
                          <span style={{ fontSize: "14px", fontWeight: "500" }}>
                            {p.nombre}
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: "16px 12px", fontSize: "14px", color: "#6b7280" }}>
                        {p.descripcion?.substring(0, 50)}...
                      </td>
                      <td style={{ padding: "16px 12px" }}>
                        {p.categoria ? (
                          <span
                            style={{
                              background: "#f3f4f6",
                              padding: "4px 12px",
                              borderRadius: "6px",
                              fontSize: "13px",
                              fontWeight: "500",
                              color: "#374151",
                            }}
                          >
                            {p.categoria === "origami-3d"
                              ? "Origami 3D"
                              : p.categoria === "filigrana"
                              ? "Filigrana"
                              : p.categoria === "tradicional-pliegues"
                              ? "Tradicional/Pliegues"
                              : p.categoria}
                          </span>
                        ) : (
                          <span style={{ fontSize: "13px", color: "#9ca3af" }}>
                            Sin categoría
                          </span>
                        )}
                      </td>
                      <td
                        style={{
                          padding: "16px 12px",
                          fontSize: "15px",
                          fontWeight: "600",
                          color: "#059669",
                        }}
                      >
                        ${p.precio}
                      </td>
                      <td style={{ padding: "16px 12px" }}>
                        <span
                          style={{
                            padding: "4px 12px",
                            background: p.stock > 0 ? "#f0fdf4" : "#fef2f2",
                            color: p.stock > 0 ? "#16a34a" : "#dc2626",
                            borderRadius: "6px",
                            fontSize: "13px",
                            fontWeight: "500",
                          }}
                        >
                          {p.stock || 0} disponible
                        </span>
                      </td>
                      <td style={{ padding: "16px 12px", textAlign: "right" }}>
                        {/* Botón de Editar */}
                        <button
                          onClick={() => handleEditProduct(p)}
                          style={{
                            padding: "6px 12px",
                            backgroundColor: "#ffc107",
                            color: "#000",
                            border: "none",
                            borderRadius: "6px",
                            cursor: "pointer",
                            fontSize: "13px",
                            fontWeight: "500",
                            marginRight: "8px",
                          }}
                          aria-label={`Editar ${p.nombre}`}
                        >
                          ✏️ Editar
                        </button>
                        <button
                          onClick={() => deleteProduct(p.id)}
                          style={{
                            padding: "8px 16px",
                            background: "#fee2e2",
                            color: "#dc2626",
                            border: "1px solid #fecaca",
                            borderRadius: "6px",
                            cursor: "pointer",
                            fontSize: "13px",
                            fontWeight: "500",
                          }}
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Tab de Pedidos Normales */}
      {tab === "pedidos" && (
        <div
          style={{
            background: "white",
            borderRadius: "12px",
            border: "1px solid #e5e7eb",
            padding: "20px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          }}
        >
          <h2 style={{ fontSize: "20px", fontWeight: "600", marginBottom: "20px" }}>
            Pedidos Normales
          </h2>
          {regularOrders.length === 0 ? (
            <div style={{ padding: "2rem", textAlign: "center" }}>No hay pedidos normales</div>
          ) : (
            regularOrders.map((o) => (
              <div
                key={o.pedido_id}
                style={{
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  padding: "16px",
                  background: "#fafafa",
                  marginBottom: "16px",
                }}
              >
                {/* ENCABEZADO CON IMAGEN Y NOMBRE */}
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px", alignItems: "flex-start" }}>
                  <div style={{ display: "flex", gap: "12px", alignItems: "center", flex: 1 }}>
                    {/* IMAGEN DEL PRIMER PRODUCTO */}
                    {o.items && o.items.length > 0 && (o.items[0]?.imagen_url || o.items[0]?.imagen) && (
                      <img
                        src={getImageUrl(o.items[0]?.imagen_url || o.items[0]?.imagen)}
                        alt={o.items[0]?.nombre || "Producto"}
                        style={{
                          width: "60px",
                          height: "60px",
                          objectFit: "cover",
                          borderRadius: "6px",
                          border: "1px solid #ddd",
                          flexShrink: 0,
                        }}
                        onError={(e) => { e.target.style.display = "none"; }}
                      />
                    )}
                    {/* NOMBRE DEL PRODUCTO */}
                    <div style={{ flex: 1 }}>
                      <strong style={{ fontSize: "15px", display: "block", marginBottom: "4px" }}>
                        {o.items && o.items.length > 0
                          ? o.items.map(item => `${item.nombre}${item.cantidad > 1 ? ` x${item.cantidad}` : ""}`).join(", ")
                          : `Pedido #${o.pedido_id.substring(0, 8)}`
                        }
                      </strong>
                      <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                        <span
                          style={{
                            background:
                              o.estado === "completado" ? "#d1fae5" :
                              o.estado === "cancelado" ? "#fee2e2" : "#fef3c7",
                            color:
                              o.estado === "completado" ? "#065f46" :
                              o.estado === "cancelado" ? "#991b1b" : "#92400e",
                            padding: "4px 12px",
                            borderRadius: "6px",
                            fontSize: "13px",
                            fontWeight: "500",
                          }}
                        >
                          {o.estado}
                        </span>
                        <span style={{ fontSize: "15px", fontWeight: "600", color: "#059669" }}>
                          ${o.total || 0}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* CONTACTO */}
                <div style={{ 
                  marginBottom: "12px", 
                  padding: "12px", 
                  background: "#f0f9ff", 
                  borderRadius: "6px" 
                }}>
                  <div style={{ fontSize: "14px", fontWeight: "600", marginBottom: "8px" }}>
                    📞 Contacto
                  </div>
                  <div style={{ fontSize: "13px", color: "#374151" }}>
                    <div style={{ marginBottom: "4px" }}>
                      <strong>Nombre:</strong> {o.contacto?.nombre || o.contacto_nombre || "N/A"}
                    </div>
                    <div style={{ marginBottom: "4px" }}>
                      <strong>Email:</strong> {o.contacto?.email || o.contacto_email || "N/A"}
                    </div>
                    <div>
                      <strong>Teléfono:</strong> {o.contacto?.telefono || o.contacto_telefono || "N/A"}
                    </div>
                  </div>
                </div>

                {/* ENTREGA */}
                <div style={{ 
                  marginBottom: "12px", 
                  padding: "12px", 
                  background: "#f0fdf4", 
                  borderRadius: "6px" 
                }}>
                  <div style={{ fontSize: "14px", fontWeight: "600", marginBottom: "8px" }}>
                    🚚 Entrega
                  </div>
                  <div style={{ fontSize: "13px", color: "#374151" }}>
                    <div style={{ marginBottom: "4px" }}>
                      <strong>Dirección:</strong> {o.direccion || "No especificada"}
                    </div>
                    <div>
                      <strong>Método de Pago:</strong> {o.metodo_pago || "No especificado"}
                    </div>
                  </div>
                </div>

                {/* CAMBIAR ESTADO */}
                <div style={{ marginTop: "12px" }}>
                  <label style={{ fontSize: "13px", fontWeight: "500", marginRight: "8px" }}>
                    Cambiar estado
                  </label>
                  <select
                    value={o.estado}
                    onChange={(e) => changeStatus(o.pedido_id, e.target.value)}
                    style={{
                      padding: "6px 12px",
                      border: "1px solid #d1d5db",
                      borderRadius: "6px",
                      fontSize: "14px",
                    }}
                  >
                    <option value="pendiente">Pendiente</option>
                    <option value="en_proceso">En Proceso</option>
                    <option value="completado">Completado</option>
                    <option value="cancelado">Cancelado</option>
                  </select>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab de Pedidos Personalizados */}
      {tab === "personalizados" && (
        <div
          style={{
            background: "white",
            borderRadius: "12px",
            border: "1px solid #e5e7eb",
            padding: "20px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          }}
        >
          <h2 style={{ fontSize: "20px", fontWeight: "600", marginBottom: "20px" }}>
            Pedidos Personalizados
          </h2>
          {customOrders.length === 0 ? (
            <div style={{ padding: "2rem", textAlign: "center" }}>No hay pedidos personalizados</div>
          ) : (
            customOrders.map((o) => (
              <div
                key={o.pedido_id}
                style={{
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  padding: "16px",
                  background: "#fafafa",
                  marginBottom: "16px",
                }}
              >
                {/* ENCABEZADO */}
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px", alignItems: "flex-start" }}>
                  <div style={{ flex: 1 }}>
                    <strong style={{ fontSize: "15px", display: "block", marginBottom: "4px" }}>
                      {o.nombre_personalizado || "Pedido Personalizado"}
                    </strong>
                    <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                      <span
                        style={{
                          background:
                            o.estado === "completado" ? "#d1fae5" :
                            o.estado === "cancelado" ? "#fee2e2" : "#fef3c7",
                          color:
                            o.estado === "completado" ? "#065f46" :
                            o.estado === "cancelado" ? "#991b1b" : "#92400e",
                          padding: "4px 12px",
                          borderRadius: "6px",
                          fontSize: "13px",
                          fontWeight: "500",
                        }}
                      >
                        {o.estado}
                      </span>
                      <span style={{ fontSize: "15px", fontWeight: "600", color: "#059669" }}>
                        ${o.precio_personalizado || 0}
                      </span>
                    </div>
                  </div>
                </div>

                {/* SOLICITUD */}
                <div style={{ 
                  marginBottom: "12px", 
                  padding: "12px", 
                  background: "#faf5ff", 
                  borderRadius: "6px" 
                }}>
                  <div style={{ fontSize: "14px", fontWeight: "600", marginBottom: "8px" }}>
                    📋 Descripción
                  </div>
                  <p style={{ margin: "0", fontSize: "13px", color: "#374151" }}>
                    {o.descripcion || "Sin descripción"}
                  </p>
                  {/* IMAGEN DE REFERENCIA */}
                  {o.imagen_referencia && (
                    <div style={{ marginTop: "8px" }}>
                      <img
                        src={getImageUrl(o.imagen_referencia)}
                        alt="Referencia"
                        style={{
                          maxWidth: "150px",
                          borderRadius: "6px",
                          border: "1px solid #ddd",
                        }}
                        onError={(e) => { e.target.style.display = "none"; }}
                      />
                    </div>
                  )}
                </div>

                {/* CONTACTO */}
                <div style={{ 
                  marginBottom: "12px", 
                  padding: "12px", 
                  background: "#f0f9ff", 
                  borderRadius: "6px" 
                }}>
                  <div style={{ fontSize: "14px", fontWeight: "600", marginBottom: "8px" }}>
                    📞 Contacto
                  </div>
                  <div style={{ fontSize: "13px", color: "#374151" }}>
                    <div style={{ marginBottom: "4px" }}>
                      <strong>Nombre:</strong> {o.contacto?.nombre || o.contacto_nombre || "N/A"}
                    </div>
                    <div style={{ marginBottom: "4px" }}>
                      <strong>Email:</strong> {o.contacto?.email || o.contacto_email || "N/A"}
                    </div>
                    <div>
                      <strong>Teléfono:</strong> {o.contacto?.telefono || o.contacto_telefono || "N/A"}
                    </div>
                  </div>
                </div>

                {/* ENTREGA */}
                <div style={{ 
                  marginBottom: "12px", 
                  padding: "12px", 
                  background: "#f0fdf4", 
                  borderRadius: "6px" 
                }}>
                  <div style={{ fontSize: "14px", fontWeight: "600", marginBottom: "8px" }}>
                    🚚 Entrega
                  </div>
                  <div style={{ fontSize: "13px", color: "#374151" }}>
                    <div style={{ marginBottom: "4px" }}>
                      <strong>Dirección:</strong> {o.direccion || "No especificada"}
                    </div>
                    <div>
                      <strong>Método de Pago:</strong> {o.metodo_pago || "No especificado"}
                    </div>
                  </div>
                </div>

                {/* SECCIÓN EDITABLE */}
                {editingOrder === o.pedido_id ? (
                  <div style={{
                    marginTop: "12px",
                    marginBottom: "12px",
                    padding: "12px",
                    background: "#f0f9ff",
                    borderRadius: "6px",
                    border: "1px solid #bfdbfe",
                  }}>
                    <div style={{ fontSize: "14px", fontWeight: "600", marginBottom: "8px" }}>
                      ✏️ Editar Información
                    </div>
                    <div style={{ marginBottom: "8px" }}>
                      <label style={{ display: "block", fontSize: "13px", fontWeight: "500", marginBottom: "4px" }}>
                        Nombre del producto
                      </label>
                      <input
                        type="text"
                        value={editData.nombre_personalizado}
                        onChange={(e) => setEditData({ ...editData, nombre_personalizado: e.target.value })}
                        style={{
                          width: "100%",
                          padding: "8px 12px",
                          border: "1px solid #d1d5db",
                          borderRadius: "6px",
                          fontSize: "14px",
                        }}
                        placeholder="Nombre del producto"
                      />
                    </div>
                    <div style={{ marginBottom: "8px" }}>
                      <label style={{ display: "block", fontSize: "13px", fontWeight: "500", marginBottom: "4px" }}>
                        Precio personalizado
                      </label>
                      <input
                        type="number"
                        value={editData.precio_personalizado}
                        onChange={(e) => setEditData({ ...editData, precio_personalizado: e.target.value })}
                        style={{
                          width: "100%",
                          padding: "8px 12px",
                          border: "1px solid #d1d5db",
                          borderRadius: "6px",
                          fontSize: "14px",
                        }}
                        placeholder="0.00"
                      />
                    </div>
                    <div style={{ marginBottom: "8px" }}>
                      <label style={{ display: "block", fontSize: "13px", fontWeight: "500", marginBottom: "4px" }}>
                        Comentario del vendedor
                      </label>
                      <textarea
                        value={editData.comentario_vendedor}
                        onChange={(e) => setEditData({ ...editData, comentario_vendedor: e.target.value })}
                        style={{
                          width: "100%",
                          padding: "8px 12px",
                          border: "1px solid #d1d5db",
                          borderRadius: "6px",
                          fontSize: "14px",
                          minHeight: "60px",
                          resize: "vertical",
                        }}
                        placeholder="Notas..."
                      />
                    </div>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button
                        onClick={() => handleSaveCustomOrder(o.pedido_id)}
                        style={{
                          padding: "8px 16px",
                          background: "#10b981",
                          color: "white",
                          border: "none",
                          borderRadius: "6px",
                          cursor: "pointer",
                          fontSize: "14px",
                          fontWeight: "500",
                        }}
                      >
                        Guardar
                      </button>
                      <button
                        onClick={() => setEditingOrder(null)}
                        style={{
                          padding: "8px 16px",
                          background: "#e5e7eb",
                          color: "#374151",
                          border: "none",
                          borderRadius: "6px",
                          cursor: "pointer",
                          fontSize: "14px",
                          fontWeight: "500",
                        }}
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* MOSTRAR INFORMACIÓN GUARDADA */}
                    {(o.nombre_personalizado || o.precio_personalizado || o.comentario_vendedor) && (
                      <div style={{
                        marginBottom: "12px",
                        padding: "12px",
                        background: "#fef5e7",
                        borderRadius: "6px",
                        border: "1px solid #fde68a",
                      }}>
                        <div style={{ fontSize: "14px", fontWeight: "600", marginBottom: "8px", color: "#92400e" }}>
                          💬 Respuesta del Vendedor
                        </div>
                        {o.precio_personalizado && (
                          <p style={{ margin: "4px 0", fontSize: "13px" }}>
                            <strong>Precio:</strong> ${o.precio_personalizado}
                          </p>
                        )}
                        {o.comentario_vendedor && (
                          <p style={{ margin: "4px 0", fontSize: "13px" }}>
                            <strong>Comentario:</strong> {o.comentario_vendedor}
                          </p>
                        )}
                      </div>
                    )}
                    <button
                      onClick={() => handleEditOrder(o)}
                      style={{
                        padding: "8px 16px",
                        background: "#3b82f6",
                        color: "white",
                        border: "none",
                        borderRadius: "6px",
                        cursor: "pointer",
                        fontSize: "14px",
                        fontWeight: "500",
                      }}
                    >
                      Editar Información
                    </button>
                  </>
                )}

                {/* CAMBIAR ESTADO */}
                <div style={{ marginTop: "12px" }}>
                  <label style={{ fontSize: "13px", fontWeight: "500", marginRight: "8px" }}>
                    Cambiar estado
                  </label>
                  <select
                    value={o.estado}
                    onChange={(e) => changeStatus(o.pedido_id, e.target.value)}
                    style={{
                      padding: "6px 12px",
                      border: "1px solid #d1d5db",
                      borderRadius: "6px",
                      fontSize: "14px",
                    }}
                  >
                    <option value="pendiente">Pendiente</option>
                    <option value="en_proceso">En Proceso</option>
                    <option value="completado">Completado</option>
                    <option value="cancelado">Cancelado</option>
                  </select>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Modal de Crear Producto */}
      {showModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              background: "white",
              borderRadius: "12px",
              padding: "30px",
              maxWidth: "500px",
              width: "90%",
              maxHeight: "90vh",
              overflowY: "auto",
            }}
          >
            <h2 style={{ fontSize: "24px", fontWeight: "600", marginBottom: "20px" }}>
              Crear Nuevo Producto
            </h2>

            {error && (
              <div
                style={{
                  padding: "12px",
                  background: "#fee2e2",
                  color: "#dc2626",
                  borderRadius: "8px",
                  marginBottom: "16px",
                  fontSize: "14px",
                }}
              >
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: "16px" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "14px",
                    fontWeight: "500",
                    marginBottom: "6px",
                  }}
                >
                  Nombre del Producto *
                </label>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  required
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: "1px solid #d1d5db",
                    borderRadius: "8px",
                    fontSize: "14px",
                  }}
                />
              </div>

              <div style={{ marginBottom: "16px" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "14px",
                    fontWeight: "500",
                    marginBottom: "6px",
                  }}
                >
                  Descripción *
                </label>
                <textarea
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleChange}
                  required
                  rows={3}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: "1px solid #d1d5db",
                    borderRadius: "8px",
                    fontSize: "14px",
                    resize: "vertical",
                  }}
                />
              </div>

              <div style={{ marginBottom: "16px" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "14px",
                    fontWeight: "500",
                    marginBottom: "6px",
                  }}
                >
                  Categoría *
                </label>
                <select
                  name="categoria"
                  value={formData.categoria}
                  onChange={handleChange}
                  required
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: "1px solid #d1d5db",
                    borderRadius: "8px",
                    fontSize: "14px",
                  }}
                >
                  <option value="">Seleccionar categoría</option>
                  <option value="origami-3d">Origami 3D</option>
                  <option value="filigrana">Filigrana</option>
                  <option value="tradicional-pliegues">Tradicional/Pliegues</option>
                </select>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "14px",
                      fontWeight: "500",
                      marginBottom: "6px",
                    }}
                  >
                    Precio ($) *
                  </label>
                  <input
                    type="number"
                    name="precio"
                    value={formData.precio}
                    onChange={handleChange}
                    required
                    step="0.01"
                    min="0"
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      border: "1px solid #d1d5db",
                      borderRadius: "8px",
                      fontSize: "14px",
                    }}
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "14px",
                      fontWeight: "500",
                      marginBottom: "6px",
                    }}
                  >
                    Stock *
                  </label>
                  <input
                    type="number"
                    name="stock"
                    value={formData.stock}
                    onChange={handleChange}
                    required
                    min="0"
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      border: "1px solid #d1d5db",
                      borderRadius: "8px",
                      fontSize: "14px",
                    }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: "16px" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "14px",
                    fontWeight: "500",
                    marginBottom: "6px",
                  }}
                >
                  Color
                </label>
                <input
                  type="text"
                  name="color"
                  value={formData.color}
                  onChange={handleChange}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: "1px solid #d1d5db",
                    borderRadius: "8px",
                    fontSize: "14px",
                  }}
                />
              </div>

              <div style={{ marginBottom: "16px" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "14px",
                    fontWeight: "500",
                    marginBottom: "6px",
                  }}
                >
                  Tamaño
                </label>
                <input
                  type="text"
                  name="tamano"
                  value={formData.tamano}
                  onChange={handleChange}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: "1px solid #d1d5db",
                    borderRadius: "8px",
                    fontSize: "14px",
                  }}
                />
              </div>

              <div style={{ marginBottom: "16px" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "14px",
                    fontWeight: "500",
                    marginBottom: "6px",
                  }}
                >
                  Material
                </label>
                <input
                  type="text"
                  name="material"
                  value={formData.material}
                  onChange={handleChange}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: "1px solid #d1d5db",
                    borderRadius: "8px",
                    fontSize: "14px",
                  }}
                />
              </div>

              <div style={{ marginBottom: "16px" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "14px",
                    fontWeight: "500",
                    marginBottom: "6px",
                  }}
                >
                  Imagen del Producto
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: "1px solid #d1d5db",
                    borderRadius: "8px",
                    fontSize: "14px",
                  }}
                />
                {imagePreview && (
                  <img
                    src={getImageUrl(imagePreview)}
                    alt="Preview"
                    style={{
                      marginTop: "12px",
                      width: "100%",
                      maxHeight: "200px",
                      objectFit: "cover",
                      borderRadius: "8px",
                    }}
                  />
                )}
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    name="activo"
                    checked={formData.activo}
                    onChange={handleChange}
                    style={{ width: "18px", height: "18px" }}
                  />
                  <span style={{ fontSize: "14px", fontWeight: "500" }}>Producto activo</span>
                </label>
              </div>

              <div style={{ display: "flex", gap: "12px" }}>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    flex: 1,
                    padding: "12px",
                    background: loading ? "#9ca3af" : "#10b981",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    cursor: loading ? "not-allowed" : "pointer",
                    fontSize: "15px",
                    fontWeight: "600",
                  }}
                >
                  {loading ? "Creando..." : "Crear Producto"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{
                    flex: 1,
                    padding: "12px",
                    background: "#e5e7eb",
                    color: "#374151",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontSize: "15px",
                    fontWeight: "600",
                  }}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
        

      )}
      {/* ===== MODAL DE EDICIÓN DE PRODUCTO ===== */}
      {showEditModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999,
            overflow: "auto",
          }}
          onClick={() => setShowEditModal(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="edit-modal-title"
        >
          <div
            style={{
              backgroundColor: "#fff",
              padding: "30px",
              borderRadius: "12px",
              width: "90%",
              maxWidth: "600px",
              maxHeight: "90vh",
              overflowY: "auto",
              boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="edit-modal-title" style={{ marginBottom: "20px", color: "#333" }}>
              ✏️ Editar Producto
            </h2>
            <p style={{ marginBottom: "20px", color: "#666", fontSize: "14px" }}>
              Todos los campos son opcionales. Solo modifica los que desees actualizar.
            </p>

            {error && (
              <div
                style={{
                  padding: "10px",
                  backgroundColor: "#fee",
                  color: "#c00",
                  borderRadius: "6px",
                  marginBottom: "15px",
                }}
                role="alert"
              >
                {error}
              </div>
            )}

            <form onSubmit={handleEditSubmit}>
              {/* Nombre del Producto */}
              <div style={{ marginBottom: "15px" }}>
                <label 
                  htmlFor="edit-nombre"
                  style={{ display: "block", marginBottom: "5px", fontWeight: "500" }}
                >
                  Nombre del Producto
                </label>
                <input
                  id="edit-nombre"
                  type="text"
                  name="nombre"
                  value={editFormData.nombre}
                  onChange={handleEditChange}
                  style={{
                    width: "100%",
                    padding: "10px",
                    border: "1px solid #ddd",
                    borderRadius: "6px",
                    fontSize: "14px",
                  }}
                  placeholder="Opcional"
                />
              </div>

              {/* Descripción */}
              <div style={{ marginBottom: "15px" }}>
                <label 
                  htmlFor="edit-descripcion"
                  style={{ display: "block", marginBottom: "5px", fontWeight: "500" }}
                >
                  Descripción
                </label>
                <textarea
                  id="edit-descripcion"
                  name="descripcion"
                  value={editFormData.descripcion}
                  onChange={handleEditChange}
                  style={{
                    width: "100%",
                    padding: "10px",
                    border: "1px solid #ddd",
                    borderRadius: "6px",
                    fontSize: "14px",
                    minHeight: "80px",
                  }}
                  placeholder="Opcional"
                />
              </div>

              {/* Categoría */}
              <div style={{ marginBottom: "15px" }}>
                <label 
                  htmlFor="edit-categoria"
                  style={{ display: "block", marginBottom: "5px", fontWeight: "500" }}
                >
                  Categoría
                </label>
                <select
                  id="edit-categoria"
                  name="categoria"
                  value={editFormData.categoria}
                  onChange={handleEditChange}
                  style={{
                    width: "100%",
                    padding: "10px",
                    border: "1px solid #ddd",
                    borderRadius: "6px",
                    fontSize: "14px",
                  }}
                >
                  <option value="">Seleccionar categoría (opcional)</option>
                  <option value="origami-3d">Origami 3D</option>
                  <option value="filigrana">Filigrana</option>
                  <option value="tradicional-pliegues">Tradicional/Pliegues</option>
                </select>
              </div>

              {/* Precio y Stock */}
              <div style={{ display: "flex", gap: "15px", marginBottom: "15px" }}>
                <div style={{ flex: 1 }}>
                  <label 
                    htmlFor="edit-precio"
                    style={{ display: "block", marginBottom: "5px", fontWeight: "500" }}
                  >
                    Precio ($)
                  </label>
                  <input
                    id="edit-precio"
                    type="number"
                    name="precio"
                    value={editFormData.precio}
                    onChange={handleEditChange}
                    min="0"
                    step="0.01"
                    style={{
                      width: "100%",
                      padding: "10px",
                      border: "1px solid #ddd",
                      borderRadius: "6px",
                      fontSize: "14px",
                    }}
                    placeholder="Opcional"
                  />
                </div>

                <div style={{ flex: 1 }}>
                  <label 
                    htmlFor="edit-stock"
                    style={{ display: "block", marginBottom: "5px", fontWeight: "500" }}
                  >
                    Stock
                  </label>
                  <input
                    id="edit-stock"
                    type="number"
                    name="stock"
                    value={editFormData.stock}
                    onChange={handleEditChange}
                    min="0"
                    style={{
                      width: "100%",
                      padding: "10px",
                      border: "1px solid #ddd",
                      borderRadius: "6px",
                      fontSize: "14px",
                    }}
                    placeholder="Opcional"
                  />
                </div>
              </div>

              {/* Color */}
              <div style={{ marginBottom: "15px" }}>
                <label 
                  htmlFor="edit-color"
                  style={{ display: "block", marginBottom: "5px", fontWeight: "500" }}
                >
                  Color
                </label>
                <input
                  id="edit-color"
                  type="text"
                  name="color"
                  value={editFormData.color}
                  onChange={handleEditChange}
                  style={{
                    width: "100%",
                    padding: "10px",
                    border: "1px solid #ddd",
                    borderRadius: "6px",
                    fontSize: "14px",
                  }}
                  placeholder="Opcional"
                />
              </div>

              {/* Tamaño */}
              <div style={{ marginBottom: "15px" }}>
                <label 
                  htmlFor="edit-tamano"
                  style={{ display: "block", marginBottom: "5px", fontWeight: "500" }}
                >
                  Tamaño
                </label>
                <input
                  id="edit-tamano"
                  type="text"
                  name="tamano"
                  value={editFormData.tamano}
                  onChange={handleEditChange}
                  style={{
                    width: "100%",
                    padding: "10px",
                    border: "1px solid #ddd",
                    borderRadius: "6px",
                    fontSize: "14px",
                  }}
                  placeholder="Opcional"
                />
              </div>

              {/* Material */}
              <div style={{ marginBottom: "15px" }}>
                <label 
                  htmlFor="edit-material"
                  style={{ display: "block", marginBottom: "5px", fontWeight: "500" }}
                >
                  Material
                </label>
                <input
                  id="edit-material"
                  type="text"
                  name="material"
                  value={editFormData.material}
                  onChange={handleEditChange}
                  style={{
                    width: "100%",
                    padding: "10px",
                    border: "1px solid #ddd",
                    borderRadius: "6px",
                    fontSize: "14px",
                  }}
                  placeholder="Opcional"
                />
              </div>

              {/* Imagen */}
              <div style={{ marginBottom: "15px" }}>
                <label 
                  htmlFor="edit-imagen"
                  style={{ display: "block", marginBottom: "5px", fontWeight: "500" }}
                >
                  Imagen del Producto
                </label>
                <input
                  id="edit-imagen"
                  type="file"
                  accept="image/*"
                  onChange={handleEditImageChange}
                  style={{
                    width: "100%",
                    padding: "10px",
                    border: "1px solid #ddd",
                    borderRadius: "6px",
                    fontSize: "14px",
                  }}
                />
                {editImagePreview && (
                  <div style={{ marginTop: "10px" }}>
                    <img
                      src={getImageUrl(editImagePreview)}
                      alt="Vista previa del producto"
                      style={{
                        width: "100%",
                        maxHeight: "200px",
                        objectFit: "contain",
                        borderRadius: "8px",
                        border: "1px solid #ddd",
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Producto Activo */}
              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "flex", alignItems: "center", cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    name="activo"
                    checked={editFormData.activo}
                    onChange={handleEditChange}
                    style={{ marginRight: "8px", cursor: "pointer" }}
                  />
                  <span style={{ fontWeight: "500" }}>Producto activo</span>
                </label>
              </div>

              {/* Botones */}
              <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingProduct(null);
                    setError("");
                  }}
                  style={{
                    padding: "10px 20px",
                    backgroundColor: "#6c757d",
                    color: "#fff",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "14px",
                    fontWeight: "500",
                  }}
                  disabled={loading}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  style={{
                    padding: "10px 20px",
                    backgroundColor: "#007bff",
                    color: "#fff",
                    border: "none",
                    borderRadius: "6px",
                    cursor: loading ? "not-allowed" : "pointer",
                    fontSize: "14px",
                    fontWeight: "500",
                    opacity: loading ? 0.7 : 1,
                  }}
                  disabled={loading}
                >
                  {loading ? "Guardando..." : "Guardar Cambios"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
