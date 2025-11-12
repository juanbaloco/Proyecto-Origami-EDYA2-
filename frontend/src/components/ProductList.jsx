import { useState, useEffect } from "react";
import { apiGetProducts } from "../api";
import { useCart } from "../contexts/CartContext";

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const { discountRate } = useCart();

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await apiGetProducts();
      setProducts(response.data || []);
    } catch (error) {
      console.error("Error al cargar productos:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter((p) =>
    p.nombre?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ minHeight: "100vh", background: "#f5f6fa", padding: "20px" }}>
      {discountRate > 0 && (
        <div style={{ maxWidth: '1200px', margin: '0 auto 16px auto' }}>
          <div style={{ padding: 12, background: '#e6f6ff', border: '1px solid #bfe9ff', borderRadius: 8, textAlign: 'center' }}>
            <strong style={{ color: '#0369a1' }}>🎁  Tienes {Math.round(discountRate * 100)}% de descuento</strong>
          </div>
        </div>
      )}
      {/* Header simple sin crear productos */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "30px",
        background: "white",
        padding: "15px 25px",
        borderRadius: "10px",
        boxShadow: "0 2px 4px rgba(0,0,0,0.05)"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <h2 style={{ margin: 0, fontSize: "20px", fontWeight: "bold" }}>Origami Arte</h2>
          <span style={{ fontSize: "14px", cursor: "pointer" }}>Inicio</span>
          <span style={{ fontSize: "14px", color: "#0066cc", cursor: "pointer" }}>
            Panel de Administración
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <span style={{ fontSize: "14px" }}>🛒 Carrito</span>
          <span style={{ fontSize: "14px", color: "#666" }}>balocojuan@gmail.com</span>
          <button style={{
            padding: "8px 20px",
            background: "#dc3545",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: "14px"
          }}>
            Cerrar Sesión
          </button>
        </div>
      </div>

      {/* Contenido principal */}
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <h1 style={{ fontSize: "32px", marginBottom: "20px", color: "#2d3748" }}>
          Productos
        </h1>

        {/* Buscador */}
        <input
          type="text"
          placeholder="Buscar productos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: "100%",
            maxWidth: "400px",
            padding: "12px 16px",
            border: "1px solid #cbd5e1",
            borderRadius: "8px",
            fontSize: "14px",
            marginBottom: "25px",
            boxSizing: "border-box"
          }}
        />

        {/* Lista de productos */}
        {loading ? (
          <div style={{
            background: "white",
            padding: "40px",
            borderRadius: "12px",
            textAlign: "center",
            color: "#64748b"
          }}>
            Cargando productos...
          </div>
        ) : filteredProducts.length === 0 ? (
          <div style={{
            background: "white",
            padding: "40px",
            borderRadius: "12px",
            textAlign: "center",
            color: "#64748b"
          }}>
            No hay productos disponibles
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "20px" }}>
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                style={{
                  background: "white",
                  padding: "20px",
                  borderRadius: "12px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                  transition: "transform 0.2s, box-shadow 0.2s",
                  cursor: "pointer"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-4px)";
                  e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.06)";
                }}
              >
                {product.imagen_url && (
                  <img
                    src={product.imagen_url}
                    alt={product.nombre}
                    onError={(e) => { e.target.style.display = 'none'; }}
                    style={{
                      width: "100%",
                      height: "200px",
                      objectFit: "cover",
                      borderRadius: "8px",
                      marginBottom: "15px"
                    }}
                  />
                )}
                <h3 style={{ margin: "0 0 10px 0", fontSize: "20px", color: "#2d3748" }}>
                  {product.nombre}
                </h3>
                <p style={{ margin: "0 0 10px 0", fontSize: "14px", color: "#64748b", lineHeight: "1.5" }}>
                  {product.descripcion}
                </p>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "15px" }}>
                  <p style={{ margin: 0, fontSize: "20px", fontWeight: "700", color: "#2d3748" }}>
                    ${product.precio}
                  </p>
                  <p style={{ margin: 0, fontSize: "13px", color: "#64748b" }}>
                    Stock: {product.stock}
                  </p>
                </div>
                <button style={{
                  width: "100%",
                  marginTop: "15px",
                  padding: "10px",
                  background: "#667eea",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: "500"
                }}>
                  Agregar al carrito
                </button>
              </div>
            ))}
          </div>
        )}

        <p style={{ marginTop: "30px", fontSize: "14px", color: "#64748b", textAlign: "center" }}>
          Total de productos: {filteredProducts.length}
        </p>
      </div>
    </div>
  );
}