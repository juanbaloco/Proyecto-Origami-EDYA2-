import { useState } from "react";
import { apiLogin } from "../api";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
const [form, setForm] = useState({ email: "", password: "" });
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
setSending(true);
if (!form.email || !form.password) {
setError("Todos los campos son obligatorios.");
setSending(false);
return;
}
try {
await apiLogin(form.email, form.password);
navigate("/productos");
} catch (err) {
setError(err.message || "Credenciales inválidas. Inténtalo de nuevo.");
} finally {
setSending(false);
}
}

return (
<section className="card">
<h2>Inicio de Sesión</h2>
<form onSubmit={onSubmit}>
<label>Correo Electrónico
<input type="email" name="email" value={form.email} onChange={onChange} required />
</label>
<label>Contraseña
<input type="password" name="password" value={form.password} onChange={onChange} required />
</label>
<div className="row">
<button type="submit" disabled={sending}>{sending ? "Iniciando..." : "Ingresar"}</button>
{error && <span className="error">{error}</span>}
</div>
</form>
<p className="muted">¿No tienes cuenta? <a href="/registro">Regístrate aquí</a>.</p>
</section>
);
}