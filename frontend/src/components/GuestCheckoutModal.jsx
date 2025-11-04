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
    whatsapp: "",
    direccion: "",
    metodoPago: "efectivo"  // Por defecto: efectivo
  });

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError("");

    // Validaciones
    if (!form.nombreCompleto || !form.email || !form.whatsapp || !form.direccion) {
      setError("Todos los campos son obligatorios");
      return;
    }

    if (!/^\S+@\S+\.\S+$/.test(form.email)) {
      setError("Email inválido");
      return;
    }

    if (!/^\d{10,}$/.test(form.whatsapp.replace(/\D/g, ""))) {
      setError("Número de WhatsApp inválido (mínimo 10 dígitos)");
      return;
    }

    setSending(true);
    try {
      // ✅ Enviar pedido al backend
      const orderData = {
        guestInfo: form,
        items: items.map((cartItem) => ({
          producto_id: cartItem.producto_id,
          nombre: cartItem.nombre,
          precio: cartItem.precio,
          cantidad: cartItem.cantidad
        })),
        total: total,
      };

      const response = await apiCreateGuestOrder(orderData);

      console.log("📦 Pedido de invitado creado:", response);

      // ✅ Limpiar carrito después de pedido exitoso
      clear();

      // Mostrar mensaje de éxito
      alert(
        `✅ ¡Pedido confirmado!\n\nNúmero de pedido: ${response.order_id}\n\n${response.message}\n\nTotal: $${total.toFixed(2)}`
      );

      setOpen(false);
    } catch (err) {
      console.error("Error al procesar pedido:", err);
      setError(err.message || "Error al procesar el pedido");
    } finally {
      setSending(false);
    }
  }

  if (!open) return null;

  return (
    <div className="modal-overlay" onClick={() => setOpen(false)}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={() => setOpen(false)}>
          ✕
        </button>

        <h2>Finalizar Compra</h2>

        {/* Resumen del Pedido */}
        <div style={{ marginBottom: "1.5rem", padding: "1rem", background: "#f5f5f5", borderRadius: "8px" }}>
          <h3 style={{ marginBottom: "1rem" }}>Resumen del Pedido</h3>
          {items.map((cartItem) => (
            <div key={cartItem.producto_id} style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
              <span>{cartItem.nombre} × {cartItem.cantidad}</span>
              <span>${(cartItem.precio * cartItem.cantidad).toFixed(2)}</span>
            </div>
          ))}
          <div style={{ borderTop: "2px solid #ddd", marginTop: "1rem", paddingTop: "0.5rem", display: "flex", justifyContent: "space-between", fontWeight: "bold" }}>
            <span>Total:</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </div>

        {/* Formulario */}
        <form onSubmit={onSubmit}>
          {error && (
            <div style={{ padding: "1rem", background: "#fee", color: "#c00", borderRadius: "6px", marginBottom: "1rem" }}>
              {error}
            </div>
          )}

          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500" }}>
              Nombre Completo *
            </label>
            <input
              type="text"
              name="nombreCompleto"
              value={form.nombreCompleto}
              onChange={handleChange}
              style={{ width: "100%", padding: "0.75rem", border: "1px solid #ccc", borderRadius: "6px" }}
              required
            />
          </div>

          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500" }}>
              Email de Contacto *
            </label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              style={{ width: "100%", padding: "0.75rem", border: "1px solid #ccc", borderRadius: "6px" }}
              required
            />
          </div>

          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500" }}>
              WhatsApp para Contacto *
            </label>
            <input
              type="tel"
              name="whatsapp"
              value={form.whatsapp}
              onChange={handleChange}
              placeholder="+57 305 4081669"
              style={{ width: "100%", padding: "0.75rem", border: "1px solid #ccc", borderRadius: "6px" }}
              required
            />
            <small style={{ color: "#666", fontSize: "0.85rem" }}>Incluye el código de país</small>
          </div>

          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500" }}>
              Dirección de Envío *
            </label>
            <textarea
              name="direccion"
              value={form.direccion}
              onChange={handleChange}
              rows="3"
              style={{ width: "100%", padding: "0.75rem", border: "1px solid #ccc", borderRadius: "6px", fontFamily: "inherit" }}
              required
            />
          </div>

          <div style={{ marginBottom: "1.5rem" }}>
            <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500" }}>
              Método de Pago *
            </label>
            <select
              name="metodoPago"
              value={form.metodoPago}
              onChange={handleChange}
              style={{ width: "100%", padding: "0.75rem", border: "1px solid #ccc", borderRadius: "6px" }}
              required
            >
              <option value="efectivo">Efectivo contra entrega</option>
              <option value="transferencia">Transferencia Nequi</option>
            </select>

            {/* Mostrar instrucciones de Nequi si ese método está seleccionado */}
            {form.metodoPago === "transferencia" && (
              <div style={{ 
                marginTop: "1rem", 
                padding: "1rem", 
                background: "#e8f5e9", 
                borderRadius: "6px",
                border: "1px solid #4caf50"
              }}>
                <h4 style={{ margin: "0 0 0.75rem 0", color: "#2e7d32" }}>
                  📱 Instrucciones para Transferencia Nequi
                </h4>
                <div style={{ fontSize: "0.95rem", lineHeight: "1.6" }}>
                  <p style={{ margin: "0.5rem 0" }}>
                    <strong>Nombre:</strong> Juan Jose Baloco
                  </p>
                  <p style={{ margin: "0.5rem 0" }}>
                    <strong>Número de cuenta:</strong> 305 4081669
                  </p>
                  <p style={{ margin: "0.5rem 0" }}>
                    <strong>WhatsApp para enviar comprobante:</strong> +57 305 4081669
                  </p>
                  <p style={{ margin: "1rem 0 0 0", color: "#555", fontSize: "0.9rem" }}>
                    💡 Después de realizar la transferencia, envía el comprobante al WhatsApp indicado con tu nombre completo.
                  </p>
                </div>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={sending}
            style={{
              width: "100%",
              padding: "1rem",
              background: sending ? "#ccc" : "#4caf50",
              color: "white",
              border: "none",
              borderRadius: "8px",
              fontSize: "1rem",
              fontWeight: "600",
              cursor: sending ? "not-allowed" : "pointer",
              transition: "background 0.3s"
            }}
          >
            {sending ? "Procesando..." : `Confirmar Pedido ($${total.toFixed(2)})`}
          </button>

          <p style={{ textAlign: "center", color: "#666", fontSize: "0.85rem", marginTop: "1rem" }}>
            * Al confirmar, aceptas nuestros términos y condiciones
          </p>
        </form>
      </div>

      <style>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 1rem;
        }
        
        .modal-content {
          background: white;
          border-radius: 12px;
          padding: 2rem;
          max-width: 600px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
          position: relative;
        }
        
        .modal-close {
          position: absolute;
          top: 1rem;
          right: 1rem;
          background: none;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
          color: #666;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          transition: background 0.2s;
        }
        
        .modal-close:hover {
          background: #f0f0f0;
        }
      `}</style>
    </div>
  );
}