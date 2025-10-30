import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../App";

export default function CustomOrderPage() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [form, setForm] = useState({
    descripcion: "",
    imagen_referencia: "",
    nombre: "",
    telefono: ""
  });
  
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    
    // Validaciones
    if (!form.descripcion.trim()) {
      setError("Por favor describe tu pedido personalizado");
      return;
    }
    
    if (!form.nombre.trim()) {
      setError("Por favor ingresa tu nombre completo");
      return;
    }

    setLoading(true);
    
    try {
      const token = localStorage.getItem("auth_token");
      const res = await fetch("http://127.0.0.1:8000/api/pedidos/personalizado", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          contacto: {
            nombre: form.nombre,
            email: user?.email || "",
            telefono: form.telefono || null
          },
          descripcion: form.descripcion,
          imagen_referencia: form.imagen_referencia || null
        })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || `Error ${res.status}`);
      }

      const data = await res.json();
      alert(`✅ Pedido personalizado creado exitosamente\nID: ${data.id}`);
      setForm({ descripcion: "", imagen_referencia: "", nombre: "", telefono: "" });
      navigate("/mis-pedidos");
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: "600px", margin: "0 auto", padding: "2rem" }}>
      <h1>Pedido Personalizado</h1>
      <p style={{ color: "#666", marginBottom: "2rem" }}>
        Describe tu diseño personalizado de origami 3D y nos pondremos en contacto contigo.
      </p>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <div>
          <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500" }}>
            Descripción del diseño *
          </label>
          <textarea
            value={form.descripcion}
            onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
            placeholder="Ejemplo: Quiero una grulla de origami 3D de 30cm de altura en color azul y blanco..."
            rows="6"
            required
            style={{
              width: "100%",
              padding: "0.75rem",
              border: "1px solid #ddd",
              borderRadius: "8px",
              fontSize: "1rem",
              fontFamily: "inherit"
            }}
          />
        </div>

        <div>
          <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500" }}>
            URL de imagen de referencia (opcional)
          </label>
          <input
            type="url"
            value={form.imagen_referencia}
            onChange={(e) => setForm({ ...form, imagen_referencia: e.target.value })}
            placeholder="https://ejemplo.com/imagen.jpg"
            style={{
              width: "100%",
              padding: "0.75rem",
              border: "1px solid #ddd",
              borderRadius: "8px",
              fontSize: "1rem"
            }}
          />
          <small style={{ color: "#666", fontSize: "0.85rem" }}>
            Puedes subir una imagen a imgur.com o similares y pegar el enlace aquí
          </small>
        </div>

        <div>
          <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500" }}>
            Nombre completo *
          </label>
          <input
            type="text"
            value={form.nombre}
            onChange={(e) => setForm({ ...form, nombre: e.target.value })}
            placeholder="Juan Pérez"
            required
            style={{
              width: "100%",
              padding: "0.75rem",
              border: "1px solid #ddd",
              borderRadius: "8px",
              fontSize: "1rem"
            }}
          />
        </div>

        <div>
          <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500" }}>
            Teléfono (opcional)
          </label>
          <input
            type="tel"
            value={form.telefono}
            onChange={(e) => setForm({ ...form, telefono: e.target.value })}
            placeholder="+57 300 123 4567"
            style={{
              width: "100%",
              padding: "0.75rem",
              border: "1px solid #ddd",
              borderRadius: "8px",
              fontSize: "1rem"
            }}
          />
        </div>

        {error && (
          <div style={{
            padding: "0.75rem",
            background: "#fee",
            border: "1px solid #fcc",
            borderRadius: "8px",
            color: "#c00"
          }}>
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{
            padding: "0.75rem 1.5rem",
            background: loading ? "#ccc" : "#000",
            color: "white",
            border: "none",
            borderRadius: "8px",
            fontSize: "1rem",
            fontWeight: "500",
            cursor: loading ? "not-allowed" : "pointer"
          }}
        >
          {loading ? "Enviando..." : "Enviar Pedido Personalizado"}
        </button>
      </form>

      <div style={{
        marginTop: "2rem",
        padding: "1rem",
        background: "#f9f9f9",
        borderRadius: "8px",
        borderLeft: "4px solid #007bff"
      }}>
        <h3 style={{ marginTop: 0, fontSize: "1rem" }}>💡 Consejos para tu pedido:</h3>
        <ul style={{ margin: "0.5rem 0 0 0", paddingLeft: "1.5rem", color: "#666" }}>
          <li>Describe el tamaño aproximado que deseas</li>
          <li>Especifica colores preferidos</li>
          <li>Menciona si es para un evento especial</li>
          <li>Incluye una imagen de referencia si es posible</li>
        </ul>
      </div>
    </div>
  );
}
