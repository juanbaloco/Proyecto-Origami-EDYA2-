import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiCreateProduct, clearToken } from "../api";

export default function ProductForm({ onCreated }) {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const [form, setForm] = useState({
    nombre: "", descripcion: "", precio: 0, color: "", tamano: "",
    material: "", imagen_url: "", activo: true, categoria_slug: "", stock: 0
  });

  function onChange(e) {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setSending(true);
    try {
      await apiCreateProduct({
        ...form,
        precio: Number(form.precio),
        stock: Number(form.stock ?? 0),
        categoria_slug: form.categoria_slug || null,
      });
      onCreated?.();
      navigate("/productos");
    } catch (err) {
      const msg = err?.message || "Error al crear producto";
      if (/401|403/.test(String(msg))) {
        clearToken();
        navigate("/login");
      } else {
        setError(msg);
      }
    } finally {
      setSending(false);
    }
  }

  return (
    <form onSubmit={onSubmit}>
      <label>Nombre<input name="nombre" value={form.nombre} onChange={onChange} required /></label>
      <label>Descripción<textarea name="descripcion" value={form.descripcion} onChange={onChange} /></label>
      <label>Precio<input name="precio" type="number" step="0.01" value={form.precio} onChange={onChange} required /></label>
      <label>Color<input name="color" value={form.color} onChange={onChange} /></label>
      <label>Tamaño<input name="tamano" value={form.tamano} onChange={onChange} /></label>
      <label>Material<input name="material" value={form.material} onChange={onChange} /></label>
      <label>Imagen URL<input name="imagen_url" value={form.imagen_url} onChange={onChange} /></label>
      <label>Stock<input name="stock" type="number" value={form.stock} onChange={onChange} required /></label>
      <label>Categoría
        <select name="categoria_slug" value={form.categoria_slug} onChange={onChange}>
          <option value="">-- Seleccionar --</option>
          <option value="3d">Origami 3D</option>
          <option value="filigrama">Filigrama</option>
          <option value="pliegues">Pliegues</option>
          <option value="ensambles">Ensambles</option>
        </select>
      </label>
      <label><input type="checkbox" name="activo" checked={form.activo} onChange={onChange} /> Activo</label>
      <button type="submit" disabled={sending}>{sending ? "Creando..." : "Crear"}</button>
      {error && <p style={{color: "red"}}>{error}</p>}
    </form>
  );
}
