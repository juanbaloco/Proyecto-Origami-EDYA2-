import { useState } from "react";
import { apiCreateCustomOrder } from "../api";

export default function CustomOrderPage() {
  const [descripcion, setDescripcion] = useState("");
  const [img, setImg] = useState("");
  const [contacto, setContacto] = useState({ nombre: "", email: "", telefono: "" });
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [sending, setSending] = useState(false);

  function onFile(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    const fr = new FileReader();
    fr.onload = () => setImg(String(fr.result));
    fr.readAsDataURL(f);
  }

  async function submit() {
    setErr("");
    setMsg("");

    if (!descripcion.trim()) {
      setErr("La descripción es obligatoria");
      return;
    }

    if (!contacto.nombre.trim() || !contacto.email.trim() || !contacto.telefono.trim()) {
      setErr("Todos los datos de contacto son obligatorios");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(contacto.email)) {
      setErr("El correo electrónico no es válido");
      return;
    }

    setSending(true);
    try {
      await apiCreateCustomOrder({
        descripcion: descripcion.trim(),
        imagen_referencia: img || null,
        contacto: {
          nombre: contacto.nombre.trim(),
          email: contacto.email.trim(),
          telefono: contacto.telefono.trim()
        }
      });

      setMsg("✅ Pedido personalizado creado exitosamente, pronto nos contactaremos contigo.");
      setDescripcion("");
      setImg("");
      setContacto({ nombre: "", email: "", telefono: "" });
    } catch (error) {
      console.error("Error creando pedido personalizado:", error);
      setErr(error.message || "Error al crear el pedido personalizado");
    } finally {
      setSending(false);
    }
  }

  return (
    <div style={{ padding: "2rem", maxWidth: "600px", margin: "0 auto" }}>
      <h1 style={{ marginBottom: "1rem", color: "#667eea" }}>✨ Pedido Personalizado</h1>
      <p style={{ marginBottom: "2rem", color: "#666" }}>
        Describe tu diseño personalizado de origami 3D y nos pondremos en contacto contigo.
      </p>

      {msg && (
        <div style={{ padding: "1rem", background: "#d4edda", border: "1px solid #c3e6cb", borderRadius: "8px", marginBottom: "1rem", color: "#155724" }}>
          {msg}
        </div>
      )}

      {err && (
        <div style={{ padding: "1rem", background: "#f8d7da", border: "1px solid #f5c6cb", borderRadius: "8px", marginBottom: "1rem", color: "#721c24" }}>
          {err}
        </div>
      )}

      <div style={{ marginBottom: "1.5rem" }}>
        <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600" }}>
          Descripción de tu pedido *
        </label>
        <textarea
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          rows={5}
          placeholder="Describe el diseño, colores, tamaño y cualquier detalle importante..."
          style={{
            width: "100%",
            padding: "0.75rem",
            border: "1px solid #ddd",
            borderRadius: "8px",
            fontSize: "1rem",
            resize: "vertical"
          }}
        />
      </div>

      <div style={{ marginBottom: "1.5rem" }}>
        <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600" }}>
          Imagen de referencia (opcional)
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={onFile}
          style={{ display: "block", marginBottom: "1rem" }}
        />
        {img && (
          <img
            src={img}
            alt="Referencia"
            style={{ maxWidth: "200px", borderRadius: "8px", border: "1px solid #ddd" }}
          />
        )}
      </div>

      <h3 style={{ marginBottom: "1rem", color: "#667eea" }}>Datos de Contacto</h3>

      <div style={{ marginBottom: "1rem" }}>
        <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600" }}>
          Nombre completo *
        </label>
        <input
          type="text"
          value={contacto.nombre}
          onChange={(e) => setContacto({ ...contacto, nombre: e.target.value })}
          placeholder="Tu nombre completo"
          style={{
            width: "100%",
            padding: "0.75rem",
            border: "1px solid #ddd",
            borderRadius: "8px",
            fontSize: "1rem"
          }}
        />
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600" }}>
          Correo electrónico *
        </label>
        <input
          type="email"
          value={contacto.email}
          onChange={(e) => setContacto({ ...contacto, email: e.target.value })}
          placeholder="tu@email.com"
          style={{
            width: "100%",
            padding: "0.75rem",
            border: "1px solid #ddd",
            borderRadius: "8px",
            fontSize: "1rem"
          }}
        />
      </div>

      <div style={{ marginBottom: "2rem" }}>
        <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600" }}>
          Teléfono *
        </label>
        <input
          type="tel"
          value={contacto.telefono}
          onChange={(e) => setContacto({ ...contacto, telefono: e.target.value })}
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

      <button
        onClick={submit}
        disabled={sending}
        style={{
          padding: "0.75rem 2rem",
          background: sending ? "#ccc" : "#667eea",
          color: "white",
          border: "none",
          borderRadius: "8px",
          fontSize: "1rem",
          fontWeight: "600",
          cursor: sending ? "not-allowed" : "pointer",
          transition: "background 0.3s"
        }}
      >
        {sending ? "Enviando..." : "Enviar Pedido Personalizado"}
      </button>
    </div>
  );
}
