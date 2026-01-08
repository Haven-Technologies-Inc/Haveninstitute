import axios from 'axios';

// Use environment variable with localhost fallback for development
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1';

const client = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token interceptor
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default client;