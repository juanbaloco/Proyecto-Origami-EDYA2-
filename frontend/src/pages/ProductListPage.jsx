import { useState, useEffect, useContext } from "react";
import { apiGetProducts } from "../api";
import { useCart } from "../contexts/CartContext";
import { AuthContext } from "../App";

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const { items, add } = useCart();
  const { user } = useContext(AuthContext);

  useEffect(() => {
    loadProducts();
  }, []);

   const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await apiGetProducts();
      
      // ✅ Maneja ambos formatos: {data: [...]} o [...]
      const finalProducts = response.data || response || [];
      setProducts(finalProducts);
    } catch (error) {
      console.error("Error al cargar productos:", error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };


  const filteredProducts = products.filter((p) =>
    p.nombre?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  const checkCartQuantity = (productId) => {
    const item = items.find(item => item.producto.id === productId);
    return item ? item.quantity : 0;
  };
  const isAdmin = user?.is_admin === true;
  const showCartFeatures = !isAdmin;

  return (
    <div style={{ minHeight: "100vh", background: "#f5f6fa", padding: "20px" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <h1 style={{ fontSize: "32px", marginBottom: "20px", color: "#2d3748" }}>
          Productos
        </h1>

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
                  transition: "transform 0.2s, box-shadow 0.2s"
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
                  <p style={{ margin: 0, fontSize: "13px", color: product.stock > 0 ? "#16a34a" : "#dc2626", fontWeight: "500" }}>
                    {product.stock > 0 ? `${product.stock} disponible` : "Sin stock"}
                  </p>

                  {showCartFeatures &&(
                    <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                      <button
                        onClick={() => addToCart(product)}
                        disabled={product.stock <= 0}
                        style={{
                          padding: "8px 12px",
                          background: product.stock > 0 ? "#2563eb" : "#9ca3af",
                          color: "white",
                          border: "none",
                          borderRadius: "8px",
                          cursor: product.stock > 0 ? "pointer" : "not-allowed",
                          fontWeight: 600,
                          fontSize: "14px",
                      }}
                    >
                      Añadir al carrito
                    </button>
                    <button
                      onClick={() => alert(`En el carrito: ${checkCartQuantity(product.id)} unidad(es)`)}
                      style={{
                        padding: "6px 10px",
                        background: "transparent",
                        border: "1px solid #e2e8f0",
                        borderRadius: "8px",
                        cursor: "pointer",
                        fontSize: "13px",
                        color: "#374151",
                      }}
                    >
                      Ver en carrito
                    </button>
                  </div>
                  )}
                  {/*✅ MENSAJE PARA ADMIN */}
                  {isAdmin && (
                    <div style={{
                       width: "100%",
                       paddingTop: "10px",
                       background: "f0f9ff",
                       border: "1px solid #ae6fd",
                        borderRadius: "8px",
                        textAlign: "center",
                        fontSize: "13px",
                        color: " #0369a1",
                        fontWeight: "500",
                    }}
                    >
                      Vista de administrador
                </div>
                  )}
              </div>
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