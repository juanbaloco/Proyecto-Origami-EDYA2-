import {
  apiLogin,
  apiRegister,
  apiMe,
  apiGetProducts,
  apiCreateProduct,
  apiUpdateProduct,
  apiDeleteProduct,
  getToken,
  setToken,
  clearToken,
} from '@/api';

// Helper para respuestas mockeadas tipo fetch
const jsonResponse = (data, init = {}) => {
  const status = init.status ?? 200;
  const headers = { 'Content-Type': 'application/json', ...(init.headers || {}) };
  return {
    ok: status >= 200 && status < 300,
    status,
    headers,
    json: async () => data,
    text: async () => (typeof data === 'string' ? data : JSON.stringify(data)),
  };
};

const emptyOkResponse = (init = {}) => {
  const status = init.status ?? 200;
  return {
    ok: status >= 200 && status < 300,
    status,
    headers: {},
    json: async () => ({}),
    text: async () => '',
  };
};

describe('api.js', () => {
  beforeEach(() => {
    // Siempre tener un mock limpio de fetch
    global.fetch = jest.fn();

    // Espiamos los métodos de localStorage (ahora sí son mocks)
    jest.spyOn(window.localStorage.__proto__, 'setItem');
    jest.spyOn(window.localStorage.__proto__, 'removeItem');
    jest.spyOn(window.localStorage.__proto__, 'clear');

    window.localStorage.clear();
    jest.clearAllMocks();
  });

  test('apiLogin hace POST x-www-form-urlencoded y guarda token', async () => {
    const token = 'abc.123';
    global.fetch.mockResolvedValueOnce(jsonResponse({ access_token: token }));

    await expect(apiLogin('foo@mail.com', 'secret')).resolves.toEqual({ access_token: token });

    expect(fetch).toHaveBeenCalledWith(
      expect.stringMatching(/\/api\/auth\/login$/),
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: expect.any(URLSearchParams),
      }),
    );

    // Ahora los spies de localStorage existen y se pueden verificar
    expect(window.localStorage.setItem).toHaveBeenCalledWith('token', token);
    expect(getToken()).toBe(token);
  });

  test('apiLogin propaga mensaje de error del backend', async () => {
    global.fetch.mockResolvedValueOnce(jsonResponse({ detail: 'Credenciales inválidas' }, { status: 401 }));
    await expect(apiLogin('x@y.com', 'bad')).rejects.toThrow('Credenciales inválidas');
  });

  test('apiRegister POST /auth/register con JSON', async () => {
    const body = { username: 'u', email: 'u@u.com', password: '123456' };
    global.fetch.mockResolvedValueOnce(jsonResponse({ ok: true }));

    const res = await apiRegister(body);
    expect(res).toEqual({ ok: true });
    expect(fetch).toHaveBeenCalledWith(
      expect.stringMatching(/\/api\/auth\/register$/),
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      }),
    );
  });

  test('apiMe GET /auth/me incluye Authorization si hay token', async () => {
    setToken('tkn');
    global.fetch.mockResolvedValueOnce(jsonResponse({ id: 1, username: 'demo' }));

    const me = await apiMe();
    expect(me.username).toBe('demo');
    const call = fetch.mock.calls[0];
    expect(call[0]).toMatch(/\/api\/auth\/me$/);
    expect(call[1].headers.Authorization).toBe('Bearer tkn');
  });

  test('apiGetProducts GET /productos', async () => {
    const products = [{ id: 1, nombre: 'Grulla' }];
    global.fetch.mockResolvedValueOnce(jsonResponse(products));

    const data = await apiGetProducts();
    expect(data).toEqual(products);
    expect(fetch).toHaveBeenCalledWith(expect.stringMatching(/\/api\/productos$/), expect.any(Object));
  });

  test('apiCreateProduct con JSON agrega Authorization y maneja errores', async () => {
    setToken('tkn');
    const newProd = { nombre: 'Rosa', precio: 9.99 };
    global.fetch.mockResolvedValueOnce(jsonResponse({ id: 1, ...newProd }));

    const res = await apiCreateProduct(newProd);
    expect(res.id).toBe(1);

    const [, opts] = fetch.mock.calls[0];
    expect(opts.method).toBe('POST');
    expect(opts.headers.Authorization).toBe('Bearer tkn');
    expect(opts.headers['Content-Type']).toBe('application/json');
    expect(opts.body).toBe(JSON.stringify(newProd));
  });

  test('apiCreateProduct con FormData NO pone Content-Type manual (debe dejar que el navegador lo cree)', async () => {
    setToken('tkn');
    const fd = new FormData();
    fd.append('nombre', 'Pez');
    global.fetch.mockResolvedValueOnce(jsonResponse({ id: 2, nombre: 'Pez' }));

    await apiCreateProduct(fd);
    const [, opts] = fetch.mock.calls[0];
    expect(opts.headers['Content-Type']).toBeUndefined();
    expect(opts.body).toBe(fd);
  });

  test('apiCreateProduct limpia token en 401 y lanza "Sesión expirada"', async () => {
    setToken('tkn');
    global.fetch.mockResolvedValueOnce(jsonResponse({ detail: 'expired' }, { status: 401 }));

    await expect(apiCreateProduct({ nombre: 'x', precio: 1 })).rejects.toThrow('Sesión expirada');
    expect(window.localStorage.removeItem).toHaveBeenCalledWith('token');
    expect(getToken()).toBeNull();
  });

  test('apiUpdateProduct PUT /productos/:id', async () => {
    global.fetch.mockResolvedValueOnce(jsonResponse({ id: 5, nombre: 'edit' }));
    const res = await apiUpdateProduct(5, { nombre: 'edit' });
    expect(res.id).toBe(5);
    expect(fetch).toHaveBeenCalledWith(
      expect.stringMatching(/\/api\/productos\/5$/),
      expect.objectContaining({ method: 'PUT' }),
    );
  });

  test('apiDeleteProduct DELETE /productos/:id', async () => {
    global.fetch.mockResolvedValueOnce(emptyOkResponse({ status: 200 }));
    const ok = await apiDeleteProduct(7);
    expect(ok).toBe(true);
    expect(fetch).toHaveBeenCalledWith(
      expect.stringMatching(/\/api\/productos\/7$/),
      expect.objectContaining({ method: 'DELETE' }),
    );
  });
});
