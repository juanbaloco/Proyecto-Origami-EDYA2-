import React from "react";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";

jest.mock('@/api', () => ({
  apiGetCustomOrders: jest.fn(),
  apiUpdateCustomOrder: jest.fn(),
}));

import { apiGetCustomOrders, apiUpdateCustomOrder } from '@/api';
import AdminDashboard from '@/pages/AdminDashboard.jsx';

describe('AdminDashboard - Pedidos Personalizados', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    jest.clearAllMocks();
    window.alert = jest.fn();
  });

  test('muestra pedidos personalizados al ir a la pestaña', async () => {
    apiGetCustomOrders.mockResolvedValueOnce([
      { id: 21, estado: 'pendiente', contacto_nombre: 'Carlos', contacto_email: 'c@x.com', contacto_telefono: '111' },
      { id: 22, estado: 'en_proceso', contacto_nombre: 'María', contacto_email: 'm@y.com', contacto_telefono: '222' },
    ]);

    render(
      <MemoryRouter initialEntries={['/admin']}>
        <AdminDashboard />
      </MemoryRouter>
    );

    const btnTab = screen.getByRole('button', { name: /Pedidos Personalizados/i });
    await user.click(btnTab);

    expect(await screen.findByText(/Pedido #\s*21/i)).toBeInTheDocument();
    expect(await screen.findByText(/Pedido #\s*22/i)).toBeInTheDocument();

    // Si existe el selector de estado, probar un cambio rápido
    const cardTitle = await screen.findByText(/Pedido #\s*21/i);
    const cardNode = cardTitle.closest('div');
    const estadoLabel = within(cardNode).queryByText(/Cambiar estado/i);
    const select = estadoLabel?.closest('div')?.querySelector('select');
    if (select) {
      apiUpdateCustomOrder.mockResolvedValueOnce({ ok: true });
      await user.selectOptions(select, 'completado');
    }

    expect(apiGetCustomOrders).toHaveBeenCalled();
  });
});
