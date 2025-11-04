import { useState } from "react";

export default function LoyaltyPage() {
  const [showModal, setShowModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("Tarjeta");
  const [form, setForm] = useState({ nombre: "", email: "", telefono: "" });

  function handleSubscribe() {
    setShowModal(true);
  }

  function handleConfirm() {
    alert(
      `Suscripción confirmada con método: ${paymentMethod}\nNombre: ${form.nombre}\nEmail: ${form.email}`
    );
    setShowModal(false);
    setForm({ nombre: "", email: "", telefono: "" });
  }

  return (
    <div style={{ padding: "2rem", maxWidth: "700px", margin: "0 auto" }}>
      <h1 style={{ marginBottom: "1rem", color: "#667eea" }}>🎁 Programa de Fidelización</h1>
      <p style={{ marginBottom: "2rem", fontSize: "1.1rem", color: "#555" }}>
        <strong>$10.000</strong> — válido 6 meses
      </p>
      <p style={{ marginBottom: "2rem", color: "#666" }}>
        Accede a descuentos exclusivos y beneficios especiales para clientes frecuentes.
      </p>

      <ul style={{ marginBottom: "2rem", lineHeight: "1.8", color: "#555" }}>
        <li>✅ 10% de descuento en todas tus compras</li>
        <li>✅ Envío gratuito en pedidos mayores a $50.000</li>
        <li>✅ Acceso anticipado a nuevos diseños</li>
        <li>✅ Personalización gratuita en un pedido al mes</li>
        <li>✅ Atención prioritaria</li>
      </ul>

      <button
        onClick={handleSubscribe}
        style={{
          padding: "1rem 3rem",
          background: "#667eea",
          color: "white",
          border: "none",
          borderRadius: "8px",
          fontSize: "1.1rem",
          fontWeight: "600",
          cursor: "pointer",
          transition: "background 0.3s"
        }}
        onMouseEnter={(e) => (e.target.style.background = "#5568d3")}
        onMouseLeave={(e) => (e.target.style.background = "#667eea")}
      >
        Suscribirme Ahora
      </button>

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
          onClick={() => setShowModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "white",
              borderRadius: "12px",
              padding: "2rem",
              maxWidth: "500px",
              width: "90%"
            }}
          >
            <h2 style={{ marginTop: 0 }}>Confirmar Suscripción</h2>

            <div style={{ marginBottom: "1.5rem" }}>
              <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600" }}>
                Nombre completo
              </label>
              <input
                type="text"
                value={form.nombre}
                onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                placeholder="Tu nombre"
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                  fontSize: "1rem"
                }}
              />
            </div>

            <div style={{ marginBottom: "1.5rem" }}>
              <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600" }}>
                Correo electrónico
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="tu@email.com"
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                  fontSize: "1rem"
                }}
              />
            </div>

            <div style={{ marginBottom: "1.5rem" }}>
              <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600" }}>
                Teléfono
              </label>
              <input
                type="tel"
                value={form.telefono}
                onChange={(e) => setForm({ ...form, telefono: e.target.value })}
                placeholder="+57 300 123 4567"
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                  fontSize: "1rem"
                }}
              />
            </div>

            <div style={{ marginBottom: "1.5rem" }}>
              <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600" }}>
                Método de pago
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                  fontSize: "1rem"
                }}
              >
                <option>Tarjeta</option>
                <option>PSE</option>
                <option>Efectivo</option>
              </select>
            </div>

            <div style={{ marginBottom: "1.5rem", padding: "1rem", background: "#f8f9fa", borderRadius: "8px" }}>
              <p style={{ margin: 0, fontSize: "1.1rem", fontWeight: "600" }}>Total: $10.000</p>
            </div>

            <div style={{ display: "flex", gap: "1rem" }}>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  flex: 1,
                  padding: "0.75rem",
                  background: "#e0e0e0",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer"
                }}
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirm}
                style={{
                  flex: 1,
                  padding: "0.75rem",
                  background: "#667eea",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontWeight: "600"
                }}
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
