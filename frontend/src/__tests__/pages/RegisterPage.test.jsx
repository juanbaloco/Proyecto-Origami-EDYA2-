import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

// Mocks de API
jest.mock('@/api', () => ({
  apiRegister: jest.fn(),
  apiLogin: jest.fn(),
}));
import { apiRegister, apiLogin } from '@/api';

// Mock de useNavigate y Link
jest.mock('react-router-dom', () => {
  const actual = jest.requireActual('react-router-dom');
  return { ...actual, useNavigate: () => jest.fn(), Link: ({ children }) => <a>{children}</a> };
});

import RegisterPage from '@/pages/RegisterPage';

describe('RegisterPage', () => {
  beforeEach(() => jest.clearAllMocks());

  test('valida longitud de contraseña y contraseñas distintas', async () => {
    const user = userEvent.setup();
    render(<RegisterPage />);

    // Rellenamos username y email para no bloquear submit por "required"
    await user.type(screen.getByLabelText(/Nombre de usuario/i), 'demo');
    await user.type(screen.getByLabelText(/Correo/i), 'demo@mail.com');

    // Contraseña corta
    await user.type(screen.getByLabelText(/^Contraseña$/i), '123');
    await user.type(screen.getByLabelText(/Confirmar contraseña/i), '123');
    await user.click(screen.getByRole('button', { name: /Crear cuenta/i }));
    expect(await screen.findByText(/al menos 6 caracteres/i)).toBeInTheDocument();

    // Contraseñas no coinciden
    await user.clear(screen.getByLabelText(/^Contraseña$/i));
    await user.type(screen.getByLabelText(/^Contraseña$/i), '123456');
    await user.clear(screen.getByLabelText(/Confirmar contraseña/i));
    await user.type(screen.getByLabelText(/Confirmar contraseña/i), '000000');
    await user.click(screen.getByRole('button', { name: /Crear cuenta/i }));
    expect(await screen.findByText(/no coinciden/i)).toBeInTheDocument();
  });

  test('flujo feliz: registra y loguea', async () => {
    const user = userEvent.setup();
    apiRegister.mockResolvedValueOnce({ ok: true });
    apiLogin.mockResolvedValueOnce({ access_token: 't' });

    render(<RegisterPage />);

    await user.type(screen.getByLabelText(/Nombre de usuario/i), 'demo');
    await user.type(screen.getByLabelText(/Correo/i), 'demo@mail.com');
    await user.type(screen.getByLabelText(/^Contraseña$/i), '123456');
    await user.type(screen.getByLabelText(/Confirmar contraseña/i), '123456');
    await user.click(screen.getByRole('button', { name: /Crear cuenta/i }));

    expect(apiRegister).toHaveBeenCalledWith({
      username: 'demo',
      email: 'demo@mail.com',
      password: '123456',
    });
    expect(apiLogin).toHaveBeenCalledWith('demo@mail.com', '123456');
  });

  test('error del backend se muestra', async () => {
    const user = userEvent.setup();
    apiRegister.mockRejectedValueOnce(new Error('Correo en uso'));

    render(<RegisterPage />);

    await user.type(screen.getByLabelText(/Nombre de usuario/i), 'demo');
    await user.type(screen.getByLabelText(/Correo/i), 'demo@mail.com');
    await user.type(screen.getByLabelText(/^Contraseña$/i), '123456');
    await user.type(screen.getByLabelText(/Confirmar contraseña/i), '123456');
    await user.click(screen.getByRole('button', { name: /Crear cuenta/i }));

    expect(await screen.findByText(/Correo en uso/i)).toBeInTheDocument();
  });
});
