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
              background: "white",
              boxShadow: "0 2px 4px rgba(0,0,0,0.08)"
            }}
          >
            {/* Header del pedido */}
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem" }}>
              <div>
                <h3 style={{ margin: "0 0 0.5rem 0" }}>Pedido #{order.id}</h3>
                <p style={{ margin: "0 0 0.25rem 0", fontSize: "0.9rem", color: "#666" }}>
                  Tipo: <strong>{order.tipo === "personalizado" ? "Personalizado 🎨" : "Estándar"}</strong>
                </p>
                <p style={{ margin: 0, fontSize: "0.9rem" }}>
                  Estado: 
                  <span style={{
                    marginLeft: "0.5rem",
                    padding: "0.25rem 0.75rem",
                    borderRadius: "12px",
                    fontSize: "0.85rem",
                    fontWeight: "600",
                    backgroundColor: 
                      order.estado === "completado" ? "#d4edda" :
                      order.estado === "en_proceso" ? "#fff3cd" :
                      order.estado === "cancelado" ? "#f8d7da" :
                      "#d1ecf1",
                    color:
                      order.estado === "completado" ? "#155724" :
                      order.estado === "en_proceso" ? "#856404" :
                      order.estado === "cancelado" ? "#721c24" :
                      "#0c5460"
                  }}>
                    {order.estado === "en_proceso" ? "En Proceso" : 
                     order.estado === "completado" ? "Completado" :
                     order.estado === "cancelado" ? "Cancelado" :
                     order.estado.charAt(0).toUpperCase() + order.estado.slice(1)}
                  </span>
                </p>
              </div>

              {/* Precio (muestra precio personalizado si existe, sino total) */}
              {(order.precio_personalizado || order.total) && (
                <div style={{ textAlign: "right" }}>
                  <p style={{ margin: 0, fontSize: "1.3rem", fontWeight: "700", color: "#28a745" }}>
                    ${order.precio_personalizado || order.total}
                  </p>
                </div>
              )}
            </div>

            {/* Información específica de pedido personalizado */}
            {order.tipo === "personalizado" && (
              <div style={{ 
                borderTop: "1px solid #eee", 
                paddingTop: "1rem",
                marginTop: "1rem" 
              }}>
                {/* Nombre del producto personalizado */}
                {order.nombre_personalizado && (
                  <div style={{ marginBottom: "0.75rem" }}>
                    <strong style={{ color: "#333", fontSize: "0.95rem" }}>📝 Nombre del producto:</strong>
                    <p style={{ margin: "0.25rem 0 0 0", fontSize: "1.05rem", fontWeight: "500" }}>
                      {order.nombre_personalizado}
                    </p>
                  </div>
                )}

                {/* Descripción del pedido */}
                {order.descripcion && (
                  <div style={{ marginBottom: "0.75rem" }}>
                    <strong style={{ color: "#333", fontSize: "0.95rem" }}>📄 Descripción:</strong>
                    <p style={{ 
                      margin: "0.25rem 0 0 0", 
                      fontSize: "0.9rem",
                      color: "#555",
                      lineHeight: "1.5"
                    }}>
                      {order.descripcion}
                    </p>
                  </div>
                )}

                {/* Imagen de referencia */}
                {order.imagen_referencia && (
                  <div style={{ marginBottom: "0.75rem" }}>
                    <strong style={{ color: "#333", fontSize: "0.95rem" }}>🖼️ Imagen de referencia:</strong>
                    <div style={{ marginTop: "0.5rem" }}>
                      <img 
                        src={order.imagen_referencia} 
                        alt="Referencia del pedido"
                        style={{
                          maxWidth: "100%",
                          maxHeight: "300px",
                          borderRadius: "8px",
                          border: "1px solid #ddd",
                          objectFit: "contain"
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Comentario del vendedor */}
                {order.comentario_vendedor && (
                  <div style={{ 
                    marginTop: "1rem",
                    padding: "0.75rem 1rem",
                    backgroundColor: "#e7f3ff",
                    borderLeft: "4px solid #2196F3",
                    borderRadius: "4px"
                  }}>
                    <strong style={{ color: "#1976D2", fontSize: "0.95rem" }}>💬 Comentario del vendedor:</strong>
                    <p style={{ margin: "0.5rem 0 0 0", fontSize: "0.9rem", color: "#333" }}>
                      {order.comentario_vendedor}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Items de pedidos estándar */}
            {order.tipo !== "personalizado" && order.items && order.items.length > 0 && (
              <div style={{ borderTop: "1px solid #eee", paddingTop: "1rem" }}>
                <h4 style={{ margin: "0 0 0.5rem 0", fontSize: "0.95rem" }}>Productos:</h4>
                {order.items.map((item, idx) => (
                  <div key={idx} style={{ fontSize: "0.9rem", color: "#555", marginBottom: "0.25rem" }}>
                    • {item.producto_nombre} x{item.cantidad} - ${item.precio_unitario}
                  </div>
                ))}
              </div>
            )}

            {/* Información de contacto (siempre al final) */}
            {order.contacto && (
              <div style={{ 
                marginTop: "1rem",
                paddingTop: "1rem",
                borderTop: "1px solid #eee",
                fontSize: "0.85rem",
                color: "#666"
              }}>
                <strong>Contacto:</strong> {order.contacto.email}
                {order.contacto.telefono && ` • ${order.contacto.telefono}`}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}
