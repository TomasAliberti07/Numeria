import { apiClient } from './client';

export const getDashboardStats = async () => {
  const { data } = await apiClient.get('/dashboard/stats');
  return data;
};

export const getProductos = async () => {
  const { data } = await apiClient.get('/productos');
  return data;
};

export const createProducto = async (productoData) => {
  const { data } = await apiClient.post('/productos', productoData);
  return data;
};