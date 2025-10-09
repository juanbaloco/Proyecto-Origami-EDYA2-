import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import ProductListPage from './pages/ProductListPage'; // Tu ProductList envuelto en una página
import ProductCreatePage from './pages/ProductCreatePage'; // Componente de Creación
import ProtectedRoute from './components/ProtectedRoute';

// Nota: Puedes renombrar ProductList.jsx a ProductListPage.jsx o envolverlo.

export default function App() {
    return (
        <BrowserRouter>
            <main>
                <Routes>
                    {/* Rutas Públicas */}
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/registro" element={<div>Página de Registro (similar a Login)</div>} />

                    {/* Rutas Protegidas (Requieren Token) */}
                    <Route element={<ProtectedRoute />}>
                        {/* 1. Entidad Principal (Origami/Producto) */}
                        <Route path="/productos" element={<ProductListPage />} /> {/* Listado */}
                        <Route path="/productos/new" element={<ProductCreatePage />} /> {/* Creación */}
                        <Route path="/productos/:id" element={<div>Detalle/Edición</div>} /> {/* Detalle/Edición */}
                        
                        {/* 2. Nuevas Entidades (Pedido y Fidelización) */}
                        <Route path="/pedidos" element={<div>Listado de Pedidos</div>} />
                        <Route path="/pedidos/:id" element={<div>Detalle de Pedido</div>} />
                        <Route path="/fidelizacion/new" element={<div>Crear Cliente de Fidelización</div>} />
                    </Route>

                    {/* Redirigir la raíz */}
                    <Route path="/" element={<Navigate to="/productos" />} />
                </Routes>
            </main>
        </BrowserRouter>
    );
}