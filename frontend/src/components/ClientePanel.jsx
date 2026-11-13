import React, { useState, useEffect } from 'react';
import { usuarioService, ejercicioService } from '../services/api';

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

  // Ejercicios / Sesiones del mes y análisis de IA
  const [ejerciciosCliente, setEjerciciosCliente] = useState([]);
  const [nuevoNombreEx, setNuevoNombreEx] = useState('');
  const [nuevasSeriesEx, setNuevasSeriesEx] = useState('');
  const [nuevoPesoEx, setNuevoPesoEx] = useState('');
  const [cargando, setCargando] = useState(true);

  // Cargar datos reales del usuario y sus entrenamientos al montar
  useEffect(() => {
    if (user?.id) {
      cargarDatosPerfil();
      cargarEjercicios();
    }
  }, [user]);

  const cargarDatosPerfil = async () => {
    try {
      const data = await usuarioService.obtenerPorId(user.id);
      setDatosUsuario(data);
      setTempDatos(data);
    } catch (error) {
      console.error("Error al cargar perfil:", error);
    }
  };

  const cargarEjercicios = async () => {
    try {
      setCargando(true);
      const data = await ejercicioService.listarPorUsuario(user.id);
      setEjerciciosCliente(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error al cargar ejercicios/sesiones:", error);
    } finally {
      setCargando(false);
    }
  };

  // Calcular edad aproximada a partir de fecha de nacimiento (si existe)
  const calcularEdad = (fecha) => {
    if (!fecha) return 'No registrada';
    const anioNac = new Date(fecha).getFullYear();
    const anioActual = new Date().getFullYear();
    return `${anioActual - anioNac} años`;
  };

  const guardarCambiosPerfil = async (e) => {
    e.preventDefault();
    try {
      const actualizado = await usuarioService.actualizar(user.id, tempDatos);
      setDatosUsuario(actualizado);
      setEditando(false);
      alert('¡Perfil actualizado correctamente!');
    } catch (error) {
      alert('Error al actualizar: ' + (error.response?.data?.error || error.message));
    }
  };

  // Registrar un nuevo ejercicio / sesión analizada
  const registrarEjercicio = async (e) => {
    e.preventDefault();
    if (!nuevoNombreEx.trim()) return;

    try {
      const nuevaSesion = {
        usuarioId: user.id,
        nombre: nuevoNombreEx,
        detalles: `${nuevasSeriesEx || '3 series'} - ${nuevoPesoEx || '0 kg'}`,
        // Aquí puedes simular o conectar la respuesta del script de Python
        analisis_ia: {
          postura: "Correcta (Alineación óptima detectada por OpenCV)",
          velocidad_ejecucion: "Estable (2.1s por repetición)",
          recomendacion: "Mantener la tensión en el punto de máxima contracción."
        }
      };

      await ejercicioService.crear(nuevaSesion);
      cargarEjercicios(); // Refrescar lista
      setNuevoNombreEx('');
      setNuevasSeriesEx('');
      setNuevoPesoEx('');
    } catch (error) {
      alert('Error al registrar ejercicio: ' + (error.response?.data?.error || error.message));
    }
  };

  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif", backgroundColor: '#090D16', color: '#FFFFFF', minHeight: '100vh', paddingBottom: '60px' }}>
      {/* HEADER */}
      <header style={{ backgroundColor: '#111827', borderBottom: '1px solid #1F2937', padding: '1rem 2rem', marginBottom: '25px' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button onClick={() => onNavigate && onNavigate('home')} style={{ backgroundColor: '#1F2937', color: '#00FF87', border: '1px solid #00FF87', padding: '0.5rem 1.1rem', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}>
            ← Volver al Inicio
          </button>
          <span style={{ fontSize: '1.2rem', fontWeight: '900', color: '#FFFFFF' }}>🏋️‍♂️ Mi Panel Biometra</span>
          <button onClick={onLogout} style={{ backgroundColor: '#DC2626', color: '#FFFFFF', border: 'none', padding: '0.5rem 1rem', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}>
            Cerrar Sesión
          </button>
        </div>
      </header>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 20px' }}>
        
        {/* PORTADA Y PERFIL */}
        <div style={{ backgroundColor: '#111827', borderRadius: '20px', border: '1px solid #1F2937', overflow: 'hidden', marginBottom: '25px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
          <div style={{ height: '180px', backgroundImage: `url(${datosUsuario.foto_portada})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />

          <div style={{ padding: '0 2rem 2rem 2rem', marginTop: '-55px', display: 'flex', flexWrap: 'wrap', gap: '1.5rem', alignItems: 'flex-end', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '1.2rem', flexWrap: 'wrap' }}>
              <img src={datosUsuario.foto_perfil} alt="Avatar" style={{ width: '120px', height: '120px', borderRadius: '50%', objectFit: 'cover', border: '4px solid #111827', backgroundColor: '#1F2937' }} />
              <div style={{ backgroundColor: 'rgba(17, 24, 39, 0.9)', padding: '0.8rem 1.2rem', borderRadius: '12px', border: '1px solid #1F2937' }}>
                <h1 style={{ margin: 0, fontSize: '1.8rem', fontWeight: '900', color: '#FFFFFF' }}>{datosUsuario.nombre}</h1>
                <div style={{ margin: '0.3rem 0', color: '#38BDF8', fontSize: '1rem', fontWeight: '700' }}>✉️ {datosUsuario.email}</div>
                <span style={{ backgroundColor: '#1F2937', color: '#00FF87', padding: '0.2rem 0.6rem', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 'bold' }}>Rol: {datosUsuario.rol || 'USUARIO'}</span>
              </div>
            </div>

            <button onClick={() => setEditando(!editando)} style={{ backgroundColor: editando ? '#374151' : '#00FF87', color: editando ? '#FFFFFF' : '#090D16', border: 'none', padding: '0.75rem 1.4rem', borderRadius: '10px', fontWeight: '800', cursor: 'pointer' }}>
              {editando ? '✕ Cancelar' : '⚙️ Editar Mis Datos'}
            </button>
          </div>

          {/* FORMULARIO DE EDICIÓN DEL USUARIO */}
          {editando && (
            <form onSubmit={guardarCambiosPerfil} style={{ backgroundColor: '#090D16', margin: '0 2rem 2rem 2rem', padding: '1.5rem', borderRadius: '12px', border: '1px solid #374151' }}>
              <h3 style={{ margin: '0 0 1rem 0', color: '#00FF87', fontSize: '1rem' }}>Actualizar Información Corporal</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#9CA3AF', marginBottom: '0.2rem' }}>Nombre</label>
                  <input type="text" value={tempDatos.nombre} onChange={(e) => setTempDatos({ ...tempDatos, nombre: e.target.value })} style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #374151', backgroundColor: '#111827', color: '#FFF' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#9CA3AF', marginBottom: '0.2rem' }}>Peso (kg)</label>
                  <input type="number" step="0.1" value={tempDatos.peso || ''} onChange={(e) => setTempDatos({ ...tempDatos, peso: e.target.value ? parseFloat(e.target.value) : null })} style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #374151', backgroundColor: '#111827', color: '#FFF' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#9CA3AF', marginBottom: '0.2rem' }}>Estatura (m)</label>
                  <input type="number" step="0.01" value={tempDatos.altura || ''} onChange={(e) => setTempDatos({ ...tempDatos, altura: e.target.value ? parseFloat(e.target.value) : null })} style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #374151', backgroundColor: '#111827', color: '#FFF' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#9CA3AF', marginBottom: '0.2rem' }}>Género</label>
                  <input type="text" value={tempDatos.genero || ''} onChange={(e) => setTempDatos({ ...tempDatos, genero: e.target.value })} style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #374151', backgroundColor: '#111827', color: '#FFF' }} />
                </div>
              </div>
              <button type="submit" style={{ backgroundColor: '#00FF87', color: '#090D16', border: 'none', padding: '0.6rem 1.2rem', borderRadius: '6px', fontWeight: '800', cursor: 'pointer' }}>Guardar Cambios</button>
            </form>
          )}
        </div>

        {/* MÉTRICAS PRINCIPALES */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '25px' }}>
          <div style={{ backgroundColor: '#111827', padding: '1.2rem', borderRadius: '14px', border: '1px solid #1F2937', textAlign: 'center' }}>
            <span style={{ color: '#9CA3AF', fontSize: '0.8rem', fontWeight: '700' }}>EDAD APROX.</span>
            <div style={{ fontSize: '1.5rem', fontWeight: '900', color: '#FFFFFF', marginTop: '0.2rem' }}>{calcularEdad(datosUsuario.fecha_nacimiento)}</div>
          </div>
          <div style={{ backgroundColor: '#111827', padding: '1.2rem', borderRadius: '14px', border: '1px solid #1F2937', textAlign: 'center' }}>
            <span style={{ color: '#9CA3AF', fontSize: '0.8rem', fontWeight: '700' }}>PESO ACTUAL</span>
            <div style={{ fontSize: '1.5rem', fontWeight: '900', color: '#38BDF8', marginTop: '0.2rem' }}>{datosUsuario.peso ? `${datosUsuario.peso} kg` : 'No registrado'}</div>
          </div>
          <div style={{ backgroundColor: '#111827', padding: '1.2rem', borderRadius: '14px', border: '1px solid #1F2937', textAlign: 'center' }}>
            <span style={{ color: '#9CA3AF', fontSize: '0.8rem', fontWeight: '700' }}>ESTATURA</span>
            <div style={{ fontSize: '1.5rem', fontWeight: '900', color: '#FFFFFF', marginTop: '0.2rem' }}>{datosUsuario.altura ? `${datosUsuario.altura} m` : 'No registrada'}</div>
          </div>
          <div style={{ backgroundColor: '#111827', padding: '1.2rem', borderRadius: '14px', border: '1px solid #1F2937', textAlign: 'center' }}>
            <span style={{ color: '#9CA3AF', fontSize: '0.8rem', fontWeight: '700' }}>EJERCICIOS DEL MES</span>
            <div style={{ fontSize: '1.5rem', fontWeight: '900', color: '#00FF87', marginTop: '0.2rem' }}>{ejerciciosCliente.length} Sesiones</div>
          </div>
        </div>

        {/* REGISTRO DE EJERCICIOS Y ANÁLISIS DE IA DE PYTHON */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
          
          {/* Formulario e Historial */}
          <div style={{ backgroundColor: '#111827', borderRadius: '16px', padding: '1.5rem', border: '1px solid #1F2937' }}>
            <h3 style={{ margin: '0 0 1rem 0', color: '#38BDF8', fontSize: '1.1rem', fontWeight: '800' }}>
              🏋️‍♂️ Registrar Ejercicio & Análisis IA
            </h3>

            <form onSubmit={registrarEjercicio} style={{ backgroundColor: '#090D16', padding: '1rem', borderRadius: '10px', marginBottom: '1.2rem', border: '1px solid #1F2937' }}>
              <input type="text" placeholder="Nombre ejercicio (ej: Sentadilla)" value={nuevoNombreEx} onChange={(e) => setNuevoNombreEx(e.target.value)} style={{ width: '100%', padding: '0.6rem', marginBottom: '0.5rem', borderRadius: '6px', border: '1px solid #374151', backgroundColor: '#111827', color: '#FFF', boxSizing: 'border-box' }} required />
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.6rem' }}>
                <input type="text" placeholder="Series (ej: 4x10)" value={nuevasSeriesEx} onChange={(e) => setNuevasSeriesEx(e.target.value)} style={{ width: '50%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #374151', backgroundColor: '#111827', color: '#FFF' }} />
                <input type="text" placeholder="Peso (ej: 80 kg)" value={nuevoPesoEx} onChange={(e) => setNuevoPesoEx(e.target.value)} style={{ width: '50%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #374151', backgroundColor: '#111827', color: '#FFF' }} />
              </div>
              <button type="submit" style={{ width: '100%', padding: '0.6rem', backgroundColor: '#38BDF8', color: '#090D16', border: 'none', borderRadius: '6px', fontWeight: '800', cursor: 'pointer' }}>
                Guardar y Analizar con IA
              </button>
            </form>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', maxHeight: '350px', overflowY: 'auto' }}>
              {ejerciciosCliente.map((item) => (
                <div key={item.id} style={{ backgroundColor: '#090D16', padding: '0.9rem', borderRadius: '8px', border: '1px solid #1F2937' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <strong style={{ color: '#FFFFFF' }}>{item.nombre}</strong>
                    <span style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>{new Date(item.createdAt || Date.now()).toLocaleDateString()}</span>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#00FF87', marginTop: '0.2rem' }}>{item.detalles}</div>
                </div>
              ))}
            </div>
          </div>

          {/* BLOQUE DE RESULTADOS DEL ANÁLISIS DE PYTHON / IA */}
          <div style={{ backgroundColor: '#111827', borderRadius: '16px', padding: '1.5rem', border: '1px solid #38BDF8' }}>
            <h3 style={{ margin: '0 0 1rem 0', color: '#00FF87', fontSize: '1.1rem', fontWeight: '800' }}>
              🤖 Reporte Biomecánico de IA (Python)
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#9CA3AF', marginBottom: '1rem' }}>
              Resultados procesados por los algoritmos de visión artificial y métricas corporales de tus últimas sesiones:
            </p>

            <div style={{ backgroundColor: '#090D16', padding: '1.2rem', borderRadius: '10px', border: '1px solid #1F2937', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#38BDF8', fontWeight: 'bold' }}>ESTADO POSTURAL</span>
                <div style={{ color: '#FFF', fontSize: '0.95rem', fontWeight: '600' }}>Óptima alineación articular detectada.</div>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#38BDF8', fontWeight: 'bold' }}>ÍNDICE DE SIMETRÍA</span>
                <div style={{ color: '#00FF87', fontSize: '1.2rem', fontWeight: '900' }}>94.5% (Balance excelente)</div>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#38BDF8', fontWeight: 'bold' }}>RECOMENDACIÓN DEL SISTEMA</span>
                <div style={{ color: '#9CA3AF', fontSize: '0.9rem' }}>Incrementar un 5% de carga progresiva para la próxima sesión de fuerza máxima.</div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};