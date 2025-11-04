import { useEffect, useState } from "react";
import { apiAllOrders, apiUpdateOrderStatus, apiGetProducts } from "../api";
import { useNavigate } from "react-router-dom";

export default function AdminDashboard() {
  const [tab, setTab] = useState("productos");
  const [orders, setOrders] = useState([]);
  const [prods, setProds] = useState([]);
  const nav = useNavigate();

  useEffect(() => {
    if (tab === "pedidos" || tab === "personalizados") {
      apiAllOrders().then((d) => setOrders(d));
    }
  }, [tab]);

  useEffect(() => {
    if (tab === "productos") {
      apiGetProducts().then((r) => setProds(r.data));
    }
  }, [tab]);

  return (
    <div style={{ minHeight: "100vh", background: "#f5f6fa", padding: "20px" }}>
      {/* Header limpio sin menú */}
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

      {/* Tabs */}
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

      {/* Vista de productos */}
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
              onClick={() => nav("/admin/products/new")}
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

          {/* Tabla de productos */}
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
                        <img
                          src={p.imagen_url || "https://via.placeholder.com/50"}
                          alt={p.nombre}
                          style={{
                            width: "50px",
                            height: "50px",
                            objectFit: "cover",
                            borderRadius: "8px",
                            border: "1px solid #e2e8f0"
                          }}
                        />
                        <span style={{ fontWeight: "500", fontSize: "14px", color: "#2d3748" }}>
                          {p.nombre}
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: "15px", fontSize: "13px", color: "#64748b", maxWidth: "200px" }}>
                      {p.descripcion?.substring(0, 50)}...
                    </td>
                    <td style={{ padding: "15px", fontSize: "13px", color: "#64748b" }}>
                      {p.variante || "Normal"}
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

      {/* Vista de pedidos */}
      {(tab === "pedidos" || tab === "personalizados") && (
        <section>
          {orders
            .filter((o) =>
              tab === "personalizados" ? o.tipo === "personalizado" : true
            )
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
                  alignItems: "center"
                }}>
                  <div>
                    <h3 style={{ margin: "0 0 5px 0", fontSize: "16px" }}>
                      Pedido #{o.id}
                    </h3>
                    <p style={{ margin: "0 0 5px 0", fontSize: "14px", color: "#64748b" }}>
                      {o.contacto.email}
                    </p>
                    <p style={{ margin: 0, fontSize: "13px", color: "#94a3b8" }}>
                      Estado: <strong>{o.estado}</strong>
                    </p>
                  </div>

                  <select
                    value={o.estado}
                    onChange={async (e) => {
                      const upd = await apiUpdateOrderStatus(o.id, e.target.value);
                      setOrders((prev) =>
                        prev.map((x) => (x.id === o.id ? upd : x))
                      );
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

                {o.descripcion && (
                  <p style={{ marginTop: "12px", fontSize: "13px", color: "#64748b" }}>
                    <strong>Descripción:</strong> {o.descripcion}
                  </p>
                )}
              </div>
            ))}
        </section>
      )}
    </div>
  );
}
