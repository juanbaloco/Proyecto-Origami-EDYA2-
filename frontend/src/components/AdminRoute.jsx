// src/components/AdminRoute.jsx

import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { getToken } from "../api";
import { AuthContext } from "../App";

export default function AdminRoute({ children }) {
  const { user } = useContext(AuthContext);

  if (!getToken()) return <Navigate to="/login" replace />;

  if (!user?.is_admin) return <Navigate to="/" replace />;

  return children;
}
