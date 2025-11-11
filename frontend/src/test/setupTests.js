// 1) Extensiones de testing-library
import '@testing-library/jest-dom';

// 2) Polyfill de fetch/Response/Headers/Request para jsdom
import 'whatwg-fetch';

// 3) Polyfill de TextEncoder/TextDecoder (requerido por react-router*)
import { TextEncoder, TextDecoder } from 'util';
if (typeof global.TextEncoder === 'undefined') {
  global.TextEncoder = TextEncoder;
}
if (typeof global.TextDecoder === 'undefined') {
  // Nota: react-router solo necesita utf-8
  global.TextDecoder = TextDecoder;
}

// 4) Mock seguro de window.alert (jsdom no lo implementa)
if (!global.window) global.window = {};
if (typeof window.alert !== 'function') {
  window.alert = jest.fn();
}

// 5) Limpieza entre tests: resetea mocks
afterEach(() => {
  jest.clearAllMocks();
});
