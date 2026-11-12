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
}, (error) => Promise.reject(error));

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

// 2. Usuarios (coincide con app.use('/usuarios', ...))
export const usuarioService = {
  obtenerPorId: async (id) => {
    const response = await api.get(`/usuarios/${id}`);
    return response.data;
  },
  crear: async (datosUsuario) => { 
    const response = await api.post('/usuarios', datosUsuario);
    return response.data;
  },
  actualizar: async (id, datos) => {
    const response = await api.put(`/usuarios/${id}`, datos);
    return response.data;
  },
  eliminar: async (id) => {
    const response = await api.delete(`/usuarios/${id}`);
    return response.data;
  },
  listar: async () => {
    const response = await api.get('/usuarios');
    return response.data;
  }
};

//ejercicios
export const ejercicioService = {
  listarPorUsuario: async (usuarioId) => {
    // Si tu ruta backend es GET /ejercicios/usuario/:id
    const response = await api.get(`/ejercicios/usuario/${usuarioId}`); 
    return response.data;
  },
  crear: async (datosSesion) => {
    // Si tu ruta backend es POST /ejercicios
    const response = await api.post('/ejercicios', datosSesion);
    return response.data;
  }
};



export default api;


