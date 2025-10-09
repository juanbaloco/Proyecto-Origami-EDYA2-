import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { createContext, useEffect, useState } from "react";
import { apiMe, clearToken, getToken } from "./api";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ProductListPage from "./pages/ProductListPage";
import ProductCreatePage from "./pages/ProductCreatePage";

export const AuthContext = createContext(null);

export default function App() {
const [user, setUser] = useState(null); // { id, username, email, is_admin }
const [ready, setReady] = useState(false);

useEffect(() => {
const t = getToken();
if (!t) { setReady(true); return; }
apiMe()
.then(setUser)
.catch(() => { clearToken(); setUser(null); })
.finally(() => setReady(true));
}, []);

if (!ready) return null;

return (
<AuthContext.Provider value={{ user, setUser }}>
<BrowserRouter>
<main>
<Routes>
<Route path="/login" element={<LoginPage />} />
<Route path="/registro" element={<RegisterPage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/productos" element={<ProductListPage />} />
          <Route element={<AdminRoute />}>
            <Route path="/productos/new" element={<ProductCreatePage />} />
          </Route>
        </Route>

        <Route path="/" element={<Navigate to="/productos" />} />
      </Routes>
    </main>
  </BrowserRouter>
</AuthContext.Provider>
);
}