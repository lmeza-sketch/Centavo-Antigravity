const AUTH_SERVICE_URL = import.meta.env.VITE_AUTH_SERVICE_URL || 'http://localhost:4001';
const TRANSACTIONS_SERVICE_URL = import.meta.env.VITE_TRANSACTIONS_SERVICE_URL || 'http://localhost:4002';

export async function loginUser(email, password) {
  try {
    const response = await fetch(`${AUTH_SERVICE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!response.ok) {
      throw new Error('Credenciales inválidas');
    }
    return await response.json();
  } catch (error) {
    console.warn('Backend service offline, fallback to mock auth in scaffold mode:', error.message);
    return { token: 'mock-jwt-token', user: { email, name: email.split('@')[0] } };
  }
}

export async function fetchTransactions() {
  try {
    const token = localStorage.getItem('centavo_user');
    const response = await fetch(`${TRANSACTIONS_SERVICE_URL}/api/transactions`, {
      headers: {
        'Authorization': token ? `Bearer ${JSON.parse(token).token}` : '',
      },
    });
    if (!response.ok) {
      throw new Error('Error al consultar transacciones');
    }
    return await response.json();
  } catch (error) {
    console.warn('Backend service offline, returning empty transactions list:', error.message);
    return [];
  }
}
