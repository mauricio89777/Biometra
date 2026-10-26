import React, { useState } from 'react';
import Login from './login';
import Gps from './Gps'; 
import Ejercicios from './ejercicios';
import { Perfil } from './perfil'; 
import './App.css';

// NUEVO ICONO BIOMETRA: Símbolo abstracto de pivote cinemático y visión por computadora
const LogoBiometra = () => (
  <svg width="38" height="38" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      {/* Degradado dinámico para la línea de movimiento */}
      <linearGradient id="kineticGradient" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#06D6A0" /> {/* Esmeralda */}
        <stop offset="100%" stopColor="#00B4D8" /> {/* Cian */}
      </linearGradient>
    </defs>
    
    {/* Fondo contenedor redondeado (Navy oscuro) */}
    <rect width="100" height="100" rx="22" fill="#0B132B" />
    
    {/* Hexágono externo: Representa la precisión digital y el encuadre de la IA */}
    <path 
      d="M50 15 L80 32.5 L80 67.5 L50 85 L20 67.5 L20 32.5 Z" 
      stroke="#3A506B" 
      strokeWidth="3" 
      strokeLinejoin="round" 
      opacity="0.6"
    />
    
    {/* Núcleo Central: Articulación esférica / Punto de datos central */}
    <circle cx="50" cy="50" r="8" fill="#FFFFFF" /> {/* Punto blanco brillante */}
    <circle cx="50" cy="50" r="14" stroke="#00B4D8" strokeWidth="4" opacity="0.8"/> {/* Aura cian */}
    
    {/* Líneas Cinéticas de Movimiento y Fuerza (Vectores) */}
    {/* Brazo superior (Cian) */}
    <path 
      d="M50 36 V22 M50 22 L44 28 M50 22 L56 28" 
      stroke="#00B4D8" 
      strokeWidth="5" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
    
    {/* Arco de rotación y trayectoria discontinua (Esmeralda -> Cian) */}
    <path 
      d="M72 40 A25 25 0 0 1 50 75" 
      stroke="url(#kineticGradient)" 
      strokeWidth="6" 
      strokeLinecap="round"
    />
    <path 
      d="M50 75 A25 25 0 0 1 28 40" 
      stroke="#06D6A0" 
      strokeWidth="6" 
      strokeLinecap="round" 
      strokeDasharray="4 6" /* Línea discontinua: Análisis y rastreo */
    />
  </svg>
);

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [currentView, setCurrentView] = useState('app');
  const [activeModal, setActiveModal] = useState(null);

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentView('app');
  };

  if (!currentUser) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  // RUTAS INTERNAS NAVEGABLES
  if (currentView === 'perfil') return <Perfil user={currentUser} onLogout={handleLogout} onNavigate={setCurrentView} />;
  if (currentView === 'gps') return <Gps onNavigate={setCurrentView} />;
  if (currentView === 'ejercicios') return <Ejercicios onNavigate={setCurrentView} />;

  return (
    <div className="app-container">
      {/* NAVBAR */}
      <nav className="navbar">
        <div className="logo-brand" onClick={() => setCurrentView('app')}>
          <LogoBiometra />
          <span className="brand-name">BIOMETRA</span>
        </div>

        <div className="nav-actions">
          <button onClick={() => setCurrentView('gps')} className="btn-nav-gym">
            📍 Gimnasios / Sedes
          </button>

          <button onClick={() => setCurrentView('perfil')} className="btn-profile">
            👤 Mi Perfil
          </button>
        </div>
      </nav>

      {/* HERO BANNER */}
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
            📍 Gimnasios y Sedes
          </button>
        </div>
      </section>

      {/* SECCIÓN SOBRE NOSOTROS */}
      <section className="about-section">
        <div className="about-card">
          <h2 className="section-title">💡 Sobre Nosotros</h2>
          <p className="about-text">
            En <strong>Biometra</strong> combinamos las ciencias del deporte, la biomecánica clínica y el procesamiento de imagen en tiempo real para brindarle a atletas, entrenadores y entusiastas del fitness un diagnóstico preciso de cada repetición. Nuestra misión es democratizar el entrenamiento biomecánico de élite en todo Chile.
          </p>

          <div className="about-grid">
            <div className="about-item">
              <h4>🎯 Precisión Cinemática</h4>
              <p>Monitoreo continuo de ángulos articulares y rango de movimiento (ROM) mediante visión por computadora avanzada.</p>
            </div>
            <div className="about-item">
              <h4>🛡️ Prevención de Lesiones</h4>
              <p>Detección temprana de compensaciones musculares y desacoples posturales en ejercicios de alta intensidad.</p>
            </div>
            <div className="about-item">
              <h4>🌐 Red de Sedes Oficiales</h4>
              <p>Integración con las principales cadenas de gimnasios del país para un seguimiento continuo dentro y fuera del centro de entrenamiento.</p>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
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
            <p className="footer-link" onClick={() => setCurrentView('ejercicios')}>Entrenamiento y Análisis</p>
            <p className="footer-link" onClick={() => setCurrentView('gps')}>Gimnasios Adheridos</p>
          </div>
          <div>
            <h4 className="footer-col-title blue">Soporte & Legal</h4>
            <p className="footer-link" onClick={() => setActiveModal('soporte')}>Contacto / Soporte</p>
            <p className="footer-link" onClick={() => setActiveModal('terminos')}>Términos del Servicio</p>
          </div>
        </div>
      </footer>

      {/* MODAL CON TÉRMINOS Y CONDICIONES EXTENSOS Y DETALLADOS */}
      {activeModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '680px', maxHeight: '85vh', display: 'flex', flexDirection: 'column' }}>
            <div className="modal-header">
              <h3>
                {activeModal === 'soporte' && '💬 Centro de Soporte'}
                {activeModal === 'terminos' && '📜 Términos y Condiciones Legales de Servicio'}
              </h3>
              <button className="close-btn" onClick={() => setActiveModal(null)}>✕</button>
            </div>

            <div className="modal-body" style={{ overflowY: 'auto', flex: 1, paddingRight: '0.8rem' }}>
              {activeModal === 'soporte' && (
                <div>
                  <p>📧 Email de contacto oficial: <strong>soporte@biometra.cl</strong></p>
                  <p>📞 Atención al usuario: <strong>+56 2 2900 1122</strong></p>
                </div>
              )}

              {activeModal === 'terminos' && (
                <div style={{ fontSize: '0.88rem', lineHeight: '1.65', color: '#CBD5E1' }}>
                  <h4 style={{ color: '#06D6A0', marginTop: '0.5rem', marginBottom: '0.3rem' }}>1. Aceptación Binding de Condiciones de Uso</h4>
                  <p>Al hacer clic en "Aceptar", registrar una cuenta de usuario o hacer uso interactivo de los módulos analíticos de Biometra, usted declara expresamente ser mayor de edad o contar con la patria potestad correspondiente, aceptando en su totalidad este Contrato Marco de Adhesión para el uso de Software como Servicio (SaaS).</p>

                  <h4 style={{ color: '#06D6A0', marginTop: '1rem', marginBottom: '0.3rem' }}>2. Objeto del Software y Deslinde Kinésico/Médico</h4>
                  <p>Biometra constituye una plataforma informática de visión por computadora destinada al cálculo de vectores angulares y estimación postural para la actividad física general. Bajo ningún precepto los resultados numéricos o diagnósticos cinemáticos emitidos reemplazarán una prescripción kinésica, evaluación médica presencial o diagnóstico fisioterapéutico profesional.</p>

                  <h4 style={{ color: '#06D6A0', marginTop: '1rem', marginBottom: '0.3rem' }}>3. Tratamiento de Datos Biométricos y Archivos Audiovisuales</h4>
                  <p>En conformidad con las normativas internacionales de protección de datos personales y la Ley N° 19.628 sobre Protección de la Vida Privada, usted consiente expresamente el procesamiento automatizado de los videos subidos a la plataforma. Dichas grabaciones son segmentadas únicamente en mapas de puntos de articulación (pose estimation), estando encriptadas en tránsito y reposo mediante algoritmos AES-256.</p>

                  <h4 style={{ color: '#06D6A0', marginTop: '1rem', marginBottom: '0.3rem' }}>4. Exención de Responsabilidad por Accidentes o Lesiones Físicas</h4>
                  <p>El usuario reconoce de forma explícita que la realización de levantamientos de pesas, ejercicios gimnásticos y sobrecargas biomecánicas conlleva riesgos inherentes de desgarro, luxación o fracturas. Biometra SpA, sus directores y desarrolladores no asumen responsabilidad civil, penal o extracontractual derivada de la imitación defectuosa o sobreesfuerzo físico realizado durante el uso de la aplicación.</p>

                  <h4 style={{ color: '#06D6A0', marginTop: '1rem', marginBottom: '0.3rem' }}>5. Propiedad Intelectual e Industrial</h4>
                  <p>Queda estrictamente prohibida la ingeniería inversa, descompilación, extracción de modelos de aprendizaje profundo o redistribución no autorizada del código fuente, interfaces visuales, iso-logotipos o algoritmos propios de la plataforma Biometra. Todos los derechos quedan reservados.</p>

                  <h4 style={{ color: '#06D6A0', marginTop: '1rem', marginBottom: '0.3rem' }}>6. Vínculo Entrenador - Cliente</h4>
                  <p>Al vincularse con un perfil con rol de "Entrenador", el cliente otorga permiso expreso para que dicho profesional acceda a su historial de grabaciones, métricas de carga y reportes de riesgo postureo a través del panel centralizado.</p>

                  <h4 style={{ color: '#06D6A0', marginTop: '1rem', marginBottom: '0.3rem' }}>7. Jurisdicción y Legislación Aplicable</h4>
                  <p>El presente acuerdo se rige en su totalidad por las leyes de la República de Chile. Cualquier controversia sobre el cumplimiento o interpretación de este instrumento será sometida a la jurisdicción de los Tribunales Ordinarios de Justicia de Santiago.</p>
                </div>
              )}
            </div>

            <button className="btn-modal-close" onClick={() => setActiveModal(null)} style={{ marginTop: '1rem' }}>
              Entendido / Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}