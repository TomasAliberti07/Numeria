import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8000/api';

export const enviarConsultaAgente = async (mensaje) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/chat`, {
      message: mensaje,
    });
    return response.data.reply;
  } catch (error) {
    console.error('Error al conectar con Numerito:', error);
    throw new Error('No se pudo establecer comunicación con el agente.');
  }
};