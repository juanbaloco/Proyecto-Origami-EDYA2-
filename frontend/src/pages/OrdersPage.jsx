import { useEffect, useState } from "react";
import { apiMyOrders } from "../api";

export default function OrdersPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    apiMyOrders()
      .then(setData)
      .catch((err) => console.error("Error al cargar pedidos:", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ padding: "2rem" }}>Cargando...</div>;

  return (
    <div style={{ padding: "2rem", maxWidth: "1000px", margin: "0 auto" }}>
      <h1 style={{ marginBottom: "2rem" }}>📦 Mis Pedidos</h1>

      {data.length === 0 ? (
        <p style={{ textAlign: "center", color: "#999", padding: "3rem" }}>
          No tienes pedidos aún
        </p>
      ) : (
        data.map((order) => (
          <div
            key={order.id}
            style={{
              border: "1px solid #ddd",
              borderRadius: "12px",
              padding: "1.5rem",
              marginBottom: "1.5rem",
              background: "white"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem" }}>
              <div>
                <h3 style={{ margin: "0 0 0.5rem 0" }}>Pedido #{order.id}</h3>
                <p style={{ margin: 0, fontSize: "0.9rem", color: "#666" }}>
                  Estado: <strong>{order.estado}</strong>
                </p>
              </div>
              <div style={{ textAlign: "right" }}>
                <p style={{ margin: 0, fontSize: "1.2rem", fontWeight: "600" }}>
                  ${order.total}
                </p>
              </div>
            </div>

            {order.items && order.items.length > 0 && (
              <div style={{ borderTop: "1px solid #eee", paddingTop: "1rem" }}>
                <h4 style={{ margin: "0 0 0.5rem 0", fontSize: "0.95rem" }}>Productos:</h4>
                {order.items.map((item, idx) => (
                  <div key={idx} style={{ fontSize: "0.9rem", color: "#555", marginBottom: "0.25rem" }}>
                    • {item.producto_nombre} x{item.cantidad} - ${item.precio_unitario}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}
