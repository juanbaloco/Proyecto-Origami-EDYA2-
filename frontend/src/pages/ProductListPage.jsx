import { useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../App";
import ProductList from "../components/ProductList";

export default function ProductListPage() {
  const { user } = useContext(AuthContext);
  
  return (
    <div>
      <h1>Productos</h1>
      {/* El botón solo lo ve el admin */}
      {user?.is_admin && (
        <Link to="/productos/nuevo" style={{padding: "0.5rem 1rem", background: "#007bff", color: "white", borderRadius: "4px", display: "inline-block", marginBottom: "1rem"}}>
          Nuevo producto
        </Link>
      )}
      <ProductList />
    </div>
  );
}
