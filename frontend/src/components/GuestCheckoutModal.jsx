import { useState, useContext } from "react";
import { CartContext } from "../contexts/CartContext";
import { apiCreateGuestOrder } from "../api";

export default function GuestCheckoutModal({ open, setOpen }) {
  const { items, total, clear } = useContext(CartContext);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  
  const [form, setForm] = useState({
    nombreCompleto: "",
    email: "",
    telefono: "",
    direccion: "",
  });
  
  const [metodoPago, setMetodoPago] = useState("nequi");

  // ✅ Métodos de pago idénticos al CheckoutModal
  const metodosPago = [
    { value: "nequi", label: "Transferencia Nequi" },
    { value: "contraentrega", label: "Contraentrega" }
  ];

  // ✅ Información de pago idéntica al CheckoutModal
  const paymentInfo = {
    nequi: {
      title: "📱 Instrucciones para Transferencia Nequi",
      details: [
        { label: "Nombre:", value: "Juan José Baloco" },
        { label: "Número de cuenta:", value: "305 408 1669" },
        { label: "WhatsApp para enviar comprobante:", value: "+57 305 4081669" }
      ],
      note: "⚠️ Después de realizar la transferencia, envía el comprobante al WhatsApp indicado con tu nombre completo."
    }
  };

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError("");

    // Validaciones
    if (!form.nombreCompleto || !form.email || !form.telefono || !form.direccion) {
      setError("Todos los campos son obligatorios");
      return;
    }

    if (!/^\S+@\S+\.\S+$/.test(form.email)) {
      setError("Email inválido");
      return;
    }

    if (!/^\d{10,}$/.test(form.telefono.replace(/\D/g, ""))) {
      setError("Número de teléfono inválido (mínimo 10 dígitos)");
      return;
    }

    setSending(true);

    try {
      const orderData = {
        contacto: {
          nombre: form.nombreCompleto,
          email: form.email,
          telefono: form.telefono
        },
        direccion: form.direccion,
        metodoPago: metodoPago,
        items: items.map((item) => ({
          producto_id: item.producto_id,
          cantidad: item.cantidad
        }))
      };

      console.log("📦 Enviando pedido:", orderData);

      const response = await apiCreateGuestOrder(orderData);
      console.log("✅ Respuesta del servidor:", response);

      clear();

      const metodoPagoLabel = metodosPago.find(m => m.value === metodoPago)?.label || metodoPago;
      
      alert(
        `✅ ¡Pedido confirmado!\n\n` +
        `Número de pedido: ${response.pedido_id}\n` +
        `Método de pago: ${metodoPagoLabel}\n` +
        `${response.message}\n\n` +
        `Total: $${total.toFixed(2)}`
      );

      setOpen(false);
    } catch (err) {
      console.error("❌ Error al procesar pedido:", err);
      setError(err.message || "Error al procesar el pedido");
    } finally {
      setSending(false);
    }
  }

  if (!open) return null;

  return (
    <div
      className="modal-overlay"
      onClick={() => setOpen(false)}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.7)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
      }}
    >
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: "white",
          padding: "30px",
          borderRadius: "12px",
          maxWidth: "500px",
          width: "90%",
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        <h2>🛒 Finalizar Compra como Invitado</h2>

        {error && (
          <div
            className="error-message"
            style={{
              backgroundColor: "#fed7d7",
              color: "#c53030",
              padding: "12px",
              borderRadius: "8px",
              marginBottom: "16px",
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={onSubmit}>
          <div className="form-group" style={{ marginBottom: "16px" }}>
            <label htmlFor="nombreCompleto">Nombre Completo *</label>
            <input
              type="text"
              id="nombreCompleto"
              name="nombreCompleto"
              value={form.nombreCompleto}
              onChange={handleChange}
              required
              placeholder="Juan Pérez"
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: "6px",
                border: "1px solid #cbd5e0",
                marginTop: "5px",
              }}
            />
          </div>

          <div className="form-group" style={{ marginBottom: "16px" }}>
            <label htmlFor="email">Email *</label>
            <input
              type="email"
              id="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              placeholder="ejemplo@correo.com"
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: "6px",
                border: "1px solid #cbd5e0",
                marginTop: "5px",
              }}
            />
          </div>

          <div className="form-group" style={{ marginBottom: "16px" }}>
            <label htmlFor="telefono">Teléfono / WhatsApp *</label>
            <input
              type="tel"
              id="telefono"
              name="telefono"
              value={form.telefono}
              onChange={handleChange}
              required
              placeholder="3001234567"
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: "6px",
                border: "1px solid #cbd5e0",
                marginTop: "5px",
              }}
            />
          </div>

          <div className="form-group" style={{ marginBottom: "16px" }}>
            <label htmlFor="direccion">Dirección de Entrega *</label>
            <textarea
              id="direccion"
              name="direccion"
              value={form.direccion}
              onChange={handleChange}
              required
              rows="3"
              placeholder="Calle 123 #45-67, Apto 301"
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: "6px",
                border: "1px solid #cbd5e0",
                marginTop: "5px",
                resize: "vertical",
              }}
            />
          </div>

          {/* ✅ MÉTODO DE PAGO CON TABS (IGUAL AL CHECKOUT DE CLIENTE) */}
          <div style={{ marginBottom: "1.5rem" }}>
            <strong style={{ display: "block", marginBottom: "0.75rem" }}>
              Método de Pago *
            </strong>

            {/* Tabs de métodos de pago */}
            <div style={{ 
              display: "flex", 
              gap: "0.5rem",
              marginBottom: "1rem"
            }}>
              {metodosPago.map((m) => (
                <button
                  key={m.value}
                  type="button"
                  onClick={() => setMetodoPago(m.value)}
                  style={{
                    flex: 1,
                    padding: "0.75rem",
                    border: "1px solid",
                    borderColor: metodoPago === m.value ? "#4CAF50" : "#ddd",
                    borderRadius: "8px",
                    background: metodoPago === m.value ? "#4CAF50" : "white",
                    color: metodoPago === m.value ? "white" : "#333",
                    cursor: "pointer",
                    fontWeight: metodoPago === m.value ? "600" : "400",
                    fontSize: "0.9rem"
                  }}
                >
                  {m.label}
                </button>
              ))}
            </div>

            {/* Información de Nequi */}
            {metodoPago === "nequi" && paymentInfo.nequi && (
              <div style={{ 
                background: "#e7f3e7", 
                padding: "1rem", 
                borderRadius: "8px",
                border: "1px solid #b7e4b7"
              }}>
                <strong style={{ display: "block", marginBottom: "0.75rem", color: "#2e7d2e" }}>
                  {paymentInfo.nequi.title}
                </strong>
                {paymentInfo.nequi.details.map((detail, idx) => (
                  <div key={idx} style={{ marginBottom: "0.5rem", fontSize: "0.9rem" }}>
                    <strong>{detail.label}</strong> {detail.value}
                  </div>
                ))}
                <p style={{ 
                  margin: "0.75rem 0 0 0", 
                  fontSize: "0.85rem", 
                  color: "#856404",
                  background: "#fff3cd",
                  padding: "0.5rem",
                  borderRadius: "4px"
                }}>
                  {paymentInfo.nequi.note}
                </p>
              </div>
            )}

            {/* Información de Contraentrega */}
            {metodoPago === "contraentrega" && (
              <div style={{ 
                background: "#e7f3e7", 
                padding: "1rem", 
                borderRadius: "8px",
                border: "1px solid #b7e4b7"
              }}>
                <strong style={{ display: "block", marginBottom: "0.75rem", color: "#2e7d2e" }}>
                  💵 Pago Contraentrega
                </strong>
                <p style={{ margin: 0, fontSize: "0.9rem" }}>
                  Pagarás en efectivo cuando recibas tu pedido.
                </p>
              </div>
            )}
          </div>

          {/* Resumen del pedido */}
          <div
            className="order-summary"
            style={{
              marginTop: "20px",
              padding: "15px",
              backgroundColor: "#f7fafc",
              borderRadius: "8px",
            }}
          >
            <h3 style={{ marginBottom: "10px" }}>Resumen del Pedido</h3>
            <ul style={{ listStyle: "none", padding: 0 }}>
              {items.map((item) => (
                <li
                  key={item.producto_id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "8px",
                  }}
                >
                  <span>
                    {item.nombre} x {item.cantidad}
                  </span>
                  <span>${(item.precio * item.cantidad).toFixed(2)}</span>
                </li>
              ))}
            </ul>
            <p
              style={{
                fontWeight: "bold",
                fontSize: "18px",
                marginTop: "10px",
                borderTop: "2px solid #cbd5e0",
                paddingTop: "10px",
              }}
            >
              Total: ${total.toFixed(2)}
            </p>
          </div>

          {/* Botones de acción */}
          <div
            className="modal-actions"
            style={{
              marginTop: "20px",
              display: "flex",
              gap: "10px",
            }}
          >
            <button
              type="submit"
              disabled={sending}
              style={{
                flex: 1,
                padding: "12px",
                backgroundColor: sending ? "#cbd5e0" : "#48bb78",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: sending ? "not-allowed" : "pointer",
                fontSize: "16px",
              }}
            >
              {sending ? "Procesando..." : "Confirmar Pedido"}
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              disabled={sending}
              style={{
                flex: 1,
                padding: "12px",
                backgroundColor: "#e2e8f0",
                color: "#2d3748",
                border: "none",
                borderRadius: "8px",
                cursor: sending ? "not-allowed" : "pointer",
                fontSize: "16px",
              }}
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 