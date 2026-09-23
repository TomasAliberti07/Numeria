import { apiClient } from './client';

export const enviarMensajeNumerito = async (mensaje) => {
  const { data } = await apiClient.post('/chat', { mensaje });
  return data; // Retorna { respuesta: "...", trace_id: "..." }
};