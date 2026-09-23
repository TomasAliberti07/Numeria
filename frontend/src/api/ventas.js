import { apiClient } from './client';

export const registrarVenta = async (ventaData) => {
  const { data } = await apiClient.post('/ventas', ventaData);
  return data;
};

export const getVentas = async () => {
  const { data } = await apiClient.get('/ventas');
  return data;
};