import React, { useState } from 'react';

export const Perfil = ({ user, onLogout, onNavigate }) => {
  if (!user) return null;

  const esEntrenador = user.role === 'entrenador' || user.rol === 'entrenador' || user.role === 'gimnasio';

  // -------------------------------------------------------------
  // ESTADOS Y DATOS PARA EL PERFIL DE CLIENTE
  // -------------------------------------------------------------
  const [datosUsuario, setDatosUsuario] = useState({
    edad: 26,
    peso: '74 kg',
    estatura: '1.75 m',
    nivel: 'Avanzado',
    entrenamientosMes: 0,
    fotoUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=300',
    fondoUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&q=80&w=1200'
  });

  const [editando, setEditando] = useState(false);
  const [tempDatos, setTempDatos] = useState({ ...datosUsuario });

  const [ejerciciosCliente, setEjerciciosCliente] = useState([
    { id: 1, nombre: 'Press de Banca', fecha: 'Hoy', detalles: '4 series x 10 reps - 70 kg' },
    { id: 2, nombre: 'Sentadillas', fecha: 'Ayer', detalles: '3 series x 12 reps - 80 kg' }
  ]);

  const [nuevoNombreCliente, setNuevoNombreCliente] = useState('');
  const [nuevasSeriesCliente, setNuevasSeriesCliente] = useState('');
  const [nuevoPesoCliente, setNuevoPesoCliente] = useState('');

  const insigniasDesbloqueadas = [
    { id: 1, icono: '🚀', titulo: 'Primer Registro', desc: 'Creaste tu cuenta en la plataforma' },
    { id: 2, icono: '🔥', titulo: 'Primer Ejercicio', desc: 'Completaste tu primera rutina' }
  ];

  const insigniasPorDesbloquear = [
    { id: 3, icono: '🔒', titulo: 'Racha de 7 Días', desc: 'Entrena 7 días seguidos' },
    { id: 4, icono: '🔒', titulo: 'Levantador Constante', desc: 'Registra 10 ejercicios en el mes' },
    { id: 5, icono: '🔒', titulo: 'Titán del Gimnasio', desc: 'Supera las 20 sesiones en un mes' }
  ];

  const handleSubirFotoPerfil = (e) => {
    const file = e.target.files[0];
    if (file) {
      setDatosUsuario(prev => ({ ...prev, fotoUrl: URL.createObjectURL(file) }));
    }
  };

  const handleSubirFotoFondo = (e) => {
    const file = e.target.files[0];
    if (file) {
      setDatosUsuario(prev => ({ ...prev, fondoUrl: URL.createObjectURL(file) }));
    }
  };

  const guardarCambios = () => {
    setDatosUsuario({ ...tempDatos });
    setEditando(false);
  };

  const agregarEjercicioCliente = (e) => {
    e.preventDefault();
    if (!nuevoNombreCliente.trim()) return;

    const nuevo = {
      id: Date.now(),
      nombre: nuevoNombreCliente,
      fecha: 'Justo ahora',
      detalles: `${nuevasSeriesCliente || '3 series'} ${nuevoPesoCliente ? `- ${nuevoPesoCliente}` : ''}`
    };

    setEjerciciosCliente([nuevo, ...ejerciciosCliente]);
    setDatosUsuario(prev => ({ ...prev, entrenamientosMes: prev.entrenamientosMes + 1 }));
    setNuevoNombreCliente('');
    setNuevasSeriesCliente('');
    setNuevoPesoCliente('');
  };

  // -------------------------------------------------------------
  // ESTADOS Y DATOS PARA EL PERFIL DE ENTRENADOR
  // -------------------------------------------------------------
  const [seccionEntrenador, setSeccionEntrenador] = useState('ejercicios');

  // Clientes con rutinas asignadas
  const [clientesList, setClientesList] = useState([
    { 
      id: 1, 
      nombre: 'Ana Gómez', 
      plan: 'Hipertrofia', 
      nivel: 'Intermedio', 
      progreso: '85%', 
      asistencia: 'Regular',
      rutinas: [
        { id: 101, ejercicio: 'Sentadilla Libre', series: '4x10', estado: 'Completado', fecha: 'Hoy' },
        { id: 102, ejercicio: 'Press de Pecho', series: '3x12', estado: 'Pendiente', fecha: 'Mañana' }
      ]
    },
    { 
      id: 2, 
      nombre: 'Carlos Pérez', 
      plan: 'Fuerza Máxima', 
      nivel: 'Avanzado', 
      progreso: '92%', 
      asistencia: 'Excelente',
      rutinas: [
        { id: 201, ejercicio: 'Press Militar', series: '5x5', estado: 'Completado', fecha: 'Ayer' }
      ]
    },
    { 
      id: 3, 
      nombre: 'Lucía Fernández', 
      plan: 'Rehabilitación', 
      nivel: 'Principiante', 
      progreso: '60%', 
      asistencia: 'En riesgo',
      rutinas: []
    }
  ]);

  // Catálogo de Ejercicios
  const [catalogoEjercicios, setCatalogoEjercicios] = useState([
    { id: 1, nombre: 'Press de Pecho', grupo: 'Pecho', dificultad: 'Media' },
    { id: 2, nombre: 'Sentadilla Libre', grupo: 'Pierna', dificultad: 'Alta' },
    { id: 3, nombre: 'Dominadas Pronas', grupo: 'Espalda', dificultad: 'Alta' },
    { id: 4, nombre: 'Press Militar', grupo: 'Hombro', dificultad: 'Media' }
  ]);

  // Formulario rápido de ejercicios
  const [nombreNuevoEx, setNombreNuevoEx] = useState('');
  const [grupoNuevoEx, setGrupoNuevoEx] = useState('Pecho');
  const [dificultadNuevoEx, setDificultadNuevoEx] = useState('Media');

  // Modal de asignación a cliente
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [ejercicioAAsignar, setEjercicioAAsignar] = useState('');
  const [seriesAAsignar, setSeriesAAsignar] = useState('3x10');

  // Plantillas prediseñadas rápidas para el entrenador
  const plantillasRapidas = [
    { nombre: 'Curl de Bíceps', grupo: 'Brazo', dificultad: 'Media' },
    { nombre: 'Peso Muerto', grupo: 'Pierna', dificultad: 'Alta' },
    { nombre: 'Zancadas', grupo: 'Pierna', dificultad: 'Baja' },
    { nombre: 'Elevaciones Laterales', grupo: 'Hombro', dificultad: 'Baja' },
    { nombre: 'Remo con Barra', grupo: 'Espalda', dificultad: 'Media' }
  ];

  // Auto-completar plantilla al hacer clic en un botón rápido
  const seleccionarPlantilla = (p) => {
    setNombreNuevoEx(p.nombre);
    setGrupoNuevoEx(p.grupo);
    setDificultadNuevoEx(p.dificultad);
  };

  const agregarEjercicioCatalogo = (e) => {
    e.preventDefault();
    if (!nombreNuevoEx.trim()) return;

    const nuevo = {
      id: Date.now(),
      nombre: nombreNuevoEx,
      grupo: grupoNuevoEx,
      dificultad: dificultadNuevoEx
    };

    setCatalogoEjercicios([...catalogoEjercicios, nuevo]);
    setNombreNuevoEx('');
  };

  const eliminarEjercicioCatalogo = (id) => {
    setCatalogoEjercicios(catalogoEjercicios.filter(ex => ex.id !== id));
  };

  // Asignar rutina a cliente
  const asignarNuevaRutina = (e) => {
    e.preventDefault();
    const ejercicioFinal = ejercicioAAsignar || (catalogoEjercicios[0] ? catalogoEjercicios[0].nombre : '');
    if (!ejercicioFinal || !clienteSeleccionado) return;

    const nuevaRutina = {
      id: Date.now(),
      ejercicio: ejercicioFinal,
      series: seriesAAsignar || '3x10',
      estado: 'Pendiente',
      fecha: 'Asignado hoy'
    };

    const actualizados = clientesList.map(cli => {
      if (cli.id === clienteSeleccionado.id) {
        return {
          ...cli,
          rutinas: [...cli.rutinas, nuevaRutina]
        };
      }
      return cli;
    });

    setClientesList(actualizados);
    setClienteSeleccionado(actualizados.find(c => c.id === clienteSeleccionado.id));
  };

  const cambiarEstadoRutina = (clienteId, rutinaId) => {
    const actualizados = clientesList.map(cli => {
      if (cli.id === clienteId) {
        const nuevasRutinas = cli.rutinas.map(rut => {
          if (rut.id === rutinaId) {
            return {
              ...rut,
              estado: rut.estado === 'Completado' ? 'Pendiente' : 'Completado'
            };
          }
          return rut;
        });
        return { ...cli, rutinas: nuevasRutinas };
      }
      return cli;
    });

    setClientesList(actualizados);
    if (clienteSeleccionado) {
      setClienteSeleccionado(actualizados.find(c => c.id === clienteSeleccionado.id));
    }
  };

  const [datosGimnasio] = useState({
    nombreGym: 'Biometra Fitness Center',
    ubicacion: 'Sede Principal - Av. Central 123',
    equipamiento: 'Zona de Pesas Libres, Guiadas, Cardio & Biofeedback',
    horario: 'Lunes a Sábado: 06:00 AM - 10:00 PM'
  });

  // -------------------------------------------------------------
  // RENDERIZADO SI ES ENTRENADOR
  // -------------------------------------------------------------
  if (esEntrenador) {
    return (
      <div style={{ fontFamily: "'Inter', system-ui, sans-serif", backgroundColor: '#090D16', color: '#FFFFFF', minHeight: '100vh', paddingBottom: '60px' }}>
        {/* NAVBAR */}
        <header style={{ backgroundColor: '#111827', borderBottom: '1px solid #1F2937', padding: '1rem 2rem', marginBottom: '25px' }}>
          <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button onClick={() => onNavigate && onNavigate('home')} style={{ backgroundColor: '#1F2937', color: '#00FF87', border: '1px solid #00FF87', padding: '0.5rem 1.1rem', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}>
              ← Volver al Inicio
            </button>
            <span style={{ fontSize: '1.2rem', fontWeight: '900', color: '#FFFFFF' }}>Panel de Entrenador</span>
            <button onClick={onLogout} style={{ backgroundColor: '#DC2626', color: '#FFFFFF', border: 'none', padding: '0.5rem 1rem', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}>
              Cerrar Sesión
            </button>
          </div>
        </header>

        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 20px' }}>
          {/* BANNER ENTRENADOR */}
          <div style={{ backgroundColor: '#111827', borderRadius: '20px', border: '1px solid #38BDF8', padding: '2rem', marginBottom: '25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h1 style={{ margin: 0, fontSize: '1.8rem', color: '#38BDF8', fontWeight: '900' }}>
                👨‍🏫 {user.name || user.nombre || 'dede'}
              </h1>
              <p style={{ margin: '0.4rem 0 0 0', color: '#9CA3AF', fontSize: '0.95rem' }}>
                ✉️ {user.email || 'josa.vasquez@duocuc.cl'} | Rol: <span style={{ color: '#00FF87', fontWeight: 'bold' }}>Entrenador / Coach</span>
              </p>
            </div>
            <div style={{ backgroundColor: '#090D16', padding: '0.8rem 1.2rem', borderRadius: '12px', border: '1px solid #1F2937', textAlign: 'center' }}>
              <span style={{ fontSize: '0.75rem', color: '#38BDF8', fontWeight: 'bold' }}>CLIENTES ACTIVOS</span>
              <div style={{ fontSize: '1.5rem', fontWeight: '900', color: '#FFF' }}>{clientesList.length}</div>
            </div>
          </div>

          {/* BOTONES NAVEGACIÓN PESTAÑAS ENTRENADOR */}
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '20px' }}>
            <button onClick={() => setSeccionEntrenador('clientes')} style={{ flex: 1, padding: '0.8rem', borderRadius: '10px', border: 'none', fontWeight: 'bold', cursor: 'pointer', backgroundColor: seccionEntrenador === 'clientes' ? '#38BDF8' : '#111827', color: seccionEntrenador === 'clientes' ? '#090D16' : '#9CA3AF' }}>
              👥 Clientes Registrados
            </button>
            <button onClick={() => setSeccionEntrenador('ejercicios')} style={{ flex: 1, padding: '0.8rem', borderRadius: '10px', border: 'none', fontWeight: 'bold', cursor: 'pointer', backgroundColor: seccionEntrenador === 'ejercicios' ? '#38BDF8' : '#111827', color: seccionEntrenador === 'ejercicios' ? '#090D16' : '#9CA3AF' }}>
              🏋️‍♂️ Banco de Ejercicios
            </button>
            <button onClick={() => setSeccionEntrenador('gym')} style={{ flex: 1, padding: '0.8rem', borderRadius: '10px', border: 'none', fontWeight: 'bold', cursor: 'pointer', backgroundColor: seccionEntrenador === 'gym' ? '#38BDF8' : '#111827', color: seccionEntrenador === 'gym' ? '#090D16' : '#9CA3AF' }}>
              🏢 Gimnasio y Equipamiento
            </button>
          </div>

          {/* VISTA 1: CLIENTES Y SEGUIMIENTO */}
          {seccionEntrenador === 'clientes' && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                {clientesList.map(cliente => (
                  <div key={cliente.id} style={{ backgroundColor: '#111827', borderRadius: '14px', padding: '1.5rem', border: '1px solid #1F2937' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                      <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#FFF' }}>👤 {cliente.nombre}</h3>
                      <span style={{ backgroundColor: '#1F2937', color: '#38BDF8', padding: '0.2rem 0.6rem', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 'bold' }}>{cliente.nivel}</span>
                    </div>
                    <p style={{ margin: '0.4rem 0', color: '#9CA3AF', fontSize: '0.85rem' }}>🎯 <strong>Plan:</strong> {cliente.plan}</p>
                    <p style={{ margin: '0.4rem 0', color: '#9CA3AF', fontSize: '0.85rem' }}>📈 <strong>Progreso:</strong> {cliente.progreso}</p>
                    <p style={{ margin: '0.4rem 0', color: '#9CA3AF', fontSize: '0.85rem' }}>📌 <strong>Rutinas activas:</strong> {cliente.rutinas.length}</p>
                    
                    <button 
                      onClick={() => setClienteSeleccionado(cliente)}
                      style={{ width: '100%', marginTop: '1rem', backgroundColor: '#00FF87', color: '#090D16', border: 'none', padding: '0.6rem', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
                      📋 Asignar Rutina / Ver Seguimiento
                    </button>
                  </div>
                ))}
              </div>

              {/* MODAL SIMPLIFICADO Y AUTOMÁTICO DE SEGUIMIENTO */}
              {clienteSeleccionado && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '1rem' }}>
                  <div style={{ backgroundColor: '#111827', border: '1px solid #38BDF8', borderRadius: '16px', padding: '2rem', maxWidth: '600px', width: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                      <h2 style={{ margin: 0, color: '#38BDF8', fontSize: '1.4rem' }}>Seguimiento: {clienteSeleccionado.nombre}</h2>
                      <button onClick={() => setClienteSeleccionado(null)} style={{ backgroundColor: 'transparent', color: '#9CA3AF', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>✕</button>
                    </div>

                    {/* FORMULARIO AUTOMÁTICO */}
                    <form onSubmit={asignarNuevaRutina} style={{ backgroundColor: '#090D16', padding: '1.2rem', borderRadius: '10px', marginBottom: '1.5rem', border: '1px solid #1F2937' }}>
                      <h4 style={{ margin: '0 0 0.8rem 0', color: '#00FF87' }}>⚡ Asignación Rápida de Ejercicio</h4>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', marginBottom: '1rem' }}>
                        <div>
                          <label style={{ fontSize: '0.8rem', color: '#9CA3AF', display: 'block', marginBottom: '0.3rem' }}>Seleccionar del Banco:</label>
                          <select 
                            value={ejercicioAAsignar} 
                            onChange={(e) => setEjercicioAAsignar(e.target.value)}
                            style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', backgroundColor: '#111827', color: '#FFF', border: '1px solid #374151', fontSize: '0.9rem' }}>
                            {catalogoEjercicios.map(ex => (
                              <option key={ex.id} value={ex.nombre}>{ex.nombre} ({ex.grupo})</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label style={{ fontSize: '0.8rem', color: '#9CA3AF', display: 'block', marginBottom: '0.3rem' }}>Configuración Rápida de Series / Reps:</label>
                          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                            {['3x10', '4x12', '3x15', '5x5'].map((opcion) => (
                              <button 
                                key={opcion} 
                                type="button" 
                                onClick={() => setSeriesAAsignar(opcion)}
                                style={{ backgroundColor: seriesAAsignar === opcion ? '#38BDF8' : '#1F2937', color: seriesAAsignar === opcion ? '#090D16' : '#FFF', border: 'none', padding: '0.3rem 0.6rem', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 'bold', cursor: 'pointer' }}>
                                {opcion}
                              </button>
                            ))}
                          </div>
                          <input 
                            type="text" 
                            placeholder="Personalizar (ej: 4x10 - 60kg)" 
                            value={seriesAAsignar} 
                            onChange={(e) => setSeriesAAsignar(e.target.value)}
                            style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', backgroundColor: '#111827', color: '#FFF', border: '1px solid #374151', boxSizing: 'border-box' }} 
                          />
                        </div>
                      </div>

                      <button type="submit" style={{ width: '100%', padding: '0.7rem', backgroundColor: '#38BDF8', color: '#090D16', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.95rem' }}>
                        ⚡ Asignar Inmediatamente
                      </button>
                    </form>

                    {/* LISTA Y ESTADO DE SEGUIMIENTO */}
                    <h4 style={{ color: '#FFF', marginBottom: '0.8rem' }}>📊 Rutinas Asignadas & Estado</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                      {clienteSeleccionado.rutinas.length === 0 ? (
                        <p style={{ color: '#9CA3AF', fontSize: '0.85rem' }}>No hay rutinas asignadas aún.</p>
                      ) : (
                        clienteSeleccionado.rutinas.map(rutina => (
                          <div key={rutina.id} style={{ backgroundColor: '#090D16', padding: '0.8rem', borderRadius: '8px', border: '1px solid #1F2937', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                              <strong style={{ color: '#FFF' }}>{rutina.ejercicio}</strong>
                              <span style={{ fontSize: '0.8rem', color: '#38BDF8', display: 'block' }}>{rutina.series}</span>
                            </div>
                            <button 
                              onClick={() => cambiarEstadoRutina(clienteSeleccionado.id, rutina.id)}
                              style={{ backgroundColor: rutina.estado === 'Completado' ? 'rgba(0, 255, 135, 0.2)' : 'rgba(239, 68, 68, 0.2)', color: rutina.estado === 'Completado' ? '#00FF87' : '#ef4444', border: '1px solid ' + (rutina.estado === 'Completado' ? '#00FF87' : '#ef4444'), padding: '0.4rem 0.8rem', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 'bold', cursor: 'pointer' }}>
                              {rutina.estado === 'Completado' ? '✓ Completado' : '⏳ Pendiente'}
                            </button>
                          </div>
                        ))
                      )}
                    </div>

                    <button onClick={() => setClienteSeleccionado(null)} style={{ marginTop: '1.5rem', width: '100%', padding: '0.6rem', backgroundColor: '#374151', color: '#FFF', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
                      Cerrar
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* VISTA 2: BANCO DE EJERCICIOS CON BOTONES RÁPIDOS Y AUTOCOMPLETADO */}
          {seccionEntrenador === 'ejercicios' && (
            <div style={{ backgroundColor: '#111827', borderRadius: '16px', padding: '1.5rem', border: '1px solid #1F2937' }}>
              <h3 style={{ margin: '0 0 1rem 0', color: '#38BDF8', fontSize: '1.2rem', fontWeight: '800' }}>
                🏋️‍♂️ Catálogo de Ejercicios Disponibles
              </h3>

              {/* OPCIONES RÁPIDAS AUTOMÁTICAS */}
              <div style={{ backgroundColor: '#090D16', padding: '1.2rem', borderRadius: '12px', marginBottom: '1.5rem', border: '1px solid #1F2937' }}>
                <span style={{ display: 'block', color: '#00FF87', fontWeight: 'bold', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                  ⚡ Clic Rápido (Carga Automática):
                </span>
                
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                  {plantillasRapidas.map((p, idx) => (
                    <button 
                      key={idx} 
                      type="button" 
                      onClick={() => seleccionarPlantilla(p)} 
                      style={{ backgroundColor: '#1F2937', color: '#38BDF8', border: '1px solid #374151', padding: '0.4rem 0.8rem', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 'bold', cursor: 'pointer' }}>
                      + {p.nombre}
                    </button>
                  ))}
                </div>

                {/* FORMULARIO */}
                <form onSubmit={agregarEjercicioCatalogo}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.8rem', marginBottom: '1rem' }}>
                    <input 
                      type="text" 
                      placeholder="Nombre del ejercicio" 
                      value={nombreNuevoEx} 
                      onChange={(e) => setNombreNuevoEx(e.target.value)} 
                      style={{ padding: '0.6rem', borderRadius: '6px', border: '1px solid #374151', backgroundColor: '#111827', color: '#FFF' }}
                    />
                    <select 
                      value={grupoNuevoEx} 
                      onChange={(e) => setGrupoNuevoEx(e.target.value)}
                      style={{ padding: '0.6rem', borderRadius: '6px', border: '1px solid #374151', backgroundColor: '#111827', color: '#FFF' }}>
                      <option value="Pecho">Pecho</option>
                      <option value="Pierna">Pierna</option>
                      <option value="Espalda">Espalda</option>
                      <option value="Hombro">Hombro</option>
                      <option value="Brazo">Brazo</option>
                      <option value="Abdomen">Abdomen</option>
                    </select>
                    <select 
                      value={dificultadNuevoEx} 
                      onChange={(e) => setDificultadNuevoEx(e.target.value)}
                      style={{ padding: '0.6rem', borderRadius: '6px', border: '1px solid #374151', backgroundColor: '#111827', color: '#FFF' }}>
                      <option value="Baja">Baja</option>
                      <option value="Media">Media</option>
                      <option value="Alta">Alta</option>
                    </select>
                  </div>
                  <button type="submit" style={{ backgroundColor: '#38BDF8', color: '#090D16', border: 'none', padding: '0.6rem 1.2rem', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
                    Añadir al Banco
                  </button>
                </form>
              </div>

              {/* GRILLA DE EJERCICIOS */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '15px' }}>
                {catalogoEjercicios.map(ex => (
                  <div key={ex.id} style={{ backgroundColor: '#090D16', padding: '1.2rem', borderRadius: '10px', border: '1px solid #1F2937', position: 'relative' }}>
                    <button 
                      onClick={() => eliminarEjercicioCatalogo(ex.id)}
                      title="Eliminar ejercicio"
                      style={{ position: 'absolute', top: '10px', right: '10px', backgroundColor: 'transparent', color: '#ef4444', border: 'none', cursor: 'pointer', fontSize: '1rem' }}>
                      🗑️
                    </button>
                    <strong style={{ display: 'block', color: '#FFF', fontSize: '1.1rem', marginBottom: '0.4rem', paddingRight: '20px' }}>{ex.nombre}</strong>
                    <span style={{ color: '#00FF87', fontSize: '0.85rem', display: 'block', marginBottom: '0.2rem' }}>Grupo: {ex.grupo}</span>
                    <span style={{ color: '#9CA3AF', fontSize: '0.8rem' }}>Dificultad: {ex.dificultad}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* VISTA 3: GYM */}
          {seccionEntrenador === 'gym' && (
            <div style={{ backgroundColor: '#111827', borderRadius: '16px', padding: '1.5rem', border: '1px solid #1F2937' }}>
              <h3 style={{ margin: '0 0 1rem 0', color: '#38BDF8' }}>🏢 Información del Gimnasio Vinculado</h3>
              <p style={{ margin: '0.5rem 0', color: '#FFF' }}><strong>Nombre:</strong> {datosGimnasio.nombreGym}</p>
              <p style={{ margin: '0.5rem 0', color: '#9CA3AF' }}><strong>Ubicación:</strong> {datosGimnasio.ubicacion}</p>
              <p style={{ margin: '0.5rem 0', color: '#9CA3AF' }}><strong>Horarios de Atención:</strong> {datosGimnasio.horario}</p>
              <p style={{ margin: '0.5rem 0', color: '#9CA3AF' }}><strong>Áreas Disponibles:</strong> {datosGimnasio.equipamiento}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // RENDERIZADO SI ES CLIENTE
  // -------------------------------------------------------------
  return (
    <div style={{ fontFamily: "'Inter', system-ui, -apple-system, sans-serif", backgroundColor: '#090D16', color: '#FFFFFF', minHeight: '100vh', paddingBottom: '60px' }}>
      <header style={{ backgroundColor: '#111827', borderBottom: '1px solid #1F2937', padding: '1rem 2rem', marginBottom: '25px' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button onClick={() => onNavigate && onNavigate('home')} style={{ backgroundColor: '#1F2937', color: '#00FF87', border: '1px solid #00FF87', padding: '0.5rem 1.1rem', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}>
            ← Volver al Inicio
          </button>
          <span style={{ fontSize: '1.2rem', fontWeight: '900', color: '#FFFFFF' }}>Perfil de Usuario</span>
          <button onClick={onLogout} style={{ backgroundColor: '#DC2626', color: '#FFFFFF', border: 'none', padding: '0.5rem 1rem', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}>
            Cerrar Sesión
          </button>
        </div>
      </header>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 20px' }}>
        <div style={{ backgroundColor: '#111827', borderRadius: '20px', border: '1px solid #1F2937', overflow: 'hidden', marginBottom: '25px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
          <div style={{ height: '180px', backgroundImage: `url(${datosUsuario.fondoUrl})`, backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative' }}>
            <label style={{ position: 'absolute', top: '15px', right: '15px', backgroundColor: 'rgba(0,0,0,0.75)', color: '#FFFFFF', border: '1px solid #374151', padding: '0.4rem 0.9rem', borderRadius: '8px', fontSize: '0.8rem', fontWeight: '700', cursor: 'pointer', backdropFilter: 'blur(4px)' }}>
              🖼️ Cambiar Fondo
              <input type="file" accept="image/*" onChange={handleSubirFotoFondo} style={{ display: 'none' }} />
            </label>
          </div>

          <div style={{ padding: '0 2rem 2rem 2rem', marginTop: '-55px', display: 'flex', flexWrap: 'wrap', gap: '1.5rem', alignItems: 'flex-end', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '1.2rem', flexWrap: 'wrap' }}>
              <div style={{ position: 'relative' }}>
                <img src={datosUsuario.fotoUrl} alt="Foto de perfil" style={{ width: '120px', height: '120px', borderRadius: '50%', objectFit: 'cover', border: '4px solid #111827', backgroundColor: '#1F2937' }} />
                <label style={{ position: 'absolute', bottom: '2px', right: '2px', backgroundColor: '#00FF87', color: '#090D16', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontWeight: '900', boxShadow: '0 2px 8px rgba(0,0,0,0.4)', fontSize: '0.9rem' }} title="Cambiar foto de perfil">
                  📷
                  <input type="file" accept="image/*" onChange={handleSubirFotoPerfil} style={{ display: 'none' }} />
                </label>
              </div>

              <div style={{ backgroundColor: 'rgba(17, 24, 39, 0.9)', padding: '0.8rem 1.2rem', borderRadius: '12px', border: '1px solid #1F2937' }}>
                <h1 style={{ margin: 0, fontSize: '1.8rem', fontWeight: '900', color: '#FFFFFF', letterSpacing: '0.3px' }}>
                  {user.name || user.nombre || 'Cliente Biometra'}
                </h1>
                
                <div style={{ margin: '0.3rem 0', color: '#38BDF8', fontSize: '1rem', fontWeight: '700' }}>
                  ✉️ {user.email || 'usuario@correo.com'}
                </div>

                <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', marginTop: '0.4rem' }}>
                  <span style={{ backgroundColor: '#1F2937', color: '#9CA3AF', padding: '0.2rem 0.6rem', borderRadius: '6px', fontSize: '0.8rem', fontWeight: '600' }}>
                    Rol: Cliente
                  </span>
                  <span style={{ color: '#6B7280', fontSize: '0.8rem' }}>•</span>
                  <span style={{ color: '#9CA3AF', fontSize: '0.8rem' }}>Nivel: {datosUsuario.nivel}</span>
                </div>
              </div>
            </div>

            <button onClick={() => setEditando(!editando)} style={{ backgroundColor: editando ? '#374151' : '#00FF87', color: editando ? '#FFFFFF' : '#090D16', border: 'none', padding: '0.75rem 1.4rem', borderRadius: '10px', fontWeight: '800', fontSize: '0.9rem', cursor: 'pointer' }}>
              {editando ? '✕ Cancelar' : '⚙️ Editar Datos'}
            </button>
          </div>

          {editando && (
            <div style={{ backgroundColor: '#090D16', margin: '0 2rem 2rem 2rem', padding: '1.5rem', borderRadius: '12px', border: '1px solid #374151' }}>
              <h3 style={{ margin: '0 0 1rem 0', color: '#00FF87', fontSize: '1rem' }}>Modificar Información Personal</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#9CA3AF', marginBottom: '0.2rem' }}>Edad</label>
                  <input type="number" value={tempDatos.edad} onChange={(e) => setTempDatos({ ...tempDatos, edad: e.target.value })} style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #374151', backgroundColor: '#111827', color: '#FFF' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#9CA3AF', marginBottom: '0.2rem' }}>Peso</label>
                  <input type="text" value={tempDatos.peso} onChange={(e) => setTempDatos({ ...tempDatos, peso: e.target.value })} style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #374151', backgroundColor: '#111827', color: '#FFF' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#9CA3AF', marginBottom: '0.2rem' }}>Estatura</label>
                  <input type="text" value={tempDatos.estatura} onChange={(e) => setTempDatos({ ...tempDatos, estatura: e.target.value })} style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #374151', backgroundColor: '#111827', color: '#FFF' }} />
                </div>
              </div>
              <button onClick={guardarCambios} style={{ backgroundColor: '#00FF87', color: '#090D16', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', fontWeight: '800', cursor: 'pointer' }}>Guardar</button>
            </div>
          )}
        </div>

        {/* METRICAS CLIENTE */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '25px' }}>
          <div style={{ backgroundColor: '#111827', padding: '1.2rem', borderRadius: '14px', border: '1px solid #1F2937', textAlign: 'center' }}>
            <span style={{ color: '#9CA3AF', fontSize: '0.8rem', fontWeight: '700' }}>EDAD</span>
            <div style={{ fontSize: '1.6rem', fontWeight: '900', color: '#FFFFFF', marginTop: '0.2rem' }}>{datosUsuario.edad} años</div>
          </div>
          <div style={{ backgroundColor: '#111827', padding: '1.2rem', borderRadius: '14px', border: '1px solid #1F2937', textAlign: 'center' }}>
            <span style={{ color: '#9CA3AF', fontSize: '0.8rem', fontWeight: '700' }}>PESO</span>
            <div style={{ fontSize: '1.6rem', fontWeight: '900', color: '#38BDF8', marginTop: '0.2rem' }}>{datosUsuario.peso}</div>
          </div>
          <div style={{ backgroundColor: '#111827', padding: '1.2rem', borderRadius: '14px', border: '1px solid #1F2937', textAlign: 'center' }}>
            <span style={{ color: '#9CA3AF', fontSize: '0.8rem', fontWeight: '700' }}>ESTATURA</span>
            <div style={{ fontSize: '1.6rem', fontWeight: '900', color: '#FFFFFF', marginTop: '0.2rem' }}>{datosUsuario.estatura}</div>
          </div>
          <div style={{ backgroundColor: '#111827', padding: '1.2rem', borderRadius: '14px', border: '1px solid #1F2937', textAlign: 'center' }}>
            <span style={{ color: '#9CA3AF', fontSize: '0.8rem', fontWeight: '700' }}>EJERCICIOS DEL MES</span>
            <div style={{ fontSize: '1.6rem', fontWeight: '900', color: '#00FF87', marginTop: '0.2rem' }}>{datosUsuario.entrenamientosMes} Sesiones</div>
          </div>
        </div>

        {/* EJERCICIOS CLIENTE */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
          <div style={{ backgroundColor: '#111827', borderRadius: '16px', padding: '1.5rem', border: '1px solid #1F2937' }}>
            <h3 style={{ margin: '0 0 1rem 0', color: '#38BDF8', fontSize: '1.1rem', fontWeight: '800' }}>
              🏋️‍♂️ Mis Ejercicios Realizados
            </h3>

            <form onSubmit={agregarEjercicioCliente} style={{ backgroundColor: '#090D16', padding: '1rem', borderRadius: '10px', marginBottom: '1.2rem', border: '1px solid #1F2937' }}>
              <span style={{ display: 'block', fontSize: '0.8rem', color: '#00FF87', fontWeight: '700', marginBottom: '0.6rem' }}>
                ➕ Registrar Nuevo Ejercicio:
              </span>
              <input type="text" placeholder="Nombre del ejercicio (ej: Press de Hombros)" value={nuevoNombreCliente} onChange={(e) => setNuevoNombreCliente(e.target.value)} style={{ width: '100%', padding: '0.6rem', marginBottom: '0.5rem', borderRadius: '6px', border: '1px solid #374151', backgroundColor: '#111827', color: '#FFF', boxSizing: 'border-box' }} />
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.6rem' }}>
                <input type="text" placeholder="Series / Reps (ej: 3x10)" value={nuevasSeriesCliente} onChange={(e) => setNuevasSeriesCliente(e.target.value)} style={{ width: '50%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #374151', backgroundColor: '#111827', color: '#FFF' }} />
                <input type="text" placeholder="Peso (ej: 50 kg)" value={nuevoPesoCliente} onChange={(e) => setNuevoPesoCliente(e.target.value)} style={{ width: '50%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #374151', backgroundColor: '#111827', color: '#FFF' }} />
              </div>
              <button type="submit" style={{ width: '100%', padding: '0.6rem', backgroundColor: '#38BDF8', color: '#090D16', border: 'none', borderRadius: '6px', fontWeight: '800', cursor: 'pointer' }}>
                Añadir al Historial
              </button>
            </form>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', maxHeight: '300px', overflowY: 'auto' }}>
              {ejerciciosCliente.map((item) => (
                <div key={item.id} style={{ backgroundColor: '#090D16', padding: '0.9rem', borderRadius: '8px', border: '1px solid #1F2937' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <strong style={{ color: '#FFFFFF' }}>{item.nombre}</strong>
                    <span style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>{item.fecha}</span>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#00FF87', marginTop: '0.2rem' }}>{item.detalles}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ backgroundColor: '#111827', borderRadius: '16px', padding: '1.5rem', border: '1px solid #1F2937' }}>
            <h3 style={{ margin: '0 0 0.8rem 0', color: '#00FF87', fontSize: '1.1rem', fontWeight: '800' }}>
              🏆 Insignias Obtentidas
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1.5rem' }}>
              {insigniasDesbloqueadas.map((item) => (
                <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', backgroundColor: '#090D16', padding: '0.7rem', borderRadius: '8px', border: '1px solid #1F2937' }}>
                  <span style={{ fontSize: '1.5rem' }}>{item.icono}</span>
                  <div>
                    <strong style={{ display: 'block', fontSize: '0.85rem', color: '#FFF' }}>{item.titulo}</strong>
                    <span style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>{item.desc}</span>
                  </div>
                </div>
              ))}
            </div>

            <h3 style={{ margin: '0 0 0.8rem 0', color: '#9CA3AF', fontSize: '1rem', fontWeight: '800' }}>
              🔒 Insignias Por Desbloquear
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {insigniasPorDesbloquear.map((item) => (
                <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', backgroundColor: '#090D16', padding: '0.7rem', borderRadius: '8px', border: '1px dashed #374151', opacity: 0.7 }}>
                  <span style={{ fontSize: '1.3rem' }}>{item.icono}</span>
                  <div>
                    <strong style={{ display: 'block', fontSize: '0.85rem', color: '#9CA3AF' }}>{item.titulo}</strong>
                    <span style={{ fontSize: '0.75rem', color: '#6B7280' }}>{item.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};