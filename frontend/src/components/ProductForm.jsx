import { useState } from "react";
import { apiCreateProduct, clearToken } from "../api";
import { useNavigate } from "react-router-dom";

export default function ProductForm({ onCreated }) {
const navigate = useNavigate();
const [error, setError] = useState("");
const [sending, setSending] = useState(false);

const [form, setForm] = useState({
nombre: "",
descripcion: "",
precio: 0,
color: "",
tamano: "",
material: "",
imagen_url: "",
activo: true,
sku: "",
slug: "",
categoria_slug: ""
});

function onChange(e) {
const { name, value, type, checked } = e.target;
setForm(f => ({ ...f, [name]: type === "checkbox" ? checked : value }));
}

async function onSubmit(e) {
e.preventDefault();
setError("");
setSending(true);
try {
await apiCreateProduct({
...form,
precio: Number(form.precio)
});
onCreated?.();
navigate("/productos");
} catch (e) {
if (/401|403/.test(String(e.message))) {
clearToken();
navigate("/login");
} else {
setError(e.message || "Error al crear producto");
}
} finally {
setSending(false);
}
}

return (
<form className="card" onSubmit={onSubmit}>
<label>Nombre
<input name="nombre" value={form.nombre} onChange={onChange} required minLength={3} />
</label>
<label>Descripción
<textarea name="descripcion" value={form.descripcion} onChange={onChange} />
</label>
<label>Precio
<input name="precio" type="number" step="0.01" min="0.01" value={form.precio} onChange={onChange} required />
</label>
<label>Color
<input name="color" value={form.color} onChange={onChange} />
</label>
<label>Tamaño
<input name="tamano" value={form.tamano} onChange={onChange} />
</label>
<label>Material
<input name="material" value={form.material} onChange={onChange} />
</label>
<label>Imagen URL
<input name="imagen_url" value={form.imagen_url} onChange={onChange} />
</label>
<label>Activo
<input name="activo" type="checkbox" checked={form.activo} onChange={onChange} />
</label>
<label>SKU (AAA-999)
<input name="sku" value={form.sku} onChange={onChange} required />
</label>
<label>Slug
<input name="slug" value={form.slug} onChange={onChange} required />
</label>
<label>Categoría (3d|filigrama|pliegues|ensambles)
<input name="categoria_slug" value={form.categoria_slug} onChange={onChange} />
</label>

  {error && <div className="error">{error}</div>}
  <button type="submit" disabled={sending}>{sending ? "Creando..." : "Crear"}</button>
</form>
);
}