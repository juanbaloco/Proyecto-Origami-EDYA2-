import { useState } from "react";
import { apiCustomOrder } from "../api";

export default function CustomOrderPage() {
  const [nombrePersonalizado, setNombrePersonalizado] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [img, setImg] = useState("");
  const [contacto, setContacto] = useState({
    nombre: "",
    email: "",
    telefono: ""
  });
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

  async function submit(e) {
    e.preventDefault();
    setErr("");
    setMsg("");

    // Validaciones
    if (!nombrePersonalizado.trim()) {
      setErr("El nombre del pedido es obligatorio");
      return;
    }

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
      // ✅ FORMATO CORRECTO con nombre_personalizado
      await apiCustomOrder({
        nombre_personalizado: nombrePersonalizado.trim(),
        descripcion: descripcion.trim(),
        imagen_referencia: img || null,
        contacto: {
          nombre: contacto.nombre.trim(),
          email: contacto.email.trim(),
          telefono: contacto.telefono.trim()
        }
      });

      setMsg("✅ Pedido personalizado creado exitosamente, pronto nos contactaremos contigo.");
      
      // Limpiar formulario
      setNombrePersonalizado("");
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
    <div style={{
      maxWidth: "600px",
      margin: "2rem auto",
      padding: "2rem",
      background: "#fff",
      borderRadius: "12px",
      boxShadow: "0 2px 10px rgba(0,0,0,0.1)"
    }}>
      <h1 style={{ marginBottom: "1rem" }}>✨ Pedido Personalizado</h1>
      
      <p style={{ marginBottom: "2rem", color: "#666" }}>
        Describe tu diseño personalizado de origami 3D y nos pondremos en contacto contigo.
      </p>

      {msg && (
        <div style={{
          background: "#d4edda",
          color: "#155724",
          padding: "1rem",
          borderRadius: "8px",
          marginBottom: "1rem",
          border: "1px solid #c3e6cb"
        }}>
          {msg}
        </div>
      )}

      {err && (
        <div style={{
          background: "#f8d7da",
          color: "#721c24",
          padding: "1rem",
          borderRadius: "8px",
          marginBottom: "1rem",
          border: "1px solid #f5c6cb"
        }}>
          {err}
        </div>
      )}

      <form onSubmit={submit}>
        {/* ✅ NUEVO CAMPO: Nombre del Pedido */}
        <div style={{ marginBottom: "1.5rem" }}>
          <label style={{
            display: "block",
            marginBottom: "0.5rem",
            fontWeight: "600"
          }}>
            Nombre del pedido *
          </label>
          <input
            type="text"
            value={nombrePersonalizado}
            onChange={(e) => setNombrePersonalizado(e.target.value)}
            placeholder="Ej: Pikachu gigante, Cisne azul, Dragón dorado..."
            style={{
              width: "100%",
              padding: "0.75rem",
              border: "1px solid #ddd",
              borderRadius: "6px",
              fontSize: "1rem"
            }}
            required
          />
        </div>

        {/* Descripción */}
        <div style={{ marginBottom: "1.5rem" }}>
          <label style={{
            display: "block",
            marginBottom: "0.5rem",
            fontWeight: "600"
          }}>
            Descripción de tu pedido *
          </label>
          <textarea
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            rows={5}
            placeholder="Describe detalladamente cómo quieres tu diseño..."
            style={{
              width: "100%",
              padding: "0.75rem",
              border: "1px solid #ddd",
              borderRadius: "6px",
              fontSize: "1rem",
              resize: "vertical"
            }}
            required
          />
        </div>

        {/* Imagen de referencia */}
        <div style={{ marginBottom: "1.5rem" }}>
          <label style={{
            display: "block",
            marginBottom: "0.5rem",
            fontWeight: "600"
          }}>
            Imagen de referencia (opcional)
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={onFile}
            style={{
              width: "100%",
              padding: "0.75rem",
              border: "1px solid #ddd",
              borderRadius: "6px",
              fontSize: "1rem"
            }}
          />
          {img && (
            <img
              src={img}
              alt="Preview"
              style={{
                marginTop: "1rem",
                maxWidth: "100%",
                maxHeight: "300px",
                borderRadius: "8px",
                border: "1px solid #ddd"
              }}
            />
          )}
        </div>

        {/* Datos de contacto */}
        <div style={{
          marginTop: "2rem",
          paddingTop: "1.5rem",
          borderTop: "2px solid #eee"
        }}>
          <h3 style={{ marginBottom: "1rem", color: "#5a67d8" }}>
            📞 Datos de Contacto
          </h3>

          <div style={{ marginBottom: "1rem" }}>
            <label style={{
              display: "block",
              marginBottom: "0.5rem",
              fontWeight: "600"
            }}>
              Nombre completo *
            </label>
            <input
              type="text"
              value={contacto.nombre}
              onChange={(e) => setContacto({ ...contacto, nombre: e.target.value })}
              placeholder="Juan Pérez"
              style={{
                width: "100%",
                padding: "0.75rem",
                border: "1px solid #ddd",
                borderRadius: "6px",
                fontSize: "1rem"
              }}
              required
            />
          </div>

          <div style={{ marginBottom: "1rem" }}>
            <label style={{
              display: "block",
              marginBottom: "0.5rem",
              fontWeight: "600"
            }}>
              Correo electrónico *
            </label>
            <input
              type="email"
              value={contacto.email}
              onChange={(e) => setContacto({ ...contacto, email: e.target.value })}
              placeholder="ejemplo@correo.com"
              style={{
                width: "100%",
                padding: "0.75rem",
                border: "1px solid #ddd",
                borderRadius: "6px",
                fontSize: "1rem"
              }}
              required
            />
          </div>

          <div style={{ marginBottom: "1rem" }}>
            <label style={{
              display: "block",
              marginBottom: "0.5rem",
              fontWeight: "600"
            }}>
              Teléfono / WhatsApp *
            </label>
            <input
              type="tel"
              value={contacto.telefono}
              onChange={(e) => setContacto({ ...contacto, telefono: e.target.value })}
              placeholder="3001234567"
              style={{
                width: "100%",
                padding: "0.75rem",
                border: "1px solid #ddd",
                borderRadius: "6px",
                fontSize: "1rem"
              }}
              required
            />
          </div>
        </div>

        {/* Botón de envío */}
        <button
          type="submit"
          disabled={sending}
          style={{
            width: "100%",
            padding: "1rem",
            background: sending ? "#cbd5e0" : "#5a67d8",
            color: "white",
            border: "none",
            borderRadius: "8px",
            fontSize: "1.1rem",
            fontWeight: "600",
            cursor: sending ? "not-allowed" : "pointer",
            marginTop: "1.5rem"
          }}
        >
          {sending ? "Enviando..." : "Enviar Pedido Personalizado"}
        </button>
      </form>
    </div>
  );
}