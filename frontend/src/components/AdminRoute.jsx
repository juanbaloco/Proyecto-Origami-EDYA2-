import { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { getToken } from "../api";
import { AuthContext } from "../App";

export default function AdminRoute() {
const { user } = useContext(AuthContext);
if (!getToken()) return <Navigate to="/login" replace />;
if (!user?.is_admin) return <Navigate to="/productos" replace />;
return <Outlet />;
}