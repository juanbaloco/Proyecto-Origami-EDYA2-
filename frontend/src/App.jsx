import { BrowserRouter, Routes, Route, Navigate, Link } from "react-router-dom";
import { createContext, useContext, useEffect, useState } from "react";
import { apiMe, clearToken, getToken } from "./api";
import { CartProvider } from "./contexts/CartContext";
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
import "./App.css";

export const AuthContext = createContext(null);

function Navbar() {
  const { user, setUser } = useContext(AuthContext);

  function handleLogout() {
    clearToken();
    setUser(null);
    window.location.href = "/";
  }

  const isAdmin = user?.is_admin === true;
  const showCartFeatures = !isAdmin;

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          🎨 Origami Store
        </Link>
        
        <div className="navbar-menu">
          {/* ✅ MOSTRAR CARRITO Y OTROS ENLACES PARA NO-ADMIN */}
          {showCartFeatures && (
            <>
              <Link to="/cart" className="navbar-link">
                🛒 Carrito
              </Link>
              
              {/* ✅ SOLO SI ESTÁ LOGEADO: mostrar enlaces adicionales */}
              {user && (
                <>
                  <Link to="/orders" className="navbar-link">
                    📦 Mis Pedidos
                  </Link>
                  <Link to="/custom-order" className="navbar-link">
                    ✨ Pedido Personalizado
                  </Link>
                  <Link to="/loyalty" className="navbar-link">
                    🎁 Fidelización
                  </Link>
                </>
              )}
            </>
          )}
          
          {/* ✅ SOLO MOSTRAR PARA ADMIN */}
          {user?.is_admin && (
            <Link to="/admin" className="navbar-link">
              ⚙️ Panel Admin
            </Link>
          )}
          
          {user ? (
            <div className="navbar-user">
              <span className="navbar-username">👋 {user.username}</span>
              <button onClick={handleLogout} className="navbar-logout">
                Cerrar Sesión
              </button>
            </div>
          ) : (
            <div className="navbar-auth">
              <Link to="/login" className="navbar-link">
                Iniciar Sesión
              </Link>
              <Link to="/register" className="navbar-link navbar-link--primary">
                Registrarse
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}


export default function App() {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const t = getToken();
    if (!t) {
      setReady(true);
      return;
    }
    
    apiMe()
      .then((u) => {
        console.log("✅ Usuario cargado:", u);
        setUser(u);
      })
      .catch(() => {
        clearToken();
        setUser(null);
      })
      .finally(() => setReady(true));
  }, []);

  if (!ready) return <div className="loading">Cargando...</div>;

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      <CartProvider>
        <BrowserRouter>
          <Navbar />
          <div className="main-content">
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              
              {/* ✅ HOME: TODOS VEN PRODUCTOS (incluye admin) */}
              <Route path="/" element={<ProductListPage />} />
              <Route path ="/products" element={<ProductListPage />} />

              {/* ✅ RUTAS SOLO PARA USUARIOS NO-ADMIN */}
              <Route
                path="/cart"
                element={
                  user?.is_admin ? (
                    <Navigate to="/admin" replace />
                  ) : (
                    
                      <CartPage />
                    
                  )
                }
              />
              <Route
                path="/orders"
                element={
                  user?.is_admin ? (
                    <Navigate to="/admin" replace />
                  ) : (
                    <ProtectedRoute>
                      <OrdersPage />
                    </ProtectedRoute>
                  )
                }
              />
              <Route
                path="/custom-order"
                element={
                  user?.is_admin ? (
                    <Navigate to="/admin" replace />
                  ) : (
                    <ProtectedRoute>
                      <CustomOrderPage />
                    </ProtectedRoute>
                  )
                }
              />
              <Route
                path="/loyalty"
                element={
                  user?.is_admin ? (
                    <Navigate to="/admin" replace />
                  ) : (
                    <ProtectedRoute>
                      <LoyaltyPage />
                    </ProtectedRoute>
                  )
                }
              />
              
              {/* ✅ RUTAS SOLO PARA ADMIN */}
              <Route
                path="/admin"
                element={
                  <AdminRoute>
                    <AdminDashboard />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/products/new"
                element={
                  <AdminRoute>
                    <ProductCreatePage />
                  </AdminRoute>
                }
              />
            </Routes>
          </div>
        </BrowserRouter>
      </CartProvider>
    </AuthContext.Provider>
  );
}
