import { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../App";
import { useCart } from "../contexts/CartContext";
import { apiPayFidelizacion } from "../api";

export default function LoyaltyPage() {
  const [showModal, setShowModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("Tarjeta");
  const [form, setForm] = useState({ nombre: "", email: "", telefono: "" });
  const [loading, setLoading] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [showAcceptedModal, setShowAcceptedModal] = useState(false);
  const nav = useNavigate();
  const { user } = useContext(AuthContext);
  const { applyFidelizacionDiscount } = useCart();
  const { discountRate } = useCart();

  // Si ya existe un descuento aplicado (persistido en localStorage), marcar como aceptado
  useEffect(() => {
    if (discountRate && parseFloat(discountRate) >= 0.1) {
      setAccepted(true);
    }
  }, [discountRate]);

  function handleSubscribe() {
    setShowModal(true);
  }

  async function handleConfirm() {
    // Simular el pago llamando al endpoint backend. Usar email del usuario si está logueado.
    const correo = user?.email || form.email;
    if (!correo) return alert('Por favor ingresa tu correo o inicia sesión');

  try {
      setLoading(true);
      const res = await apiPayFidelizacion(correo);
      console.log('Pago fidelizacion respuesta:', res);

      // aplicar descuento del 10% en el carrito
      applyFidelizacionDiscount(0.10);

  // marcar como aceptado y mostrar modal de aceptación
  setAccepted(true);
  setShowAcceptedModal(true);
  setShowModal(false);
    } catch (err) {
      console.error('Error al procesar pago de fidelizacion', err);
      alert('Ocurrió un error procesando el pago. Intenta de nuevo.');
    } finally {
      setLoading(false);
      // limpiar formulario por seguridad
      setForm({ nombre: "", email: "", telefono: "" });
    }
  }

  function goToProducts() {
    // redirigir al listado de productos
    nav('/products');
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

      {!accepted ? (
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
      ) : (
        <div style={{ padding: '1.25rem', background: '#f0f9ff', borderRadius: 8, border: '1px solid #cfe8ff', marginBottom: '1rem' }}>
          <h3 style={{ margin: 0, color: '#0369a1' }}>🎉 Ya estás suscrito</h3>
          <p style={{ margin: '0.5rem 0 0 0', color: '#075985' }}>Tienes derecho a 10% de descuento y más beneficios próximamente.</p>
          <div style={{ marginTop: 12 }}>
            <button onClick={goToProducts} style={{ padding: '0.6rem 1rem', background: '#3b82f6', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer' }}>
              Ir a productos
            </button>
          </div>
        </div>
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
                disabled={loading}
                style={{
                  flex: 1,
                  padding: "0.75rem",
                  background: "#3b82f6",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  cursor: loading ? 'wait' : 'pointer',
                  fontWeight: "600"
                }}
              >
                {loading ? 'Procesando...' : 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal que aparece cuando la suscripción fue aceptada */}
      {showAcceptedModal && (
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
        >
          <div
            style={{
              background: "white",
              borderRadius: "12px",
              padding: "2rem",
              maxWidth: "500px",
              width: "90%",
              textAlign: 'center'
            }}
          >
            <h2 style={{ marginTop: 0 }}>🎉 ¡Usted ha sido aceptado!</h2>
            <p>Se le aplicó un 10% de descuento en su carrito. ¡Gracias por unirse!</p>
            <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
              <button
                onClick={() => setShowAcceptedModal(false)}
                style={{ flex: 1, padding: '0.75rem', borderRadius: 8, border: 'none', background: '#e0e0e0', cursor: 'pointer' }}
              >Cerrar</button>
              <button
                onClick={goToProducts}
                style={{ flex: 1, padding: '0.75rem', borderRadius: 8, border: 'none', background: '#3b82f6', color: 'white', cursor: 'pointer' }}
              >Ir a productos</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
