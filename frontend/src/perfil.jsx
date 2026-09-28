import React, { useState } from 'react';

export const Perfil = ({ user, onLogout, onNavigate }) => {
  if (!user) return null;

  // Estados de datos personales
  const [datosUsuario, setDatosUsuario] = useState({
    edad: 26,
    peso: '74 kg',
    estatura: '1.75 m',
    nivel: 'Avanzado',
    entrenamientosMes: 0, // Inicia en 0 para ser realista
    fotoUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=300',
    fondoUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&q=80&w=1200'
  });

  const [editando, setEditando] = useState(false);
  const [tempDatos, setTempDatos] = useState({ ...datosUsuario });

  // Historial de ejercicios dinámico (permite agregar nuevos)
  const [ejercicios, setEjercicios] = useState([
    { id: 1, nombre: 'Press de Banca', fecha: 'Hoy', detalles: '4 series x 10 reps - 70 kg' },
    { id: 2, nombre: 'Sentadillas', fecha: 'Ayer', detalles: '3 series x 12 reps - 80 kg' }
  ]);

  // Formulario para nuevo ejercicio
  const [nuevoNombre, setNuevoNombre] = useState('');
  const [nuevasSeries, setNuevasSeries] = useState('');
  const [nuevoPeso, setNuevoPeso] = useState('');

  // Insignias
  const insigniasDesbloqueadas = [
    { id: 1, icono: '🚀', titulo: 'Primer Registro', desc: 'Creaste tu cuenta en la plataforma' },
    { id: 2, icono: '🔥', titulo: 'Primer Ejercicio', desc: 'Completaste tu primera rutina' }
  ];

  const insigniasPorDesbloquear = [
    { id: 3, icono: '🔒', titulo: 'Racha de 7 Días', desc: 'Entrena 7 días seguidos' },
    { id: 4, icono: '🔒', titulo: 'Levantador Constante', desc: 'Registra 10 ejercicios en el mes' },
    { id: 5, icono: '🔒', titulo: 'Titán del Gimnasio', desc: 'Supera las 20 sesiones en un mes' }
  ];

  // Subir foto de perfil desde el PC
  const handleSubirFotoPerfil = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setDatosUsuario(prev => ({ ...prev, fotoUrl: imageUrl }));
    }
  };

  // Subir foto de fondo desde el PC
  const handleSubirFotoFondo = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setDatosUsuario(prev => ({ ...prev, fondoUrl: imageUrl }));
    }
  };

  // Guardar cambios de edición de datos
  const guardarCambios = () => {
    setDatosUsuario({ ...tempDatos });
    setEditando(false);
  };

  // Agregar nuevo ejercicio
  const agregarEjercicio = (e) => {
    e.preventDefault();
    if (!nuevoNombre.trim()) return;

    const nuevo = {
      id: Date.now(),
      nombre: nuevoNombre,
      fecha: 'Justo ahora',
      detalles: `${nuevasSeries || '3 series'} ${nuevoPeso ? `- ${nuevoPeso}` : ''}`
    };

    setEjercicios([nuevo, ...ejercicios]);
    setDatosUsuario(prev => ({ ...prev, entrenamientosMes: prev.entrenamientosMes + 1 }));
    setNuevoNombre('');
    setNuevasSeries('');
    setNuevoPeso('');
  };

  return (
    <div style={{
      fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
      backgroundColor: '#090D16',
      color: '#FFFFFF',
      minHeight: '100vh',
      paddingBottom: '60px'
    }}>
      {/* NAVBAR */}
      <header style={{ 
        backgroundColor: '#111827', 
        borderBottom: '1px solid #1F2937', 
        padding: '1rem 2rem',
        marginBottom: '25px'
      }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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

          <span style={{ fontSize: '1.2rem', fontWeight: '900', color: '#FFFFFF' }}>
            Perfil de Usuario
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

      {/* CONTENEDOR PRINCIPAL */}
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 20px' }}>
        
        {/* BANNER PRINCIPAL Y FOTOS */}
        <div style={{
          backgroundColor: '#111827',
          borderRadius: '20px',
          border: '1px solid #1F2937',
          overflow: 'hidden',
          marginBottom: '25px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
        }}>
          {/* FONDO PORTADA CON IMAGEN PERSONALIZABLE */}
          <div style={{
            height: '180px',
            backgroundImage: `url(${datosUsuario.fondoUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            position: 'relative'
          }}>
            {/* BOTÓN PARA CAMBIAR FONDO DE PORTADA */}
            <label style={{
              position: 'absolute',
              top: '15px',
              right: '15px',
              backgroundColor: 'rgba(0,0,0,0.75)',
              color: '#FFFFFF',
              border: '1px solid #374151',
              padding: '0.4rem 0.9rem',
              borderRadius: '8px',
              fontSize: '0.8rem',
              fontWeight: '700',
              cursor: 'pointer',
              backdropFilter: 'blur(4px)'
            }}>
              🖼️ Cambiar Fondo
              <input type="file" accept="image/*" onChange={handleSubirFotoFondo} style={{ display: 'none' }} />
            </label>
          </div>

          {/* DATOS DE IDENTIFICACIÓN CON MÁXIMO CONTRASTE */}
          <div style={{ padding: '0 2rem 2rem 2rem', marginTop: '-55px', display: 'flex', flexWrap: 'wrap', gap: '1.5rem', alignItems: 'flex-end', justifyContent: 'space-between' }}>
            
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '1.2rem', flexWrap: 'wrap' }}>
              {/* AVATAR CON BOTÓN PARA SUBIR FOTO DESDE EL PC */}
              <div style={{ position: 'relative' }}>
                <img 
                  src={datosUsuario.fotoUrl} 
                  alt="Foto de perfil"
                  style={{
                    width: '120px',
                    height: '120px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '4px solid #111827',
                    backgroundColor: '#1F2937'
                  }}
                />
                <label style={{
                  position: 'absolute',
                  bottom: '2px',
                  right: '2px',
                  backgroundColor: '#00FF87',
                  color: '#090D16',
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  fontWeight: '900',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
                  fontSize: '0.9rem'
                }} title="Cambiar foto de perfil">
                  📷
                  <input type="file" accept="image/*" onChange={handleSubirFotoPerfil} style={{ display: 'none' }} />
                </label>
              </div>

              {/* TEXTO DE NOMBRE Y CORREO CON MÁXIMA CLARIDAD */}
              <div style={{ backgroundColor: 'rgba(17, 24, 39, 0.9)', padding: '0.8rem 1.2rem', borderRadius: '12px', border: '1px solid #1F2937' }}>
                <h1 style={{ margin: 0, fontSize: '1.8rem', fontWeight: '900', color: '#FFFFFF', letterSpacing: '0.3px' }}>
                  {user.name || user.nombre || 'Usuario Registrado'}
                </h1>
                
                <div style={{ margin: '0.3rem 0', color: '#38BDF8', fontSize: '1rem', fontWeight: '700' }}>
                  ✉️ {user.email || 'usuario@correo.com'}
                </div>

                <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', marginTop: '0.4rem' }}>
                  <span style={{ backgroundColor: '#1F2937', color: '#9CA3AF', padding: '0.2rem 0.6rem', borderRadius: '6px', fontSize: '0.8rem', fontWeight: '600' }}>
                    Rol: {user.role === 'gimnasio' || user.rol === 'entrenador' ? 'Entrenador' : 'Usuario'}
                  </span>
                  <span style={{ color: '#6B7280', fontSize: '0.8rem' }}>•</span>
                  <span style={{ color: '#9CA3AF', fontSize: '0.8rem' }}>Nivel: {datosUsuario.nivel}</span>
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
                fontSize: '0.9rem',
                cursor: 'pointer'
              }}
            >
              {editando ? '✕ Cancelar' : '⚙️ Editar Datos'}
            </button>
          </div>

          {/* FORMULARIO PARA EDITAR EDAD, PESO Y ESTATURA */}
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

        {/* METRICAS REALES Y CLARAS */}
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

        {/* SECCIÓN DOS COLUMNAS: EJERCICIOS Y INSIGNIAS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
          
          {/* COLUMNA 1: REGISTRO Y HISTORIAL DINÁMICO DE EJERCICIOS */}
          <div style={{ backgroundColor: '#111827', borderRadius: '16px', padding: '1.5rem', border: '1px solid #1F2937' }}>
            <h3 style={{ margin: '0 0 1rem 0', color: '#38BDF8', fontSize: '1.1rem', fontWeight: '800' }}>
              🏋️‍♂️ Mis Ejercicios Realizados
            </h3>

            {/* FORMULARIO PARA AÑADIR EJERCICIO NUEVO */}
            <form onSubmit={agregarEjercicio} style={{ backgroundColor: '#090D16', padding: '1rem', borderRadius: '10px', marginBottom: '1.2rem', border: '1px solid #1F2937' }}>
              <span style={{ display: 'block', fontSize: '0.8rem', color: '#00FF87', fontWeight: '700', marginBottom: '0.6rem' }}>
                ➕ Registrar Nuevo Ejercicio:
              </span>
              <input 
                type="text" 
                placeholder="Nombre del ejercicio (ej: Press de Hombros)"
                value={nuevoNombre}
                onChange={(e) => setNuevoNombre(e.target.value)}
                style={{ width: '100%', padding: '0.6rem', marginBottom: '0.5rem', borderRadius: '6px', border: '1px solid #374151', backgroundColor: '#111827', color: '#FFF', boxSizing: 'border-box' }}
              />
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.6rem' }}>
                <input 
                  type="text" 
                  placeholder="Series / Reps (ej: 3x10)"
                  value={nuevasSeries}
                  onChange={(e) => setNuevasSeries(e.target.value)}
                  style={{ width: '50%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #374151', backgroundColor: '#111827', color: '#FFF' }}
                />
                <input 
                  type="text" 
                  placeholder="Peso (ej: 50 kg)"
                  value={nuevoPeso}
                  onChange={(e) => setNuevoPeso(e.target.value)}
                  style={{ width: '50%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #374151', backgroundColor: '#111827', color: '#FFF' }}
                />
              </div>
              <button type="submit" style={{ width: '100%', padding: '0.6rem', backgroundColor: '#38BDF8', color: '#090D16', border: 'none', borderRadius: '6px', fontWeight: '800', cursor: 'pointer' }}>
                Añadir al Historial
              </button>
            </form>

            {/* LISTA DE EJERCICIOS */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', maxHeight: '300px', overflowY: 'auto' }}>
              {ejercicios.length === 0 ? (
                <div style={{ color: '#6B7280', fontSize: '0.85rem', textAlign: 'center', padding: '1rem' }}>Aún no has registrado ningún ejercicio.</div>
              ) : (
                ejercicios.map((item) => (
                  <div key={item.id} style={{ backgroundColor: '#090D16', padding: '0.9rem', borderRadius: '8px', border: '1px solid #1F2937' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <strong style={{ color: '#FFFFFF' }}>{item.nombre}</strong>
                      <span style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>{item.fecha}</span>
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#00FF87', marginTop: '0.2rem' }}>{item.detalles}</div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* COLUMNA 2: INSIGNIAS OBTENIDAS Y POR DESBLOQUEAR */}
          <div style={{ backgroundColor: '#111827', borderRadius: '16px', padding: '1.5rem', border: '1px solid #1F2937' }}>
            
            {/* INSIGNIAS OBTENIDAS */}
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

            {/* INSIGNIAS POR DESBLOQUEAR */}
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