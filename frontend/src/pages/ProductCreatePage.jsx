import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ProductCreatePage() {
  const navigate = useNavigate();
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  
  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    precio: 0,
    stock: 0,
    categoria: "Filigrana",
    color: "",
    tamano: "",
    material: "",
    imagen_url: ""
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      alert("Por favor selecciona una imagen válida");
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      alert("La imagen no puede superar 5MB");
      return;
    }
    
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      
      const response = await fetch("http://localhost:8000/api/productos/upload-image", {
        method: "POST",
        body: formData
      });
      
      if (!response.ok) {
        throw new Error("Error al subir la imagen");
      }
      
      const data = await response.json();
      setFormData(prev => ({ ...prev, imagen_url: data.image_url }));
      setImagePreview(`http://localhost:8000${data.image_url}`);
      alert("✅ Imagen subida exitosamente");
    } catch (error) {
      console.error("Error subiendo imagen:", error);
      alert("❌ Error al subir la imagen. Intenta de nuevo.");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.nombre.trim()) {
      alert("El nombre del producto es obligatorio");
      return;
    }
    
    if (formData.precio <= 0) {
      alert("El precio debe ser mayor a 0");
      return;
    }
    
    if (formData.stock < 0) {
      alert("El stock no puede ser negativo");
      return;
    }
    
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Debes iniciar sesión");
        navigate("/login");
        return;
      }
      
      const response = await fetch("http://localhost:8000/api/productos/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || "Error al crear producto");
      }
      
      alert("✅ Producto creado exitosamente");
      navigate("/admin");
    } catch (error) {
      console.error("Error creando producto:", error);
      alert(`❌ Error: ${error.message}`);
    }
  };

  return (
    <div style={{ padding: "2rem", maxWidth: "800px", margin: "0 auto" }}>
      <div style={{ marginBottom: "2rem" }}>
        <button
          onClick={() => navigate("/admin")}
          style={{
            padding: "0.5rem 1rem",
            backgroundColor: "#6b7280",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer"
          }}
        >
          ← Volver al Panel
        </button>
      </div>

      <h1 style={{ fontSize: "2rem", marginBottom: "2rem" }}>
        Agregar Nuevo Producto
      </h1>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        
        <div>
          <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500" }}>
            Nombre del Producto *
          </label>
          <input
            type="text"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            placeholder="Ej: Grulla de papel"
            required
            style={{
              width: "100%",
              padding: "0.75rem",
              border: "1px solid #ccc",
              borderRadius: "8px",
              fontSize: "1rem"
            }}
          />
        </div>

        <div>
          <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500" }}>
            Descripción *
          </label>
          <textarea
            name="descripcion"
            value={formData.descripcion}
            onChange={handleChange}
            placeholder="Describe el producto..."
            rows="3"
            required
            style={{
              width: "100%",
              padding: "0.75rem",
              border: "1px solid #ccc",
              borderRadius: "8px",
              fontSize: "1rem",
              fontFamily: "inherit"
            }}
          />
        </div>

        <div>
          <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500" }}>
            Categoría *
          </label>
          <select
            name="categoria"
            value={formData.categoria}
            onChange={handleChange}
            required
            style={{
              width: "100%",
              padding: "0.75rem",
              border: "1px solid #ccc",
              borderRadius: "8px",
              fontSize: "1rem"
            }}
          >
            <option value="Filigrana">Filigrana</option>
            <option value="Origami 3D">Origami 3D</option>
            <option value="Tradicional">Tradicional</option>
          </select>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          <div>
            <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500" }}>
              Precio *
            </label>
            <input
              type="number"
              name="precio"
              value={formData.precio}
              onChange={handleChange}
              placeholder="0.00"
              step="0.01"
              min="0"
              required
              style={{
                width: "100%",
                padding: "0.75rem",
                border: "1px solid #ccc",
                borderRadius: "8px",
                fontSize: "1rem"
              }}
            />
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500" }}>
              Stock *
            </label>
            <input
              type="number"
              name="stock"
              value={formData.stock}
              onChange={handleChange}
              placeholder="0"
              min="0"
              required
              style={{
                width: "100%",
                padding: "0.75rem",
                border: "1px solid #ccc",
                borderRadius: "8px",
                fontSize: "1rem"
              }}
            />
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem" }}>
          <div>
            <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500" }}>
              Color
            </label>
            <input
              type="text"
              name="color"
              value={formData.color}
              onChange={handleChange}
              placeholder="Ej: Rojo"
              style={{
                width: "100%",
                padding: "0.75rem",
                border: "1px solid #ccc",
                borderRadius: "8px",
                fontSize: "1rem"
              }}
            />
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500" }}>
              Tamaño
            </label>
            <input
              type="text"
              name="tamano"
              value={formData.tamano}
              onChange={handleChange}
              placeholder="Ej: Grande"
              style={{
                width: "100%",
                padding: "0.75rem",
                border: "1px solid #ccc",
                borderRadius: "8px",
                fontSize: "1rem"
              }}
            />
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500" }}>
              Material
            </label>
            <input
              type="text"
              name="material"
              value={formData.material}
              onChange={handleChange}
              placeholder="Ej: Papel plegado"
              style={{
                width: "100%",
                padding: "0.75rem",
                border: "1px solid #ccc",
                borderRadius: "8px",
                fontSize: "1rem"
              }}
            />
          </div>
        </div>

        <div>
          <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500" }}>
            Imagen del producto (opcional)
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            disabled={uploading}
            style={{
              width: "100%",
              padding: "0.75rem",
              border: "1px solid #ccc",
              borderRadius: "8px",
              fontSize: "1rem"
            }}
          />
          
          {uploading && (
            <p style={{ marginTop: "0.5rem", color: "#2563eb" }}>
              📤 Subiendo imagen...
            </p>
          )}
          
          {imagePreview && (
            <div style={{ marginTop: "1rem" }}>
              <p style={{ marginBottom: "0.5rem", color: "#16a34a", fontWeight: "500" }}>
                ✅ Imagen cargada:
              </p>
              <img 
                src={imagePreview} 
                alt="Preview" 
                style={{ 
                  maxWidth: "300px", 
                  maxHeight: "300px",
                  borderRadius: "8px",
                  border: "2px solid #e5e7eb",
                  objectFit: "cover"
                }}
              />
            </div>
          )}
        </div>

        <button
          type="submit"
          style={{
            padding: "1rem",
            backgroundColor: "#2563eb",
            color: "white",
            border: "none",
            borderRadius: "8px",
            fontSize: "1.1rem",
            fontWeight: "600",
            cursor: "pointer",
            transition: "background-color 0.2s"
          }}
          onMouseEnter={(e) => e.target.style.backgroundColor = "#1d4ed8"}
          onMouseLeave={(e) => e.target.style.backgroundColor = "#2563eb"}
        >
          Crear Producto
        </button>

        <p style={{ fontSize: "0.875rem", color: "#666", textAlign: "center" }}>
          * Campos obligatorios
        </p>
      </form>
    </div>
  );
}