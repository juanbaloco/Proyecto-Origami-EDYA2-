import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";

jest.mock('@/api', () => ({
  apiGetOrders: jest.fn(),
  apiUpdateOrder: jest.fn(),
}));

import { apiGetOrders } from '@/api';
import AdminDashboard from '@/pages/AdminDashboard.jsx';

describe('AdminDashboard - Pedidos (normales)', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    jest.clearAllMocks();
    window.alert = jest.fn();
  });

  test('muestra pedidos al ir a Pedidos Normales', async () => {
    apiGetOrders.mockResolvedValueOnce([
      { id: 10, estado: 'pendiente', contacto_nombre: 'Ana', contacto_email: 'ana@example.com', contacto_telefono: '123' },
      { id: 11, estado: 'enviado', contacto_nombre: 'Luis', contacto_email: 'luis@example.com', contacto_telefono: '456' },
    ]);

    render(
      <MemoryRouter initialEntries={['/admin']}>
        <AdminDashboard />
      </MemoryRouter>
    );

    const btnTab = screen.getByRole('button', { name: /Pedidos Normales/i });
    await user.click(btnTab);

    expect(await screen.findByText(/Pedido #\s*10/i)).toBeInTheDocument();
    expect(await screen.findByText(/Pedido #\s*11/i)).toBeInTheDocument();
    expect(await screen.findByText(/pendiente/i)).toBeInTheDocument();
    expect(await screen.findByText(/enviado/i)).toBeInTheDocument();
  });
});
