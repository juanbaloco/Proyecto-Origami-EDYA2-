import { useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../App";
import ProductList from "../components/ProductList";

export default function ProductListPage() {
const { user } = useContext(AuthContext);
return (
<section className="container">
<div className="row">
<h1>Productos</h1>
{user?.is_admin && <Link to="/productos/new" className="btn">Nuevo producto</Link>}
</div>
<ProductList />
</section>
);
}