import { render, screen } from '@testing-library/react';
import React from 'react';

// Mock de API
jest.mock('@/api', () => ({ apiMyOrders: jest.fn() }));
import { apiMyOrders } from '@/api';

import OrdersPage from '@/pages/OrdersPage';

describe('OrdersPage', () => {
  beforeEach(() => jest.clearAllMocks());

  test('muestra loading, luego vacío', async () => {
    apiMyOrders.mockResolvedValueOnce([]);
    render(<OrdersPage />);

    expect(screen.getByText(/Cargando/i)).toBeInTheDocument();
    expect(await screen.findByText(/No tienes pedidos aún/i)).toBeInTheDocument();
  });

  test('render de pedido cancelado con motivo y precio', async () => {
    apiMyOrders.mockResolvedValueOnce([
      {
        id: 99,
        tipo: 'estandar',
        estado: 'cancelado',
        comentario_cancelacion: 'Pago rechazado',
        total: 123.45,
      },
    ]);

    render(<OrdersPage />);

    expect(await screen.findByText(/Pedido #99/i)).toBeInTheDocument();
    expect(screen.getByText(/Cancelado/i)).toBeInTheDocument();
    expect(screen.getByText(/Pago rechazado/i)).toBeInTheDocument();
    expect(screen.getByText(/\$123\.45/)).toBeInTheDocument();
  });

  test('pedido personalizado muestra nombre/desc/imagen cuando existen', async () => {
    apiMyOrders.mockResolvedValueOnce([
      {
        id: 7,
        tipo: 'personalizado',
        estado: 'en_proceso',
        nombre_personalizado: 'Grulla Azul',
        descripcion: 'Papel japonés',
        imagen_referencia: 'data:image/png;base64,AAAA',
        precio_personalizado: 50,
      },
    ]);

    render(<OrdersPage />);

    expect(await screen.findByText(/Pedido #7/i)).toBeInTheDocument();
    expect(screen.getByText(/Personalizado/i)).toBeInTheDocument();
    expect(screen.getByText(/Grulla Azul/i)).toBeInTheDocument();
    expect(screen.getByText(/Papel japonés/i)).toBeInTheDocument();
    expect(screen.getByText(/\$50/)).toBeInTheDocument();
    // imagen presente (no validamos render real del <img/> en JSDOM)
  });
});
