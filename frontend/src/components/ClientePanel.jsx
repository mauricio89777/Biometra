import React, { useState, useEffect, useRef } from 'react';
import { usuarioService } from '../services/usuarioService';
import { ejercicioService } from '../services/ejercicioService';
import { sesionService } from '../services/sesionService';

const API_BASE_URL = (
  import.meta.env.VITE_API_URL || 'http://localhost:3000'
).replace(/\/$/, '');

const FOTO_PERFIL_DEFAULT =
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=300';

const FOTO_PORTADA_DEFAULT =
  'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&q=80&w=1200';

// Convierte las rutas relativas del backend en URL completas
const obtenerUrlImagen = (ruta, imagenDefault) => {
  if (!ruta) return imagenDefault;

  if (ruta.startsWith('http://') || ruta.startsWith('https://')) {
    return ruta;
  }

  return `${API_BASE_URL}${ruta.startsWith('/') ? '' : '/'}${ruta}`;
};


export const ClientePanel = ({ user, onLogout, onNavigate }) => {
  // Datos principales del usuario autenticado
  const [datosUsuario, setDatosUsuario] = useState({
    nombre: user?.nombre || '',
    email: user?.email || '',
    peso: user?.peso || '',
    altura: user?.altura || '',
    genero: user?.genero || '',
    fecha_nacimiento: user?.fecha_nacimiento || '',
    foto_perfil: user?.foto_perfil || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=300',
    foto_portada: user?.foto_portada || 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&q=80&w=1200'
  });


  const [editando, setEditando] = useState(false);
  const [tempDatos, setTempDatos] = useState({ ...datosUsuario });
  
  // Archivos seleccionados para actualizar el perfil
  const [fotoPerfilArchivo, setFotoPerfilArchivo] = useState(null);
  const [fotoPortadaArchivo, setFotoPortadaArchivo] = useState(null);

  // Vistas previas de las imágenes seleccionadas
  const [fotoPerfilPreview, setFotoPerfilPreview] = useState(null);
  const [fotoPortadaPreview, setFotoPortadaPreview] = useState(null);

  const [guardandoPerfil, setGuardandoPerfil] = useState(false);

  // Notificación (toast) dentro de la página
  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);

  const mostrarToast = (mensaje, tipo = 'success') => {
    if (toastTimer.current) clearTimeout(toastTimer.current);

    setToast({ mensaje, tipo });

    toastTimer.current = setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, []);


  // Catálogo de ejercicios
  const [catalogoEjercicios, setCatalogoEjercicios] = useState([]);
  const [ejercicioSeleccionadoId, setEjercicioSeleccionadoId] = useState('');

  // Datos del entrenamiento
  const [cantidadSeries, setCantidadSeries] = useState(3);
  const [repeticionesPorSerie, setRepeticionesPorSerie] = useState(10);
  const [pesoPorSerie, setPesoPorSerie] = useState(0);
  const [duracionPorSerie, setDuracionPorSerie] = useState(30);

  // Historial de sesiones
  const [ejerciciosCliente, setEjerciciosCliente] = useState([]);

  const [cargando, setCargando] = useState(true);
  const [cargandoCatalogo, setCargandoCatalogo] = useState(true);
  const [guardandoEntrenamiento, setGuardandoEntrenamiento] = useState(false);
  const [errorCatalogo, setErrorCatalogo] = useState('');

    useEffect(() => {
    if (!fotoPerfilArchivo) {
      setFotoPerfilPreview(null);
      return;
    }

    const url = URL.createObjectURL(fotoPerfilArchivo);
    setFotoPerfilPreview(url);

    return () => URL.revokeObjectURL(url);
  }, [fotoPerfilArchivo]);

  useEffect(() => {
    if (!fotoPortadaArchivo) {
      setFotoPortadaPreview(null);
      return;
    }

    const url = URL.createObjectURL(fotoPortadaArchivo);
    setFotoPortadaPreview(url);

    return () => URL.revokeObjectURL(url);
  }, [fotoPortadaArchivo]);

  // Cargar datos al montar el componente
  useEffect(() => {
    if (user?.id) {
      cargarDatosPerfil();
      cargarEjercicios();
      cargarCatalogo();
    }
  }, [user?.id]);

  const cargarDatosPerfil = async () => {
    try {
      const data = await usuarioService.obtenerPorId(user.id);

      const perfil = {
        ...data,
        fecha_nacimiento: data.fecha_nacimiento
          ? String(data.fecha_nacimiento).slice(0, 10)
          : '',
        foto_perfil: data.foto_perfil || FOTO_PERFIL_DEFAULT,
        foto_portada: data.foto_portada || FOTO_PORTADA_DEFAULT
      };

      setDatosUsuario(perfil);
      setTempDatos(perfil);

    } catch (error) {
      console.error('Error al cargar perfil:', error);
    }
  };

  // Obtener sesiones del usuario
  const cargarEjercicios = async () => {
    try {
      setCargando(true);

      const data = await sesionService.listarPorUsuario(user.id);

      setEjerciciosCliente(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error al cargar sesiones:', error);
    } finally {
      setCargando(false);
    }
  };

  // Obtener ejercicios disponibles del catálogo
  const cargarCatalogo = async () => {
    try {
      setCargandoCatalogo(true);
      setErrorCatalogo('');

      const data = await ejercicioService.listar();

      // Solo mostrar ejercicios disponibles
      const ejerciciosActivos = Array.isArray(data)
        ? data.filter(ejercicio => ejercicio.activo !== false)
        : [];

      setCatalogoEjercicios(ejerciciosActivos);

    } catch (error) {
      console.error('Error al cargar catálogo:', error);

      setErrorCatalogo(
        error.response?.data?.error ||
        'No se pudo cargar el catálogo de ejercicios'
      );
    } finally {
      setCargandoCatalogo(false);
    }
  };
  // Calcular edad aproximada
  const calcularEdad = (fecha) => {
    if (!fecha) return 'No registrada';

    const anioNac = new Date(fecha).getFullYear();
    const anioActual = new Date().getFullYear();

    return `${anioActual - anioNac} años`;
  };

  // Guardar cambios del perfil
    const guardarCambiosPerfil = async (e) => {
    e.preventDefault();

    try {
      setGuardandoPerfil(true);

      // Actualizar primero los datos personales
      const datosActualizar = {
        nombre: tempDatos.nombre,
        email: tempDatos.email,
        peso: tempDatos.peso,
        altura: tempDatos.altura,
        genero: tempDatos.genero,
        fecha_nacimiento: tempDatos.fecha_nacimiento || null
      };

      await usuarioService.actualizar(user.id, datosActualizar);

      // Subir las imágenes solamente si se seleccionaron
      if (fotoPerfilArchivo || fotoPortadaArchivo) {
        await usuarioService.subirFotos(
          user.id,
          fotoPerfilArchivo,
          fotoPortadaArchivo
        );
      }

      // Recuperar los datos definitivos desde el backend
      const data = await usuarioService.obtenerPorId(user.id);

      const perfil = {
        ...data,
        fecha_nacimiento: data.fecha_nacimiento
          ? String(data.fecha_nacimiento).slice(0, 10)
          : '',
        foto_perfil: data.foto_perfil || FOTO_PERFIL_DEFAULT,
        foto_portada: data.foto_portada || FOTO_PORTADA_DEFAULT
      };

      setDatosUsuario(perfil);
      setTempDatos(perfil);

      setFotoPerfilArchivo(null);
      setFotoPortadaArchivo(null);

      setEditando(false);

      mostrarToast('Perfil actualizado correctamente');

    } catch (error) {
      console.error('Error al actualizar perfil:', error);

      mostrarToast(
        'Error al actualizar: ' +
        (error.response?.data?.error || error.message),
        'error'
      );

    } finally {
      setGuardandoPerfil(false);
    }
  };

  const ejercicioSeleccionado = catalogoEjercicios.find(
    (ejercicio) => Number(ejercicio.id) === Number(ejercicioSeleccionadoId)
  );

  const esIsometrico =
    ejercicioSeleccionado?.tipo?.toLowerCase().trim() === 'isometrico';

  
  // Registrar entrenamiento manual
  const registrarEjercicio = async (e) => {
    e.preventDefault();

    if (!ejercicioSeleccionadoId) {
      mostrarToast('Selecciona un ejercicio del catálogo', 'error');
      return;
    }

    const numeroSeries = Number(cantidadSeries);
    const repeticiones = Number(repeticionesPorSerie);
    const duracion = Number(duracionPorSerie);
    const peso = Number(pesoPorSerie);

    // Validar cantidad de series
    if (
      !Number.isInteger(numeroSeries) ||
      numeroSeries < 1 ||
      numeroSeries > 20
    ) {
      mostrarToast('La cantidad de series debe estar entre 1 y 20', 'error');
      return;
    }

    // Validar según el tipo de ejercicio
    if (esIsometrico) {
      if (!Number.isInteger(duracion) || duracion < 1) {
        mostrarToast('La duración debe ser un número entero mayor a cero', 'error');
        return;
      }
    } else {
      if (!Number.isInteger(repeticiones) || repeticiones < 1) {
        mostrarToast('Las repeticiones deben ser un número mayor a cero', 'error');
        return;
      }
    }

    // Validar peso
    if (!Number.isFinite(peso) || peso < 0) {
      mostrarToast('El peso debe ser igual o mayor a cero', 'error');
      return;
    }

    // Construir las series según el tipo de ejercicio
    const series = Array.from(
      { length: numeroSeries },
      (_, indice) => ({
        numero_serie: indice + 1,
        repeticiones: esIsometrico ? null : repeticiones,
        duracion_segundos: esIsometrico ? duracion : null,
        peso
      })
    );

    try {
      setGuardandoEntrenamiento(true);

      const nuevaSesion = {
        notas: null,
        duracion_min: null,
        registros: [
          {
            ejercicio_id: Number(ejercicioSeleccionadoId),
            notas: null,
            series
          }
        ]
      };

      await sesionService.crear(nuevaSesion);

      // Actualizar historial
      await cargarEjercicios();

      // Limpiar formulario
      setEjercicioSeleccionadoId('');
      setCantidadSeries(3);
      setRepeticionesPorSerie(10);
      setDuracionPorSerie(30);
      setPesoPorSerie(0);

      mostrarToast('Entrenamiento registrado correctamente');

    } catch (error) {
      console.error('Error al registrar entrenamiento:', error);

      mostrarToast(
        'Error al registrar entrenamiento: ' +
        (error.response?.data?.error || error.message),
        'error'
      );

    } finally {
      setGuardandoEntrenamiento(false);
    }
  };


  // Convertir las sesiones en una lista de registros de ejercicios
  const registrosHistorial = ejerciciosCliente.flatMap((sesion) =>
    (sesion.registros || []).map((registro) => ({
      ...registro,
      fechaSesion: sesion.fecha
    }))
  );

  // Obtener todos los análisis asociados a los registros del historial
  const resultadosAnalisis = registrosHistorial.flatMap((registro) =>
    (registro.videos || []).flatMap((video) =>
      (video.analisis || []).map((analisis) => ({
        ...analisis,
        videoId: video.id,
        estadoVideo: video.estado,
        fechaVideo: video.fecha_carga,
        ejercicio: registro.ejercicio?.nombre || 'Ejercicio',
        fechaSesion: registro.fechaSesion,
        registroId: registro.id
      }))
    )
  );


  // Contar ejercicios registrados durante el mes actual
  const fechaActual = new Date();

  const ejerciciosDelMes = registrosHistorial.filter((registro) => {
    const fecha = new Date(registro.fechaSesion);

    return (
      fecha.getMonth() === fechaActual.getMonth() &&
      fecha.getFullYear() === fechaActual.getFullYear()
    );
  });

  return (
    <div style={{
      fontFamily: "'Inter', system-ui, sans-serif",
      backgroundColor: '#090D16',
      color: '#FFFFFF',
      minHeight: '100vh',
      paddingBottom: '60px'
    }}>

      {/* NOTIFICACIÓN */}
      {toast && (
        <div
          role="status"
          style={{
            position: 'fixed',
            top: '24px',
            right: '24px',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            maxWidth: '360px',
            padding: '0.9rem 1.3rem',
            borderRadius: '10px',
            fontWeight: '700',
            fontSize: '0.95rem',
            backgroundColor: toast.tipo === 'success' ? '#00FF87' : '#EF4444',
            color: toast.tipo === 'success' ? '#090D16' : '#FFFFFF',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.45)',
            animation: 'toastEntrada 0.3s ease'
          }}
        >
          <span>{toast.tipo === 'success' ? '✅' : '⚠️'}</span>
          <span>{toast.mensaje}</span>
        </div>
      )}

      <style>{`
        @keyframes toastEntrada {
          from { opacity: 0; transform: translateY(-12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* HEADER */}
      <header style={{
        backgroundColor: '#111827',
        borderBottom: '1px solid #1F2937',
        padding: '1rem 2rem',
        marginBottom: '25px'
      }}>
        <div style={{
          maxWidth: '1100px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <button
            onClick={() => onNavigate && onNavigate('home')}
            style={{
              backgroundColor: '#1F2937',
              color: '#00FF87',
              border: '1px solid #00FF87',
              padding: '0.5rem 1.1rem',
              borderRadius: '8px',
              fontWeight: '700',
              cursor: 'pointer'
            }}
          >
            ← Volver al Inicio
          </button>

          <span style={{
            fontSize: '1.2rem',
            fontWeight: '900',
            color: '#FFFFFF'
          }}>
            🏋️‍♂️ Mi Panel Biometra
          </span>

          <button
            onClick={onLogout}
            style={{
              backgroundColor: '#DC2626',
              color: '#FFFFFF',
              border: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              fontWeight: '700',
              cursor: 'pointer'
            }}
          >
            Cerrar Sesión
          </button>
        </div>
      </header>

      <div style={{
        maxWidth: '1100px',
        margin: '0 auto',
        padding: '0 20px'
      }}>

        {/* PORTADA Y PERFIL */}
        <div style={{
          backgroundColor: '#111827',
          borderRadius: '20px',
          border: '1px solid #1F2937',
          overflow: 'hidden',
          marginBottom: '25px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
        }}>
          <div style={{
            height: '180px',
            backgroundImage: `url(${fotoPortadaPreview || obtenerUrlImagen(
            datosUsuario.foto_portada,
            FOTO_PORTADA_DEFAULT
          )})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }} />

          <div style={{
            padding: '0 2rem 2rem 2rem',
            marginTop: '-55px',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '1.5rem',
            alignItems: 'flex-end',
            justifyContent: 'space-between'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'flex-end',
              gap: '1.2rem',
              flexWrap: 'wrap'
            }}>
              <img
                src={fotoPerfilPreview || obtenerUrlImagen(
                datosUsuario.foto_perfil,
                FOTO_PERFIL_DEFAULT
                )}
                alt="Avatar"
                style={{
                  width: '120px',
                  height: '120px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '4px solid #111827',
                  backgroundColor: '#1F2937'
                }}
              />

              <div style={{
                backgroundColor: 'rgba(17, 24, 39, 0.9)',
                padding: '0.8rem 1.2rem',
                borderRadius: '12px',
                border: '1px solid #1F2937'
              }}>
                <h1 style={{
                  margin: 0,
                  fontSize: '1.8rem',
                  fontWeight: '900',
                  color: '#FFFFFF'
                }}>
                  {datosUsuario.nombre}
                </h1>

                <div style={{
                  margin: '0.3rem 0',
                  color: '#38BDF8',
                  fontSize: '1rem',
                  fontWeight: '700'
                }}>
                  ✉️ {datosUsuario.email}
                </div>
              </div>
            </div>

            <button
              onClick={() => setEditando(!editando)}
              style={{
                backgroundColor: editando ? '#374151' : '#00FF87',
                color: editando ? '#FFFFFF' : '#090D16',
                border: 'none',
                padding: '0.75rem 1.4rem',
                borderRadius: '10px',
                fontWeight: '800',
                cursor: 'pointer'
              }}
            >
              {editando ? '✕ Cancelar' : '⚙️ Editar Mis Datos'}
            </button>
          </div>

          {/* FORMULARIO DE EDICIÓN */}
          {editando && (
            <form
              onSubmit={guardarCambiosPerfil}
              style={{
                backgroundColor: '#090D16',
                margin: '0 2rem 2rem 2rem',
                padding: '1.5rem',
                borderRadius: '12px',
                border: '1px solid #374151'
              }}
            >
              <h3 style={{
                margin: '0 0 1rem 0',
                color: '#00FF87',
                fontSize: '1rem'
              }}>
                Actualizar Información Corporal
              </h3>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1rem',
                marginBottom: '1rem'
              }}>




              
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '0.8rem',
                    color: '#9CA3AF',
                    marginBottom: '0.2rem'
                  }}>
                    Nombre
                  </label>

                  <input
                    type="text"
                    value={tempDatos.nombre || ''}
                    onChange={(e) => setTempDatos({
                      ...tempDatos,
                      nombre: e.target.value
                    })}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      borderRadius: '6px',
                      border: '1px solid #374151',
                      backgroundColor: '#111827',
                      color: '#FFF'
                    }}
                  />
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '0.8rem',
                    color: '#9CA3AF',
                    marginBottom: '0.2rem'
                  }}>
                    Peso (kg)
                  </label>

                  <input
                    type="number"
                    step="0.1"
                    value={tempDatos.peso || ''}
                    onChange={(e) => setTempDatos({
                      ...tempDatos,
                      peso: e.target.value ? parseFloat(e.target.value) : null
                    })}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      borderRadius: '6px',
                      border: '1px solid #374151',
                      backgroundColor: '#111827',
                      color: '#FFF'
                    }}
                  />
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '0.8rem',
                    color: '#9CA3AF',
                    marginBottom: '0.2rem'
                  }}>
                    Estatura (m)
                  </label>

                  <input
                    type="number"
                    step="0.01"
                    value={tempDatos.altura || ''}
                    onChange={(e) => setTempDatos({
                      ...tempDatos,
                      altura: e.target.value ? parseFloat(e.target.value) : null
                    })}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      borderRadius: '6px',
                      border: '1px solid #374151',
                      backgroundColor: '#111827',
                      color: '#FFF'
                    }}
                  />
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '0.8rem',
                    color: '#9CA3AF',
                    marginBottom: '0.2rem'
                  }}>
                    Género
                  </label>

                  <input
                    type="text"
                    value={tempDatos.genero || ''}
                    onChange={(e) => setTempDatos({
                      ...tempDatos,
                      genero: e.target.value
                    })}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      borderRadius: '6px',
                      border: '1px solid #374151',
                      backgroundColor: '#111827',
                      color: '#FFF'
                    }}
                  />
                </div>

                <div>
                    <label style={{
                    display: 'block',
                    fontSize: '0.8rem',
                    color: '#9CA3AF',
                    marginBottom: '0.2rem'
                  }}>
                    Fecha de nacimiento
                  </label>

                  <input
                    type="date"
                    value={tempDatos.fecha_nacimiento || ''}
                    max={new Date().toISOString().slice(0, 10)}
                    onChange={(e) => setTempDatos({
                      ...tempDatos,
                      fecha_nacimiento: e.target.value
                    })}
                    style={{
                      width: '100%',
                      boxSizing: 'border-box',
                      padding: '0.5rem',
                      borderRadius: '6px',
                      border: '1px solid #374151',
                      backgroundColor: '#111827',
                      color: '#FFF'
                    }}
                  />
                </div>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                    gap: '1rem',
                    marginBottom: '1.2rem'
                  }}>

                    {/* FOTO DE PERFIL */}
                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: '0.8rem',
                        color: '#9CA3AF',
                        marginBottom: '0.5rem'
                      }}>
                        Foto de perfil
                      </label>

                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={(e) => {
                          const archivo = e.target.files?.[0] || null;

                          if (archivo && archivo.size > 5 * 1024 * 1024) {
                            mostrarToast('La imagen no puede superar los 5 MB', 'error');
                            e.target.value = '';
                            return;
                          }

                          setFotoPerfilArchivo(archivo);
                        }}
                        style={{ color: '#D1D5DB', width: '100%' }}
                      />

                      <img
                        src={fotoPerfilPreview || obtenerUrlImagen(
                          datosUsuario.foto_perfil,
                          FOTO_PERFIL_DEFAULT
                        )}
                        alt="Vista previa de perfil"
                        style={{
                          width: '90px',
                          height: '90px',
                          objectFit: 'cover',
                          borderRadius: '50%',
                          marginTop: '0.8rem',
                          border: '2px solid #00FF87'
                        }}
                      />
                    </div>

                    {/* FOTO DE PORTADA */}
                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: '0.8rem',
                        color: '#9CA3AF',
                        marginBottom: '0.5rem'
                      }}>
                        Imagen de portada
                      </label>

                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={(e) => {
                          const archivo = e.target.files?.[0] || null;

                          if (archivo && archivo.size > 5 * 1024 * 1024) {
                            mostrarToast('La imagen no puede superar los 5 MB', 'error');
                            e.target.value = '';
                            return;
                          }

                          setFotoPortadaArchivo(archivo);
                        }}
                        style={{ color: '#D1D5DB', width: '100%' }}
                      />

                      <img
                        src={fotoPortadaPreview || obtenerUrlImagen(
                          datosUsuario.foto_portada,
                          FOTO_PORTADA_DEFAULT
                        )}
                        alt="Vista previa de portada"
                        style={{
                          width: '100%',
                          height: '90px',
                          objectFit: 'cover',
                          borderRadius: '8px',
                          marginTop: '0.8rem',
                          border: '2px solid #00FF87'
                        }}
                      />
                    </div>

                  </div>



              </div>
              <button
                type="submit"
                disabled={guardandoPerfil}
                style={{
                  backgroundColor: '#00FF87',
                  color: '#090D16',
                  border: 'none',
                  padding: '0.6rem 1.2rem',
                  borderRadius: '6px',
                  fontWeight: '800',
                  cursor: 'pointer'
                }}
              >
                {guardandoPerfil ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </form>
          )}
        </div>

        {/* MÉTRICAS PRINCIPALES */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          marginBottom: '25px'
        }}>
          <div style={{
            backgroundColor: '#111827',
            padding: '1.2rem',
            borderRadius: '14px',
            border: '1px solid #1F2937',
            textAlign: 'center'
          }}>
            <span style={{
              color: '#9CA3AF',
              fontSize: '0.8rem',
              fontWeight: '700'
            }}>
              EDAD APROX.
            </span>

            <div style={{
              fontSize: '1.5rem',
              fontWeight: '900',
              color: '#FFFFFF',
              marginTop: '0.2rem'
            }}>
              {calcularEdad(datosUsuario.fecha_nacimiento)}
            </div>
          </div>

          <div style={{
            backgroundColor: '#111827',
            padding: '1.2rem',
            borderRadius: '14px',
            border: '1px solid #1F2937',
            textAlign: 'center'
          }}>
            <span style={{
              color: '#9CA3AF',
              fontSize: '0.8rem',
              fontWeight: '700'
            }}>
              PESO ACTUAL
            </span>

            <div style={{
              fontSize: '1.5rem',
              fontWeight: '900',
              color: '#38BDF8',
              marginTop: '0.2rem'
            }}>
              {datosUsuario.peso ? `${datosUsuario.peso} kg` : 'No registrado'}
            </div>
          </div>

          <div style={{
            backgroundColor: '#111827',
            padding: '1.2rem',
            borderRadius: '14px',
            border: '1px solid #1F2937',
            textAlign: 'center'
          }}>
            <span style={{
              color: '#9CA3AF',
              fontSize: '0.8rem',
              fontWeight: '700'
            }}>
              ESTATURA
            </span>

            <div style={{
              fontSize: '1.5rem',
              fontWeight: '900',
              color: '#FFFFFF',
              marginTop: '0.2rem'
            }}>
              {datosUsuario.altura ? `${datosUsuario.altura} m` : 'No registrada'}
            </div>
          </div>

          <div style={{
            backgroundColor: '#111827',
            padding: '1.2rem',
            borderRadius: '14px',
            border: '1px solid #1F2937',
            textAlign: 'center'
          }}>
            <span style={{
              color: '#9CA3AF',
              fontSize: '0.8rem',
              fontWeight: '700'
            }}>
              EJERCICIOS DEL MES
            </span>

            <div style={{
              fontSize: '1.5rem',
              fontWeight: '900',
              color: '#00FF87',
              marginTop: '0.2rem'
            }}>
              {ejerciciosDelMes.length}
            </div>
          </div>
        </div>

        {/* REGISTRO DE ENTRENAMIENTO E HISTORIAL */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '20px'
        }}>

          {/* FORMULARIO E HISTORIAL */}
          <div style={{
            backgroundColor: '#111827',
            borderRadius: '16px',
            padding: '1.5rem',
            border: '1px solid #1F2937'
          }}>
            <h3 style={{
              margin: '0 0 1rem 0',
              color: '#38BDF8',
              fontSize: '1.1rem',
              fontWeight: '800'
            }}>
              🏋️‍♂️ Registrar Entrenamiento
            </h3>

            <form
              onSubmit={registrarEjercicio}
              style={{
                backgroundColor: '#090D16',
                padding: '1rem',
                borderRadius: '10px',
                marginBottom: '1.2rem',
                border: '1px solid #1F2937'
              }}
            >
              <label style={{
                display: 'block',
                fontSize: '0.8rem',
                color: '#9CA3AF',
                marginBottom: '0.4rem'
              }}>
                Seleccionar ejercicio
              </label>

              <select
                value={ejercicioSeleccionadoId}
                onChange={(e) => setEjercicioSeleccionadoId(e.target.value)}
                required
                disabled={cargandoCatalogo || catalogoEjercicios.length === 0}
                style={{
                  width: '100%',
                  padding: '0.6rem',
                  marginBottom: '0.8rem',
                  borderRadius: '6px',
                  border: '1px solid #374151',
                  backgroundColor: '#111827',
                  color: '#FFF'
                }}
              >
                <option value="">
                  {cargandoCatalogo
                    ? 'Cargando ejercicios...'
                    : 'Selecciona un ejercicio'}
                </option>

                {catalogoEjercicios.map((ejercicio) => (
                  <option key={ejercicio.id} value={ejercicio.id}>
                    {ejercicio.nombre}
                  </option>
                ))}
              </select>

              {errorCatalogo && (
                <p style={{
                  color: '#F87171',
                  fontSize: '0.8rem',
                  margin: '0 0 0.8rem 0'
                }}>
                  {errorCatalogo}
                </p>
              )}

              {!cargandoCatalogo &&
                !errorCatalogo &&
                catalogoEjercicios.length === 0 && (
                  <p style={{
                    color: '#FBBF24',
                    fontSize: '0.8rem',
                    margin: '0 0 0.8rem 0'
                  }}>
                    No hay ejercicios disponibles en el catálogo.
                  </p>
                )}

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                gap: '0.5rem',
                marginBottom: '0.6rem'
              }}>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '0.8rem',
                    color: '#9CA3AF',
                    marginBottom: '0.3rem'
                  }}>
                    Cantidad de series
                  </label>

                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={cantidadSeries}
                    onChange={(e) => setCantidadSeries(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      boxSizing: 'border-box',
                      padding: '0.5rem',
                      borderRadius: '6px',
                      border: '1px solid #374151',
                      backgroundColor: '#111827',
                      color: '#FFF'
                    }}
                  />
                </div>

                <div>
                  
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '0.8rem',
                      color: '#9CA3AF',
                      marginBottom: '0.3rem'
                    }}>
                      {esIsometrico
                        ? 'Duración por serie (segundos)'
                        : 'Repeticiones por serie'}
                    </label>

                    <input
                      type="number"
                      min="1"
                      value={
                        esIsometrico
                          ? duracionPorSerie
                          : repeticionesPorSerie
                      }
                      onChange={(e) => {
                        if (esIsometrico) {
                          setDuracionPorSerie(e.target.value);
                        } else {
                          setRepeticionesPorSerie(e.target.value);
                        }
                      }}
                      required
                      style={{
                        width: '100%',
                        boxSizing: 'border-box',
                        padding: '0.5rem',
                        borderRadius: '6px',
                        border: '1px solid #374151',
                        backgroundColor: '#111827',
                        color: '#FFF'
                      }}
                    />
                  </div>

                </div>
              </div>

              <label style={{
                display: 'block',
                fontSize: '0.8rem',
                color: '#9CA3AF',
                marginBottom: '0.3rem'
              }}>
                Peso utilizado (kg)
              </label>

              <input
                type="number"
                min="0"
                step="0.5"
                value={pesoPorSerie}
                onChange={(e) => setPesoPorSerie(e.target.value)}
                required
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: '0.5rem',
                  marginBottom: '0.8rem',
                  borderRadius: '6px',
                  border: '1px solid #374151',
                  backgroundColor: '#111827',
                  color: '#FFF'
                }}
              />

              <button
                type="submit"
                disabled={
                  guardandoEntrenamiento ||
                  cargandoCatalogo ||
                  catalogoEjercicios.length === 0
                }
                style={{
                  width: '100%',
                  padding: '0.6rem',
                  backgroundColor: '#38BDF8',
                  color: '#090D16',
                  border: 'none',
                  borderRadius: '6px',
                  fontWeight: '800',
                  cursor: guardandoEntrenamiento ? 'wait' : 'pointer',
                  opacity: guardandoEntrenamiento ? 0.6 : 1
                }}
              >
                {guardandoEntrenamiento
                  ? 'Registrando...'
                  : 'Registrar entrenamiento'}
              </button>
            </form>

            {/* HISTORIAL */}
            <h4 style={{
              color: '#FFFFFF',
              margin: '0 0 0.8rem 0'
            }}>
              Historial de entrenamientos
            </h4>

            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.8rem',
              maxHeight: '350px',
              overflowY: 'auto'
            }}>
              {cargando ? (
                <p style={{ color: '#9CA3AF', fontSize: '0.85rem' }}>
                  Cargando historial...
                </p>
              ) : registrosHistorial.length === 0 ? (
                <p style={{ color: '#9CA3AF', fontSize: '0.85rem' }}>
                  Todavía no tienes entrenamientos registrados.
                </p>
              ) : (
                registrosHistorial.map((registro) => (
                  <div
                    key={registro.id}
                    style={{
                      backgroundColor: '#090D16',
                      padding: '0.9rem',
                      borderRadius: '8px',
                      border: '1px solid #1F2937'
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      gap: '0.5rem',
                      flexWrap: 'wrap'
                    }}>
                      <strong style={{ color: '#FFFFFF' }}>
                        {registro.ejercicio?.nombre || 'Ejercicio'}
                      </strong>

                      <span style={{
                        fontSize: '0.75rem',
                        color: '#9CA3AF'
                      }}>
                        {new Date(registro.fechaSesion).toLocaleDateString()}
                      </span>
                    </div>

                    <div style={{
                      fontSize: '0.85rem',
                      color: '#00FF87',
                      marginTop: '0.4rem'
                    }}>
                      {(registro.series || []).map((serie) => (
                        <div key={serie.id}>
                          Serie {serie.numero_serie}:{' '}
                          {serie.duracion_segundos != null
                            ? `${serie.duracion_segundos} segundos`
                            : `${serie.repeticiones} repeticiones`}
                          {' · '}
                          {serie.peso ?? 0} kg
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>






          
          {/* BLOQUE DE RESULTADOS DE IA */}
          <div style={{
            backgroundColor: '#111827',
            borderRadius: '16px',
            padding: '1.5rem',
            border: '1px solid #38BDF8'
          }}>
            <h3 style={{
              margin: '0 0 1rem 0',
              color: '#00FF87',
              fontSize: '1.1rem',
              fontWeight: '800'
            }}>
              🤖 Reporte Biomecánico de IA
            </h3>

            <p style={{
              fontSize: '0.85rem',
              color: '#9CA3AF',
              marginBottom: '1rem'
            }}>
              Resultados de los análisis realizados sobre tus videos.
            </p>

            {resultadosAnalisis.length === 0 ? (
              <div style={{
                backgroundColor: '#090D16',
                padding: '1.2rem',
                borderRadius: '10px',
                border: '1px solid #1F2937'
              }}>
                <div style={{
                  color: '#FFFFFF',
                  fontWeight: '600',
                  marginBottom: '0.6rem'
                }}>
                  Aún no hay resultados disponibles.
                </div>

                <p style={{
                  color: '#9CA3AF',
                  fontSize: '0.9rem'
                }}>
                  Registra un ejercicio y después selecciona ese registro
                  en la Biblioteca de Ejercicios para analizar un video.
                </p>

                <button
                  type="button"
                  onClick={() => onNavigate && onNavigate('ejercicios')}
                  style={{
                    width: '100%',
                    padding: '0.7rem',
                    backgroundColor: '#00FF87',
                    color: '#090D16',
                    border: 'none',
                    borderRadius: '6px',
                    fontWeight: '800',
                    cursor: 'pointer'
                  }}
                >
                  Ir a Biblioteca de Ejercicios
                </button>
              </div>
            ) : (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                maxHeight: '600px',
                overflowY: 'auto'
              }}>
                {resultadosAnalisis
                  .sort((a, b) =>
                    new Date(b.fecha_analisis) - new Date(a.fecha_analisis)
                  )
                  .map((analisis) => (
                    <div
                      key={analisis.id}
                      style={{
                        backgroundColor: '#090D16',
                        padding: '1rem',
                        borderRadius: '10px',
                        border: '1px solid #1F2937'
                      }}
                    >
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: '0.5rem'
                      }}>
                        <strong style={{ color: '#FFFFFF' }}>
                          {analisis.ejercicio}
                        </strong>

                        <span style={{
                          color: analisis.estado === 'COMPLETADO'
                            ? '#00FF87'
                            : '#FBBF24',
                          fontSize: '0.75rem',
                          fontWeight: '700'
                        }}>
                          {analisis.estado}
                        </span>
                      </div>

                      <p style={{
                        color: '#9CA3AF',
                        fontSize: '0.75rem',
                        margin: '0.5rem 0'
                      }}>
                        Análisis del{' '}
                        {new Date(analisis.fecha_analisis).toLocaleDateString()}
                      </p>

                      <div style={{
                        backgroundColor: '#111827',
                        borderRadius: '8px',
                        padding: '0.8rem',
                        marginTop: '0.8rem'
                      }}>
                        <span style={{
                          color: '#38BDF8',
                          fontSize: '0.75rem',
                          fontWeight: '700'
                        }}>
                          PUNTUACIÓN GLOBAL
                        </span>

                        <div style={{
                          color: '#00FF87',
                          fontSize: '2rem',
                          fontWeight: '900'
                        }}>
                          {analisis.puntuacion != null
                            ? `${analisis.puntuacion}/100`
                            : 'Sin puntuación'}
                        </div>
                      </div>

                      {/* MÉTRICAS */}
                      {analisis.metricas?.length > 0 && (
                        <div style={{ marginTop: '1rem' }}>
                          <h4 style={{
                            color: '#38BDF8',
                            fontSize: '0.85rem',
                            margin: '0 0 0.6rem 0'
                          }}>
                            Métricas biomecánicas
                          </h4>

                          {analisis.metricas.map((metrica) => (
                            <div
                              key={metrica.id}
                              style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                gap: '0.5rem',
                                padding: '0.4rem 0',
                                borderBottom: '1px solid #1F2937',
                                fontSize: '0.85rem'
                              }}
                            >
                              <span style={{ color: '#D1D5DB' }}>
                                {metrica.tipo_metrica}
                              </span>

                              <strong style={{ color: '#FFFFFF' }}>
                                {metrica.valor != null
                                  ? Number(metrica.valor).toFixed(2)
                                  : 'No disponible'}
                              </strong>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* FEEDBACK */}
                      {analisis.feedbacks?.length > 0 && (
                        <div style={{ marginTop: '1rem' }}>
                          <h4 style={{
                            color: '#38BDF8',
                            fontSize: '0.85rem',
                            margin: '0 0 0.6rem 0'
                          }}>
                            Observaciones y recomendaciones
                          </h4>

                          {analisis.feedbacks.map((feedback) => (
                            <div
                              key={feedback.id}
                              style={{
                                backgroundColor: '#111827',
                                padding: '0.7rem',
                                borderRadius: '7px',
                                marginBottom: '0.5rem'
                              }}
                            >
                              <p style={{
                                color: '#D1D5DB',
                                fontSize: '0.85rem',
                                margin: 0
                              }}>
                                {feedback.observacion}
                              </p>

                              {feedback.recomendacion && (
                                <p style={{
                                  color: '#00FF87',
                                  fontSize: '0.85rem',
                                  margin: '0.5rem 0 0 0'
                                }}>
                                  Recomendación: {feedback.recomendacion}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* REPETICIONES */}
                      {analisis.repeticiones?.length > 0 && (
                        <div style={{ marginTop: '1rem' }}>
                          <h4 style={{
                            color: '#38BDF8',
                            fontSize: '0.85rem'
                          }}>
                            Repeticiones detectadas
                          </h4>

                          {analisis.repeticiones.map((repeticion) => (
                            <div
                              key={repeticion.id}
                              style={{
                                color: '#D1D5DB',
                                fontSize: '0.85rem',
                                padding: '0.3rem 0'
                              }}
                            >
                              Repetición {repeticion.numero_rep}
                              {' · '}
                              Puntuación:{' '}
                              {repeticion.calificacion != null
                                ? repeticion.calificacion
                                : 'No disponible'}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            )}
          </div>

          
        </div>
      </div>
    </div>
  );
};
