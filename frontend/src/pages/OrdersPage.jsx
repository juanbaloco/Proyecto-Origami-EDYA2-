import { useEffect, useState } from "react";
import { apiMyOrders } from "../api";

export default function OrdersPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const BASE_URL = "http://localhost:8000";

  useEffect(() => {
    setLoading(true);
    apiMyOrders()
      .then(setData)
      .catch((err) => console.error("Error al cargar pedidos:", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Cargando...</div>;

  return (
    <div style={{ maxWidth: "900px", margin: "auto", padding: "1rem" }}>
      <h1 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>📦 Mis Pedidos</h1>

      {data.length === 0 ? (
        <p>No tienes pedidos aún</p>
      ) : (
        data.map((order) => {
          const pedidoId = order.pedido_id || "unknown";
          const shortId = pedidoId.length > 8 ? pedidoId.substring(0, 8) + "..." : pedidoId;

          // Título del pedido
          let titulo = "";
          if (order.tipo === "personalizado") {
            titulo = "Pedido Personalizado";
          } else if (order.items && order.items.length > 0) {
            titulo = order.items.map(item => {
              const qty = item.cantidad > 1 ? ` x${item.cantidad}` : "";
              return `${item.nombre || "Producto"}${qty}`;
            }).join(", ");
          } else {
            titulo = `Pedido #${shortId}`;
          }

          return (
            <div
              key={pedidoId}
              style={{
                border: "1px solid #ddd",
                borderRadius: "8px",
                padding: "1rem",
                marginBottom: "1.5rem",
                background: "#fff",
                position: "relative"
              }}
            >
              {/* TÍTULO */}
              <h3 style={{
                fontSize: "1.1rem",
                marginBottom: "0.5rem",
                paddingRight: "120px"
              }}>
                {titulo}
              </h3>

              {/* TOTAL - Esquina superior derecha */}
              <div style={{
                position: "absolute",
                top: "1rem",
                right: "1rem",
                fontSize: "1.25rem",
                fontWeight: "bold",
                color: "#48bb78"
              }}>
                ${order.precio_personalizado || order.total || 0}
              </div>

              {/* TIPO */}
              <p style={{ margin: "0.25rem 0" }}>
                <strong>Tipo:</strong>{" "}
                <span style={{
                  background: order.tipo === "personalizado" ? "#e0e7ff" : "#e0f2fe",
                  padding: "0.25rem 0.5rem",
                  borderRadius: "4px",
                  fontSize: "0.9rem"
                }}>
                  {order.tipo === "personalizado" ? "Personalizado 🎨" : "Estándar"}
                </span>
              </p>

              {/* ESTADO */}
              <p style={{ margin: "0.25rem 0" }}>
                <strong>Estado:</strong>{" "}
                <span style={{
                  background: 
                    order.estado === "pendiente" ? "#fef3c7" :
                    order.estado === "en_proceso" ? "#fed7aa" :
                    order.estado === "completado" ? "#d1fae5" :
                    order.estado === "cancelado" ? "#fee2e2" : "#f3f4f6",
                  padding: "0.25rem 0.5rem",
                  borderRadius: "4px",
                  fontSize: "0.9rem",
                  color:
                    order.estado === "completado" ? "#065f46" :
                    order.estado === "cancelado" ? "#991b1b" : "#000"
                }}>
                  {order.estado === "en_proceso" ? "En Proceso" :
                   order.estado === "completado" ? "Completado" :
                   order.estado === "cancelado" ? "Cancelado" :
                   order.estado.charAt(0).toUpperCase() + order.estado.slice(1)}
                </span>
              </p>

              {/* Motivo de cancelación */}
              {order.estado === "cancelado" && order.comentario_cancelacion && (
                <div style={{
                  marginTop: "0.75rem",
                  padding: "0.75rem",
                  background: "#fef3c7",
                  borderRadius: "6px",
                  border: "1px solid #fde047"
                }}>
                  <strong>Motivo de cancelación:</strong> {order.comentario_cancelacion}
                </div>
              )}

              {/* ✅ PRODUCTOS CON IMÁGENES (para pedidos estándar) */}
              {order.tipo === "estandar" && order.items && order.items.length > 0 && (
                <div style={{ marginTop: "0.75rem" }}>
                  <strong>Productos:</strong>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginTop: "0.5rem" }}>
                    {order.items.map((item, idx) => (
                      <div key={idx} style={{
                        display: "flex",
                        gap: "1rem",
                        padding: "0.75rem",
                        background: "#f9fafb",
                        borderRadius: "6px",
                        alignItems: "center"
                      }}>
                        {/* ✅ IMAGEN DEL PRODUCTO */}
                        {item.imagen_url && (
                          <img
                            src={item.imagen_url.startsWith('http') ? item.imagen_url : `${BASE_URL}${item.imagen_url}`}
                            alt={item.nombre}
                            style={{
                              width: "80px",
                              height: "80px",
                              objectFit: "cover",
                              borderRadius: "6px",
                              border: "1px solid #ddd"
                            }}
                          />
                        )}
                        {/* INFORMACIÓN DEL PRODUCTO */}
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: "600", marginBottom: "0.25rem" }}>
                            {item.nombre || "Producto"}
                          </div>
                          <div style={{ fontSize: "0.9rem", color: "#666" }}>
                            Cantidad: {item.cantidad} | Precio: ${item.precio}
                          </div>
                        </div>
                        {/* SUBTOTAL */}
                        <div style={{ fontWeight: "600", color: "#48bb78" }}>
                          ${(item.cantidad * item.precio).toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* DETALLES DE PEDIDO PERSONALIZADO */}
              {order.tipo === "personalizado" && (
                <div style={{ marginTop: "1rem" }}>
                  {order.nombre_personalizado && (
                    <div style={{ marginTop: "0.75rem" }}>
                      <strong>Nombre:</strong> {order.nombre_personalizado}
                    </div>
                  )}

                  {order.descripcion && (
                    <div style={{ marginTop: "0.5rem" }}>
                      <strong>Descripción:</strong> {order.descripcion}
                    </div>
                  )}

                  {/* ✅ Imagen de referencia */}
                  {order.imagen_referencia && (
                    <div style={{ marginTop: "0.75rem" }}>
                      <strong style={{ display: "block", marginBottom: "0.5rem" }}>
                        Imagen de referencia:
                      </strong>
                      <img
                        src={order.imagen_referencia}
                        alt="Referencia"
                        style={{
                          maxWidth: "200px",
                          borderRadius: "8px",
                          border: "1px solid #ddd"
                        }}
                      />
                    </div>
                  )}

                  {order.comentario_vendedor && (
                    <div style={{
                      marginTop: "0.75rem",
                      padding: "0.75rem",
                      background: "#e7f3e7",
                      borderRadius: "6px",
                      border: "1px solid #b7e4b7"
                    }}>
                      <strong>Comentario del vendedor:</strong> {order.comentario_vendedor}
                    </div>
                  )}
                </div>
              )}

              {/* Información de contacto */}
              {order.contacto && (
                <div style={{
                  marginTop: "0.75rem",
                  fontSize: "0.85rem",
                  color: "#666"
                }}>
                  <strong>Contacto:</strong> {order.contacto.email || ""} - {order.contacto.telefono || ""}
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}