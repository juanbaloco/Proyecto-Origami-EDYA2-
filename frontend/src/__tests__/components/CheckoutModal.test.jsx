import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

// Mock de api y carrito
jest.mock('@/api', () => ({ apiCreateOrder: jest.fn() }));
import { apiCreateOrder } from '@/api';

jest.mock('@/contexts/CartContext', () => ({
  useCart: jest.fn(),
}));
import { useCart } from '@/contexts/CartContext';

import CheckoutModal from '@/components/CheckoutModal';

describe('CheckoutModal', () => {
  const items = [
    { producto_id: 1, nombre: 'Grulla', precio: 10, cantidad: 2 },
    { producto_id: 2, nombre: 'Rana', precio: 5, cantidad: 1 },
  ];
  const clear = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    // total = 10*2 + 5*1 = 25
    useCart.mockReturnValue({ items, clear, total: 25 });
    window.alert = jest.fn();
  });

test('valida email inválido: NO llama API ni cierra', async () => {
  const user = userEvent.setup();
  const onClose = jest.fn();
  render(<CheckoutModal onClose={onClose} />);

  await user.type(screen.getByPlaceholderText(/Nombre Completo/i), 'Juan');
  await user.type(screen.getByPlaceholderText(/Correo/i), 'bad@'); // inválido
  await user.type(screen.getByPlaceholderText(/Dirección de Envío/i), 'Calle 123');

  await user.click(screen.getByRole('button', { name: /Confirmar Pedido/i }));

  // No debería intentar crear el pedido
  expect(apiCreateOrder).not.toHaveBeenCalled();
  // No debería cerrar ni alertar éxito
  expect(onClose).not.toHaveBeenCalled();
  expect(window.alert).not.toHaveBeenCalledWith(expect.stringMatching(/Total:/i));
});



  test('flujo feliz: crea pedido, limpia carrito, alerta y cierra', async () => {
    const user = userEvent.setup();
    apiCreateOrder.mockResolvedValueOnce({ ok: true });
    const onClose = jest.fn();

    render(<CheckoutModal onClose={onClose} />);

    // Llenar campos requeridos
    await user.type(screen.getByPlaceholderText(/Nombre Completo/i), 'Juan');
    await user.type(screen.getByPlaceholderText(/Correo/i), 'juan@mail.com');
    await user.type(screen.getByPlaceholderText(/Teléfono/i), '3001234567');
    await user.type(screen.getByPlaceholderText(/Dirección de Envío/i), '   Cra 1 #2-3   ');

    // Cambiar método de pago a Contraentrega (tabs de botones)
    await user.click(screen.getByRole('button', { name: /Contraentrega/i }));

    await user.click(screen.getByRole('button', { name: /Confirmar Pedido/i }));

    // payload correcto
    expect(apiCreateOrder).toHaveBeenCalledTimes(1);
    const payload = apiCreateOrder.mock.calls[0][0];
    expect(payload.metodo_pago).toBe('contraentrega'); // cambió
    expect(payload.direccion).toBe('Cra 1 #2-3'); // trim
    expect(payload.items).toEqual([
      { producto_id: 1, cantidad: 2 },
      { producto_id: 2, cantidad: 1 },
    ]);
    expect(payload.contacto.email).toBe('juan@mail.com');

    // Limpia, alerta con total y cierra
    expect(clear).toHaveBeenCalled();
    expect(window.alert).toHaveBeenCalledWith(expect.stringMatching(/Total: \$25\.00/));
    expect(onClose).toHaveBeenCalled();
  });

  test('error del backend se muestra en pantalla', async () => {
    const user = userEvent.setup();
    apiCreateOrder.mockRejectedValueOnce(new Error('Error creando pedido'));

    render(<CheckoutModal onClose={jest.fn()} />);

    await user.type(screen.getByPlaceholderText(/Nombre Completo/i), 'Ana');
    await user.type(screen.getByPlaceholderText(/Correo/i), 'ana@mail.com');
    await user.type(screen.getByPlaceholderText(/Dirección de Envío/i), 'Calle 9 # 9-9');

    await user.click(screen.getByRole('button', { name: /Confirmar Pedido/i }));

    expect(await screen.findByText(/Error creando pedido/i)).toBeInTheDocument();
  });
});
