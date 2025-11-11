import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';

// Mocks de API
jest.mock('@/api', () => ({
  apiLogin: jest.fn(),
  apiMe: jest.fn(),
}));
import { apiLogin, apiMe } from '@/api';

// Mock de useNavigate (no necesitamos asertarlo, solo que no truene)
jest.mock('react-router-dom', () => {
  const actual = jest.requireActual('react-router-dom');
  return { ...actual, useNavigate: () => jest.fn() };
});

// Mock de AuthContext exportado por App.jsx
jest.mock('@/App', () => {
  const React = require('react');
  return { AuthContext: React.createContext({ setUser: () => {} }) };
});
import { AuthContext } from '@/App';

import LoginPage from '@/pages/LoginPage';

// Helper: selecciona inputs por atributo name (porque los label no están asociados)
const getByName = (name) => document.querySelector(`input[name="${name}"]`);

describe('LoginPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  function renderWithRouter(ui, ctx) {
    return render(
      <AuthContext.Provider value={ctx}>
        <MemoryRouter>{ui}</MemoryRouter>
      </AuthContext.Provider>
    );
  }

  test('flujo feliz: guarda usuario y navega a "/" si no es admin', async () => {
    const user = userEvent.setup();
    apiLogin.mockResolvedValueOnce({ access_token: 't' });
    apiMe.mockResolvedValueOnce({ id: 1, is_admin: false });

    const setUser = jest.fn();
    renderWithRouter(<LoginPage />, { setUser });

    // Seleccionamos inputs por name
    await user.type(getByName('email'), 'user@mail.com');
    await user.type(getByName('password'), 'secret');
    await user.click(screen.getByRole('button', { name: /Ingresar/i }));

    expect(apiLogin).toHaveBeenCalledWith('user@mail.com', 'secret');
    expect(setUser).toHaveBeenCalledWith({ id: 1, is_admin: false });
  });

  test('flujo admin: navega a "/admin"', async () => {
    const user = userEvent.setup();
    apiLogin.mockResolvedValueOnce({ access_token: 't' });
    apiMe.mockResolvedValueOnce({ id: 2, is_admin: true });

    const setUser = jest.fn();
    renderWithRouter(<LoginPage />, { setUser });

    await user.type(getByName('email'), 'admin@mail.com');
    await user.type(getByName('password'), 'secret');
    await user.click(screen.getByRole('button', { name: /Ingresar/i }));

    expect(apiLogin).toHaveBeenCalled();
    expect(setUser).toHaveBeenCalledWith({ id: 2, is_admin: true });
  });

  test('muestra error del backend', async () => {
    const user = userEvent.setup();
    apiLogin.mockRejectedValueOnce(new Error('Credenciales inválidas'));

    renderWithRouter(<LoginPage />, { setUser: jest.fn() });

    await user.type(getByName('email'), 'bad@mail.com');
    await user.type(getByName('password'), 'nope');
    await user.click(screen.getByRole('button', { name: /Ingresar/i }));

    expect(await screen.findByText(/Credenciales inválidas/i)).toBeInTheDocument();
  });
});
