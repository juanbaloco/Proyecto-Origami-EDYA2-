import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

// mock de API y del carrito
jest.mock('@/api', () => ({ apiGetProducts: jest.fn() }));
jest.mock('@/contexts/CartContext', () => ({ useCart: jest.fn() }));

import { apiGetProducts } from '@/api';
import { useCart } from '@/contexts/CartContext';

// mock de AuthContext
jest.mock('@/App', () => {
  const React = require('react');
  return { AuthContext: React.createContext(null) };
});
import { AuthContext } from '@/App';

import ProductsPage from '@/pages/ProductListPage';

describe('ProductsPage / ProductListPage', () => {
  const add = jest.fn();
  const items = [];

  beforeEach(() => {
    jest.clearAllMocks();
    useCart.mockReturnValue({ items, add });
    window.alert = jest.fn();
  });

  test('renderiza productos y filtra por nombre', async () => {
    apiGetProducts.mockResolvedValueOnce([
      { id: 1, nombre: 'Grulla', precio: 10, stock: 5 },
      { id: 2, nombre: 'Rosa', precio: 12, stock: 2 },
    ]);

    render(
      <AuthContext.Provider value={{ user: null }}>
        <ProductsPage />
      </AuthContext.Provider>
    );

    expect(screen.getByText(/Cargando productos/i)).toBeInTheDocument();

    expect(await screen.findByText('Grulla')).toBeInTheDocument();
    expect(screen.getByText('Rosa')).toBeInTheDocument();

    const input = screen.getByPlaceholderText(/Buscar productos/i);
    await userEvent.type(input, 'gru');

    expect(screen.getByText('Grulla')).toBeInTheDocument();
    expect(screen.queryByText('Rosa')).not.toBeInTheDocument();
  });

  test('click en "Añadir al Carrito" llama add y muestra alert', async () => {
    apiGetProducts.mockResolvedValueOnce([
      { id: 10, nombre: 'Rana', precio: 8, stock: 3 },
    ]);

    render(
      <AuthContext.Provider value={{ user: null }}>
        <ProductsPage />
      </AuthContext.Provider>
    );

    // Espera a que se renderice la tarjeta
    expect(await screen.findByText('Rana')).toBeInTheDocument();

    // El botón en tu UI se llama "Añadir al Carrito"
    const btn = screen.getByRole('button', { name: /Añadir al Carrito/i });
    await userEvent.click(btn);

    expect(add).toHaveBeenCalledWith(
      expect.objectContaining({ id: 10, nombre: 'Rana' }),
      1
    );
    expect(window.alert).toHaveBeenCalledWith('Producto añadido al carrito');
  });

  test('con stock 0 el botón está deshabilitado y NO llama add ni muestra alert', async () => {
    apiGetProducts.mockResolvedValueOnce([
      { id: 11, nombre: 'Dragón', precio: 20, stock: 0 },
    ]);

    render(
      <AuthContext.Provider value={{ user: null }}>
        <ProductsPage />
      </AuthContext.Provider>
    );

    expect(await screen.findByText('Dragón')).toBeInTheDocument();

    // En tu UI el botón cambia a "Sin Stock" y está deshabilitado
    const btn = screen.getByRole('button', { name: /Sin Stock/i });
    expect(btn).toBeDisabled();

    await userEvent.click(btn); // no debería hacer nada
    expect(add).not.toHaveBeenCalled();
    expect(window.alert).not.toHaveBeenCalled();
  });
});
