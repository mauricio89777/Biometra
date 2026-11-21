
import api from './api';

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

  // Subir o reemplazar foto de perfil y/o portada
  subirFotos: async (id, fotoPerfil, fotoPortada) => {
    const formData = new FormData();

    if (fotoPerfil) {
      formData.append('foto_perfil', fotoPerfil);
    }

    if (fotoPortada) {
      formData.append('foto_portada', fotoPortada);
    }

    const response = await api.post(
      `/usuarios/${id}/fotos`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    );

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
