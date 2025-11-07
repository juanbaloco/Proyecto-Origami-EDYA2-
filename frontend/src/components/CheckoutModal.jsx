// src/components/CheckoutModal.jsx

import { useState } from "react";
import { useCart } from "../contexts/CartContext";
import { apiCreateOrder } from "../api";

export default function CheckoutModal({ onClose }) {
  const { items, clear, total } = useCart();

  const [contacto, setContacto] = useState({ 
    nombre: "", 
    email: "", 
    telefono: "" 
  });
  const [direccion, setDireccion] = useState("");
  const [metodoPago, setMetodoPago] = useState("nequi");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const metodosPago = [
    { value: "nequi", label: "Transferencia Nequi" },
    { value: "contraentrega", label: "Contraentrega" }
  ];

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

  function onContactoChange(e) {
    const { name, value } = e.target;
    setContacto(prev => ({ ...prev, [name]: value }));
  }

  async function confirm(e) {
    e.preventDefault();
    setError("");

    if (!contacto.nombre || !contacto.email) {
      setError("Nombre completo y correo son obligatorios");
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(contacto.email)) {
      setError("Email inválido");
      return;
    }
    if (!direccion.trim()) {
      setError("La dirección de envío es obligatoria");
      return;
    }
    setSending(true);

    try {
      await apiCreateOrder({
        contacto: {
          nombre: contacto.nombre,
          email: contacto.email,
          telefono: contacto.telefono || ""
        },
        items: items.map(i => ({ 
          producto_id: i.producto_id, 
          cantidad: i.cantidad 
        })),
        direccion: direccion.trim(),
        metodo_pago: metodoPago
      });
      clear();
      const metodoPagoLabel = metodosPago.find(m => m.value === metodoPago)?.label || metodoPago;
      const mensaje = 
        `✅ ¡Pedido confirmado!\n\n` +
        `Método de pago: ${metodoPagoLabel}\n` +
        `Dirección: ${direccion}\n` +
        `Te contactaremos pronto al email: ${contacto.email}\n\n` +
        `Total: $${total.toFixed(2)}`;
      alert(mensaje);

      // ✅ Cierra el modal al finalizar
      if(onClose) onClose();
    } catch (e) {
      setError(e.message || "Error creando pedido");
    } finally {
      setSending(false);
    }
  }

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "white",
          borderRadius: "12px",
          width: "90%",
          maxWidth: "550px",
          maxHeight: "90vh",
          overflowY: "auto",
          padding: "2rem",
          position: "relative"
        }}
        onClick={e => e.stopPropagation()} // Esto previene que el fondo cierre el modal al hacer clic dentro del modal
      >
        {/* Botón cerrar (X) */}
        <button
          onClick={onClose}
          type="button"
          style={{
            position: "absolute",
            top: "1rem",
            right: "1rem",
            background: "transparent",
            border: "none",
            fontSize: "1.5rem",
            cursor: "pointer",
            color: "#666",
            padding: "0.5rem"
          }}
        >
          ×
        </button>

        <h2 style={{ margin: "0 0 1rem 0" }}>Finalizar Compra</h2>

        {/* Resumen del pedido */}
        <div style={{ 
          background: "#f9f9f9", 
          padding: "1rem", 
          borderRadius: "8px", 
          marginBottom: "1.5rem" 
        }}>
          <strong>Resumen del Pedido</strong>
          {items.map((item, idx) => (
            <div key={idx} style={{ 
              fontSize: "0.9rem", 
              marginTop: "0.5rem",
              display: "flex",
              justifyContent: "space-between" 
            }}>
              <span>{item.nombre} × {item.cantidad}</span>
              <span>${(item.precio * item.cantidad).toFixed(2)}</span>
            </div>
          ))}
          <div style={{ 
            marginTop: "1rem", 
            paddingTop: "0.75rem", 
            borderTop: "2px solid #ddd",
            display: "flex",
            justifyContent: "space-between",
            fontSize: "1.1rem",
            fontWeight: "600"
          }}>
            <span>Total:</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </div>

        {/* Método de Pago (tabs) */}
        <div style={{ marginBottom: "1.5rem" }}>
          <strong style={{ display: "block", marginBottom: "0.75rem" }}>
            Método de Pago *
          </strong>

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

          {/* Información del método de pago */}
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

        <form onSubmit={confirm}>
          {/* Contacto para envío */}
          <div style={{ marginBottom: "1.5rem" }}>
            <strong style={{ display: "block", marginBottom: "0.75rem" }}>
              Contacto para envío
            </strong>

            <input
              type="text"
              name="nombre"
              placeholder="Nombre Completo *"
              value={contacto.nombre}
              onChange={onContactoChange}
              required
              style={{
                width: "100%",
                padding: "0.75rem",
                marginBottom: "0.75rem",
                border: "1px solid #ddd",
                borderRadius: "8px",
                fontSize: "1rem",
                boxSizing: "border-box"
              }}
            />

            <input
              type="email"
              name="email"
              placeholder="Correo *"
              value={contacto.email}
              onChange={onContactoChange}
              required
              style={{
                width: "100%",
                padding: "0.75rem",
                marginBottom: "0.75rem",
                border: "1px solid #ddd",
                borderRadius: "8px",
                fontSize: "1rem",
                boxSizing: "border-box"
              }}
            />

            <input
              type="tel"
              name="telefono"
              placeholder="Teléfono (opcional)"
              value={contacto.telefono}
              onChange={onContactoChange}
              style={{
                width: "100%",
                padding: "0.75rem",
                marginBottom: "0.75rem",
                border: "1px solid #ddd",
                borderRadius: "8px",
                fontSize: "1rem",
                boxSizing: "border-box"
              }}
            />

            <textarea
              placeholder="Dirección de Envío *"
              value={direccion}
              onChange={(e) => setDireccion(e.target.value)}
              required
              rows={3}
              style={{
                width: "100%",
                padding: "0.75rem",
                border: "1px solid #ddd",
                borderRadius: "8px",
                fontSize: "1rem",
                resize: "vertical",
                boxSizing: "border-box"
              }}
            />
          </div>

          {/* Total */}
          <div style={{ 
            fontSize: "1.2rem", 
            fontWeight: "600", 
            marginBottom: "1rem",
            textAlign: "right"
          }}>
            Total: ${total.toFixed(2)}
          </div>

          {error && (
            <div style={{ 
              padding: "0.75rem", 
              background: "#f8d7da", 
              color: "#721c24",
              borderRadius: "8px",
              marginBottom: "1rem",
              fontSize: "0.9rem"
            }}>
              {error}
            </div>
          )}

          {/* Botones */}
          <div style={{ display: "flex", gap: "0.75rem" }}>
            <button
              type="button"
              onClick={onClose}
              disabled={sending}
              style={{
                flex: 1,
                padding: "0.75rem",
                border: "1px solid #ddd",
                borderRadius: "8px",
                background: "white",
                cursor: sending ? "not-allowed" : "pointer",
                fontSize: "1rem"
              }}
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={sending}
              style={{
                flex: 1,
                padding: "0.75rem",
                border: "none",
                borderRadius: "8px",
                background: sending ? "#ccc" : "#4CAF50",
                color: "white",
                cursor: sending ? "not-allowed" : "pointer",
                fontSize: "1rem",
                fontWeight: "600"
              }}
            >
              {sending ? "Procesando..." : "Confirmar Pedido"}
            </button>
          </div>

          <p style={{ 
            fontSize: "0.8rem", 
            color: "#666", 
            textAlign: "center", 
            marginTop: "1rem" 
          }}>
            * Al confirmar, aceptas nuestros términos y condiciones.
          </p>
        </form>
      </div>
    </div>
  );
}
