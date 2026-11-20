import api from './api';

export const sesionService = {
  listarPorUsuario: async (usuarioId) => {
    const response = await api.get(`/sesiones/usuario/${usuarioId}`);
    return response.data;
  },

  crear: async (datosSesion) => {
    const response = await api.post('/sesiones', datosSesion);
    return response.data;
  }
};
