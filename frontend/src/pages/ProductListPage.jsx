import { useState, useEffect, useContext } from "react";
import { apiGetProducts } from "../api";
import { useCart } from "../contexts/CartContext";
import { AuthContext } from "../App";

// ✅ URL base del backend
const BASE_URL = "http://localhost:8000";

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const { items, add, discountRate } = useCart();
  const { user } = useContext(AuthContext);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await apiGetProducts();
      const finalProducts = response.data || response || [];
      setProducts(finalProducts);
    } catch (error) {
      console.error("Error al cargar productos:", error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Filtro combinado de búsqueda Y categoría
  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.nombre?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || p.categoria === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const addToCart = (product) => {
    if (product.stock <= 0) {
      alert("Sin stock");
      return;
    }
    try {
      add(product, 1);
      alert("Producto añadido al carrito");
    } catch (err) {
      console.error("Error añadiendo al carrito:", err);
      alert("No se pudo añadir al carrito");
    }
  };

  // ✅ CORREGIDO: Usar producto_id en lugar de item.producto.id
  const checkCartQuantity = (productId) => {
    if (!items || !Array.isArray(items)) return 0;
    const item = items.find((item) => item.producto_id === productId);
    return item ? item.cantidad : 0;
  };

  const isAdmin = user?.is_admin === true;
  const showCartFeatures = !isAdmin;

  return (
    <div style={{ minHeight: "100vh", background: "#f5f6fa", padding: "40px 20px" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <h1 style={{ fontSize: "28px", marginBottom: "30px", textAlign: "center", color: "#2d3748" }}>
          Productos de Origami
        </h1>

        {/* Banner de fidelización si hay descuento activo */}
        {discountRate > 0 && (
          <div style={{ marginBottom: 20, padding: 16, background: '#e6f6ff', border: '1px solid #bfe9ff', borderRadius: 8, textAlign: 'center' }}>
            <strong style={{ color: '#0369a1' }}>🎁 ¡Felicidades!</strong>
            <span style={{ marginLeft: 8, color: '#075985' }}>Tienes {Math.round(discountRate * 100)}% de descuento en tu carrito.</span>
          </div>
        )}

        {/* ✅ Barra de filtros */}
        <div style={{ display: "flex", gap: "15px", marginBottom: "30px", flexWrap: "wrap" }}>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar productos..."
            style={{
              flex: 1,
              minWidth: "250px",
              padding: "12px 16px",
              fontSize: "14px",
              border: "1px solid #e2e8f0",
              borderRadius: "8px",
              outline: "none"
            }}
          />

          {/* ✅ Select de categoría con slugs */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            style={{
              padding: "12px 16px",
              fontSize: "14px",
              border: "1px solid #e2e8f0",
              borderRadius: "8px",
              outline: "none",
              cursor: "pointer",
              backgroundColor: "white",
              minWidth: "200px"
            }}
          >
            <option value="">Todas las categorías</option>
            <option value="origami-3d">Origami 3D</option>
            <option value="filigrana">Filigrana</option>
            <option value="tradicional-pliegues">Tradicional/Pliegues</option>
          </select>
        </div>

        <p style={{ textAlign: "right", color: "#64748b", fontSize: "14px", marginBottom: "20px" }}>
          Total de productos: {filteredProducts.length}
        </p>

        {loading ? (
          <div style={{ textAlign: "center", padding: "60px", color: "#94a3b8" }}>
            Cargando productos...
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "24px" }}>
            {filteredProducts.length === 0 ? (
              <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "60px", color: "#94a3b8" }}>
                No se encontraron productos
              </div>
            ) : (
              filteredProducts.map((product) => (
                <div
                  key={product.id}
                  style={{
                    background: "white",
                    borderRadius: "12px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                    padding: "20px",
                    transition: "transform 0.2s",
                    border: "1px solid #e2e8f0"
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-4px)")}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
                >
                  {/* ✅ IMAGEN CON URL COMPLETA */}
                  {product.imagen_url && (
                    <img
                      src={`${BASE_URL}${product.imagen_url}`}
                      alt={product.nombre}
                      style={{
                        width: "100%",
                        height: "200px",
                        objectFit: "cover",
                        borderRadius: "8px",
                        marginBottom: "15px"
                      }}
                      onError={(e) => {
                        e.target.style.display = "none";
                      }}
                    />
                  )}

                  <h3 style={{ fontSize: "18px", marginBottom: "8px", color: "#2d3748", fontWeight: "600" }}>
                    {product.nombre}
                  </h3>

                  {product.descripcion && (
                    <p style={{ fontSize: "14px", color: "#64748b", marginBottom: "12px", lineHeight: "1.5" }}>
                      {product.descripcion}
                    </p>
                  )}

                  {/* ✅ CAMPOS ADICIONALES: Categoría, Color, Tamaño, Material */}
                  <div style={{ fontSize: "13px", color: "#475569", marginBottom: "12px", lineHeight: "1.6" }}>
                    {product.categoria && (
                      <p style={{ margin: "4px 0" }}>
                        <strong>Categoría:</strong> {product.categoria}
                      </p>
                    )}
                    {product.color && (
                      <p style={{ margin: "4px 0" }}>
                        <strong>Color:</strong> {product.color}
                      </p>
                    )}
                    {product.tamano && (
                      <p style={{ margin: "4px 0" }}>
                        <strong>Tamaño:</strong> {product.tamano}
                      </p>
                    )}
                    {product.material && (
                      <p style={{ margin: "4px 0" }}>
                        <strong>Material:</strong> {product.material}
                      </p>
                    )}
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
                    <span style={{ fontSize: "22px", fontWeight: "700", color: "#2d3748" }}>
                      ${product.precio}
                    </span>
                    <span style={{ fontSize: "13px", color: product.stock > 0 ? "#16a34a" : "#dc2626", fontWeight: "500" }}>
                      {product.stock > 0 ? `${product.stock} disponible` : "Sin stock"}
                    </span>
                  </div>

                  {showCartFeatures && (
                    <div style={{ marginTop: "15px" }}>
                      {checkCartQuantity(product.id) > 0 && (
                        <p style={{ fontSize: "13px", color: "#3b82f6", marginBottom: "8px", fontWeight: "500" }}>
                          {checkCartQuantity(product.id)} en el carrito
                        </p>
                      )}
                      <button
                        onClick={() => addToCart(product)}
                        disabled={product.stock <= 0}
                        style={{
                          width: "100%",
                          padding: "10px",
                          background: product.stock > 0 ? "#1a202c" : "#cbd5e1",
                          color: "white",
                          border: "none",
                          borderRadius: "8px",
                          cursor: product.stock > 0 ? "pointer" : "not-allowed",
                          fontSize: "14px",
                          fontWeight: "500",
                          transition: "background 0.2s"
                        }}
                        onMouseEnter={(e) => {
                          if (product.stock > 0) e.currentTarget.style.background = "#2d3748";
                        }}
                        onMouseLeave={(e) => {
                          if (product.stock > 0) e.currentTarget.style.background = "#1a202c";
                        }}
                      >
                        {product.stock > 0 ? "Añadir al Carrito" : "Sin Stock"}
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
