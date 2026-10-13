import { apiClient } from './client';

/**
 * Envía una consulta conversacional al agente Numerito.
 * @param {string} promptText - El texto de la pregunta del usuario.
 * @returns {Promise<{respuesta: string}>} - La respuesta generada por la IA o el mensaje de fallback.
 */
export const enviarMensajeNumerito = async (promptText) => {
  // Coincide con Pydantic BaseModel(prompt: str) y la ruta POST /api/chat/
  const { data } = await apiClient.post('/chat/', { prompt: promptText });
  
  // El backend devuelve { "respuesta": "..." }
  return data;
};

// =====================================================================
// FUNCIONES DEL GLOSARIO SEGURO (Cortafuegos para consultas directas a BD)
// =====================================================================

export const obtenerGlosarioStockBajo = async () => {
  const { data } = await apiClient.get('/chat/glosario/stock-bajo');
  return data.data;
};

export const obtenerGlosarioResumenInventario = async () => {
  const { data } = await apiClient.get('/chat/glosario/resumen-inventario');
  return data.data;
};

export const obtenerGlosarioProductosCaros = async () => {
  const { data } = await apiClient.get('/chat/glosario/productos-caros');
  return data.data;
};

export const obtenerGlosarioSinStock = async () => {
  const { data } = await apiClient.get('/chat/glosario/sin-stock');
  return data.data;
};

export const obtenerGlosarioReporteVentas = async () => {
  const { data } = await apiClient.get('/chat/glosario/reporte-ventas');
  return data.data;
};

export const obtenerGlosarioTopVentas = async () => {
  const { data } = await apiClient.get('/chat/glosario/top-ventas');
  return data.data;
};

export const obtenerGlosarioProveedorDestacado = async () => {
  const { data } = await apiClient.get('/chat/glosario/proveedor-destacado');
  return data.data;
};

export const obtenerGlosarioListaProveedores = async () => {
  const { data } = await apiClient.get('/chat/glosario/lista-proveedores');
  return data.data;
};