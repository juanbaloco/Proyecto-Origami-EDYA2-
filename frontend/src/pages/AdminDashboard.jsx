// src/pages/AdminDashboard.jsx
import { useEffect, useState } from "react";
import { apiAllOrders, apiUpdateOrderStatus, apiGetProducts } from "../api";
import { Link } from "react-router-dom";

export default function AdminDashboard(){
  const [tab,setTab]=useState("productos");
  const [orders,setOrders]=useState([]); const [prods,setProds]=useState([]);

  useEffect(()=>{ if(tab==="pedidos"||tab==="personalizados")
      apiAllOrders().then(d=> setOrders(d));
  }, [tab]);
  useEffect(()=>{ if(tab==="productos") apiGetProducts().then(r=> setProds(r.data)); }, [tab]);

  return (
    <div className="page">
      <h1>Panel de Administración</h1>
      <div className="tabs">
        <button className={tab==="productos"?"active":""} onClick={()=>setTab("productos")}>Productos</button>
        <button className={tab==="pedidos"?"active":""} onClick={()=>setTab("pedidos")}>Pedidos</button>
        <button className={tab==="personalizados"?"active":""} onClick={()=>setTab("personalizados")}>Pedidos Personalizados</button>
      </div>

      {tab==="productos" && (
        <>
          <Link to="/productos/nuevo">Agregar Producto</Link>
          <ul>{prods.map(p=> <li key={p.id}>{p.nombre} — ${p.precio}</li>)}</ul>
        </>
      )}

      {(tab==="pedidos"||tab==="personalizados") && orders
        .filter(o=> tab==="personalizados"? o.tipo==="personalizado": true)
        .map(o=>(
          <div key={o.id} className="order-admin">
            <div>#{o.id} — {o.contacto.email} — {o.estado}</div>
            {o.descripcion && <div>Descripción: {o.descripcion}</div>}
            <select value={o.estado} onChange={async e=>{
              const upd = await apiUpdateOrderStatus(o.id, e.target.value);
              setOrders(prev=> prev.map(x=> x.id===o.id? upd : x));
            }}>
              <option>Pendiente</option>
              <option>En Proceso</option>
              <option>Enviado</option>
              <option>Entregado</option>
              <option>Cancelado</option>
            </select>
          </div>
      ))}
    </div>
  );
}
