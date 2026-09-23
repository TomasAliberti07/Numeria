import { apiClient } from './client';

export const getProveedores = async () => {
  const { data } = await apiClient.get('/proveedores');
  return data;
};

export const createProveedor = async (proveedorData) => {
  const { data } = await apiClient.post('/proveedores', proveedorData);
  return data;
};