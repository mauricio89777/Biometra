import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/', 
});

// Interceptor para inyectar automáticamente el token de autenticación
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token'); 
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Funciones CRUD de Usuarios para el admin
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


//Servicios para los analisis por pyhton

export const ejercicioService ={
  listarPorUsuario: async (usuarioId) =>{
    const response = await api.get(`/sesiones/usuario/${usuarioId}`);
    return response.data;
  },
  crear: async (datosSesion) => {
    const response = await api.post('/sesiones', datosSesion);
    return response.data;
  }
};


//Login

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



export default api;


