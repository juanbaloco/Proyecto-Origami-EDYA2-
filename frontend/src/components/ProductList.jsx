import { useEffect, useRef, useState } from "react";
import { apiGetProducts } from "../api";

export default function ProductList() {
  const [q, setQ] = useState("");
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const timer = useRef(null);

  // Ref para siempre tener el valor más reciente de q dentro de listeners
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

  // Carga inicial
  useEffect(() => { fetchNow(""); }, []);

  // Debounce 300 ms
  useEffect(() => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => { fetchNow(q); }, 300);
    return () => clearTimeout(timer.current);
  }, [q]);

  // Escuchar evento global para recargar (al crear)
  useEffect(() => {
    const onReload = () => fetchNow(qRef.current);
    window.addEventListener("reload-products", onReload);
    return () => window.removeEventListener("reload-products", onReload);
  }, []); // se registra una sola vez

  return (
    <section className="card">
      <div className="row">
        <input
          placeholder="Buscar por nombre o SKU…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <span className="muted">{loading ? "Cargando…" : `${total} resultados`}</span>
      </div>

      {error && <div className="error">{error}</div>}

      <ul className="list">
        {data.map((p) => (
          <li key={p.id} className="item">
            <div className="title">{p.nombre}</div>
            <div className="sub">
              SKU: {p.sku} · Slug: {p.slug} · Precio: $
              {(p.precio_cent / 100).toFixed(2)} · Stock: {p.stock}
            </div>
          </li>
        ))}
      </ul>

      {!loading && !error && data.length === 0 && (
        <div className="muted">Sin resultados</div>
      )}
    </section>
  );
}
