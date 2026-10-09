import React, { useState } from 'react';
import Login from './login';
import Gps from './Gps'; 
import Ejercicios from './ejercicios';
import { Perfil } from './perfil'; 
import './App.css';

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  
  // Estado para controlar qué página se muestra: 'home', 'gps', 'ejercicios' o 'perfil'
  const [currentView, setCurrentView] = useState('app');

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentView('app');
  };

  // 1. SI NO HAY USUARIO: Muestra la pantalla de Login
  if (!currentUser) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  // 2. VISTA DE PERFIL
  if (currentView === 'perfil') {
    return (
      <Perfil 
        user={currentUser} 
        onLogout={handleLogout} 
        onNavigate={setCurrentView} 
      />
    );
  }

  // 3. SI LA VISTA ES 'gps': Renderiza directamente Gps.jsx (sin botones flotantes externos)
  if (currentView === 'gps') {
    return <Gps onNavigate={setCurrentView} />;
  }

  // 4. SI LA VISTA ES 'ejercicios': Renderiza directamente Ejercicios.jsx
  if (currentView === 'ejercicios') {
    return <Ejercicios onNavigate={setCurrentView} />;
  }

  // 5. VISTA PRINCIPAL DE BIOMETRA (Home)
  return (
    <div className="app-container">
      {/* BARRA DE NAVEGACIÓN SUPERIOR */}
      <nav className="navbar">
        {/* LOGO BIOMETRA (Izquierda) */}
        <div 
          className="logo-brand logo-container"
          onClick={() => setCurrentView('home')}
        >
          <span className="logo-icon">🏋️‍♂️</span>
          <span className="logo-text-gradient">
            <span className="logo-letter">B</span>
            <span className="logo-letter">i</span>
            <span className="logo-letter">o</span>
            <span className="logo-letter">m</span>
            <span className="logo-letter">e</span>
            <span className="logo-letter">t</span>
            <span className="logo-letter">r</span>
            <span className="logo-letter">a</span>
          </span>
        </div>

        {/* MENÚ DE ACCIONES Y PERFIL */}
        <div className="nav-actions">
          <button 
            onClick={() => setCurrentView('ejercicios')}
            className="btn-nav-link">
            Ejercicios
          </button>
          
          <button 
            onClick={() => setCurrentView('gps')}
            className="btn-metrics">
            Métricas Biomecánicas ↗
          </button>

          <button 
            onClick={() => setCurrentView('perfil')}
            className="btn-profile">
            👤 Ver Perfil
          </button>
        </div>
      </nav>

      {/* SECCIÓN HERO PRINCIPAL DE BIOMETRA */}
      <section className="hero-section">
        <div className="hero-badge">
          ⚡ TECNOLOGÍA DE ALTO RENDIMIENTO
        </div>

        <h1 className="hero-title">
          Biometra
        </h1>

        <p className="hero-description">
          La plataforma definitiva de análisis biomecánico en tiempo real. Optimiza tu técnica en el gimnasio, previene lesiones y eleva tu entrenamiento al siguiente nivel.
        </p>

        <div className="hero-buttons">
          <button 
            onClick={() => setCurrentView('gps')}
            className="btn-primary">
            Comenzar Entrenamiento
          </button>
          <button 
            onClick={() => setCurrentView('ejercicios')}
            className="btn-secondary">
            Explorar Ejercicios
          </button>
        </div>
      </section>

      {/* SECCIÓN ANÁLISIS DE MOVIMIENTO */}
      <section id="metricas" className="features-section">
        <h2 className="section-title">
          Análisis Biomecánico de Movimiento
        </h2>

        <div className="cards-grid">
          <div className="card">
            <div className="card-img-wrapper">
              <img 
                src="https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=600&auto=format&fit=crop" 
                alt="Tracking 3D Biometra"
                className="card-img" 
              />
            </div>
            <h3 className="card-title-1">
              Rastreo Articular 3D
            </h3>
            <p className="card-text">
              Detección de puntos cinemáticos en hombros, cadera, rodillas y tobillos para perfeccionar tu postura en cada repetición.
            </p>
          </div>

          <div className="card">
            <div className="card-img-wrapper">
              <img 
                src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=600&auto=format&fit=crop" 
                alt="Medición de Ángulos" 
                className="card-img"
              />
            </div>
            <h3 className="card-title-2">
              Cálculo de Ángulos y ROM
            </h3>
            <p className="card-text">
              Medición automática del rango de movimiento profundo en sentadillas, press de banca y peso muerto.
            </p>
          </div>

          <div className="card">
            <div className="card-img-wrapper">
              <img 
                src="https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=600&auto=format&fit=crop" 
                alt="Prevención de Lesiones" 
                className="card-img"
              />
            </div>
            <h3 className="card-title-3">
              Prevención de Lesiones
            </h3>
            <p className="card-text">
              Alertas biomecánicas instantáneas si la espalda se curva o las rodillas colapsan hacia adentro.
            </p>
          </div>
        </div>
      </section>

      {/* SECCIÓN UBICACIÓN CON PRECISIÓN */}
      <section className="location-section">
        <h2 className="section-title">
          Gimnasios y Centros Oficiales
        </h2>

        <div className="location-grid">
          <div className="location-info">
            <div>
              <h3 className="info-title-green">
                Red de Gimnasios Adheridos
              </h3>
              <p className="info-text">
                Encuentra las instalaciones deportivas y centros de alto rendimiento equipados con cámaras Biometra.
              </p>
            </div>

            <div>
              <h3 className="info-title-blue">
                Sincronización Multidispositivo
              </h3>
              <p className="info-text">
                Revisa tus métricas, gráficos de rendimiento y videos desde tu teléfono o computadora.
              </p>
            </div>

            <div style={{ marginTop: '1rem' }}>
              <button 
                onClick={() => setCurrentView('gps')}
                className="btn-map">
                Ver Mapa de Centros
              </button>
            </div>
          </div>

          <div className="map-container">
            <iframe
              title="Ubicaciones Biometra"
              src="https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d13313.342123512992!2d-70.58!3d-33.45!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1ses!2scl!4v1600000000000!5m2!1ses!2scl"
              width="100%"
              height="380"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
            />
          </div>
        </div>
      </section>

      {/* PIE DE PÁGINA */}
      <footer className="footer">
        <div>
          <h3 className="footer-brand">
            🏋️‍♂️ Biometra
          </h3>
          <p className="footer-desc">
            Tecnología y ciencia aplicada al entrenamiento físico.
          </p>
        </div>

        <div className="footer-links">
          <div>
            <h4 className="footer-col-title-green">Plataforma</h4>
            <p className="footer-link-text">Análisis Biomecánico</p>
            <p className="footer-link-text">Métricas en Vivo</p>
          </div>
          <div>
            <h4 className="footer-col-title-blue">Soporte</h4>
            <p className="footer-link-text">Contacto</p>
            <p className="footer-link-text">Privacidad</p>
          </div>
        </div>
      </footer>
    </div>
  );
}