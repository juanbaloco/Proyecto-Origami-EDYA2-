import { useEffect, useRef, useState } from "react";
import { apiGetProducts } from "../api";

export default function ProductList() {
  const [q, setQ] = useState("");
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const timer = useRef(null);
  const qRef = useRef(q);
  
  useEffect(() => { qRef.current = q; }, [q]);

  async function fetchNow(search) {
    setLoading(true); setError("");
    try {
      const res = await apiGetProducts({ q: search });
      setData(res.data);
      setTotal(res.total);
    } catch (e) {
      setError(e.message || "Error cargando productos");
      setData([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchNow(""); }, []);
  
  useEffect(() => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => { fetchNow(q); }, 300);
    return () => clearTimeout(timer.current);
  }, [q]);

  return (
    <div>
      <input
        type="search"
        placeholder="Buscar productos..."
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />
      {loading && <p>Cargando...</p>}
      {error && <p style={{color: "red"}}>{error}</p>}
      {!loading && !error && data.length === 0 && <p>No hay productos.</p>}
      <div>
        {data.map((p) => (
          <article key={p.id} style={{border: "1px solid #ccc", padding: "1rem", marginBottom: "1rem"}}>
            <h3>{p.nombre}</h3>
            <p>{p.descripcion}</p>
            <p>Precio: ${Number(p.precio).toFixed(2)}</p>
            {p.stock !== undefined && <p>Stock: {p.stock}</p>}
          </article>
        ))}
      </div>
      <p>Total de productos: {total}</p>
    </div>
  );
}
