import { useEffect, useState } from "react";
import {
  apiAllOrders,
  apiUpdateOrderStatus,
  apiGetProducts,
  apiCreateProduct,
  apiGetPedidosNormales,
  apiGetPedidosPersonalizados,
  apiUpdatePedidoPersonalizado  // ✅ NUEVO
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

  // ✅ Cargar pedidos normales
  useEffect(() => {
    if (tab === "pedidos") {
      apiGetPedidosNormales()
        .then((d) => setOrders(d))
        .catch((e) => console.error(e));
    }
  }, [tab]);

  // ✅ Cargar pedidos personalizados
  useEffect(() => {
    if (tab === "personalizados") {
      apiGetPedidosPersonalizados()
        .then((d) => setOrders(d))
        .catch((e) => console.error(e));
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
  // Si el nuevo estado es CANCELADO, pide un comentario, actualiza y remueve de la lista
  if (newStatus === "cancelado") {
    const comentario = prompt("Escribe el motivo de la cancelación:");
    if (!comentario || comentario.trim().length < 3) {
      alert("Debes ingresar un comentario para cancelar.");
      return;
    }
    apiUpdateOrderStatus(orderId, newStatus, comentario)
      .then(() => {
        setOrders(prev => prev.filter(o => o.id !== orderId));
        alert("Pedido cancelado y eliminado del panel.");
      })
      .catch((e) => {
        alert("Error cancelando el pedido");
        console.error(e);
      });
  } else {
    // Si es otro estado, simplemente lo actualiza en el UI
    apiUpdateOrderStatus(orderId, newStatus)
      .then(() => {
        setOrders(prev => prev.map(o =>
          o.id === orderId ? { ...o, estado: newStatus } : o
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
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:8000/api/productos/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        alert("Producto eliminado");
        loadProducts();
      } else {
        alert("Error al eliminar");
      }
    } catch (e) {
      console.error(e);
    }
  };

  // ✅ NUEVO: Función para iniciar edición de pedido personalizado
  const handleEditOrder = (order) => {
    setEditingOrder(order.id);
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
                              src={p.imagen_url}
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
            <p style={{ textAlign: "center", color: "#9ca3af", padding: "40px" }}>
              No hay pedidos normales
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {regularOrders.map((o) => (
                <div
                  key={o.id}
                  style={{
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                    padding: "16px",
                    background: "#fafafa",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
                    <strong style={{ fontSize: "15px" }}>Pedido #{o.id}</strong>
                    <span
                      style={{
                        background:
                          o.estado === "completado"
                            ? "#d1fae5"
                            : o.estado === "cancelado"
                            ? "#fee2e2"
                            : "#fef3c7",
                        color:
                          o.estado === "completado"
                            ? "#065f46"
                            : o.estado === "cancelado"
                            ? "#991b1b"
                            : "#92400e",
                        padding: "4px 12px",
                        borderRadius: "6px",
                        fontSize: "13px",
                        fontWeight: "500",
                      }}
                    >
                      {o.estado}
                    </span>
                  </div>
                  <p style={{ margin: "8px 0", fontSize: "14px" }}>
                    <strong>Contacto:</strong> {o.contacto_nombre} | {o.contacto_email}
                  </p>
                  <div style={{ marginTop: "12px" }}>
                    <label style={{ fontSize: "13px", fontWeight: "500", marginRight: "8px" }}>
                      Cambiar estado:
                    </label>
                    <select
                      value={o.estado}
                      onChange={(e) => changeStatus(o.id, e.target.value)}
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
              ))}
            </div>
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
            <p style={{ textAlign: "center", color: "#9ca3af", padding: "40px" }}>
              No hay pedidos personalizados
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {customOrders.map((o) => (
                <div
                  key={o.id}
                  style={{
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                    padding: "16px",
                    background: "#fafafa",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
                    <strong style={{ fontSize: "15px" }}>Pedido #{o.id}</strong>
                    <span
                      style={{
                        background:
                          o.estado === "completado"
                            ? "#d1fae5"
                            : o.estado === "cancelado"
                            ? "#fee2e2"
                            : "#fef3c7",
                        color:
                          o.estado === "completado"
                            ? "#065f46"
                            : o.estado === "cancelado"
                            ? "#991b1b"
                            : "#92400e",
                        padding: "4px 12px",
                        borderRadius: "6px",
                        fontSize: "13px",
                        fontWeight: "500",
                      }}
                    >
                      {o.estado}
                    </span>
                  </div>

                  <p style={{ margin: "8px 0", fontSize: "14px" }}>
                    <strong>Contacto:</strong> {o.contacto_nombre} | {o.contacto_email}
                  </p>
                  <p style={{ margin: "8px 0", fontSize: "14px" }}>
                    <strong>Descripción:</strong> {o.descripcion}
                  </p>

                  {/* ✅ SECCIÓN EDITABLE */}
                  {editingOrder === o.id ? (
                    <div
                      style={{
                        marginTop: "16px",
                        padding: "16px",
                        background: "#f0f9ff",
                        borderRadius: "8px",
                        border: "1px solid #bfdbfe",
                      }}
                    >
                      <h4 style={{ marginTop: 0, fontSize: "14px", fontWeight: "600" }}>
                        Editar Información Personalizada
                      </h4>

                      <div style={{ marginBottom: "12px" }}>
                        <label style={{ display: "block", fontSize: "13px", fontWeight: "500", marginBottom: "4px" }}>
                          Nombre del producto:
                        </label>
                        <input
                          type="text"
                          value={editData.nombre_personalizado}
                          onChange={(e) =>
                            setEditData({ ...editData, nombre_personalizado: e.target.value })
                          }
                          style={{
                            width: "100%",
                            padding: "8px 12px",
                            border: "1px solid #d1d5db",
                            borderRadius: "6px",
                            fontSize: "14px",
                          }}
                          placeholder="Ej: Grulla de Papel Azul"
                        />
                      </div>

                      <div style={{ marginBottom: "12px" }}>
                        <label style={{ display: "block", fontSize: "13px", fontWeight: "500", marginBottom: "4px" }}>
                          Precio personalizado ($):
                        </label>
                        <input
                          type="number"
                          value={editData.precio_personalizado}
                          onChange={(e) =>
                            setEditData({ ...editData, precio_personalizado: e.target.value })
                          }
                          style={{
                            width: "100%",
                            padding: "8px 12px",
                            border: "1px solid #d1d5db",
                            borderRadius: "6px",
                            fontSize: "14px",
                          }}
                          placeholder="Ej: 25.00"
                        />
                      </div>

                      <div style={{ marginBottom: "12px" }}>
                        <label style={{ display: "block", fontSize: "13px", fontWeight: "500", marginBottom: "4px" }}>
                          Comentario del vendedor:
                        </label>
                        <textarea
                          value={editData.comentario_vendedor}
                          onChange={(e) =>
                            setEditData({ ...editData, comentario_vendedor: e.target.value })
                          }
                          style={{
                            width: "100%",
                            padding: "8px 12px",
                            border: "1px solid #d1d5db",
                            borderRadius: "6px",
                            fontSize: "14px",
                            minHeight: "80px",
                            resize: "vertical",
                          }}
                          placeholder="Notas internas sobre el pedido..."
                        />
                      </div>

                      <div style={{ display: "flex", gap: "8px" }}>
                        <button
                          onClick={() => handleSaveCustomOrder(o.id)}
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
                      {/* ✅ MOSTRAR INFORMACIÓN GUARDADA */}
                      {(o.nombre_personalizado || o.precio_personalizado || o.comentario_vendedor) && (
                        <div
                          style={{
                            marginTop: "12px",
                            padding: "12px",
                            background: "#f0fdf4",
                            borderRadius: "6px",
                            border: "1px solid #bbf7d0",
                          }}
                        >
                          <h4 style={{ marginTop: 0, fontSize: "13px", fontWeight: "600", color: "#065f46" }}>
                            Información Personalizada
                          </h4>
                          {o.nombre_personalizado && (
                            <p style={{ margin: "4px 0", fontSize: "13px" }}>
                              <strong>Producto:</strong> {o.nombre_personalizado}
                            </p>
                          )}
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
                          marginTop: "12px",
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

                  {/* ✅ CAMBIAR ESTADO */}
                  <div style={{ marginTop: "12px" }}>
                    <label style={{ fontSize: "13px", fontWeight: "500", marginRight: "8px" }}>
                      Cambiar estado:
                    </label>
                    <select
                      value={o.estado}
                      onChange={(e) => changeStatus(o.id, e.target.value)}
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
              ))}
            </div>
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
                    src={imagePreview}
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
    </div>
  );
}
