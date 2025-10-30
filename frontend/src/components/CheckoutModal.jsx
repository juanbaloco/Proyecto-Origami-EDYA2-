// src/components/CheckoutModal.jsx
import { useState } from "react";
import { useCart } from "../contexts/CartContext";
import { apiCreateOrder } from "../api";

export default function CheckoutModal({ onClose }) {
  const { items, clear, total } = useCart();
  const [method, setMethod] = useState("tarjeta"); // tarjeta|transferencia|contraentrega
  const [contacto, setContacto] = useState({ nombre: "", email: "", telefono: "" });
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  async function confirm() {
    setError("");
    if (!contacto.nombre || !contacto.email) { setError("Nombre y correo son obligatorios"); return; }
    setSending(true);
    try {
      await apiCreateOrder({
        contacto,
        items: items.map(i => ({ producto_id: i.producto_id, cantidad: i.cantidad }))
      });
      clear();
      onClose?.();
      alert("Pedido creado. ¡Gracias!");
    } catch (e) {
      setError(e.message || "Error creando pedido");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="modal" role="dialog" aria-modal="true">
      <div>
        <h3>Método de Pago</h3>
        <div className="methods">
          <button className={method==="tarjeta" ? "active" : ""} onClick={() => setMethod("tarjeta")}>Tarjeta</button>
          <button className={method==="transferencia" ? "active" : ""} onClick={() => setMethod("transferencia")}>Transferencia</button>
          <button className={method==="contraentrega" ? "active" : ""} onClick={() => setMethod("contraentrega")}>Contraentrega</button>
        </div>

        {method === "transferencia" && (
          <div className="bank-box">
            <strong>Realiza la transferencia a:</strong>
            <div>Banco: Bancolombia</div>
            <div>Cuenta: 1234567890</div>
            <div>Titular: Origami Arte</div>
          </div>
        )}

        <h4>Contacto para envío</h4>
        <input placeholder="Nombre Completo" value={contacto.nombre} onChange={e => setContacto({ ...contacto, nombre: e.target.value })} />
        <input placeholder="Correo" value={contacto.email} onChange={e => setContacto({ ...contacto, email: e.target.value })} />
        <input placeholder="Teléfono (opcional)" value={contacto.telefono} onChange={e => setContacto({ ...contacto, telefono: e.target.value })} />

        <div className="mt-3">Total: ${total.toFixed(2)}</div>
        {error && <p className="error">{error}</p>}

        <div className="actions">
          <button onClick={onClose}>Cancelar</button>
          <button disabled={sending || !items.length} onClick={confirm}>{sending ? "Procesando..." : "Confirmar Pedido"}</button>
        </div>
      </div>
    </div>
  );
}
