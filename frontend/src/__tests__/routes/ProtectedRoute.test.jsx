import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import ProtectedRoute from '@/components/ProtectedRoute';

// mockeamos solo getToken, que es lo que usa ProtectedRoute
jest.mock('@/api', () => ({ getToken: jest.fn() }));
import { getToken } from '@/api';

const PrivateScreen = () => <div>Privado</div>;
const LoginScreen = () => <div>Login</div>;

describe('ProtectedRoute', () => {
  test('redirige a /login cuando NO hay token', () => {
    getToken.mockReturnValue(null);

    render(
      <MemoryRouter initialEntries={['/privado']}>
        <Routes>
          <Route
            path="/privado"
            element={
              <ProtectedRoute>
                <PrivateScreen />
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<LoginScreen />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Login')).toBeInTheDocument();
    expect(screen.queryByText('Privado')).not.toBeInTheDocument();
  });

  test('renderiza hijos cuando SÍ hay token', () => {
    getToken.mockReturnValue('tkn');

    render(
      <MemoryRouter initialEntries={['/privado']}>
        <Routes>
          <Route
            path="/privado"
            element={
              <ProtectedRoute>
                <PrivateScreen />
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<LoginScreen />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Privado')).toBeInTheDocument();
  });
});
