
import React, { useState, useEffect, useRef } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100 MB

export default function AdminEjercicios() {
  const [ejercicios, setEjercicios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');

  const [sincronizando, setSincronizando] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [subiendoVideo, setSubiendoVideo] = useState(false);
  const [eliminandoVideo, setEliminandoVideo] = useState(false);

  const [ejercicioSeleccionado, setEjercicioSeleccionado] = useState(null);
  const [videoSeleccionado, setVideoSeleccionado] = useState(null);
  const [vistaPrevia, setVistaPrevia] = useState(null);

  const videoInputRef = useRef(null);

  // Obtener el token de autenticación
  const obtenerHeaders = () => {
    const token = localStorage.getItem('token');

    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  // Limpiar el input de archivos
  const limpiarInputVideo = () => {
    if (videoInputRef.current) {
      videoInputRef.current.value = '';
    }
  };

  // Cargar todos los ejercicios, activos e inactivos
  const cargarEjerciciosAdmin = async () => {
    try {
      setError('');

      const res = await fetch(`${API_URL}/ejercicios/admin/listar`, {
        headers: obtenerHeaders()
      });

      if (!res.ok) {
        throw new Error('No se pudieron cargar los ejercicios');
      }

      const data = await res.json();
      setEjercicios(data);
    } catch (err) {
      console.error('Error al cargar administración:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarEjerciciosAdmin();
  }, []);

  // Crear y limpiar URL de vista previa del video
  useEffect(() => {
    if (!videoSeleccionado) {
      setVistaPrevia(null);
      return;
    }

    const url = URL.createObjectURL(videoSeleccionado);
    setVistaPrevia(url);

    return () => URL.revokeObjectURL(url);
  }, [videoSeleccionado]);

  // Seleccionar un ejercicio para editar
  const seleccionarEjercicio = (ejercicio) => {
    setEjercicioSeleccionado({
      id: ejercicio.id,
      nombre: ejercicio.nombre || '',
      grupo_muscular: ejercicio.grupo_muscular || '',
      descripcion: ejercicio.descripcion || '',
      video_ayuda: ejercicio.video_ayuda || null
    });

    setVideoSeleccionado(null);
    limpiarInputVideo();
    setMensaje('');
    setError('');
  };

  // Guardar los datos del ejercicio
  const guardarCambios = async (e) => {
    e.preventDefault();

    if (!ejercicioSeleccionado) return;

    try {
      setGuardando(true);
      setError('');
      setMensaje('');

      const res = await fetch(
        `${API_URL}/ejercicios/admin/${ejercicioSeleccionado.id}`,
        {
          method: 'PUT',
          headers: {
            ...obtenerHeaders(),
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            nombre: ejercicioSeleccionado.nombre,
            grupo_muscular: ejercicioSeleccionado.grupo_muscular,
            descripcion: ejercicioSeleccionado.descripcion
          })
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'No se pudieron guardar los cambios');
      }

      setMensaje('Datos del ejercicio actualizados correctamente.');
      await cargarEjerciciosAdmin();
    } catch (err) {
      console.error('Error al guardar ejercicio:', err);
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  };

  // Subir video demostrativo
  const subirVideoAyuda = async () => {
    if (!ejercicioSeleccionado || !videoSeleccionado) {
      setError('Selecciona un video antes de continuar.');
      return;
    }

    try {
      setSubiendoVideo(true);
      setError('');
      setMensaje('');

      const formData = new FormData();
      formData.append('video', videoSeleccionado);

      const res = await fetch(
        `${API_URL}/ejercicios/admin/${ejercicioSeleccionado.id}/video-ayuda`,
        {
          method: 'POST',
          headers: obtenerHeaders(),
          body: formData
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'No se pudo subir el video');
      }

      setMensaje('Video demostrativo asociado correctamente.');
      setVideoSeleccionado(null);
      limpiarInputVideo();

      await cargarEjerciciosAdmin();

      setEjercicioSeleccionado((actual) => {
        if (!actual) return actual;

        return {
          ...actual,
          video_ayuda: data.video_ayuda || actual.video_ayuda
        };
      });
    } catch (err) {
      console.error('Error al subir video:', err);
      setError(err.message);
    } finally {
      setSubiendoVideo(false);
    }
  };

  // Mostrar u ocultar un ejercicio
  const toggleActivo = async (id, estadoActual) => {
    try {
      setError('');
      setMensaje('');

      const res = await fetch(`${API_URL}/ejercicios/admin/${id}`, {
        method: 'PUT',
        headers: {
          ...obtenerHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ activo: !estadoActual })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'No se pudo cambiar la visibilidad');
      }

      await cargarEjerciciosAdmin();
    } catch (err) {
      console.error('Error al actualizar visibilidad:', err);
      setError(err.message);
    }
  };

  // Sincronizar ejercicios desde Python
  const sincronizar = async () => {
    try {
      setSincronizando(true);
      setError('');
      setMensaje('');

      const res = await fetch(`${API_URL}/ejercicios/sincronizar`, {
        method: 'POST',
        headers: obtenerHeaders()
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Error al sincronizar con Python');
      }

      setMensaje('Ejercicios sincronizados correctamente desde Python.');
      await cargarEjerciciosAdmin();
    } catch (err) {
      console.error('Error al sincronizar:', err);
      setError(err.message);
    } finally {
      setSincronizando(false);
    }
  };

  // Eliminar el video propio sin desactivar ni eliminar el ejercicio.
  const eliminarVideoAyuda = async () => {
    if (!ejercicioSeleccionado?.video_ayuda || eliminandoVideo) return;

    const confirmar = window.confirm(
      '¿Quieres eliminar el video demostrativo de este ejercicio? El ejercicio seguirá disponible.'
    );

    if (!confirmar) return;

    try {
      setEliminandoVideo(true);
      setError('');
      setMensaje('');

      const res = await fetch(
        `${API_URL}/ejercicios/admin/${ejercicioSeleccionado.id}/video-ayuda`,
        {
          method: 'DELETE',
          headers: obtenerHeaders()
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'No se pudo eliminar el video');
      }

      // Actualizamos el ejercicio seleccionado en el formulario.
      setEjercicioSeleccionado(actual => ({
        ...actual,
        video_ayuda: null
      }));

      // Limpiamos también cualquier archivo que estuviera seleccionado.
      setVideoSeleccionado(null);
      limpiarInputVideo();

      setMensaje(data.mensaje || 'Video demostrativo eliminado correctamente.');

      await cargarEjerciciosAdmin();

    } catch (err) {
      console.error('Error al eliminar video:', err);
      setError(err.message);
    } finally {
      setEliminandoVideo(false);
    }
  };

  if (loading) {
    return (
      <div style={{ color: '#FFF', padding: '2rem' }}>
        Cargando panel de administración...
      </div>
    );
  }

  return (
    <div style={{
      backgroundColor: '#0B132B',
      color: '#FFF',
      padding: '2rem',
      minHeight: '100vh'
    }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>

        {/* Encabezado */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '2rem'
        }}>
          <h1>Panel de Administración: Ejercicios e IA</h1>

          <button
            onClick={sincronizar}
            disabled={sincronizando}
            style={{
              backgroundColor: '#06D6A0',
              color: '#0B132B',
              border: 'none',
              padding: '0.8rem 1.5rem',
              borderRadius: '8px',
              fontWeight: 'bold',
              cursor: sincronizando ? 'wait' : 'pointer'
            }}
          >
            {sincronizando ? 'Sincronizando...' : 'Sincronizar con Python'}
          </button>
        </div>

        {/* Mensajes */}
        {error && (
          <div style={{
            backgroundColor: 'rgba(255, 107, 107, 0.15)',
            color: '#FF6B6B',
            padding: '1rem',
            borderRadius: '8px',
            marginBottom: '1rem'
          }}>
            {error}
          </div>
        )}

        {mensaje && (
          <div style={{
            backgroundColor: 'rgba(6, 214, 160, 0.15)',
            color: '#06D6A0',
            padding: '1rem',
            borderRadius: '8px',
            marginBottom: '1rem'
          }}>
            {mensaje}
          </div>
        )}

        {/* Tabla de ejercicios */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            backgroundColor: '#1C2541',
            borderRadius: '12px',
            overflow: 'hidden'
          }}>
            <thead>
              <tr style={{ backgroundColor: '#3A506B', textAlign: 'left' }}>
                {['ID', 'Nombre', 'Script Key', 'Tipo', 'Video', 'Estado', 'Acciones'].map(titulo => (
                  <th key={titulo} style={{ padding: '1rem' }}>{titulo}</th>
                ))}
              </tr>
            </thead>

            <tbody>
              {ejercicios.map((ej) => (
                <tr key={ej.id} style={{ borderBottom: '1px solid #3A506B' }}>
                  <td style={{ padding: '1rem' }}>{ej.id}</td>

                  <td style={{ padding: '1rem', fontWeight: 'bold' }}>
                    {ej.nombre}
                  </td>

                  <td style={{ padding: '1rem', color: '#00B4D8' }}>
                    {ej.script_key}
                  </td>

                  <td style={{ padding: '1rem' }}>
                    {ej.tipo || 'N/D'}
                  </td>

                  <td style={{ padding: '1rem' }}>
                    {ej.video_ayuda ? 'Video propio' : 'Video de respaldo'}
                  </td>

                  <td style={{ padding: '1rem' }}>
                    <span style={{
                      padding: '0.3rem 0.8rem',
                      borderRadius: '12px',
                      fontSize: '0.8rem',
                      backgroundColor: ej.activo
                        ? 'rgba(6, 214, 160, 0.2)'
                        : 'rgba(255, 107, 107, 0.2)',
                      color: ej.activo ? '#06D6A0' : '#FF6B6B'
                    }}>
                      {ej.activo ? 'Visible' : 'Oculto'}
                    </span>
                  </td>

                  <td style={{
                    padding: '1rem',
                    display: 'flex',
                    gap: '0.5rem',
                    flexWrap: 'wrap'
                  }}>
                    <button
                      onClick={() => seleccionarEjercicio(ej)}
                      style={{
                        backgroundColor: '#00B4D8',
                        color: '#0B132B',
                        border: 'none',
                        padding: '0.5rem 1rem',
                        borderRadius: '6px',
                        fontWeight: 'bold',
                        cursor: 'pointer'
                      }}
                    >
                      Editar
                    </button>

                    <button
                      onClick={() => toggleActivo(ej.id, ej.activo)}
                      style={{
                        backgroundColor: ej.activo ? '#FF6B6B' : '#06D6A0',
                        color: '#0B132B',
                        border: 'none',
                        padding: '0.5rem 1rem',
                        borderRadius: '6px',
                        fontWeight: 'bold',
                        cursor: 'pointer'
                      }}
                    >
                      {ej.activo ? 'Ocultar' : 'Mostrar'}
                    </button>
                  </td>
                </tr>
              ))}

              {ejercicios.length === 0 && (
                <tr>
                  <td colSpan="7" style={{ padding: '2rem', textAlign: 'center' }}>
                    No hay ejercicios registrados. Puedes sincronizarlos desde Python.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Formulario de edición */}
        {ejercicioSeleccionado && (
          <section style={{
            marginTop: '2rem',
            padding: '1.5rem',
            backgroundColor: '#1C2541',
            borderRadius: '12px'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '1rem'
            }}>
              <h2>Editar ejercicio: {ejercicioSeleccionado.nombre}</h2>

              <button
                onClick={() => {
                  setEjercicioSeleccionado(null);
                  setVideoSeleccionado(null);
                  limpiarInputVideo();
                  setMensaje('');
                  setError('');
                }}
                style={{
                  backgroundColor: '#3A506B',
                  color: '#FFF',
                  border: 'none',
                  padding: '0.5rem 1rem',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                Cerrar
              </button>
            </div>

            <form onSubmit={guardarCambios}>
              <div style={{ display: 'grid', gap: '1rem', marginTop: '1rem' }}>

                <label>
                  Nombre
                  <input
                    type="text"
                    value={ejercicioSeleccionado.nombre}
                    onChange={(e) => setEjercicioSeleccionado({
                      ...ejercicioSeleccionado,
                      nombre: e.target.value
                    })}
                    required
                    style={estiloInput}
                  />
                </label>

                <label>
                  Grupo muscular
                  <input
                    type="text"
                    value={ejercicioSeleccionado.grupo_muscular}
                    onChange={(e) => setEjercicioSeleccionado({
                      ...ejercicioSeleccionado,
                      grupo_muscular: e.target.value
                    })}
                    style={estiloInput}
                  />
                </label>

                <label>
                  Descripción
                  <textarea
                    value={ejercicioSeleccionado.descripcion}
                    onChange={(e) => setEjercicioSeleccionado({
                      ...ejercicioSeleccionado,
                      descripcion: e.target.value
                    })}
                    rows="4"
                    style={{ ...estiloInput, resize: 'vertical' }}
                  />
                </label>

                <button
                  type="submit"
                  disabled={guardando}
                  style={estiloBoton}
                >
                  {guardando ? 'Guardando...' : 'Guardar cambios'}
                </button>
              </div>
            </form>

            {/* Asociación del video demostrativo */}
            <div style={{
              marginTop: '2rem',
              paddingTop: '1.5rem',
              borderTop: '1px solid #3A506B'
            }}>
              <h3>Video demostrativo</h3>

              <p style={{ color: '#B8C5D6' }}>
                {ejercicioSeleccionado.video_ayuda
                  ? 'Este ejercicio tiene un video propio asociado.'
                  : 'Este ejercicio todavía utiliza el video de respaldo de YouTube.'}
              </p>

              <label style={{ display: 'block', margin: '1rem 0' }}>
                Seleccionar video

                <input
                  ref={videoInputRef}
                  type="file"
                  accept="video/*"
                  onChange={(e) => {
                    const archivo = e.target.files?.[0];

                    setError('');
                    setMensaje('');

                    if (!archivo) {
                      setVideoSeleccionado(null);
                      return;
                    }

                    if (!archivo.type.startsWith('video/')) {
                      setError('El archivo seleccionado no es un video.');
                      setVideoSeleccionado(null);
                      e.target.value = '';
                      return;
                    }

                    if (archivo.size > MAX_VIDEO_SIZE) {
                      setError('El video supera el límite permitido de 100 MB.');
                      setVideoSeleccionado(null);
                      e.target.value = '';
                      return;
                    }

                    setVideoSeleccionado(archivo);
                  }}
                  style={{ display: 'block', marginTop: '0.5rem' }}
                />
              </label>

              {vistaPrevia && (
                <video
                  src={vistaPrevia}
                  controls
                  preload="metadata"
                  style={{
                    display: 'block',
                    width: '100%',
                    maxWidth: '500px',
                    maxHeight: '300px',
                    borderRadius: '8px',
                    marginBottom: '1rem',
                    backgroundColor: '#000'
                  }}
                />
              )}
              <button
                type="button"
                onClick={subirVideoAyuda}
                disabled={!videoSeleccionado || subiendoVideo}
                style={{
                  ...estiloBoton,
                  opacity: !videoSeleccionado || subiendoVideo ? 0.5 : 1,
                  cursor: !videoSeleccionado || subiendoVideo ? 'not-allowed' : 'pointer'
                }}
              >
                {subiendoVideo ? 'Subiendo video...' : 'Subir y asociar video'}
              </button>
              {ejercicioSeleccionado.video_ayuda && (
                <button
                  type="button"
                  onClick={eliminarVideoAyuda}
                  disabled={eliminandoVideo || subiendoVideo}
                  style={{
                    backgroundColor: '#FF6B6B',
                    color: '#0B132B',
                    border: 'none',
                    padding: '0.8rem 1.2rem',
                    borderRadius: '6px',
                    fontWeight: 'bold',
                    cursor: eliminandoVideo || subiendoVideo ? 'not-allowed' : 'pointer',
                    opacity: eliminandoVideo || subiendoVideo ? 0.6 : 1,
                    marginTop: '1rem',
                    marginLeft: '0.5rem'
                  }}
                >
                  {eliminandoVideo ? 'Eliminando video...' : 'Quitar video demostrativo'}
                </button>
              )}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

// Estilos reutilizables
const estiloInput = {
  display: 'block',
  width: '100%',
  boxSizing: 'border-box',
  marginTop: '0.5rem',
  padding: '0.8rem',
  borderRadius: '6px',
  border: '1px solid #3A506B',
  backgroundColor: '#0B132B',
  color: '#FFF'
};

const estiloBoton = {
  backgroundColor: '#06D6A0',
  color: '#0B132B',
  border: 'none',
  padding: '0.8rem 1.2rem',
  borderRadius: '6px',
  fontWeight: 'bold',
  cursor: 'pointer'
};
