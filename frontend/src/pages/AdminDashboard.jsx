import { useEffect, useState } from "react";
import { apiAllOrders, apiUpdateOrderStatus, apiGetProducts, apiCreateProduct } from "../api";
import { useNavigate } from "react-router-dom";

export default function AdminDashboard() {
  const navigate = useNavigate();

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
  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    categoria: "",
    precio: "",
    color: "",
    tamano: "",
    material: "",
    stock: "",
    activo: true
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (tab === "pedidos" || tab === "personalizados") {
      apiAllOrders().then((d) => setOrders(d || [])).catch((e) => console.error(e));
    }
  }, [tab]);

  useEffect(() => {
    if (tab === "productos") {
      loadProducts();
    }
  }, [tab]);

  const loadProducts = async () => {
    try {
      const r = await apiGetProducts();
      setProds(r || []); // ✅ CAMBIO AQUÍ: Quitar .data
    } catch (err) {
      console.error("Error al cargar productos:", err);
    }
  };

  const handleFileChange = (e) => {
    const f = e.target.files && e.target.files[0] ? e.target.files[0] : null;

    setImageFile(f);
    if (!f) {
      setImagePreview("");
      return;
    }
    const fr = new FileReader();
    fr.onload = () => setImagePreview(String(fr.result));
    fr.readAsDataURL(f);
  };

  const resetForm = () => {
    setFormData({
      nombre: "",
      descripcion: "",
      categoria: "",
      precio: "",
      color: "",
      tamano: "",
      material: "",
      stock: "",
      activo: true
    });
    setImageFile(null);
    setImagePreview("");
    setError("");
  };

  const handleSubmit = async () => {
  setError("");
  
  if (!formData.nombre || !formData.descripcion || !formData.precio || !formData.stock) {
    setError("Por favor completa todos los campos obligatorios");
    return;
  }

  setLoading(true);

  try {
    if (imageFile && imageFile instanceof File && imageFile.size > 0) {
      const fd = new FormData();
      fd.append("nombre", formData.nombre);
      fd.append("descripcion", formData.descripcion);
      if (formData.categoria) fd.append("categoria", formData.categoria);
      fd.append("precio", String(parseFloat(formData.precio)));
      if (formData.color) fd.append("color", formData.color);
      if (formData.tamano) fd.append("tamano", formData.tamano);
      if (formData.material) fd.append("material", formData.material);
      fd.append("stock", String(parseInt(formData.stock, 10)));
      fd.append("activo", formData.activo ? "true" : "false");
      fd.append("imagen", imageFile);

      console.log("📦 Enviando FormData con imagen");
      await apiCreateProduct(fd);
    } else {
      const productData = {
        nombre: formData.nombre,
        descripcion: formData.descripcion,
        categoria_slug: formData.categoria || null,
        precio: parseFloat(formData.precio),
        color: formData.color || null,
        tamano: formData.tamano || null,
        material: formData.material || null,
        imagen_url: null,
        stock: parseInt(formData.stock, 10),
        activo: formData.activo
      };

      console.log("📦 Enviando JSON sin imagen:", JSON.stringify(productData, null, 2));
      await apiCreateProduct(productData);
    }

    await loadProducts();
    resetForm();
    setShowModal(false);
    alert("Producto creado exitosamente");
  } catch (err) {
    console.error("Error al crear producto:", err);
    if (err.message === "Sesión expirada") {
      navigate("/login");
    } else {
      setError(err.message || "Error al crear producto. Por favor intenta de nuevo.");
    }
  } finally {
    setLoading(false);
  }
};

  const handleOpenModal = () => {
    resetForm();
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setError("");
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f5f6fa", padding: "20px" }}>
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: "15px",
        marginBottom: "30px",
        background: "white",
        padding: "15px 25px",
        borderRadius: "10px",
        boxShadow: "0 2px 4px rgba(0,0,0,0.05)"
      }}>
        <div style={{
          width: "40px",
          height: "40px",
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          borderRadius: "10px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          fontWeight: "bold"
        }}>O</div>
        <h2 style={{ margin: 0, fontSize: "18px" }}>Origami Arte</h2>
      </div>

      <h1 style={{ fontSize: "24px", marginBottom: "20px", color: "#2d3748" }}>
        Panel de Administración
      </h1>

      <div style={{
        display: "flex",
        gap: "10px",
        marginBottom: "25px",
        borderBottom: "2px solid #e2e8f0"
      }}>
        {[
          { id: "productos", label: "Productos" },
          { id: "pedidos", label: "Pedidos" },
          { id: "personalizados", label: "Pedidos Personalizados" },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              padding: "12px 24px",
              border: "none",
              background: "transparent",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: tab === t.id ? "600" : "400",
              color: tab === t.id ? "#667eea" : "#64748b",
              borderBottom: tab === t.id ? "3px solid #667eea" : "none",
              marginBottom: "-2px",
              transition: "all 0.2s"
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "productos" && (
        <div style={{ background: "white", borderRadius: "12px", padding: "25px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "25px"
          }}>
            <h3 style={{ margin: 0, fontSize: "18px", color: "#2d3748" }}>
              Stock de Productos
            </h3>
            <button
              onClick={handleOpenModal}
              style={{
                padding: "10px 20px",
                background: "#1a202c",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "500"
              }}
            >
              Agregar Producto
            </button>
          </div>

          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid #e2e8f0" }}>
                <th style={{ padding: "12px", textAlign: "left", fontSize: "13px", fontWeight: "600", color: "#64748b" }}>Producto</th>
                <th style={{ padding: "12px", textAlign: "left", fontSize: "13px", fontWeight: "600", color: "#64748b" }}>Descripción</th>
                <th style={{ padding: "12px", textAlign: "left", fontSize: "13px", fontWeight: "600", color: "#64748b" }}>Variante</th>
                <th style={{ padding: "12px", textAlign: "left", fontSize: "13px", fontWeight: "600", color: "#64748b" }}>Precio</th>
                <th style={{ padding: "12px", textAlign: "left", fontSize: "13px", fontWeight: "600", color: "#64748b" }}>Stock</th>
                <th style={{ padding: "12px", textAlign: "left", fontSize: "13px", fontWeight: "600", color: "#64748b" }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {prods.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ padding: "40px", textAlign: "center", color: "#94a3b8" }}>
                    No hay productos registrados
                  </td>
                </tr>
              ) : (
                prods.map((p) => (
                  <tr key={p.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td style={{ padding: "15px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        {p.imagen_url && (
                          <img
                            src={p.imagen_url}
                            alt={p.nombre}
                            onError={(e) => { e.target.style.display = 'none'; }}
                            style={{
                              width: "50px",
                              height: "50px",
                              objectFit: "cover",
                              borderRadius: "8px",
                              border: "1px solid #e2e8f0"
                            }}
                          />
                        )}
                        <span style={{ fontWeight: "500", fontSize: "14px", color: "#2d3748" }}>
                          {p.nombre}
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: "15px", fontSize: "13px", color: "#64748b", maxWidth: "200px" }}>
                      {p.descripcion?.substring(0, 50)}{p.descripcion?.length > 50 ? '...' : ''}
                    </td>
                    <td style={{ padding: "15px", fontSize: "13px", color: "#64748b" }}>
                      {p.color || p.tamano || "Normal"}
                    </td>
                    <td style={{ padding: "15px", fontSize: "14px", fontWeight: "600", color: "#2d3748" }}>
                      ${p.precio}
                    </td>
                    <td style={{ padding: "15px" }}>
                      <span style={{
                        padding: "4px 12px",
                        background: "#f0fdf4",
                        color: "#16a34a",
                        borderRadius: "6px",
                        fontSize: "12px",
                        fontWeight: "500"
                      }}>
                        {p.stock || 0} disponible
                      </span>
                    </td>
                    <td style={{ padding: "15px" }}>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button style={{
                          padding: "6px 12px",
                          background: "#f8fafc",
                          border: "1px solid #e2e8f0",
                          borderRadius: "6px",
                          cursor: "pointer",
                          fontSize: "12px"
                        }}>
                          ✏️
                        </button>
                        <button style={{
                          padding: "6px 12px",
                          background: "#fef2f2",
                          border: "1px solid #fecaca",
                          borderRadius: "6px",
                          cursor: "pointer",
                          fontSize: "12px",
                          color: "#dc2626"
                        }}>
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {(tab === "pedidos" || tab === "personalizados") && (
        <section>
          {orders
            .filter((o) => (tab === "personalizados" ? o.tipo === "personalizado" : true))
            .map((o) => (
              <div key={o.id} style={{
                background: "white",
                borderRadius: "12px",
                padding: "20px",
                marginBottom: "15px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.06)"
              }}>
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start"
                }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ margin: "0 0 5px 0", fontSize: "16px" }}>
                      Pedido #{o.id}
                    </h3>
                    <p style={{ margin: "0 0 5px 0", fontSize: "14px", color: "#64748b" }}>
                      {o.contacto?.email}
                    </p>
                    <p style={{ margin: "0 0 5px 0", fontSize: "14px", color: "#64748b" }}>
                      <strong>Nombre:</strong> {o.contacto?.nombre}
                    </p>
                    <p style={{ margin: "0 0 5px 0", fontSize: "14px", color: "#64748b" }}>
                      <strong>Teléfono:</strong> {o.contacto?.telefono}
                    </p>
                    <p style={{ margin: 0, fontSize: "13px", color: "#94a3b8" }}>
                      Estado: <strong>{o.estado}</strong>
                    </p>
                  </div>

                  <select
                    value={o.estado}
                    onChange={async (e) => {
                      const upd = await apiUpdateOrderStatus(o.id, e.target.value);
                      setOrders((prev) => prev.map((x) => (x.id === o.id ? upd : x)));
                    }}
                    style={{
                      padding: "8px 12px",
                      border: "1px solid #e2e8f0",
                      borderRadius: "8px",
                      fontSize: "14px"
                    }}
                  >
                    <option>Pendiente</option>
                    <option>En Proceso</option>
                    <option>Enviado</option>
                    <option>Entregado</option>
                    <option>Cancelado</option>
                  </select>
                </div>

                <div style={{
                  marginTop: "15px",
                  display: "flex",
                  gap: "20px",
                  alignItems: "flex-start"
                }}>
                  <div style={{ flex: 1 }}>
                    {o.descripcion && (
                      <p style={{
                        margin: "0 0 10px 0",
                        fontSize: "14px",
                        color: "#64748b",
                        lineHeight: "1.5"
                      }}>
                        <strong>Descripción:</strong> {o.descripcion}
                      </p>
                    )}
                  </div>

                  {o.imagen_referencia && (
                    <div style={{ flexShrink: 0, width: "200px" }}>
                      <img
                        src={o.imagen_referencia}
                        alt="Referencia del pedido"
                        style={{
                          width: "100%",
                          height: "auto",
                          borderRadius: "8px",
                          border: "1px solid #e2e8f0"
                        }}
                        onError={(e) => {
                          e.target.style.display = 'none';
                          console.error('Error cargando imagen');
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
        </section>
      )}

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
            zIndex: 9999
          }}
          onClick={handleCloseModal}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "white",
              borderRadius: "12px",
              width: "90%",
              maxWidth: "550px",
              maxHeight: "90vh",
              overflow: "auto",
              boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)",
              position: "relative"
            }}
          >
            <div style={{
              padding: "20px 25px",
              borderBottom: "1px solid #e2e8f0",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              position: "sticky",
              top: 0,
              background: "white",
              zIndex: 1
            }}>
              <h3 style={{ margin: 0, fontSize: "18px", color: "#2d3748" }}>
                Agregar Nuevo Producto
              </h3>
              <button
                onClick={handleCloseModal}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "24px",
                  cursor: "pointer",
                  color: "#94a3b8",
                  lineHeight: "1",
                  padding: "0 8px"
                }}
              >
                ×
              </button>
            </div>

            <div style={{ padding: "25px" }}>
              {error && (
                <div style={{
                  padding: "12px",
                  background: "#fee2e2",
                  border: "1px solid #fecaca",
                  borderRadius: "6px",
                  marginBottom: "15px",
                  color: "#dc2626",
                  fontSize: "14px"
                }}>
                  {error}
                </div>
              )}

              <div style={{ marginBottom: "18px" }}>
                <label style={{ display: "block", marginBottom: "8px", fontSize: "13px", fontWeight: "500", color: "#475569" }}>
                  Nombre del Producto *
                </label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  placeholder="Ej: Grulla de papel"
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                    fontSize: "14px",
                    boxSizing: "border-box",
                    outline: "none",
                    transition: "border-color 0.2s"
                  }}
                  onFocus={(e) => e.target.style.borderColor = "#667eea"}
                  onBlur={(e) => e.target.style.borderColor = "#e2e8f0"}
                />
              </div>

              <div style={{ marginBottom: "18px" }}>
                <label style={{ display: "block", marginBottom: "8px", fontSize: "13px", fontWeight: "500", color: "#475569" }}>
                  Descripción *
                </label>
                <textarea
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  rows="3"
                  placeholder="Describe el producto..."
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                    fontSize: "14px",
                    resize: "vertical",
                    boxSizing: "border-box",
                    fontFamily: "inherit",
                    outline: "none",
                    transition: "border-color 0.2s"
                  }}
                  onFocus={(e) => e.target.style.borderColor = "#667eea"}
                  onBlur={(e) => e.target.style.borderColor = "#e2e8f0"}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", marginBottom: "18px" }}>
                <div>
                  <label style={{ display: "block", marginBottom: "8px", fontSize: "13px", fontWeight: "500", color: "#475569" }}>
                    Categoría
                  </label>
                  <select
                    value={formData.categoria}
                    onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
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
                    <option value="Origami 3D">Origami 3D</option>
                    <option value="Grulla Tradicional">Grulla Tradicional</option>
                    <option value="Flores">Flores</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", marginBottom: "8px", fontSize: "13px", fontWeight: "500", color: "#475569" }}>
                    Precio *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.precio}
                    onChange={(e) => setFormData({ ...formData, precio: e.target.value })}
                    placeholder="0.00"
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      border: "1px solid #e2e8f0",
                      borderRadius: "8px",
                      fontSize: "14px",
                      boxSizing: "border-box",
                      outline: "none",
                      transition: "border-color 0.2s"
                    }}
                    onFocus={(e) => e.target.style.borderColor = "#667eea"}
                    onBlur={(e) => e.target.style.borderColor = "#e2e8f0"}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px", marginBottom: "18px" }}>
                <div>
                  <label style={{ display: "block", marginBottom: "8px", fontSize: "13px", fontWeight: "500", color: "#475569" }}>
                    Color
                  </label>
                  <input
                    type="text"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    placeholder="Ej: Rojo"
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      border: "1px solid #e2e8f0",
                      borderRadius: "8px",
                      fontSize: "14px",
                      boxSizing: "border-box",
                      outline: "none",
                      transition: "border-color 0.2s"
                    }}
                    onFocus={(e) => e.target.style.borderColor = "#667eea"}
                    onBlur={(e) => e.target.style.borderColor = "#e2e8f0"}
                  />
                </div>

                <div>
                  <label style={{ display: "block", marginBottom: "8px", fontSize: "13px", fontWeight: "500", color: "#475569" }}>
                    Tamaño
                  </label>
                  <input
                    type="text"
                    value={formData.tamano}
                    onChange={(e) => setFormData({ ...formData, tamano: e.target.value })}
                    placeholder="Ej: Grande"
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      border: "1px solid #e2e8f0",
                      borderRadius: "8px",
                      fontSize: "14px",
                      boxSizing: "border-box",
                      outline: "none",
                      transition: "border-color 0.2s"
                    }}
                    onFocus={(e) => e.target.style.borderColor = "#667eea"}
                    onBlur={(e) => e.target.style.borderColor = "#e2e8f0"}
                  />
                </div>

                <div>
                  <label style={{ display: "block", marginBottom: "8px", fontSize: "13px", fontWeight: "500", color: "#475569" }}>
                    Stock *
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    placeholder="0"
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      border: "1px solid #e2e8f0",
                      borderRadius: "8px",
                      fontSize: "14px",
                      boxSizing: "border-box",
                      outline: "none",
                      transition: "border-color 0.2s"
                    }}
                    onFocus={(e) => e.target.style.borderColor = "#667eea"}
                    onBlur={(e) => e.target.style.borderColor = "#e2e8f0"}
                  />
                </div>
              </div>

              <div style={{ marginBottom: "18px" }}>
                <label style={{ display: "block", marginBottom: "8px", fontSize: "13px", fontWeight: "500", color: "#475569" }}>
                  Material
                </label>
                <input
                  type="text"
                  value={formData.material}
                  onChange={(e) => setFormData({ ...formData, material: e.target.value })}
                  placeholder="Ej: Papel plegado"
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                    fontSize: "14px",
                    boxSizing: "border-box",
                    outline: "none",
                    transition: "border-color 0.2s"
                  }}
                />
              </div>

              <div style={{ marginBottom: "24px" }}>
                <label style={{ display: "block", marginBottom: "8px", fontSize: "13px", fontWeight: "500", color: "#475569" }}>
                  Imagen del producto (opcional)
                </label>
                <input type="file" accept="image/*" onChange={handleFileChange} style={{ display: "block" }} />
                {imagePreview && (
                  <div style={{ marginTop: "10px" }}>
                    <img src={imagePreview} alt="Preview" style={{ maxWidth: "160px", maxHeight: "160px", borderRadius: "8px", border: "1px solid #e2e8f0", objectFit: "cover" }} onError={(e) => { e.target.style.display = 'none'; }} />
                  </div>
                )}
              </div>

              <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end", paddingTop: "8px" }}>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={loading}
                  style={{
                    padding: "11px 28px",
                    background: "white",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                    cursor: loading ? "not-allowed" : "pointer",
                    fontSize: "14px",
                    fontWeight: "500",
                    color: "#475569",
                    opacity: loading ? 0.5 : 1,
                    transition: "all 0.2s"
                  }}
                  onMouseEnter={(e) => { if (!loading) { e.target.style.background = "#f8fafc"; e.target.style.borderColor = "#cbd5e1"; } }}
                  onMouseLeave={(e) => { if (!loading) { e.target.style.background = "white"; e.target.style.borderColor = "#e2e8f0"; } }}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading}
                  style={{
                    padding: "11px 28px",
                    background: loading ? "#94a3b8" : "#1a202c",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    cursor: loading ? "not-allowed" : "pointer",
                    fontSize: "14px",
                    fontWeight: "500",
                    transition: "all 0.2s"
                  }}
                  onMouseEnter={(e) => { if (!loading) e.target.style.background = "#2d3748"; }}
                  onMouseLeave={(e) => { if (!loading) e.target.style.background = "#1a202c"; }}
                >
                  {loading ? "Creando..." : "Agregar Producto"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
