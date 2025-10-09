import { useState } from "react";
import { apiRegister, apiLogin } from "../api.js";
import { useNavigate, Link } from "react-router-dom";

export default function RegisterPage() {
const [form, setForm] = useState({ username: "", email: "", password: "", confirm: "" });
const [sending, setSending] = useState(false);
const [error, setError] = useState("");
const navigate = useNavigate();

function onChange(e) {
const { name, value } = e.target;
setForm(f => ({ ...f, [name]: value }));
}

async function onSubmit(e) {
e.preventDefault();
setError("");
if (!form.username || !form.email || !form.password) {
  setError("Todos los campos son obligatorios.");
  return;
}
if (form.password.length < 6) {
  setError("La contraseña debe tener al menos 6 caracteres.");
  return;
}
if (form.password !== form.confirm) {
  setError("Las contraseñas no coinciden.");
  return;
}

setSending(true);
try {
  await apiRegister({
    username: form.username.trim(),
    email: form.email.trim(),
    password: form.password
  });
  await apiLogin(form.email, form.password); // guarda token
  navigate("/productos");
} catch (err) {
  setError(err.message || "No fue posible registrar la cuenta.");
} finally {
  setSending(false);
}
}

return (
<section className="card">
<h2>Crear cuenta</h2>
<form onSubmit={onSubmit}>
<label>Nombre de usuario
<input name="username" value={form.username} onChange={onChange} required />
</label>
<label>Correo electrónico
<input type="email" name="email" value={form.email} onChange={onChange} required />
</label>
<label>Contraseña
<input type="password" name="password" value={form.password} onChange={onChange} required />
</label>
<label>Confirmar contraseña
<input type="password" name="confirm" value={form.confirm} onChange={onChange} required />
</label>
<div className="row">
<button type="submit" disabled={sending}>
{sending ? "Creando…" : "Crear cuenta"}
</button>
{error && <span className="error">{error}</span>}
</div>
</form>
<p className="muted">
¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>.
</p>
</section>
);
}