import api from './api';

export const ejercicioService = {
  listarPorUsuario: async (usuarioId) => {
    const response = await api.get(`/ejercicios/usuario/${usuarioId}`);
    return response.data;
  },

  crear: async (datosSesion) => {
    const response = await api.post('/ejercicios', datosSesion);
    return response.data;
  },

  listar: async () => {
    const response = await api.get('/ejercicios');
    return response.data;
  },
};
