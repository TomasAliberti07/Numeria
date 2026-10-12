import { apiClient } from './client';

export const getVentas = async () => {
  const { data } = await apiClient.get('/ventas');
  return data;
};

export const registrarVenta = async (ventaData) => {
  const { data } = await apiClient.post('/ventas', ventaData);
  return data;
};

// Actualizar una venta existente (PUT)
export const updateVenta = async (id, ventaData) => {
  const { data } = await apiClient.put(`/ventas/${id}`, ventaData);
  return data;
};

// Eliminar / anular una venta (DELETE)
export const deleteVenta = async (id) => {
  const { data } = await apiClient.delete(`/ventas/${id}`);
  return data;
};