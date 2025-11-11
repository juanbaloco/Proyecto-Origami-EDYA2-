import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import React from 'react';

// mock de getToken
jest.mock('@/api', () => ({ getToken: jest.fn() }));
import { getToken } from '@/api';

// mock de AuthContext exportado por App.jsx
jest.mock('@/App', () => {
  const React = require('react');
  return { AuthContext: React.createContext(null) };
});
import { AuthContext } from '@/App';

import AdminRoute from '@/components/AdminRoute';

const AdminScreen = () => <div>Admin OK</div>;
const HomeScreen = () => <div>Home</div>;
const LoginScreen = () => <div>Login</div>;

function renderWithContext(ui, { user, initialPath = '/admin' } = {}) {
  return render(
    <AuthContext.Provider value={{ user }}>
      <MemoryRouter initialEntries={[initialPath]}>
        <Routes>
          <Route path="/admin" element={<AdminRoute>{ui}</AdminRoute>} />
          <Route path="/login" element={<LoginScreen />} />
          <Route path="/" element={<HomeScreen />} />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>
  );
}

describe('AdminRoute', () => {
  test('sin token ⇒ redirige a /login', () => {
    getToken.mockReturnValue(null);

    renderWithContext(<AdminScreen />, { user: null });
    expect(screen.getByText('Login')).toBeInTheDocument();
  });

  test('con token pero user no admin ⇒ redirige a /', () => {
    getToken.mockReturnValue('tkn');

    renderWithContext(<AdminScreen />, { user: { is_admin: false } });
    expect(screen.getByText('Home')).toBeInTheDocument();
  });

  test('con token y user admin ⇒ renderiza hijos', () => {
    getToken.mockReturnValue('tkn');

    renderWithContext(<AdminScreen />, { user: { is_admin: true } });
    expect(screen.getByText('Admin OK')).toBeInTheDocument();
  });
});
