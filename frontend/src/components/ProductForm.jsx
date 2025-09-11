import { useState } from "react";
import { apiCreateProduct } from "../api";

const empty = { nombre: "", sku: "", slug: "", precio: "", activo: true };

export default function ProductForm({ onCreated }) {
  const [form, setForm] = useState(empty);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  function onChange(e) {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setSending(true); setError("");
    try {
      const payload = {
        nombre: String(form.nombre).trim(),
        sku: String(form.sku).trim(),     // debe ser AAA-999
        slug: String(form.slug).trim(),
        precio: Number(form.precio),      // <-- AHORA 'precio' (float)
        activo: !!form.activo,
      };

      if (!payload.nombre || !payload.sku || !payload.slug)
        throw new Error("Nombre, SKU y Slug son obligatorios");
      if (!/^[A-Z]{3}-\d{3}$/.test(payload.sku))
        throw new Error("SKU debe tener formato AAA-999");
      if (!Number.isFinite(payload.precio) || payload.precio <= 0)
        throw new Error("Precio debe ser un número > 0");

      await apiCreateProduct(payload);
      setForm(empty);
      onCreated?.();  // recarga lista
    } catch (err) {
      setError(err.message || "Error creando producto");
    } finally {
      setSending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="card">
      <h3>Crear producto</h3>
      <div className="grid">
        <label>Nombre
          <input name="nombre" value={form.nombre} onChange={onChange} required />
        </label>
        <label>SKU
          <input name="sku" value={form.sku} onChange={onChange} placeholder="AAA-999" required />
        </label>
        <label>Slug
          <input name="slug" value={form.slug} onChange={onChange} required />
        </label>
        <label>Precio
          <input name="precio" type="number" step="0.01" min="0.01"
                 value={form.precio} onChange={onChange} required />
        </label>
        <label className="check">
          <input name="activo" type="checkbox" checked={form.activo} onChange={onChange} />
          Activo
        </label>
      </div>
      <div className="row">
        <button disabled={sending}>{sending ? "Creando…" : "Crear"}</button>
        {error && <span className="error">{error}</span>}
      </div>
    </form>
  );
}
