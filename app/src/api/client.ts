// URL del backend TESK. Durante el desarrollo/pruebas apunta a la IP del
// servidor de Hetzner; cuando haya dominio propio, se cambia aqui.
const BASE_URL = 'https://api.viverossimonharo.es';

async function request(path: string, options: RequestInit = {}, token?: string | null) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> | undefined),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });
  const isJson = res.headers.get('content-type')?.includes('application/json');
  const body = isJson ? await res.json() : await res.text();

  if (!res.ok) {
    const message = isJson && body?.message ? body.message : 'Error de conexion con el servidor';
    throw new Error(Array.isArray(message) ? message.join(', ') : message);
  }
  return body;
}

export interface LoginResponse {
  accessToken: string;
  user: {
    sub: number;
    tenantId: number;
    email: string;
    role: string;
    priceProfileId: number | null;
  };
}

export const api = {
  login: (email: string, password: string): Promise<LoginResponse> =>
    request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),

  setPassword: (email: string, newPassword: string): Promise<LoginResponse> =>
    request('/auth/set-password', { method: 'POST', body: JSON.stringify({ email, newPassword }) }),

  catalog: (token: string) => request('/products', {}, token),

  createOrder: (
    token: string,
    paymentMethod: 'factura' | 'contado',
    items: { productId: number; units: number; trays: number }[],
  ) =>
    request('/orders', { method: 'POST', body: JSON.stringify({ paymentMethod, items }) }, token),

  myOrders: (token: string) => request('/orders', {}, token),
};
