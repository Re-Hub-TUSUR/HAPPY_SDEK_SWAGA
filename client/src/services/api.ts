const API_BASE_URL = 'http://localhost:5000/api/v1';

const handleResponse = async (response: Response) => {
  if (response.status === 204) {
    return;
  }
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Произошла ошибка на сервере');
  }
  return data;
};

export const authApi = {
  register: async (userData: any) => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    return handleResponse(response);
  },

  login: async (credentials: any) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    return handleResponse(response);
  },

  getProfile: async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      throw new Error('Токен доступа не найден');
    }
    
    const headers = {
      'Authorization': `Bearer ${token}`,
    };

    const response = await fetch(`${API_BASE_URL}/profile`, {
      method: 'GET',
      headers: headers,
    });
    return handleResponse(response);
  },
};