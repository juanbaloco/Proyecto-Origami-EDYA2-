import React from "react";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";

jest.mock('@/api', () => ({
  apiGetProducts: jest.fn(),
  apiCreateProduct: jest.fn(),
  apiDeleteProduct: jest.fn(),
}));

import { apiGetProducts, apiCreateProduct, apiDeleteProduct } from '@/api';
import AdminDashboard from '@/pages/AdminDashboard.jsx';

describe('AdminDashboard - Productos', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    jest.clearAllMocks();
    window.alert = jest.fn();
    window.confirm = jest.fn(() => true);
  });

  test('crear producto con imagen → usa FormData (al menos llama API y aparece en la lista)', async () => {
    apiGetProducts
      .mockResolvedValueOnce([]) // carga inicial
      .mockResolvedValueOnce([   // después de crear, refresco
        { id: 99, nombre: 'Cisne', descripcion: 'Figura clásica', categoria: 'tradicional-pliegues', precio: 15, stock: 0 },
      ]);

    apiCreateProduct.mockResolvedValueOnce({ id: 99, nombre: 'Cisne' });

    render(
      <MemoryRouter initialEntries={['/admin']}>
        <AdminDashboard />
      </MemoryRouter>
    );

    const abrir = await screen.findByRole('button', { name: /\+ Crear Producto/i });
    await user.click(abrir);

    await user.type(screen.getByLabelText(/Nombre del Producto/i), 'Cisne');
    await user.type(screen.getByLabelText(/Descripción/i), 'Figura clásica');
    await user.selectOptions(screen.getByLabelText(/Categoría/i), 'tradicional-pliegues');
    await user.type(screen.getByLabelText(/Precio/i), '15');
    await user.type(screen.getByLabelText(/Stock/i), '0');

    const fileInput = screen.getByLabelText(/Imagen del Producto/i);
    const file = new File(['img'], 'foto.png', { type: 'image/png' });
    await user.upload(fileInput, file);

    await user.click(screen.getByRole('button', { name: /Crear Producto/i }));

    expect(apiCreateProduct).toHaveBeenCalled();
    expect(await screen.findByText(/Cisne/i)).toBeInTheDocument();
  });

  test('eliminar producto llama apiDeleteProduct y lo quita de la tabla', async () => {
    apiGetProducts
      .mockResolvedValueOnce([{ id: 1, nombre: 'Grulla', descripcion: 'Figura', categoria: 'origami-3d', precio: 10, stock: 3 }])
      .mockResolvedValueOnce([]); // tras borrar y refrescar

    apiDeleteProduct.mockResolvedValueOnce(true);

    render(
      <MemoryRouter initialEntries={['/admin']}>
        <AdminDashboard />
      </MemoryRouter>
    );

    const cell = await screen.findByText(/Grulla/i);
    const row = cell.closest('tr');
    const btnEliminar = within(row).getByRole('button', { name: /Eliminar/i });
    await user.click(btnEliminar);

    expect(window.confirm).toHaveBeenCalled();
    expect(apiDeleteProduct).toHaveBeenCalledWith(1);
    expect(await screen.findByText(/No hay productos/i)).toBeInTheDocument();
  });
});
