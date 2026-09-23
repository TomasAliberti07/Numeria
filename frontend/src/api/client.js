import axios from 'axios';

export const apiClient = axios.create({
  baseURL: 'http://127.0.0.1:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para manejo de errores global (Límites de API, Servidor Caído)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 429) {
      console.error('Límite de peticiones alcanzado (Rate Limit).');
    } else if (!error.response) {
      console.error('Error de red: El backend no está respondiendo.');
    }
    return Promise.reject(error);
  }
);