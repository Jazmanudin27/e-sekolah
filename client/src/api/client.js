import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5007/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor to inject Authorization Bearer token automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('esekolah_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;
