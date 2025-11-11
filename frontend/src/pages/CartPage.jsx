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
  const [showCheckout, setShowCheckout] = useState(false);

  const onCheckout = () => {
    console.log("🛒 Abriendo checkout, usuario:", user);
    setShowCheckout(true);
  };

  return (
    <div className="cart-page">
      <h1>🛒 Carrito de Compras</h1>

      {items.length === 0 ? (
        <div className="empty-cart">
          <p>Tu carrito está vacío</p>
          <button onClick={() => nav("/products")}>Ver Productos</button>
        </div>
      ) : (
        <>
          <table className="cart-table">
            <thead>
              <tr>
                <th>Producto</th>
                <th>Precio</th>
                <th>Cantidad</th>
                <th>Subtotal</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {items.map((it) => (
                <tr key={it.producto_id}>
                  <td>{it.nombre}</td>
                  <td>${it.precio}</td>
                  <td>
                    <button
                      onClick={() => setQty(it.producto_id, it.cantidad - 1)}
                      disabled={it.cantidad <= 1}
                    >
                      -
                    </button>
                    <span style={{ margin: "0 10px" }}>{it.cantidad}</span>
                    <button onClick={() => setQty(it.producto_id, it.cantidad + 1)}>
                      +
                    </button>
                  </td>
                  <td>${(it.precio * it.cantidad).toFixed(2)}</td>
                  <td>
                    <button
                      onClick={() => remove(it.producto_id)}
                      style={{
                        padding: "6px 12px",
                        backgroundColor: "#f56565",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                      }}
                    >
                      🗑️ Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="cart-total" style={{ marginTop: "20px", textAlign: "right" }}>
            <h2>Total: ${total.toFixed(2)}</h2>
            <button
              onClick={onCheckout}
              className="checkout-btn"
              style={{
                padding: "12px 24px",
                fontSize: "16px",
                backgroundColor: "#5a67d8",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                marginTop: "10px",
              }}
            >
              Proceder al Pago
            </button>
          </div>
        </>
      )}

      {/* ✅ Renderizar modal correcto según si hay usuario o no */}
      {user ? (
        <CheckoutModal open={showCheckout} setOpen={setShowCheckout} />
      ) : (
        <GuestCheckoutModal open={showCheckout} setOpen={setShowCheckout} />
      )}
    </div>
  );
}
