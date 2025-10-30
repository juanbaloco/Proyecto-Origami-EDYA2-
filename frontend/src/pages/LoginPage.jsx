import { useState, useContext } from "react";
import { apiLogin, apiMe } from "../api";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../App";

export default function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { setUser } = useContext(AuthContext);

  function onChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    if (!form.email || !form.password) {
      setError("Todos los campos son obligatorios.");
      return;
    }
    setSending(true);
    try {
      await apiLogin(form.email, form.password);
      const u = await apiMe();
      setUser(u);
      navigate(u.is_admin ? "/admin" : "/productos");
    } catch (err) {
      setError(err.message || "Credenciales inválidas. Inténtalo de nuevo.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div>
      <h1>Inicio de Sesión</h1>
      <form onSubmit={onSubmit}>
        <label>Correo Electrónico</label>
        <input type="email" name="email" value={form.email} onChange={onChange} required />
        
        <label>Contraseña</label>
        <input type="password" name="password" value={form.password} onChange={onChange} required />
        
        <button type="submit" disabled={sending}>{sending ? "Iniciando..." : "Ingresar"}</button>
        {error && <p style={{color: "red"}}>{error}</p>}
      </form>
      <p>¿No tienes cuenta? <a href="/registro">Regístrate aquí</a>.</p>
    </div>
  );
}
