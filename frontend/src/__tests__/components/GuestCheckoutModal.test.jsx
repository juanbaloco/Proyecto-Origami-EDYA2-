import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

// API mock
jest.mock('@/api', () => ({ apiCreateGuestOrder: jest.fn() }));
import { apiCreateGuestOrder } from '@/api';

// CartContext mock (el componente usa useContext directamente)
jest.mock('@/contexts/CartContext', () => {
  const React = require('react');
  return { CartContext: React.createContext(null) };
});
import { CartContext } from '@/contexts/CartContext';

import GuestCheckoutModal from '@/components/GuestCheckoutModal';

// Helpers para seleccionar por atributo name
const q = {
  nombre: () => document.querySelector('input[name="nombreCompleto"]'),
  email: () => document.querySelector('input[name="email"]'),
  whatsapp: () => document.querySelector('input[name="whatsapp"]'),
  direccion: () => document.querySelector('textarea[name="direccion"]'),
  metodoPago: () => document.querySelector('select[name="metodoPago"]'),
};

describe('GuestCheckoutModal', () => {
  const items = [
    { producto_id: 1, nombre: 'Grulla', precio: 10, cantidad: 2 },
    { producto_id: 2, nombre: 'Rana', precio: 5, cantidad: 1 },
  ];
  const total = 25;
  const clear = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    window.alert = jest.fn();
  });

  function renderOpen() {
    const setOpen = jest.fn();
    render(
      <CartContext.Provider value={{ items, total, clear }}>
        <GuestCheckoutModal open={true} setOpen={setOpen} />
      </CartContext.Provider>
    );
    return { setOpen };
  }

test('valida email y whatsapp inválidos: NO llama API ni cierra', async () => {
  const user = userEvent.setup();
  const { setOpen } = renderOpen();

  // Rellenamos con datos inválidos
  await user.type(q.nombre(), 'Juan');
  await user.type(q.email(), 'bad@');            // email inválido
  await user.type(q.whatsapp(), '123');          // whatsapp muy corto
  await user.type(q.direccion(), 'Calle 123');

  await user.click(screen.getByRole('button', { name: /Confirmar Pedido/i }));

  // No debería intentar crear el pedido
  expect(apiCreateGuestOrder).not.toHaveBeenCalled();
  // No debería cerrar el modal ni mostrar alerta de éxito
  expect(setOpen).not.toHaveBeenCalledWith(false);
  expect(window.alert).not.toHaveBeenCalledWith(expect.stringMatching(/Número de pedido:/i));
});


  test('flujo feliz: crea pedido, limpia carrito, alerta y cierra', async () => {
    const user = userEvent.setup();
    apiCreateGuestOrder.mockResolvedValueOnce({ order_id: 77, message: '¡Gracias por tu compra!' });

    const { setOpen } = renderOpen();

    await user.type(q.nombre(), 'Ana');
    await user.type(q.email(), 'ana@mail.com');
    await user.type(q.whatsapp(), '+57 3001234567');
    await user.type(q.direccion(), 'Cra 1');

    // Cambiar método a transferencia para ver instrucciones
    await user.selectOptions(q.metodoPago(), 'transferencia');
    expect(screen.getByText(/Instrucciones para Transferencia Nequi/i)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Confirmar Pedido/i }));

    expect(apiCreateGuestOrder).toHaveBeenCalledTimes(1);
    const payload = apiCreateGuestOrder.mock.calls[0][0];
    expect(payload.guestInfo.nombreCompleto).toBe('Ana');
    expect(payload.items).toEqual([
      { producto_id: 1, nombre: 'Grulla', precio: 10, cantidad: 2 },
      { producto_id: 2, nombre: 'Rana', precio: 5, cantidad: 1 },
    ]);
    expect(payload.total).toBe(25);

    expect(clear).toHaveBeenCalled();
    expect(window.alert).toHaveBeenCalledWith(expect.stringMatching(/Número de pedido: 77/));
    expect(setOpen).toHaveBeenCalledWith(false);
  });

  test('error del backend se muestra', async () => {
    const user = userEvent.setup();
    apiCreateGuestOrder.mockRejectedValueOnce(new Error('Error al procesar el pedido'));

    renderOpen();

    await user.type(q.nombre(), 'Ana');
    await user.type(q.email(), 'ana@mail.com');
    await user.type(q.whatsapp(), '+57 3001234567');
    await user.type(q.direccion(), 'Cra 1');

    await user.click(screen.getByRole('button', { name: /Confirmar Pedido/i }));
    expect(await screen.findByText(/Error al procesar el pedido/i)).toBeInTheDocument();
  });
});
