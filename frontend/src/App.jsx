import React, { useState } from 'react';
import Login from './login';
import Gps from './Gps'; 
import Ejercicios from './ejercicios';
import { Perfil } from './perfil'; 
import './App.css';

const LogoBiometra = () => (
  <svg width="36" height="36" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="100" height="100" rx="22" fill="#020617" />
    <path d="M20 50 Q35 20, 50 50 T80 50" stroke="#00FF87" strokeWidth="7" strokeLinecap="round" fill="none" />
    <path d="M20 50 Q35 80, 50 50 T80 50" stroke="#38BDF8" strokeWidth="7" strokeLinecap="round" fill="none" />
    <circle cx="50" cy="50" r="10" fill="#00FF87" />
  </svg>
);

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [currentView, setCurrentView] = useState('app');
  const [activeModal, setActiveModal] = useState(null);

  // Estados exclusivos de gestión para el Administrador
  const [tabAdmin, setTabAdmin] = useState('clientes');
  const [usuarioDetalle, setUsuarioDetalle] = useState(null);

  // Filtros para la gestión de gimnasios
  const [filtroComunaAdmin, setFiltroComunaAdmin] = useState('Todas');
  const [filtroMarcaAdmin, setFiltroMarcaAdmin] = useState('Todas');
  
  const [listaClientes, setListaClientes] = useState([
    { id: 1, nombre: 'Carlos Pérez', email: 'cliente@ejemplo.com', fechaRegistro: '10/01/2024', antiguedad: '10 meses', nivel: 'Avanzado', plan: 'Fuerza Máxima', estado: 'Activo' },
    { id: 2, nombre: 'Ana Gómez', email: 'ana.gomez@ejemplo.com', fechaRegistro: '15/02/2024', antiguedad: '9 meses', nivel: 'Intermedio', plan: 'Hipertrofia', estado: 'Activo' },
    { id: 3, nombre: 'Lucía Fernández', email: 'lucia.f@ejemplo.com', fechaRegistro: '01/05/2024', antiguedad: '6 meses', nivel: 'Principiante', plan: 'Rehabilitación', estado: 'Inactivo' }
  ]);

  const [listaEntrenadores, setListaEntrenadores] = useState([
    { id: 1, nombre: 'Entrenador Marco', email: 'entrenador@ejemplo.com', fechaRegistro: '05/08/2023', antiguedad: '1 año 2 meses', especialidad: 'Fuerza / Hipertrofia', clientesAsignados: 5, estado: 'Activo' },
    { id: 2, nombre: 'Entrenadora Laura', email: 'laura.coach@ejemplo.com', fechaRegistro: '12/11/2023', antiguedad: '11 meses', especialidad: 'Rehabilitación Biomecánica', clientesAsignados: 3, estado: 'Activo' }
  ]);

  // Base completa de sedes de gimnasios
  const [listaGimnasios, setListaGimnasios] = useState([
    { id: 1, marca: 'Smart Fit', nombre: 'Smart Fit - Arica Diego Portales', comuna: 'Arica', region: 'Arica y Parinacota', direccion: 'Av. Diego Portales 157' },
    { id: 2, marca: 'Pacific Fitness', nombre: 'Pacific Fitness - Iquique', comuna: 'Iquique', region: 'Tarapacá', direccion: 'Tarapacá 465' },
    { id: 3, marca: 'Sportlife', nombre: 'Sportlife - Antofagasta Angamos', comuna: 'Antofagasta', region: 'Antofagasta', direccion: 'Av. Angamos 1215' },
    { id: 4, marca: 'Smart Fit', nombre: 'Smart Fit - Valparaíso Plaza Victoria', comuna: 'Valparaíso', region: 'Valparaíso', direccion: 'Av. Brasil 1650' },
    { id: 5, marca: 'Pacific Fitness', nombre: 'Pacific Fitness - Viña del Mar', comuna: 'Viña del Mar', region: 'Valparaíso', direccion: 'Arlegui 440' },
    { id: 6, marca: 'Power Fitness', nombre: 'Power Fitness - Reñaca', comuna: 'Viña del Mar', region: 'Valparaíso', direccion: 'Av. Borgoño 14500' },
    { id: 7, marca: 'Pacific Fitness', nombre: 'Pacific Fitness - Merced', comuna: 'Santiago Centro', region: 'RM', direccion: 'Merced 838' },
    { id: 8, marca: 'Sportlife', nombre: 'Sportlife - Vitacura', comuna: 'Vitacura', region: 'RM', direccion: 'Av. Vitacura 2640' },
    { id: 9, marca: 'O2 Fit', nombre: 'O2 Fit - El Golf', comuna: 'Las Condes', region: 'RM', direccion: 'Av. Isidora Goyenechea 3000' },
    { id: 10, marca: 'Anytime Fitness', nombre: 'Anytime Fitness - Chicureo', comuna: 'Colina', region: 'RM', direccion: 'Av. Chicureo 1700' },
    { id: 11, marca: 'SpeedWorks', nombre: 'SpeedWorks - Las Condes', comuna: 'Las Condes', region: 'RM', direccion: 'Cerro Colorado 4661' },
    { id: 12, marca: 'Youtopia', nombre: 'Youtopia - Los Trapenses', comuna: 'Lo Barnechea', region: 'RM', direccion: 'Av. José Alcalde Délano 10497' },
    { id: 13, marca: 'Dmoov', nombre: 'Dmoov - Escuela Militar', comuna: 'Las Condes', region: 'RM', direccion: 'Av. Apoquindo 4501' },
    { id: 14, marca: 'Smart Fit', nombre: 'Smart Fit - Concepción Centro', comuna: 'Concepción', region: 'Biobío', direccion: 'Barros Arana 1068' },
    { id: 15, marca: 'Sportlife', nombre: 'Sportlife - Temuco', comuna: 'Temuco', region: 'Araucanía', direccion: 'Av. Alemania 0825' }
  ]);

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentView('app');
  };

  // Obtener comunas y marcas únicas para los filtros desplegables del Admin
  const comunasDisponibles = ['Todas', ...Array.from(new Set(listaGimnasios.map(g => g.comuna)))];
  const marcasDisponibles = ['Todas', ...Array.from(new Set(listaGimnasios.map(g => g.marca)))];

  const gimnasiosFiltradosAdmin = listaGimnasios.filter(gym => {
    const cumpleComuna = filtroComunaAdmin === 'Todas' || gym.comuna === filtroComunaAdmin;
    const cumpleMarca = filtroMarcaAdmin === 'Todas' || gym.marca === filtroMarcaAdmin;
    return cumpleComuna && cumpleMarca;
  });

  if (!currentUser) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  // VISTA EXCLUSIVA DEL ADMINISTRADOR
  if (currentUser.role === 'administrador') {
    return (
      <div className="app-container" style={{ backgroundColor: '#0B1120', minHeight: '100vh' }}>
        <nav className="navbar">
          <div className="logo-brand">
            <LogoBiometra />
            <span className="brand-name">BIOMETRA ADMIN</span>
          </div>

          <div className="nav-actions">
            <span style={{ color: '#38BDF8', fontWeight: 'bold', fontSize: '0.9rem' }}>
              ⚙️ {currentUser.name}
            </span>
            <button onClick={handleLogout} style={{ backgroundColor: '#EF4444', color: '#FFF', border: 'none', padding: '0.5rem 1rem', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
              Cerrar Sesión
            </button>
          </div>
        </nav>

        <main style={{ maxWidth: '1100px', margin: '3rem auto', padding: '0 2rem', boxSizing: 'border-box' }}>
          <div style={{ marginBottom: '2rem' }}>
            <h1 style={{ fontSize: '2.2rem', fontWeight: '900', color: '#FFFFFF', margin: '0 0 0.5rem 0' }}>
              ⚙️ Panel Exclusivo de Administración
            </h1>
            <p style={{ color: '#94A3B8', margin: 0 }}>
              Gestión centralizada de usuarios, cuerpo técnico y sedes adheridas.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
            <button 
              onClick={() => { setTabAdmin('clientes'); setUsuarioDetalle(null); }} 
              style={{ flex: 1, padding: '1rem', borderRadius: '10px', border: 'none', fontWeight: '900', cursor: 'pointer', fontSize: '1rem', backgroundColor: tabAdmin === 'clientes' ? '#00FF87' : '#1E293B', color: tabAdmin === 'clientes' ? '#0F172A' : '#FFF' }}>
              👤 Gestión de Clientes ({listaClientes.length})
            </button>

            <button 
              onClick={() => { setTabAdmin('entrenadores'); setUsuarioDetalle(null); }} 
              style={{ flex: 1, padding: '1rem', borderRadius: '10px', border: 'none', fontWeight: '900', cursor: 'pointer', fontSize: '1rem', backgroundColor: tabAdmin === 'entrenadores' ? '#38BDF8' : '#1E293B', color: tabAdmin === 'entrenadores' ? '#0F172A' : '#FFF' }}>
              📋 Gestión de Entrenadores ({listaEntrenadores.length})
            </button>

            <button 
              onClick={() => { setTabAdmin('gimnasios'); setUsuarioDetalle(null); }} 
              style={{ flex: 1, padding: '1rem', borderRadius: '10px', border: 'none', fontWeight: '900', cursor: 'pointer', fontSize: '1rem', backgroundColor: tabAdmin === 'gimnasios' ? '#818CF8' : '#1E293B', color: tabAdmin === 'gimnasios' ? '#0F172A' : '#FFF' }}>
              🏢 Gestión de Gimnasios ({listaGimnasios.length})
            </button>
          </div>

          {/* TAB CLIENTES */}
          {tabAdmin === 'clientes' && (
            <div style={{ backgroundColor: '#0F172A', padding: '2rem', borderRadius: '16px', border: '1px solid #1E293B' }}>
              <h3 style={{ margin: '0 0 1.2rem 0', color: '#00FF87', fontSize: '1.3rem' }}>Lista Activa de Clientes</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {listaClientes.map(cli => (
                  <div key={cli.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#1E293B', padding: '1.2rem', borderRadius: '10px', border: '1px solid #334155' }}>
                    <div>
                      <strong style={{ color: '#FFF', fontSize: '1.1rem' }}>{cli.nombre}</strong>
                      <span style={{ display: 'block', color: '#94A3B8', fontSize: '0.88rem', marginTop: '0.2rem' }}>📧 {cli.email} • Antigüedad: {cli.antiguedad}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '0.6rem' }}>
                      <button 
                        onClick={() => setUsuarioDetalle(cli)}
                        style={{ backgroundColor: '#38BDF8', color: '#0F172A', border: 'none', padding: '0.5rem 1rem', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
                        👁️ Ver Perfil
                      </button>
                      <button 
                        onClick={() => setListaClientes(listaClientes.filter(c => c.id !== cli.id))}
                        style={{ backgroundColor: '#EF4444', color: '#FFF', border: 'none', padding: '0.5rem 1rem', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
                        🗑️ Eliminar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB ENTRENADORES */}
          {tabAdmin === 'entrenadores' && (
            <div style={{ backgroundColor: '#0F172A', padding: '2rem', borderRadius: '16px', border: '1px solid #1E293B' }}>
              <h3 style={{ margin: '0 0 1.2rem 0', color: '#38BDF8', fontSize: '1.3rem' }}>Lista de Entrenadores</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {listaEntrenadores.map(ent => (
                  <div key={ent.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#1E293B', padding: '1.2rem', borderRadius: '10px', border: '1px solid #334155' }}>
                    <div>
                      <strong style={{ color: '#FFF', fontSize: '1.1rem' }}>{ent.nombre}</strong>
                      <span style={{ display: 'block', color: '#94A3B8', fontSize: '0.88rem', marginTop: '0.2rem' }}>📧 {ent.email} • Especialidad: {ent.especialidad}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '0.6rem' }}>
                      <button 
                        onClick={() => setUsuarioDetalle(ent)}
                        style={{ backgroundColor: '#38BDF8', color: '#0F172A', border: 'none', padding: '0.5rem 1rem', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
                        👁️ Ver Perfil
                      </button>
                      <button 
                        onClick={() => setListaEntrenadores(listaEntrenadores.filter(e => e.id !== ent.id))}
                        style={{ backgroundColor: '#EF4444', color: '#FFF', border: 'none', padding: '0.5rem 1rem', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
                        🗑️ Eliminar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB GIMNASIOS CON FILTROS POR COMUNA Y MARCA */}
          {tabAdmin === 'gimnasios' && (
            <div style={{ backgroundColor: '#0F172A', padding: '2rem', borderRadius: '16px', border: '1px solid #1E293B' }}>
              <h3 style={{ margin: '0 0 1.2rem 0', color: '#818CF8', fontSize: '1.3rem' }}>Sedes de Gimnasios Adheridas</h3>

              {/* FILTROS DESPLEGABLES */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem', backgroundColor: '#1E293B', padding: '1rem', borderRadius: '10px' }}>
                <div>
                  <label style={{ display: 'block', color: '#94A3B8', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '0.4rem' }}>
                    📍 FILTRAR POR COMUNA:
                  </label>
                  <select 
                    value={filtroComunaAdmin} 
                    onChange={(e) => setFiltroComunaAdmin(e.target.value)}
                    style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', backgroundColor: '#0F172A', color: '#FFF', border: '1px solid #334155', fontWeight: 'bold', outline: 'none' }}>
                    {comunasDisponibles.map(c => (
                      <option key={c} value={c}>{c === 'Todas' ? 'Todas las Comunas' : c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', color: '#94A3B8', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '0.4rem' }}>
                    🏷️ FILTRAR POR MARCA:
                  </label>
                  <select 
                    value={filtroMarcaAdmin} 
                    onChange={(e) => setFiltroMarcaAdmin(e.target.value)}
                    style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', backgroundColor: '#0F172A', color: '#FFF', border: '1px solid #334155', fontWeight: 'bold', outline: 'none' }}>
                    {marcasDisponibles.map(m => (
                      <option key={m} value={m}>{m === 'Todas' ? 'Todas las Marcas' : m}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ fontSize: '0.88rem', color: '#94A3B8', marginBottom: '1rem' }}>
                Sedes mostradas: <strong>{gimnasiosFiltradosAdmin.length}</strong>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '420px', overflowY: 'auto' }}>
                {gimnasiosFiltradosAdmin.map(gym => (
                  <div key={gym.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#1E293B', padding: '1.2rem', borderRadius: '10px', border: '1px solid #334155' }}>
                    <div>
                      <strong style={{ color: '#FFF', fontSize: '1.1rem' }}>{gym.nombre}</strong>
                      <span style={{ display: 'block', color: '#94A3B8', fontSize: '0.88rem', marginTop: '0.2rem' }}>📍 {gym.direccion} ({gym.comuna}, Región {gym.region}) • Cadena: <strong>{gym.marca}</strong></span>
                    </div>
                    <button 
                      onClick={() => setListaGimnasios(listaGimnasios.filter(g => g.id !== gym.id))}
                      style={{ backgroundColor: '#EF4444', color: '#FFF', border: 'none', padding: '0.5rem 1rem', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
                      🗑️ Eliminar Sede
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* MODAL / TARJETA CON INFORMACIÓN COMPLETA DEL USUARIO */}
          {usuarioDetalle && (
            <div className="modal-overlay">
              <div className="modal-content" style={{ border: '1px solid #00FF87' }}>
                <div className="modal-header">
                  <h3 style={{ color: '#00FF87' }}>👤 Información Detallada del Perfil</h3>
                  <button className="close-btn" onClick={() => setUsuarioDetalle(null)}>✕</button>
                </div>

                <div className="modal-body">
                  <p style={{ margin: '0.4rem 0' }}><strong>Nombre Completo:</strong> {usuarioDetalle.nombre}</p>
                  <p style={{ margin: '0.4rem 0' }}><strong>Correo Electrónico:</strong> {usuarioDetalle.email}</p>
                  <p style={{ margin: '0.4rem 0' }}><strong>Fecha de Registro:</strong> {usuarioDetalle.fechaRegistro}</p>
                  <p style={{ margin: '0.4rem 0' }}><strong>Antigüedad en Biometra:</strong> {usuarioDetalle.antiguedad}</p>
                  <p style={{ margin: '0.4rem 0' }}><strong>Estado de Cuenta:</strong> <span style={{ color: usuarioDetalle.estado === 'Activo' ? '#00FF87' : '#EF4444', fontWeight: 'bold' }}>{usuarioDetalle.estado}</span></p>
                  
                  {usuarioDetalle.plan && <p style={{ margin: '0.4rem 0' }}><strong>Plan Asignado:</strong> {usuarioDetalle.plan}</p>}
                  {usuarioDetalle.nivel && <p style={{ margin: '0.4rem 0' }}><strong>Nivel Deportivo:</strong> {usuarioDetalle.nivel}</p>}
                  {usuarioDetalle.especialidad && <p style={{ margin: '0.4rem 0' }}><strong>Especialidad Técnica:</strong> {usuarioDetalle.especialidad}</p>}
                  {usuarioDetalle.clientesAsignados && <p style={{ margin: '0.4rem 0' }}><strong>Clientes a Cargo:</strong> {usuarioDetalle.clientesAsignados}</p>}
                </div>

                <button className="btn-modal-close" onClick={() => setUsuarioDetalle(null)}>
                  Cerrar Ficha
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    );
  }

  // VISTAS CLIENTES Y ENTRENADORES
  if (currentView === 'perfil') {
    return <Perfil user={currentUser} onLogout={handleLogout} onNavigate={setCurrentView} />;
  }

  if (currentView === 'gps') {
    return <Gps onNavigate={setCurrentView} />;
  }

  if (currentView === 'ejercicios') {
    return <Ejercicios onNavigate={setCurrentView} />;
  }

  return (
    <div className="app-container">
      <nav className="navbar">
        <div className="logo-brand" onClick={() => setCurrentView('app')}>
          <LogoBiometra />
          <span className="brand-name">BIOMETRA</span>
        </div>

        <div className="nav-actions">
          <button onClick={() => setActiveModal('deQueTrata')} className="btn-metrics">
            💡 ¿De qué trata?
          </button>

          <button onClick={() => setCurrentView('perfil')} className="btn-profile">
            👤 Mi Perfil
          </button>
        </div>
      </nav>

      <section className="hero-section">
        <div className="hero-badge">⚡ TECNOLOGÍA BIOMECÁNICA DE ALTO RENDIMIENTO</div>
        <h1 className="hero-title">
          Optimiza Tu Técnica <br />
          <span className="gradient-text">Sin Riesgo de Lesión</span>
        </h1>

        <p className="hero-description">
          Análisis cinemático en tiempo real impulsado por inteligencia artificial. Corrige tu postura, evalúa tu rango de movimiento y lleva tus levantamientos al siguiente nivel.
        </p>

        <div className="hero-buttons">
          <button onClick={() => setCurrentView('ejercicios')} className="btn-primary">
            🚀 Comenzar Entrenamiento
          </button>
          <button onClick={() => setCurrentView('gps')} className="btn-secondary">
            📍 Red de Gimnasios Adheridos
          </button>
        </div>
      </section>

      <section className="about-section">
        <div className="about-card">
          <h2 className="section-title">💡 Sobre Nosotros</h2>
          <p className="about-text">
            En <strong>Biometra</strong> combinamos las ciencias del deporte, la biomecánica clínica y el procesamiento de imagen en tiempo real para brindarle a atletas y entrenadores un diagnóstico preciso de cada repetición. Nuestra misión es democratizar el entrenamiento biomecánico de élite en todo Chile.
          </p>
        </div>
      </section>

      <footer className="footer">
        <div className="footer-brand-col">
          <div className="logo-brand">
            <LogoBiometra />
            <span className="brand-name">BIOMETRA</span>
          </div>
          <p className="footer-desc">Ciencia y tecnología aplicada a la técnica de levantamiento.</p>
        </div>

        <div className="footer-links">
          <div>
            <h4 className="footer-col-title green">Plataforma</h4>
            <p className="footer-link" onClick={() => setActiveModal('deQueTrata')}>¿De qué trata?</p>
            <p className="footer-link" onClick={() => setCurrentView('gps')}>Gimnasios Adheridos</p>
          </div>
          <div>
            <h4 className="footer-col-title blue">Soporte & Legal</h4>
            <p className="footer-link" onClick={() => setActiveModal('soporte')}>Contacto / Soporte</p>
            <p className="footer-link" onClick={() => setActiveModal('terminos')}>Términos del Servicio</p>
          </div>
        </div>
      </footer>

      {activeModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>
                {activeModal === 'deQueTrata' && '💡 ¿De qué trata Biometra?'}
                {activeModal === 'soporte' && '💬 Centro de Soporte'}
                {activeModal === 'terminos' && '📜 Términos del Servicio'}
              </h3>
              <button className="close-btn" onClick={() => setActiveModal(null)}>✕</button>
            </div>

            <div className="modal-body">
              {activeModal === 'deQueTrata' && (
                <div>
                  <p><strong>Biometra</strong> es una plataforma integral para el análisis biomecánico de ejercicios de fuerza:</p>
                  <ul className="modal-list">
                    <li>🟢 <strong>Análisis en tiempo real:</strong> Evaluación articular y detección de riesgo de lesión.</li>
                    <li>🔵 <strong>Catálogo guiado:</strong> Demostración en video con tips de ejecución limpia.</li>
                    <li>🟣 <strong>Red de Gimnasios:</strong> Localización de sedes oficiales equipadas con tecnología Biometra.</li>
                  </ul>
                </div>
              )}

              {activeModal === 'soporte' && (
                <div>
                  <p>📧 Email de contacto: <strong>soporte@biometra.cl</strong></p>
                  <p>📞 Teléfono: <strong>+56 2 2900 1122</strong></p>
                </div>
              )}

              {activeModal === 'terminos' && (
                <p>El uso del sistema biomecánico es una herramienta de asistencia y apoyo técnico. No sustituye evaluación médica o kinésica especializada.</p>
              )}
            </div>

            <button className="btn-modal-close" onClick={() => setActiveModal(null)}>
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}