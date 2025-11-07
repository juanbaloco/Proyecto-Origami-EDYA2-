import { useNavigate } from "react-router-dom";
import { useCart } from "../contexts/CartContext";
import { useContext, useState } from "react";
import { AuthContext } from "../App";
import CheckoutModal from "../components/CheckoutModal";
import GuestCheckoutModal from "../components/GuestCheckoutModal";

export default function CartPage() {
  const nav = useNavigate();
  const { items, setQty, remove, total } = useCart();
  const { user } = useContext(AuthContext); // ✅ Obtener usuario
  const [showCheckout, setShowCheckout] = useState(false);

  const onCheckout = () => {
    setShowCheckout(true);
  };

  return (
    <div style={{ padding: "2rem", maxWidth: "900px", margin: "0 auto" }}>
      <h1 style={{ marginBottom: "2rem" }}>🛒 Carrito de Compras</h1>

      {items.length === 0 ? (
        <div style={{ textAlign: "center", padding: "3rem" }}>
          <p style={{ color: "#999", fontSize: "18px", marginBottom: "1rem" }}>
            Tu carrito está vacío
          </p>
          <button
            onClick={() => nav("/")}
            style={{
              padding: "0.75rem 2rem",
              background: "#667eea",
              color: "white",
              border: "none",
              borderRadius: "8px",
              fontSize: "1rem",
              cursor: "pointer",
            }}
          >
            Ir a productos
          </button>
        </div>
      ) : (
        <>
          {items.map((it) => (
            <div
              key={it.producto_id}
              style={{
                display: "flex",
                gap: "1rem",
                marginBottom: "1rem",
                padding: "1rem",
                border: "1px solid #ddd",
                borderRadius: "8px",
                alignItems: "center",
              }}
            >
              {it.imagen_url && (
                <img
                  src={it.imagen_url}
                  alt={it.nombre}
                  style={{
                    width: "80px",
                    height: "80px",
                    objectFit: "cover",
                    borderRadius: "8px",
                  }}
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
              )}
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: 0 }}>{it.nombre}</h3>
                <p style={{ margin: "0.5rem 0", color: "#666" }}>
                  ${it.precio}
                </p>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
              >
                <button
                  onClick={() => setQty(it.producto_id, Math.max(1, it.cantidad - 1))}
                  style={{
                    padding: "0.5rem 0.75rem",
                    background: "#f0f0f0",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                >
                  -
                </button>
                <span style={{ minWidth: "30px", textAlign: "center" }}>
                  {it.cantidad}
                </span>
                <button
                  onClick={() => setQty(it.producto_id, it.cantidad + 1)}
                  style={{
                    padding: "0.5rem 0.75rem",
                    background: "#f0f0f0",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                >
                  +
                </button>
              </div>
              <button
                onClick={() => remove(it.producto_id)}
                style={{
                  color: "red",
                  background: "transparent",
                  border: "none",
                  fontSize: "1.5rem",
                  cursor: "pointer",
                  padding: "0.5rem",
                }}
              >
                🗑️
              </button>
            </div>
          ))}

          <div style={{ textAlign: "right", marginTop: "2rem" }}>
            <h2 style={{ marginBottom: "1rem" }}>
              Total: ${total.toFixed(2)}
            </h2>
            <button
              onClick={onCheckout}
              style={{
                padding: "0.75rem 2rem",
                background: "#667eea",
                color: "white",
                border: "none",
                borderRadius: "8px",
                fontSize: "1rem",
                cursor: "pointer",
                fontWeight: "600",
              }}
            >
              Proceder al Pago
            </button>
          </div>
        </>
      )}

      {/* ✅ Renderiza el modal según login con onClose correcto */}
      {showCheckout && user && (
        <CheckoutModal onClose={() => setShowCheckout(false)} />
      )}
      {showCheckout && !user && (
        <GuestCheckoutModal onClose={() => setShowCheckout(false)} />
      )}
    </div>
  );
}
