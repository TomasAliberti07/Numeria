import { apiClient } from './client';

export const enviarMensajeNumerito = async (message) => {
  // apiClient ya tiene configurado baseURL '/api' (o http://127.0.0.1:8000/api)
  const { data } = await apiClient.post('/chat', { message });
  
  // Tu backend chat.py devuelve { "response": "texto..." }
  return data;
};