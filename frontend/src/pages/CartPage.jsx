import { useNavigate } from "react-router-dom";
import { useCart } from "../contexts/CartContext";
import { useContext, useState } from "react";
import { AuthContext } from "../App";
import CheckoutModal from "../components/CheckoutModal";
import GuestCheckoutModal from "../components/GuestCheckoutModal";

export default function CartPage() {
  const nav = useNavigate();
  const { items, setQty, remove, total } = useCart();
  const { user } = useContext(AuthContext);
  const BASE_URL = "http://localhost:8000";
  
  // ✅ CORREGIDO - Modal no se abre automáticamente
  const [showCheckout, setShowCheckout] = useState(false);

  const onCheckout = () => {
    console.log("🛒 Abriendo checkout, usuario:", user);
    setShowCheckout(true);
  };

  return (
    <div style={{ maxWidth: "900px", margin: "auto", padding: "1rem" }}>
      <h1 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>🛒 Carrito</h1>

      {items.length === 0 ? (
        <div style={{ textAlign: "center", padding: "2rem" }}>
          <p>Tu carrito está vacío</p>
          <button
            onClick={() => nav("/")}
            style={{
              marginTop: "1rem",
              padding: "0.75rem 1.5rem",
              background: "#3b82f6",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer"
            }}
          >
            Ir a la tienda
          </button>
        </div>
      ) : (
        <>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid #ddd" }}>
                <th style={{ padding: "0.75rem", textAlign: "left" }}>Producto</th>
                <th style={{ padding: "0.75rem", textAlign: "center" }}>Precio</th>
                <th style={{ padding: "0.75rem", textAlign: "center" }}>Cantidad</th>
                <th style={{ padding: "0.75rem", textAlign: "center" }}>Subtotal</th>
                <th style={{ padding: "0.75rem", textAlign: "center" }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {items.map((it) => (
                <tr key={it.producto_id} style={{ borderBottom: "1px solid #eee" }}>
                  <td style={{ padding: "0.75rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      {it.imagen_url && (
                        <img
                          src={it.imagen_url.startsWith('http') ? it.imagen_url : `${BASE_URL}${it.imagen_url}`}
                          alt={it.nombre}
                          style={{ width: "60px", height: "60px", objectFit: "cover", borderRadius: "8px", border: "1px solid #e5e7eb" }}
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                      )}
                      <span>{it.nombre}</span>
                    </div>
                  </td>
                  <td style={{ padding: "0.75rem", textAlign: "center" }}>${it.precio}</td>
                  <td style={{ padding: "0.75rem", textAlign: "center" }}>
                    <input
                      type="number"
                      min="1"
                      value={it.cantidad}
                      onChange={(e) => setQty(it.producto_id, parseInt(e.target.value) || 1)}
                      style={{
                        width: "60px",
                        padding: "0.25rem",
                        textAlign: "center",
                        border: "1px solid #ddd",
                        borderRadius: "4px"
                      }}
                    />
                  </td>
                  <td style={{ padding: "0.75rem", textAlign: "center", fontWeight: "600" }}>
                    ${(it.precio * it.cantidad).toFixed(2)}
                  </td>
                  <td style={{ padding: "0.75rem", textAlign: "center" }}>
                    <button
                      onClick={() => remove(it.producto_id)}
                      style={{
                        padding: "0.5rem 1rem",
                        background: "#f56565",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer"
                      }}
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{
            marginTop: "1.5rem",
            padding: "1rem",
            background: "#f7fafc",
            borderRadius: "8px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}>
            <div>
              <strong style={{ fontSize: "1.25rem" }}>Total: ${total.toFixed(2)}</strong>
            </div>
            <button
              onClick={onCheckout}
              style={{
                padding: "0.75rem 2rem",
                background: "#3b82f6",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "1rem",
                fontWeight: "600"
              }}
            >
              Proceder al Pago
            </button>
          </div>
        </>
      )}

      {/* ✅ MODALES - Solo se muestran cuando showCheckout es true */}
      {showCheckout && user && (
        <CheckoutModal onClose={() => setShowCheckout(false)} />
      )}

      {showCheckout && !user && (
        <GuestCheckoutModal 
          open={showCheckout} 
          setOpen={setShowCheckout} 
        />
      )}
    </div>
  );
}