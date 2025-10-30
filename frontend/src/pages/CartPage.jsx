import { useNavigate } from "react-router-dom";
import { useCart } from "../contexts/CartContext";
import CheckoutModal from "../components/CheckoutModal";
import { getToken } from "../api";
import { useState } from "react";

export default function CartPage(){
  const nav = useNavigate();
  const { items, setQty, remove, total } = useCart();
  const [open, setOpen] = useState(false);

  const onCheckout = ()=> getToken()? setOpen(true) : nav("/login");
  return (
    <div className="page">
      <h1>Carrito de Compras</h1>
      {items.map(it=>(
        <div key={it.producto_id} className="cart-item">
          <img src={it.imagen_url} />
          <div>{it.nombre}<br/>${it.precio.toFixed(2)}</div>
          <div>
            <button onClick={()=> setQty(it.producto_id, it.cantidad-1)}>-</button>
            <span>{it.cantidad}</span>
            <button onClick={()=> setQty(it.producto_id, it.cantidad+1)}>+</button>
          </div>
          <button onClick={()=> remove(it.producto_id)}>Eliminar</button>
        </div>
      ))}
      <aside className="summary">
        <div>Total: ${total.toFixed(2)}</div>
        <button onClick={onCheckout} disabled={!items.length}>Proceder al Pago</button>
      </aside>
      {open && <CheckoutModal onClose={()=> setOpen(false)} />}
    </div>
  );
}
