const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export async function request(path, options = {}) {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers
  });

  if (response.status === 401 || response.status === 403) {
    throw new Error('Недостаточно прав или истекла сессия');
  }

  if (!response.ok) {
    let message = 'Ошибка запроса';
    try {
      const body = await response.json();
      if (body.message) message = body.message;
    } catch {
      // ignore
    }
    throw new Error(message);
  }

  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    return response.json();
  }
  return response.text();
}

export { API_URL };
