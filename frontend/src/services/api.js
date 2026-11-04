import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/', // Ajusta según el puerto de tu backend
});

// Interceptor para inyectar automáticamente el token de autenticación
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token'); // O donde guardes tu token al iniciar sesión
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Funciones CRUD de Usuarios basadas exactamente en tu controlador backend
export const usuarioService = {
  listar: async () => {
    const response = await api.get('/usuarios');
    return response.data;
  },
  obtenerPorId: async (id) => {
    const response = await api.get(`/usuarios/${id}`);
    return response.data;
  },
  crear: async (datos) => {
    const response = await api.post('/usuarios', datos);
    return response.data;
  },
  actualizar: async (id, datos) => {
    const response = await api.put(`/usuarios/${id}`, datos);
    return response.data;
  },
  eliminar: async (id) => {
    const response = await api.delete(`/usuarios/${id}`);
    return response.data;
  }
};




export default api;


