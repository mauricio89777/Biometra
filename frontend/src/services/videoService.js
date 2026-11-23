
import api from './api';

export const videoService = {
  obtenerArchivo: async (videoId, tipo = 'original') => {
    const respuesta = await api.get(
      `/videos/${videoId}/archivo/${tipo}`,
      { responseType: 'blob' }
    );

    return URL.createObjectURL(respuesta.data);
  }
};
