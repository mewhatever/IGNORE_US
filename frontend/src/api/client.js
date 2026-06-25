const API_BASE = import.meta.env.VITE_API_URL || '';

function getToken() {
  return localStorage.getItem('queuestorm_token');
}

async function request(path, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const token = getToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || data.details?.join?.(', ') || 'Request failed');
  }

  return data;
}

export const api = {
  health: () => request('/health'),
  sortTicket: (body) =>
    request('/sort-ticket', { method: 'POST', body: JSON.stringify(body) }),
  login: (email, password) =>
    request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  me: () => request('/api/auth/me'),
  tickets: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/api/tickets${query ? `?${query}` : ''}`);
  },
  stats: () => request('/api/stats'),
};
