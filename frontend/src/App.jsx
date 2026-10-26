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
          {/* BOTÓN DESTACADO GIMNASIOS / SEDES */}
          <button onClick={() => setCurrentView('gps')} className="btn-nav-gym">
            📍 Gimnasios / Sedes
          </button>

          {/* SÓLO PERFIL DE USUARIO */}
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
          {/* BOTÓN PRINCIPAL */}
          <button onClick={() => setCurrentView('ejercicios')} className="btn-primary">
            🚀 Comenzar Entrenamiento
          </button>

          {/* BOTÓN SECUNDARIO QUE LLEVA A GIMNASIOS Y SEDES */}
          <button onClick={() => setCurrentView('gps')} className="btn-secondary">
            📍 Gimnasios y Sedes
          </button>
        </div>
      </section>

      {/* SECCIÓN SOBRE NOSOTROS EXTENDIDA */}
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

      {activeModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>
                {activeModal === 'soporte' && '💬 Centro de Soporte'}
                {activeModal === 'terminos' && '📜 Términos del Servicio'}
              </h3>
              <button className="close-btn" onClick={() => setActiveModal(null)}>✕</button>
            </div>

            <div className="modal-body">
              {activeModal === 'soporte' && <p>Contacto oficial: <strong>soporte@biometra.cl</strong></p>}
              {activeModal === 'terminos' && <p>El uso del sistema biomecánico es asistencial y no sustituye la supervisión médica o kinesiológica.</p>}
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