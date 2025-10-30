import { useState } from "react";

export default function LoyaltyPage() {
  const [showModal, setShowModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("Tarjeta");
  const [form, setForm] = useState({ nombre: "", email: "", telefono: "" });

  function handleSubscribe() {
    setShowModal(true);
  }

  function handleConfirm() {
    // Aquí enviarías la suscripción al backend
    alert(`Suscripción confirmada con método: ${paymentMethod}\nNombre: ${form.nombre}\nEmail: ${form.email}`);
    setShowModal(false);
    setForm({ nombre: "", email: "", telefono: "" });
  }

  return (
    <div style={{ maxWidth: "600px", margin: "0 auto", padding: "2rem" }}>
      <h1>Programa de Fidelización</h1>
      <p style={{ fontSize: "1.2rem", marginBottom: "1rem", color: "#666" }}>
        <strong style={{ color: "#000", fontSize: "1.5rem" }}>$10.000</strong> — válido 6 meses
      </p>
      <p style={{ marginBottom: "1.5rem", color: "#666" }}>
        Accede a descuentos exclusivos y beneficios especiales para clientes frecuentes.
      </p>
      <button
        onClick={handleSubscribe}
        style={{
          padding: "0.75rem 1.5rem",
          background: "#007bff",
          color: "white",
          border: "none",
          borderRadius: "8px",
          fontSize: "1rem",
          cursor: "pointer",
          fontWeight: "500"
        }}
      >
        Suscribirse Ahora
      </button>

      {showModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000
          }}
          onClick={() => setShowModal(false)}
        >
          <div
            style={{
              background: "white",
              padding: "2rem",
              borderRadius: "12px",
              maxWidth: "500px",
              width: "90%",
              boxShadow: "0 4px 20px rgba(0,0,0,0.15)"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ marginTop: 0, marginBottom: "1.5rem" }}>Método de Pago</h2>
            
            {/* Solo Tarjeta y Transferencia */}
            <div style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem" }}>
              <button
                onClick={() => setPaymentMethod("Tarjeta")}
                style={{
                  flex: 1,
                  padding: "0.75rem",
                  background: paymentMethod === "Tarjeta" ? "#1f2121" : "white",
                  color: paymentMethod === "Tarjeta" ? "white" : "#333",
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontSize: "1rem",
                  fontWeight: "500",
                  transition: "all 0.2s"
                }}
              >
                Tarjeta
              </button>
              <button
                onClick={() => setPaymentMethod("Transferencia")}
                style={{
                  flex: 1,
                  padding: "0.75rem",
                  background: paymentMethod === "Transferencia" ? "#1f2121" : "white",
                  color: paymentMethod === "Transferencia" ? "white" : "#333",
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontSize: "1rem",
                  fontWeight: "500",
                  transition: "all 0.2s"
                }}
              >
                Transferencia
              </button>
            </div>

            <h3 style={{ fontSize: "1.1rem", marginBottom: "1rem" }}>Contacto para envío</h3>
            
            <input
              type="text"
              placeholder="Nombre Completo"
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              style={{
                width: "100%",
                padding: "0.75rem",
                marginBottom: "1rem",
                border: "1px solid #ddd",
                borderRadius: "8px",
                fontSize: "1rem"
              }}
              required
            />
            
            <input
              type="email"
              placeholder="Correo"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              style={{
                width: "100%",
                padding: "0.75rem",
                marginBottom: "1rem",
                border: "1px solid #ddd",
                borderRadius: "8px",
                fontSize: "1rem"
              }}
              required
            />
            
            <input
              type="tel"
              placeholder="Teléfono (opcional)"
              value={form.telefono}
              onChange={(e) => setForm({ ...form, telefono: e.target.value })}
              style={{
                width: "100%",
                padding: "0.75rem",
                marginBottom: "1.5rem",
                border: "1px solid #ddd",
                borderRadius: "8px",
                fontSize: "1rem"
              }}
            />

            <p style={{ fontSize: "1.3rem", fontWeight: "bold", marginBottom: "1.5rem" }}>
              Total: <span style={{ color: "#007bff" }}>$10.000</span>
            </p>

            <div style={{ display: "flex", gap: "1rem" }}>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  flex: 1,
                  padding: "0.75rem",
                  background: "white",
                  color: "#333",
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontSize: "1rem",
                  fontWeight: "500"
                }}
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirm}
                style={{
                  flex: 1,
                  padding: "0.75rem",
                  background: form.nombre && form.email ? "#007bff" : "#ccc",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  cursor: form.nombre && form.email ? "pointer" : "not-allowed",
                  fontSize: "1rem",
                  fontWeight: "500"
                }}
                disabled={!form.nombre || !form.email}
              >
                Confirmar Pedido
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
