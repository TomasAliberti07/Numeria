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

// Edición / Actualización de Producto
export const updateProducto = async (id, productoData) => {
  const { data } = await apiClient.put(`/productos/${id}`, productoData);
  return data;
};

// Borrado Lógico de Producto
export const deleteProducto = async (id) => {
  const { data } = await apiClient.delete(`/productos/${id}`);
  return data;
};