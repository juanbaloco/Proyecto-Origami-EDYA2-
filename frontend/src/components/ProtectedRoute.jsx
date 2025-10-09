import { Navigate, Outlet } from 'react-router-dom';
import { getToken } from '../api'; // Importamos la función para leer el token

export default function ProtectedRoute() {
    const isAuthenticated = !!getToken(); // Verifica si existe el token

    if (!isAuthenticated) {
        // Si no hay token, redirige a la página de login
        // Esto cumple el requisito de 'manejo de token JWT'
        return <Navigate to="/login" replace />; 
    }

    // Si hay token, renderiza la ruta anidada (listado, creación, etc.)
    return <Outlet />;
}