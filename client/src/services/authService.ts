import apiClient from './apiClient';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

export const authApi = {
  register: async (userData: any) => {
    const { data } = await apiClient.post('/auth/register', userData);
    return data;
  },

  login: async (credentials: any) => {
    const { data } = await apiClient.post('/auth/login', credentials);
    return data;
  },

  getProfile: async () => {
    const { data } = await apiClient.get('/profile');
    return data;
  },
  
  updateProfile: async (userData: { name: string }) => {
    const { data } = await apiClient.put('/profile', userData);
    return data;
  },
  
  refresh: async (refreshToken: string) => {
    return axios.post(`${API_BASE_URL}/auth/refresh`, {}, {
      headers: { 'Authorization': `Bearer ${refreshToken}` }
    });
  },
};