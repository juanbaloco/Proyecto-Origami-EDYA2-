import { Navigate, Outlet } from "react-router-dom";
import { getToken } from "../api";

export default function ProtectedRoute() {
const isAuthenticated = !!getToken();
if (!isAuthenticated) return <Navigate to="/login" replace />;
return <Outlet />;
}