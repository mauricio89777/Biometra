import React, { useState, useEffect } from 'react';
import { usuarioService } from '../services/api'; // Tu servicio centralizado

export const AdminPanel = ({ user, onLogout, onNavigate }) => {
  // Pestaña activa dentro del panel de administración ('usuarios' | 'ejercicios' | 'gym')
  const [seccionActiva, setSeccionActiva] = useState('usuarios');


  const [listaUsuarios, setListaUsuarios] = useState([]);
  const [busquedaUsuario, setBusquedaUsuario] = useState('');
  const [usuarioEditando, setUsuarioEditando] = useState(null);
  
  const [cargando, setCargando] = useState(false);
  const [errorAPI, setErrorApi]= useState(null);

  const [formUsuario, setFormUsuario] = useState({
    nombre: '',
    email: '',
    password: '', 
    rol: 'USUARIO', // Coincide con tu enum de Prisma (USUARIO, ADMIN, etc.)
    peso: '',
    altura: '',
    genero: ''
  });

  useEffect(() => {
    if (seccionActiva === 'usuarios') {
      cargarUsuarios();
    }
  }, [seccionActiva]);

  const cargarUsuarios = async () => {
    setCargando(true);
    setErrorApi(null);
    try {
      const data = await usuarioService.listar();
      // asegurarmos que data se un array cpor segurida
      setListaUsuarios(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
      setErrorApi(error.response?.data?.error || error.message || 'no se pudo conectar con el servidor' );
      setListaUsuarios([]); //eviat quemuera el map()
    } finally {
        setCargando(false);
    }
  };

const handleGuardarUsuario = async (e) => {
    e.preventDefault();
    try {
      // Limpiamos datos vacíos antes de enviar
      const datosAEnviar = { ...formUsuario };
      if (usuarioEditando && !datosAEnviar.password) {
        delete datosAEnviar.password; // Si edita y no puso pass, no la enviamos
      }

      if (usuarioEditando) {
        await usuarioService.actualizar(usuarioEditando.id, datosAEnviar);
        setUsuarioEditando(null);
      } else {
        await usuarioService.crear(datosAEnviar);
      }
      cargarUsuarios();
      setFormUsuario({ nombre: '', email: '', password: '', rol: 'USUARIO', peso: '', altura: '', genero: '' });
    } catch (error) {
      alert('Error: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleEditarUsuarioClick = (u) => {
    setUsuarioEditando(u);
    setFormUsuario({ 
      nombre: u.nombre || '', 
      email: u.email || '', 
      password: '', // Vacío por seguridad
      rol: u.rol || 'USUARIO',
      peso: u.peso || '', 
      altura: u.altura || '', 
      genero: u.genero || '' 
    });
  };

 const handleEliminarUsuario = async (id) => {
  // Verificamos que el ID exista antes de hacer la petición
  if (!id) {
    console.error("El ID del usuario es inválido o undefined");
    return;
  }

  if (window.confirm('¿Estás seguro de eliminar este usuario?')) {
    try {
      await usuarioService.eliminar(id);
      cargarUsuarios(); // Recarga la tabla
    } catch (error) {
      alert('Error al eliminar: ' + (error.response?.data?.error || error.message));
    }
  }
  };

  const usuariosFiltrados = listaUsuarios.filter(u =>
    (u.nombre || '').toLowerCase().includes(busquedaUsuario.toLowerCase()) ||
    (u.email || '').toLowerCase().includes(busquedaUsuario.toLowerCase())
  );

 
  const [catalogoEjercicios, setCatalogoEjercicios] = useState([
    { id: 1, nombre: 'Press de Pecho', grupo: 'Pecho', dificultad: 'Media' },
    { id: 2, nombre: 'Sentadilla Libre', grupo: 'Pierna', dificultad: 'Alta' }
  ]);
  const [formEjercicio, setFormEjercicio] = useState({ nombre: '', grupo: 'Pecho', dificultad: 'Media' });

  const handleGuardarEjercicio = (e) => {
    e.preventDefault();
    if (!formEjercicio.nombre.trim()) return;
    const nuevo = { id: Date.now(), ...formEjercicio };
    setCatalogoEjercicios([...catalogoEjercicios, nuevo]);
    setFormEjercicio({ nombre: '', grupo: 'Pecho', dificultad: 'Media' });
  };

  const handleEliminarEjercicio = (id) => {
    setCatalogoEjercicios(catalogoEjercicios.filter(ex => ex.id !== id));
  };


  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif", backgroundColor: '#090D16', color: '#FFFFFF', minHeight: '100vh', paddingBottom: '60px' }}>
      {/* HEADER */}
      <header style={{ backgroundColor: '#111827', borderBottom: '1px solid #1F2937', padding: '1rem 2rem', marginBottom: '25px' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button onClick={() => onNavigate && onNavigate('home')} style={{ backgroundColor: '#1F2937', color: '#00FF87', border: '1px solid #00FF87', padding: '0.5rem 1.1rem', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}>
            ← Volver al Inicio
          </button>
          <span style={{ fontSize: '1.2rem', fontWeight: '900', color: '#FFFFFF' }}>⚙️ Panel de Administración General</span>
          <button onClick={onLogout} style={{ backgroundColor: '#DC2626', color: '#FFFFFF', border: 'none', padding: '0.5rem 1rem', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}>
            Cerrar Sesión
          </button>
        </div>
      </header>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 20px' }}>
        
        {/* NAVEGACIÓN ENTRE MÓDULOS DE ADMIN */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '25px' }}>
          <button 
            onClick={() => setSeccionActiva('usuarios')} 
            style={{ flex: 1, padding: '0.8rem', borderRadius: '10px', border: 'none', fontWeight: 'bold', cursor: 'pointer', backgroundColor: seccionActiva === 'usuarios' ? '#38BDF8' : '#111827', color: seccionActiva === 'usuarios' ? '#090D16' : '#9CA3AF' }}>
            👤 Gestión de Usuarios
          </button>
          <button 
            onClick={() => setSeccionActiva('ejercicios')} 
            style={{ flex: 1, padding: '0.8rem', borderRadius: '10px', border: 'none', fontWeight: 'bold', cursor: 'pointer', backgroundColor: seccionActiva === 'ejercicios' ? '#38BDF8' : '#111827', color: seccionActiva === 'ejercicios' ? '#090D16' : '#9CA3AF' }}>
            🏋️‍♂️ Banco de Ejercicios
          </button>
          <button 
            onClick={() => setSeccionActiva('gym')} 
            style={{ flex: 1, padding: '0.8rem', borderRadius: '10px', border: 'none', fontWeight: 'bold', cursor: 'pointer', backgroundColor: seccionActiva === 'gym' ? '#38BDF8' : '#111827', color: seccionActiva === 'gym' ? '#090D16' : '#9CA3AF' }}>
            🏢 Configuración Gimnasio
          </button>
        </div>

        {/* CONTENIDO: SECCIÓN USUARIOS */}
        {seccionActiva === 'usuarios' && (
          <div>
            {/* Formulario de Usuario */}
            <div style={{ backgroundColor: '#111827', padding: '1.5rem', borderRadius: '14px', border: '1px solid #1F2937', marginBottom: '25px' }}>
              <h3 style={{ margin: '0 0 1rem 0', color: usuarioEditando ? '#38BDF8' : '#00FF87', fontSize: '1.1rem', fontWeight: '800' }}>
                {usuarioEditando ? `✏️ Editando Usuario ID: ${usuarioEditando.id}` : '➕ Registrar Nuevo Usuario'}
              </h3>
                <form onSubmit={handleGuardarUsuario} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', alignItems: 'end' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: '#9CA3AF', marginBottom: '0.3rem', fontWeight: '600' }}>Nombre Completo</label>
                    <input type="text" required placeholder="Ej: Carlos Pérez" value={formUsuario.nombre} onChange={(e) => setFormUsuario({ ...formUsuario, nombre: e.target.value })} style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #374151', backgroundColor: '#090D16', color: '#FFF', boxSizing: 'border-box' }} />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: '#9CA3AF', marginBottom: '0.3rem', fontWeight: '600' }}>Correo Electrónico</label>
                    <input type="email" required placeholder="correo@ejemplo.com" value={formUsuario.email} onChange={(e) => setFormUsuario({ ...formUsuario, email: e.target.value })} style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #374151', backgroundColor: '#090D16', color: '#FFF', boxSizing: 'border-box' }} />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: '#9CA3AF', marginBottom: '0.3rem', fontWeight: '600' }}>Contraseña</label>
                    <input type="password" placeholder={usuarioEditando ? "Dejar en blanco para no cambiar" : "Contraseña obligatoria"} value={formUsuario.password} onChange={(e) => setFormUsuario({ ...formUsuario, password: e.target.value })} style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #374151', backgroundColor: '#090D16', color: '#FFF', boxSizing: 'border-box' }} />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: '#9CA3AF', marginBottom: '0.3rem', fontWeight: '600' }}>Rol</label>
                    <select value={formUsuario.rol} onChange={(e) => setFormUsuario({ ...formUsuario, rol: e.target.value })} style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #374151', backgroundColor: '#090D16', color: '#FFF' }}>
                      <option value="USUARIO">Usuario</option>
                      <option value="ADMIN">Administrador</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: '#9CA3AF', marginBottom: '0.3rem', fontWeight: '600' }}>Peso kg (opcional)</label>
                    <input type="number" step="0.1" placeholder="Ej: 75.5" value={formUsuario.peso} onChange={(e) => setFormUsuario({ ...formUsuario, peso: e.target.value })} style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #374151', backgroundColor: '#090D16', color: '#FFF', boxSizing: 'border-box' }} />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: '#9CA3AF', marginBottom: '0.3rem', fontWeight: '600' }}>Altura m (opcional)</label>
                    <input type="number" step="0.01" placeholder="Ej: 1.75" value={formUsuario.altura} onChange={(e) => setFormUsuario({ ...formUsuario, altura: e.target.value })} style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #374151', backgroundColor: '#090D16', color: '#FFF', boxSizing: 'border-box' }} />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: '#9CA3AF', marginBottom: '0.3rem', fontWeight: '600' }}>Género (opcional)</label>
                    <input type="text" placeholder="Ej: Masculino / Femenino" value={formUsuario.genero} onChange={(e) => setFormUsuario({ ...formUsuario, genero: e.target.value })} style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #374151', backgroundColor: '#090D16', color: '#FFF', boxSizing: 'border-box' }} />
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem', gridColumn: '1 / -1' }}>
                    <button type="submit" style={{ flex: 1, padding: '0.7rem', backgroundColor: usuarioEditando ? '#38BDF8' : '#00FF87', color: '#090D16', border: 'none', borderRadius: '8px', fontWeight: '900', cursor: 'pointer' }}>
                      {usuarioEditando ? 'Actualizar Usuario' : 'Crear Usuario'}
                    </button>
                    {usuarioEditando && (
                      <button type="button" onClick={() => { setUsuarioEditando(null); setFormUsuario({ nombre: '', email: '', password: '', rol: 'USUARIO', peso: '', altura: '', genero: '' }); }} style={{ padding: '0.7rem 1.2rem', backgroundColor: '#374151', color: '#FFF', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
                        Cancelar
                      </button>
                    )}
                  </div>
                </form>
            </div>

            {/* Tabla de Usuarios */}
            <div style={{ backgroundColor: '#111827', padding: '1.5rem', borderRadius: '14px', border: '1px solid #1F2937' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem', flexWrap: 'wrap', gap: '1rem' }}>
                <h3 style={{ margin: 0, color: '#FFF', fontSize: '1.1rem', fontWeight: '800' }}>
                  📋 Lista de Usuarios en Base de Datos ({usuariosFiltrados.length})
                </h3>
                <input type="text" placeholder="🔍 Buscar usuario..." value={busquedaUsuario} onChange={(e) => setBusquedaUsuario(e.target.value)} style={{ width: '100%', maxWidth: '280px', padding: '0.6rem', borderRadius: '8px', border: '1px solid #374151', backgroundColor: '#090D16', color: '#FFF' }} />
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #1F2937', color: '#38BDF8' }}>
                      <th style={{ padding: '0.8rem' }}>ID</th>
                      <th style={{ padding: '0.8rem' }}>Nombre</th>
                      <th style={{ padding: '0.8rem' }}>Email</th>
                      <th style={{ padding: '0.8rem', textAlign: 'center' }}>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usuariosFiltrados.map(u => (
                      <tr key={u.id} style={{ borderBottom: '1px solid #1F2937' }}>
                        <td style={{ padding: '0.8rem', color: '#9CA3AF' }}>#{u.id}</td>
                        <td style={{ padding: '0.8rem', fontWeight: 'bold', color: '#FFF' }}>{u.nombre}</td>
                        <td style={{ padding: '0.8rem', color: '#9CA3AF' }}>{u.email}</td>
                        <td style={{ padding: '0.8rem', textAlign: 'center' }}>
                          <button onClick={() => handleEditarUsuarioClick(u)} style={{ background: 'transparent', color: '#38BDF8', border: '1px solid #38BDF8', padding: '0.3rem 0.6rem', borderRadius: '6px', marginRight: '0.5rem', cursor: 'pointer', fontWeight: 'bold' }}>Editar</button>
                          <button onClick={() => handleEliminarUsuario(u.id)} style={{ background: 'transparent', color: '#ef4444', border: '1px solid #ef4444', padding: '0.3rem 0.6rem', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Eliminar</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* CONTENIDO: SECCIÓN EJERCICIOS */}
        {seccionActiva === 'ejercicios' && (
          <div style={{ backgroundColor: '#111827', padding: '1.5rem', borderRadius: '14px', border: '1px solid #1F2937' }}>
            <h3 style={{ margin: '0 0 1rem 0', color: '#00FF87', fontSize: '1.1rem', fontWeight: '800' }}>🏋️‍♂️ Gestión del Banco de Ejercicios</h3>
            <form onSubmit={handleGuardarEjercicio} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', alignItems: 'end', marginBottom: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#9CA3AF', marginBottom: '0.3rem', fontWeight: '600' }}>Nombre Ejercicio</label>
                <input type="text" required placeholder="Ej: Dominadas" value={formEjercicio.nombre} onChange={(e) => setFormEjercicio({ ...formEjercicio, nombre: e.target.value })} style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #374151', backgroundColor: '#090D16', color: '#FFF', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#9CA3AF', marginBottom: '0.3rem', fontWeight: '600' }}>Grupo Muscular</label>
                <select value={formEjercicio.grupo} onChange={(e) => setFormEjercicio({ ...formEjercicio, grupo: e.target.value })} style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #374151', backgroundColor: '#090D16', color: '#FFF' }}>
                  <option value="Pecho">Pecho</option>
                  <option value="Pierna">Pierna</option>
                  <option value="Espalda">Espalda</option>
                  <option value="Hombro">Hombro</option>
                  <option value="Brazo">Brazo</option>
                </select>
              </div>
              <button type="submit" style={{ padding: '0.7rem', backgroundColor: '#00FF87', color: '#090D16', border: 'none', borderRadius: '8px', fontWeight: '900', cursor: 'pointer' }}>
                Agregar Ejercicio
              </button>
            </form>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
              {catalogoEjercicios.map(ex => (
                <div key={ex.id} style={{ backgroundColor: '#090D16', padding: '1rem', borderRadius: '10px', border: '1px solid #1F2937', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h4 style={{ margin: '0 0 0.3rem 0', color: '#FFF' }}>{ex.nombre}</h4>
                    <span style={{ fontSize: '0.75rem', color: '#38BDF8', background: 'rgba(56,189,248,0.1)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>{ex.grupo}</span>
                  </div>
                  <button onClick={() => handleEliminarEjercicio(ex.id)} style={{ background: 'transparent', color: '#ef4444', border: 'none', cursor: 'pointer', fontSize: '1.1rem' }}>🗑️</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CONTENIDO: SECCIÓN GIMNASIO */}
        {seccionActiva === 'gym' && (
          <div style={{ backgroundColor: '#111827', padding: '1.5rem', borderRadius: '14px', border: '1px solid #1F2937' }}>
            <h3 style={{ margin: '0 0 1rem 0', color: '#38BDF8', fontSize: '1.1rem', fontWeight: '800' }}>🏢 Información del Gimnasio (Biometra)</h3>
            <p style={{ color: '#9CA3AF', fontSize: '0.9rem' }}>Aquí podrás configurar los datos generales de la sede, horarios y equipamiento visible para los usuarios de la plataforma.</p>
            <div style={{ backgroundColor: '#090D16', padding: '1.2rem', borderRadius: '10px', border: '1px solid #1F2937', marginTop: '1rem' }}>
              <p style={{ margin: '0.4rem 0', color: '#FFF' }}><strong>Nombre:</strong> Biometra Fitness Center</p>
              <p style={{ margin: '0.4rem 0', color: '#FFF' }}><strong>Ubicación:</strong> Sede Principal - Av. Central 123</p>
              <p style={{ margin: '0.4rem 0', color: '#FFF' }}><strong>Horario:</strong> Lunes a Sábado: 06:00 AM - 10:00 PM</p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};