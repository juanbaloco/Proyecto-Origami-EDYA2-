import { useEffect, useState } from "react";
import { apiMyOrders } from "../api";
export default function OrdersPage(){
  const [data,setData]=useState([]); const [loading,setLoading]=useState(false);
  useEffect(()=>{ setLoading(true); apiMyOrders().then(setData).finally(()=>setLoading(false)); }, []);
  if(loading) return <p>Cargando...</p>;
  return (
    <div className="page">
      <h1>Mis Pedidos</h1>
      {data.map(p=>(
        <div key={p.id} className="order">
          <div><strong>Pedido #{p.id}</strong> — {p.estado}</div>
          {p.items.map(it=> <div key={it.producto_id}>Producto {it.producto_id} x{it.cantidad}</div>)}
          <a href={`https://wa.me/573001234567?text=Consulta%20Pedido%20${p.id}`} target="_blank">Contactar WhatsApp</a>
        </div>
      ))}
    </div>
  );
}
