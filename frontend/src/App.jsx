import { BrowserRouter, Routes, Route, Navigate, Link } from "react-router-dom";
import { createContext, useContext, useEffect, useState } from "react"; // ← AGREGADO useContext
import { apiMe, clearToken, getToken } from "./api";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";

import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ProductListPage from "./pages/ProductListPage";
import ProductCreatePage from "./pages/ProductCreatePage";
import CartPage from "./pages/CartPage";
import OrdersPage from "./pages/OrdersPage";
import CustomOrderPage from "./pages/CustomOrderPage";
import LoyaltyPage from "./pages/LoyaltyPage";
import AdminDashboard from "./pages/AdminDashboard";

export const AuthContext = createContext(null);

function Navbar() {
  const { user, setUser } = useContext(AuthContext);
  
  function handleLogout() {
    clearToken();
    setUser(null);
    window.location.href = "/";
  }

  return (
    <nav style={{
      display: "flex", 
      alignItems: "center", 
      justifyContent: "space-between", 
      padding: "1rem 2rem", 
      background: "#f5f5f5", 
      borderBottom: "1px solid #ddd"
    }}>
      <div style={{display: "flex", gap: "1rem", alignItems: "center"}}>
        <Link to="/" style={{fontWeight: "bold", fontSize: "1.2rem", textDecoration: "none", color: "#333"}}>
          Origami Arte
        </Link>
        <Link to="/" style={{textDecoration: "none", color: "#666"}}>Inicio</Link>
      </div>

      <div style={{display: "flex", gap: "1rem", alignItems: "center"}}>
        {user ? (
          <>
            {/* Usuario autenticado */}
            {!user.is_admin && (
              <>
                <Link to="/mis-pedidos" style={{textDecoration: "none", color: "#666"}}>Mis Pedidos</Link>
                <Link to="/pedidos-personalizados" style={{textDecoration: "none", color: "#666"}}>Pedidos Personalizados</Link>
                <Link to="/fidelizacion" style={{textDecoration: "none", color: "#666"}}>Fidelización</Link>
              </>
            )}
            
            {/* Admin */}
            {user.is_admin && (
              <Link to="/admin" style={{textDecoration: "none", color: "#007bff", fontWeight: "500"}}>
                Panel de Administración
              </Link>
            )}
            
            <Link to="/carrito" style={{textDecoration: "none", color: "#666"}}>🛒 Carrito</Link>
            <span style={{color: "#666", fontSize: "0.9rem"}}>{user.email}</span>
            <button onClick={handleLogout} style={{
              padding: "0.5rem 1rem", 
              cursor: "pointer",
              background: "#dc3545",
              color: "white",
              border: "none",
              borderRadius: "4px"
            }}>
              Cerrar Sesión
            </button>
          </>
        ) : (
          <>
            {/* Usuario no autenticado */}
            <Link to="/carrito" style={{textDecoration: "none", color: "#666"}}>🛒 Carrito</Link>
            <Link to="/login" style={{textDecoration: "none", color: "#666"}}>Iniciar Sesión</Link>
            <Link to="/registro" style={{
              textDecoration: "none", 
              color: "white",
              background: "#007bff",
              padding: "0.5rem 1rem",
              borderRadius: "4px"
            }}>Registrarse</Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const t = getToken();
    if (!t) { setReady(true); return; }
    apiMe()
      .then(setUser)
      .catch(() => { clearToken(); setUser(null); })
      .finally(() => setReady(true));
  }, []);

  if (!ready) return <div style={{padding: "2rem"}}>Cargando...</div>;

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      <BrowserRouter>
        <Navbar />
        <div style={{padding: "2rem"}}>
          <Routes>
            {/* Rutas públicas */}
            <Route path="/" element={<ProductListPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/registro" element={<RegisterPage />} />
            <Route path="/carrito" element={<CartPage />} />

            {/* Rutas protegidas para usuarios autenticados */}
            <Route element={<ProtectedRoute />}>
              <Route path="/mis-pedidos" element={<OrdersPage />} />
              <Route path="/pedidos-personalizados" element={<CustomOrderPage />} />
              <Route path="/fidelizacion" element={<LoyaltyPage />} />
            </Route>

            {/* Rutas protegidas para admin */}
            <Route element={<AdminRoute />}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/productos/nuevo" element={<ProductCreatePage />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </BrowserRouter>
    </AuthContext.Provider>
  );
}
