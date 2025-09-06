import ProductList from "./components/ProductList";
import ProductForm from "./components/ProductForm";
import "./App.css";

export default function App() {
  return (
    <div className="container">
      <header>
        <h1>Tienda de Origami — Productos</h1>
        <p className="muted">
          Lista, búsqueda (debounce) y creación de productos (cumple vertical slice).
        </p>
      </header>

      <main className="grid-2">
        <ProductList key="list" />
        <ProductForm key="form" onCreated={() => {
          // Fuerza recarga de la lista sin levantar estado global:
          const event = new Event("reload-products");
          window.dispatchEvent(event);
        }} />
      </main>
    </div>
  );
}
