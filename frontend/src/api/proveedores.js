import { apiClient } from './client';

export const getProveedores = async () => {
  const { data } = await apiClient.get('/proveedores');
  return data;
};

export const createProveedor = async (proveedorData) => {
  const { data } = await apiClient.post('/proveedores', proveedorData);
  return data;
};

// Actualizar un proveedor existente (PUT)
export const updateProveedor = async (id, proveedorData) => {
  const { data } = await apiClient.put(`/proveedores/${id}`, proveedorData);
  return data;
};

// Eliminar un proveedor (DELETE)
export const deleteProveedor = async (id) => {
  const { data } = await apiClient.delete(`/proveedores/${id}`);
  return data;
};