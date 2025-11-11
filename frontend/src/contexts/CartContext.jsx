import { createContext, useContext, useEffect, useState } from "react";
export const CartContext = createContext(null);
export const useCart = () => {
   const context = useContext(CartContext);
};

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => JSON.parse(localStorage.getItem("cart") || "[]"));
  useEffect(() => localStorage.setItem("cart", JSON.stringify(items)), [items]);

  //agregar producto al carrito

  const add = (product, cantidad = 1) => {
    setItems(prev => {
      const found = prev.find(x => x.producto_id === product.id);
      return found
        ? prev.map(x => x.producto_id === product.id ? { ...x, cantidad: x.cantidad + cantidad } : x)
        : [...prev, { producto_id: product.id, nombre: product.nombre, precio: product.precio, imagen_url: product.imagen_url, cantidad }];
    });
  };
  const setQty = (producto_id, cantidad) => setItems(prev => prev.map(x => x.producto_id === producto_id ? { ...x, cantidad: Math.max(1, cantidad) } : x));
  const remove = (producto_id) => setItems(prev => prev.filter(x => x.producto_id !== producto_id));
  const clear = () => setItems([]);
  const total = items.reduce((s, x) => s + x.precio * x.cantidad, 0);

  return (
    <CartContext.Provider value={{ items, add, setQty, remove, clear, total }}>
      {children}
    </CartContext.Provider>
  );}
