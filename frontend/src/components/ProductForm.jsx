import { useState } from "react";
import { apiCreateProduct } from "../api";

const empty = {
  nombre: "", sku: "", slug: "",
  precio_cent: "", stock: "", activo: true
};

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
        sku: String(form.sku).trim(),
        slug: String(form.slug).trim(),
        precio_cent: Number(form.precio_cent),
        stock: Number(form.stock),
        activo: !!form.activo,
      };
      if (!payload.nombre || !payload.sku || !payload.slug) {
        throw new Error("Nombre, SKU y Slug son obligatorios");
      }
      if (!Number.isFinite(payload.precio_cent) || payload.precio_cent <= 0) {
        throw new Error("precio_cent debe ser un número > 0");
      }
      if (!Number.isFinite(payload.stock) || payload.stock < 0) {
        throw new Error("stock debe ser un número ≥ 0");
      }

      await apiCreateProduct(payload);
      setForm(empty);
      onCreated?.(); // dispara recarga de la lista
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
        <label>
          Nombre
          <input name="nombre" value={form.nombre} onChange={onChange} required />
        </label>
        <label>
          SKU
          <input name="sku" value={form.sku} onChange={onChange} required />
        </label>
        <label>
          Slug
          <input name="slug" value={form.slug} onChange={onChange} required />
        </label>
        <label>
          Precio (centavos)
          <input name="precio_cent" type="number" min="1" value={form.precio_cent} onChange={onChange} required />
        </label>
        <label>
          Stock
          <input name="stock" type="number" min="0" value={form.stock} onChange={onChange} required />
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
