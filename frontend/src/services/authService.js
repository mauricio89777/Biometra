import api from './api';

export const authService = {
  login: async (credenciales) => {
    const response = await api.post('/api/auth/login', credenciales);
    return response.data;
  },

  register: async (datosUsuario) => {
    const response = await api.post('/api/auth/register', datosUsuario);
    return response.data;
  }
};
