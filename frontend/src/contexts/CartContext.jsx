import { createContext, useContext, useEffect, useState } from "react";

export const CartContext = createContext(null);

export const useCart = () => {
  const context = useContext(CartContext);
  // ✅ AGREGAR RETURN
  if (!context) {
    throw new Error("useCart debe usarse dentro de CartProvider");
  }
  return context;
};

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => 
    JSON.parse(localStorage.getItem("cart") || "[]")
  );

  // discount rate stored in localStorage when user is part of loyalty (e.g., 0.1 for 10%)
  const [discountRate, setDiscountRate] = useState(() => parseFloat(localStorage.getItem('fidelizado_discount') || '0'));

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(items));
  }, [items]);

  const add = (product, cantidad = 1) => {
    setItems((prev) => {
      const found = prev.find((x) => x.producto_id === product.id);
      return found
        ? prev.map((x) =>
            x.producto_id === product.id
              ? { ...x, cantidad: x.cantidad + cantidad }
              : x
          )
        : [
            ...prev,
            {
              producto_id: product.id,
              nombre: product.nombre,
              precio: product.precio,
              imagen_url: product.imagen_url,
              cantidad,
            },
          ];
    });
  };

  const setQty = (producto_id, cantidad) =>
    setItems((prev) =>
      prev.map((x) =>
        x.producto_id === producto_id
          ? { ...x, cantidad: Math.max(1, cantidad) }
          : x
      )
    );

  const remove = (producto_id) =>
    setItems((prev) => prev.filter((x) => x.producto_id !== producto_id));

  const clear = () => setItems([]);

  const rawTotal = items.reduce((sum, item) => sum + item.precio * item.cantidad, 0);
  const total = +(rawTotal * (1 - (discountRate || 0))).toFixed(2);

  const applyFidelizacionDiscount = (rate) => {
    const r = parseFloat(rate) || 0;
    localStorage.setItem('fidelizado_discount', String(r));
    setDiscountRate(r);
  };

  // ✅ RETORNAR EL PROVIDER CORRECTAMENTE
  return (
    <CartContext.Provider value={{ items, add, setQty, remove, clear, total, rawTotal, discountRate, applyFidelizacionDiscount }}>
      {children}
    </CartContext.Provider>
  );
}
