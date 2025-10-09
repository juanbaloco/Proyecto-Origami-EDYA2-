import ProductForm from "../components/ProductForm";
export default function ProductCreatePage() {
return (
<section className="container">
<h1>Nuevo producto</h1>
<ProductForm onCreated={() => window.dispatchEvent(new Event("reload-products"))} />
</section>
);
}