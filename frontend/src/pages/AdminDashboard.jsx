import { useEffect, useState } from "react";
import { 
  apiAllOrders, 
  apiUpdateOrderStatus, 
  apiGetProducts, 
  apiCreateProduct,
  apiGetPedidosNormales,
  apiGetPedidosPersonalizados 
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
    categoria: "", // ✅ Aquí se guardará el slug
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


  // ✅ NUEVO: Cargar pedidos normales
  useEffect(() => {
    if (tab === "pedidos") {
      apiGetPedidosNormales()
        .then((d) => setOrders(d))
        .catch((e) => console.error(e));
    }
  }, [tab]);

  // ✅ NUEVO: Cargar pedidos personalizados
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
      setProds(r); // ✅ CAMBIO: Quitar .data
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
      
      // ✅ Enviar el slug de la categoría
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
    apiUpdateOrderStatus(orderId, newStatus)
      .then(() => {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, estado: newStatus } : o))
        );
        alert(`Pedido actualizado a: ${newStatus}`);
      })
      .catch((e) => console.error(e));
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


  // ✅ Ya no es necesario filtrar porque el backend lo hace
  const regularOrders = orders;
  const customOrders = orders;


  return (
    <div style={{ minHeight: "100vh", background: "#fafafa", padding: "40px 20px" }}>
      <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" }}>
          <h1 style={{ fontSize: "30px", fontWeight: "700", color: "#1a202c" }}>
            Panel de Administración
          </h1>
          <button
            onClick={() => {
              localStorage.removeItem("token");
              navigate("/");
            }}
            style={{
              padding: "10px 20px",
              background: "#e53e3e",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "500",
            }}
          >
            Cerrar Sesión
          </button>
        </div>


        {/* Tabs */}
        <div style={{ display: "flex", gap: "10px", marginBottom: "30px", borderBottom: "2px solid #e2e8f0" }}>
          {["productos", "pedidos", "personalizados"].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                padding: "12px 24px",
                background: tab === t ? "#1a202c" : "transparent",
                color: tab === t ? "white" : "#4a5568",
                border: "none",
                borderBottom: tab === t ? "3px solid #1a202c" : "none",
                cursor: "pointer",
                fontWeight: "600",
                fontSize: "15px",
                transition: "all 0.2s",
              }}
            >
              {t === "productos" ? "Productos" : t === "pedidos" ? "Pedidos Normales" : "Pedidos Personalizados"}
            </button>
          ))}
        </div>


        {/* TAB: PRODUCTOS */}
        {tab === "productos" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h2 style={{ fontSize: "22px", fontWeight: "600" }}>Gestión de Productos</h2>
              <button
                onClick={() => setShowModal(true)}
                style={{
                  padding: "10px 24px",
                  background: "#1a202c",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontWeight: "500",
                  fontSize: "15px",
                }}
              >
                + Crear Producto
              </button>
            </div>


            <div style={{ background: "white", borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.08)", overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#f7fafc", borderBottom: "2px solid #e2e8f0" }}>
                    <th style={{ padding: "16px", textAlign: "left", fontWeight: "600", fontSize: "14px", color: "#4a5568" }}>Producto</th>
                    <th style={{ padding: "16px", textAlign: "left", fontWeight: "600", fontSize: "14px", color: "#4a5568" }}>Descripción</th>
                    <th style={{ padding: "16px", textAlign: "left", fontWeight: "600", fontSize: "14px", color: "#4a5568" }}>Categoría</th>
                    <th style={{ padding: "16px", textAlign: "left", fontWeight: "600", fontSize: "14px", color: "#4a5568" }}>Precio</th>
                    <th style={{ padding: "16px", textAlign: "left", fontWeight: "600", fontSize: "14px", color: "#4a5568" }}>Stock</th>
                    <th style={{ padding: "16px", textAlign: "center", fontWeight: "600", fontSize: "14px", color: "#4a5568" }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {prods.length === 0 ? (
                    <tr>
                      <td colSpan="6" style={{ padding: "40px", textAlign: "center", color: "#a0aec0" }}>
                        No hay productos registrados
                      </td>
                    </tr>
                  ) : (
                    prods.map((p) => (
                      <tr key={p.id} style={{ borderBottom: "1px solid #f7fafc" }}>
                        <td style={{ padding: "16px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                            {p.imagen_url && (
                              <img
                                src={`http://localhost:8000${p.imagen_url}`}
                                alt={p.nombre}
                                style={{ width: "50px", height: "50px", objectFit: "cover", borderRadius: "6px" }}
                                onError={(e) => {
                                  e.target.style.display = "none";
                                }}
                              />
                            )}
                            <span style={{ fontWeight: "500", color: "#2d3748" }}>{p.nombre}</span>
                          </div>
                        </td>
                        <td style={{ padding: "16px", color: "#718096", fontSize: "14px" }}>
                          {p.descripcion?.substring(0, 50)}...
                        </td>
                        <td style={{ padding: "16px", fontSize: "14px" }}>
                          {p.categoria ? (
                            <span style={{
                              padding: "4px 10px",
                              background: "#e6fffa",
                              color: "#047857",
                              borderRadius: "6px",
                              fontSize: "13px",
                              fontWeight: "500"
                            }}>
                              {p.categoria === "origami-3d" ? "Origami 3D" : 
                               p.categoria === "filigrana" ? "Filigrana" :
                               p.categoria === "tradicional-pliegues" ? "Tradicional/Pliegues" :
                               p.categoria}
                            </span>
                          ) : (
                            <span style={{ color: "#a0aec0", fontSize: "13px" }}>Sin categoría</span>
                          )}
                        </td>
                        <td style={{ padding: "16px", fontWeight: "600", color: "#2d3748" }}>${p.precio}</td>
                        <td style={{ padding: "16px" }}>
                          <span style={{
                            padding: "4px 10px",
                            background: p.stock > 0 ? "#f0fdf4" : "#fef2f2",
                            color: p.stock > 0 ? "#16a34a" : "#dc2626",
                            borderRadius: "6px",
                            fontSize: "13px",
                            fontWeight: "500"
                          }}>
                            {p.stock || 0} disponible
                          </span>
                        </td>
                        <td style={{ padding: "16px", textAlign: "center" }}>
                          <button
                            onClick={() => deleteProduct(p.id)}
                            style={{
                              padding: "6px 14px",
                              background: "#fee2e2",
                              color: "#dc2626",
                              border: "none",
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
          </div>
        )}


        {/* TAB: PEDIDOS NORMALES */}
        {tab === "pedidos" && (
          <div>
            <h2 style={{ fontSize: "22px", fontWeight: "600", marginBottom: "20px" }}>Pedidos Normales</h2>
            {regularOrders.length === 0 ? (
              <div style={{ padding: "60px", textAlign: "center", color: "#a0aec0", background: "white", borderRadius: "12px" }}>
                No hay pedidos normales
              </div>
            ) : (
              <div style={{ display: "grid", gap: "20px" }}>
                {regularOrders.map((o) => (
                  <div
                    key={o.id}
                    style={{
                      background: "white",
                      padding: "24px",
                      borderRadius: "12px",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                      border: "1px solid #e2e8f0",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "16px" }}>
                      <div>
                        <div style={{ fontSize: "18px", fontWeight: "600", color: "#1a202c", marginBottom: "8px" }}>
                          Pedido #{o.id}
                        </div>
                        <div style={{ fontSize: "14px", color: "#718096" }}>
                          {o.contacto?.nombre || o.contacto?.email}
                        </div>
                      </div>
                      <div style={{
                        padding: "6px 14px",
                        background: o.estado === "completado" ? "#f0fdf4" :
                                   o.estado === "cancelado" ? "#fef2f2" : "#fef3c7",
                        color: o.estado === "completado" ? "#16a34a" :
                               o.estado === "cancelado" ? "#dc2626" : "#d97706",
                        borderRadius: "6px",
                        fontSize: "13px",
                        fontWeight: "600"
                      }}>
                        {o.estado}
                      </div>
                    </div>


                    <div style={{ marginBottom: "16px" }}>
                      {o.items?.map((it, idx) => (
                        <div key={idx} style={{ padding: "8px 0", borderBottom: "1px solid #f7fafc", fontSize: "14px" }}>
                          <span style={{ fontWeight: "500" }}>{it.producto?.nombre || "Producto"}</span> x{it.cantidad} - ${it.precio * it.cantidad}
                        </div>
                      ))}
                    </div>


                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "16px", borderTop: "2px solid #e2e8f0" }}>
                      <div>
                        <span style={{ fontSize: "14px", color: "#718096" }}>Total: </span>
                        <span style={{ fontSize: "20px", fontWeight: "700", color: "#1a202c" }}>${o.total}</span>
                      </div>
                      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                        <button
                          onClick={() => changeStatus(o.id, "aceptado")}
                          style={{ padding: "6px 12px", background: "#dbeafe", color: "#1e40af", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "500", fontSize: "12px" }}
                        >
                          Aceptar
                        </button>
                        <button
                          onClick={() => changeStatus(o.id, "terminado")}
                          style={{ padding: "6px 12px", background: "#e0e7ff", color: "#4338ca", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "500", fontSize: "12px" }}
                        >
                          Terminado
                        </button>
                        <button
                          onClick={() => changeStatus(o.id, "enviado")}
                          style={{ padding: "6px 12px", background: "#fef3c7", color: "#d97706", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "500", fontSize: "12px" }}
                        >
                          Enviado
                        </button>
                        <button
                          onClick={() => changeStatus(o.id, "completado")}
                          style={{ padding: "6px 12px", background: "#f0fdf4", color: "#16a34a", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "500", fontSize: "12px" }}
                        >
                          Completado
                        </button>
                        <button
                          onClick={() => changeStatus(o.id, "cancelado")}
                          style={{ padding: "6px 12px", background: "#fef2f2", color: "#dc2626", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "500", fontSize: "12px" }}
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}


        {/* TAB: PEDIDOS PERSONALIZADOS */}
        {tab === "personalizados" && (
          <div>
            <h2 style={{ fontSize: "22px", fontWeight: "600", marginBottom: "20px" }}>Pedidos Personalizados</h2>
            {customOrders.length === 0 ? (
              <div style={{ padding: "60px", textAlign: "center", color: "#a0aec0", background: "white", borderRadius: "12px" }}>
                No hay pedidos personalizados
              </div>
            ) : (
              <div style={{ display: "grid", gap: "20px" }}>
                {customOrders.map((o) => (
                  <div
                    key={o.id}
                    style={{
                      background: "white",
                      padding: "24px",
                      borderRadius: "12px",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                      border: "1px solid #e2e8f0",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "16px" }}>
                      <div>
                        <div style={{ fontSize: "18px", fontWeight: "600", color: "#1a202c", marginBottom: "8px" }}>
                          Pedido Personalizado #{o.id}
                        </div>
                        <div style={{ fontSize: "14px", color: "#718096" }}>
                          {o.contacto?.email}
                        </div>
                      </div>
                      <div style={{
                        padding: "6px 14px",
                        background: o.estado === "completado" ? "#f0fdf4" :
                                   o.estado === "cancelado" ? "#fef2f2" : "#fef3c7",
                        color: o.estado === "completado" ? "#16a34a" :
                               o.estado === "cancelado" ? "#dc2626" : "#d97706",
                        borderRadius: "6px",
                        fontSize: "13px",
                        fontWeight: "600"
                      }}>
                        {o.estado}
                      </div>
                    </div>


                    <div style={{ marginBottom: "16px" }}>
                      <div style={{ fontSize: "14px", fontWeight: "600", marginBottom: "8px", color: "#2d3748" }}>Descripción:</div>
                      <div style={{ padding: "12px", background: "#f7fafc", borderRadius: "6px", fontSize: "14px", color: "#4a5568" }}>
                        {o.descripcion}
                      </div>
                    </div>


                    <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", paddingTop: "16px", borderTop: "2px solid #e2e8f0", flexWrap: "wrap" }}>
                      <button
                        onClick={() => changeStatus(o.id, "aceptado")}
                        style={{ padding: "6px 12px", background: "#dbeafe", color: "#1e40af", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "500", fontSize: "12px" }}
                      >
                        Aceptar
                      </button>
                      <button
                        onClick={() => changeStatus(o.id, "terminado")}
                        style={{ padding: "6px 12px", background: "#e0e7ff", color: "#4338ca", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "500", fontSize: "12px" }}
                      >
                        Terminado
                      </button>
                      <button
                        onClick={() => changeStatus(o.id, "enviado")}
                        style={{ padding: "6px 12px", background: "#fef3c7", color: "#d97706", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "500", fontSize: "12px" }}
                      >
                        Enviado
                      </button>
                      <button
                        onClick={() => changeStatus(o.id, "completado")}
                        style={{ padding: "6px 12px", background: "#f0fdf4", color: "#16a34a", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "500", fontSize: "12px" }}
                      >
                        Completado
                      </button>
                      <button
                        onClick={() => changeStatus(o.id, "cancelado")}
                        style={{ padding: "6px 12px", background: "#fef2f2", color: "#dc2626", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "500", fontSize: "12px" }}
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>


      {/* MODAL DE CREACIÓN DE PRODUCTO */}
      {showModal && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0, 0, 0, 0.5)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 1000,
        }}>
          <div style={{
            background: "white",
            padding: "30px",
            borderRadius: "16px",
            width: "90%",
            maxWidth: "600px",
            maxHeight: "90vh",
            overflow: "auto",
            boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
              <h2 style={{ fontSize: "24px", fontWeight: "700", color: "#1a202c", margin: 0 }}>Crear Producto</h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  setError("");
                }}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "28px",
                  cursor: "pointer",
                  color: "#a0aec0",
                  lineHeight: "1",
                }}
              >
                ×
              </button>
            </div>


            {error && (
              <div style={{
                padding: "12px 16px",
                background: "#fef2f2",
                color: "#dc2626",
                borderRadius: "8px",
                marginBottom: "20px",
                fontSize: "14px",
                border: "1px solid #fecaca",
              }}>
                {error}
              </div>
            )}


            <form onSubmit={handleSubmit}>
              <div style={{ display: "grid", gap: "20px" }}>
                {/* Nombre */}
                <div>
                  <label style={{ display: "block", marginBottom: "8px", fontSize: "13px", fontWeight: "500", color: "#475569" }}>
                    Nombre *
                  </label>
                  <input
                    type="text"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    required
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      border: "1px solid #e2e8f0",
                      borderRadius: "8px",
                      fontSize: "14px",
                      boxSizing: "border-box",
                      outline: "none",
                    }}
                  />
                </div>


                {/* Descripción */}
                <div>
                  <label style={{ display: "block", marginBottom: "8px", fontSize: "13px", fontWeight: "500", color: "#475569" }}>
                    Descripción *
                  </label>
                  <textarea
                    name="descripcion"
                    value={formData.descripcion}
                    onChange={handleChange}
                    required
                    rows="3"
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      border: "1px solid #e2e8f0",
                      borderRadius: "8px",
                      fontSize: "14px",
                      boxSizing: "border-box",
                      outline: "none",
                      fontFamily: "inherit",
                      resize: "vertical",
                    }}
                  />
                </div>


                {/* ✅ CATEGORÍA CON SLUGS */}
                <div>
                  <label style={{ display: "block", marginBottom: "8px", fontSize: "13px", fontWeight: "500", color: "#475569" }}>
                    Categoría
                  </label>
                  <select
                    name="categoria"
                    value={formData.categoria}
                    onChange={handleChange}
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      border: "1px solid #e2e8f0",
                      borderRadius: "8px",
                      fontSize: "14px",
                      boxSizing: "border-box",
                      outline: "none",
                      cursor: "pointer",
                      backgroundColor: "white"
                    }}
                  >
                    <option value="">-- Seleccionar --</option>
                    <option value="origami-3d">Origami 3D</option>
                    <option value="filigrana">Filigrana</option>
                    <option value="tradicional-pliegues">Tradicional/Pliegues</option>
                  </select>
                </div>


                {/* Grid de 2 columnas */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                  {/* Precio */}
                  <div>
                    <label style={{ display: "block", marginBottom: "8px", fontSize: "13px", fontWeight: "500", color: "#475569" }}>
                      Precio *
                    </label>
                    <input
                      type="number"
                      name="precio"
                      value={formData.precio}
                      onChange={handleChange}
                      required
                      min="0"
                      step="0.01"
                      style={{
                        width: "100%",
                        padding: "10px 14px",
                        border: "1px solid #e2e8f0",
                        borderRadius: "8px",
                        fontSize: "14px",
                        boxSizing: "border-box",
                        outline: "none",
                      }}
                    />
                  </div>


                  {/* Stock */}
                  <div>
                    <label style={{ display: "block", marginBottom: "8px", fontSize: "13px", fontWeight: "500", color: "#475569" }}>
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
                        padding: "10px 14px",
                        border: "1px solid #e2e8f0",
                        borderRadius: "8px",
                        fontSize: "14px",
                        boxSizing: "border-box",
                        outline: "none",
                      }}
                    />
                  </div>
                </div>


                {/* Color, Tamaño, Material */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
                  <div>
                    <label style={{ display: "block", marginBottom: "8px", fontSize: "13px", fontWeight: "500", color: "#475569" }}>
                      Color
                    </label>
                    <input
                      type="text"
                      name="color"
                      value={formData.color}
                      onChange={handleChange}
                      style={{
                        width: "100%",
                        padding: "10px 14px",
                        border: "1px solid #e2e8f0",
                        borderRadius: "8px",
                        fontSize: "14px",
                        boxSizing: "border-box",
                        outline: "none",
                      }}
                    />
                  </div>


                  <div>
                    <label style={{ display: "block", marginBottom: "8px", fontSize: "13px", fontWeight: "500", color: "#475569" }}>
                      Tamaño
                    </label>
                    <input
                      type="text"
                      name="tamano"
                      value={formData.tamano}
                      onChange={handleChange}
                      style={{
                        width: "100%",
                        padding: "10px 14px",
                        border: "1px solid #e2e8f0",
                        borderRadius: "8px",
                        fontSize: "14px",
                        boxSizing: "border-box",
                        outline: "none",
                      }}
                    />
                  </div>


                  <div>
                    <label style={{ display: "block", marginBottom: "8px", fontSize: "13px", fontWeight: "500", color: "#475569" }}>
                      Material
                    </label>
                    <input
                      type="text"
                      name="material"
                      value={formData.material}
                      onChange={handleChange}
                      style={{
                        width: "100%",
                        padding: "10px 14px",
                        border: "1px solid #e2e8f0",
                        borderRadius: "8px",
                        fontSize: "14px",
                        boxSizing: "border-box",
                        outline: "none",
                      }}
                    />
                  </div>
                </div>


                {/* Imagen */}
                <div>
                  <label style={{ display: "block", marginBottom: "8px", fontSize: "13px", fontWeight: "500", color: "#475569" }}>
                    Imagen del Producto
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      border: "1px solid #e2e8f0",
                      borderRadius: "8px",
                      fontSize: "14px",
                      boxSizing: "border-box",
                      cursor: "pointer",
                    }}
                  />
                  {imagePreview && (
                    <div style={{ marginTop: "12px", textAlign: "center" }}>
                      <img
                        src={imagePreview}
                        alt="Vista previa"
                        style={{
                          maxWidth: "100%",
                          maxHeight: "200px",
                          borderRadius: "8px",
                          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                        }}
                      />
                    </div>
                  )}
                </div>


                {/* Activo */}
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <input
                    type="checkbox"
                    name="activo"
                    checked={formData.activo}
                    onChange={handleChange}
                    id="activo-checkbox"
                    style={{ width: "18px", height: "18px", cursor: "pointer" }}
                  />
                  <label htmlFor="activo-checkbox" style={{ fontSize: "14px", fontWeight: "500", color: "#475569", cursor: "pointer" }}>
                    Producto activo
                  </label>
                </div>
              </div>


              {/* Botones */}
              <div style={{ display: "flex", gap: "12px", marginTop: "30px" }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setError("");
                  }}
                  style={{
                    flex: 1,
                    padding: "12px",
                    background: "#e2e8f0",
                    color: "#475569",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontWeight: "600",
                    fontSize: "15px",
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    flex: 1,
                    padding: "12px",
                    background: loading ? "#cbd5e1" : "#1a202c",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    cursor: loading ? "not-allowed" : "pointer",
                    fontWeight: "600",
                    fontSize: "15px",
                  }}
                >
                  {loading ? "Creando..." : "Crear Producto"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
