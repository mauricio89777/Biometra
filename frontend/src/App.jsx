import React, { useState } from 'react';
import Login from './Login';
import Gps from './Gps'; 
import Ejercicios from './ejercicios';

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLogoHovered, setIsLogoHovered] = useState(false);
  
  // Estado para controlar qué página se muestra: 'home', 'gps' o 'ejercicios'
  const [currentView, setCurrentView] = useState('app');

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  // 1. SI NO HAY USUARIO: Muestra la pantalla de Login
  if (!currentUser) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  // 2. SI LA VISTA ES 'gps': Renderiza la página Gps.jsx
  if (currentView === 'gps') {
    return (
      <div>
        {/* Botón flotante para regresar a la página principal */}
        <button 
          onClick={() => setCurrentView('home')}
          style={{
            position: 'fixed',
            top: '15px',
            left: '15px',
            zIndex: 9999,
            backgroundColor: '#000000',
            color: '#FFFFFF',
            border: 'none',
            padding: '0.6rem 1.2rem',
            borderRadius: '6px',
            fontWeight: '700',
            cursor: 'pointer',
            boxShadow: '0 4px 10px rgba(0,0,0,0.3)'
          }}>
          ← Volver a Biometra
        </button>
        <Gps onNavigate={setCurrentView} />
      </div>
    );
  }

  // 3. SI LA VISTA ES 'ejercicios': Renderiza la página Ejercicios.jsx
  if (currentView === 'ejercicios') {
    return (
      <div>
        {/* Botón flotante para regresar a la página principal */}
        <button 
          onClick={() => setCurrentView('home')}
          style={{
            position: 'fixed',
            top: '15px',
            left: '15px',
            zIndex: 9999,
            backgroundColor: '#000000',
            color: '#FFFFFF',
            border: 'none',
            padding: '0.6rem 1.2rem',
            borderRadius: '6px',
            fontWeight: '700',
            cursor: 'pointer',
            boxShadow: '0 4px 10px rgba(0,0,0,0.3)'
          }}>
          ← Volver a Biometra
        </button>
        <Ejercicios onNavigate={setCurrentView} />
      </div>
    );
  }

  // Estilos CSS para animaciones del logo
  const logoStyle = {
    fontWeight: '900',
    fontSize: '1.8rem',
    letterSpacing: '-0.5px',
    color: isLogoHovered ? '#00FF87' : '#FFFFFF',
    display: 'flex',
    alignItems: 'center',
    gap: '0.6rem',
    cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    transform: isLogoHovered ? 'scale(1.08) translateY(-2px)' : 'scale(1)',
    textShadow: isLogoHovered ? '0 0 15px rgba(0, 255, 135, 0.6)' : 'none'
  };

  // 4. VISTA PRINCIPAL DE BIOMETRA (Home)
  return (
    <div style={{
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      backgroundColor: '#0F172A',
      color: '#F8FAFC',
      minHeight: '100vh',
      margin: 0,
      padding: 0
    }}>
      {/* BARRA DE NAVEGACIÓN SUPERIOR CORREGIDA */}
      <nav style={{
        backgroundColor: '#1E293B',
        padding: '1rem 3rem',
        display: 'flex',
        justifyContent: 'space-between', // Corregido 'justify' por 'justifyContent'
        alignItems: 'center',
        borderBottom: '1px solid #334155',
        boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        width: '100%',
        boxSizing: 'border-box'
      }}>
        {/* LOGO BIOMETRA (Izquierda) */}
        <div 
          style={logoStyle}
          onClick={() => setCurrentView('home')}
          onMouseEnter={() => setIsLogoHovered(true)}
          onMouseLeave={() => setIsLogoHovered(false)}
        >
          <span style={{ 
            fontSize: '1.6rem',
            transform: isLogoHovered ? 'rotate(-10deg) scale(1.15)' : 'rotate(0deg)',
            transition: 'transform 0.3s ease'
          }}>
            🏋️‍♂️
          </span>
          <span style={{
            background: isLogoHovered 
              ? 'linear-gradient(90deg, #00FF87 0%, #60A5FA 100%)' 
              : 'linear-gradient(90deg, #FFFFFF 0%, #E2E8F0 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Biometra
          </span>
        </div>

        {/* MENÚ DE ACCIONES Y PERFIL (Derecha con espacio holgado) */}
        <div style={{ display: 'flex', gap: '1.8rem', alignItems: 'center' }}>
          
          <a href="#metricas" style={{ textDecoration: 'none', color: '#CBD5E1', fontWeight: '600', fontSize: '0.95rem' }}>
            Sobre Nosotros
          </a>
          
          {/* BOTÓN O ENLACE A EJERCICIOS */}
          <button 
            onClick={() => setCurrentView('ejercicios')}
            style={{ 
              background: 'none', 
              border: 'none', 
              color: '#CBD5E1', 
              fontWeight: '600', 
              fontSize: '0.95rem', 
              cursor: 'pointer',
              padding: '0.4rem 0.6rem'
            }}>
            Ejercicios
          </button>
          
          {/* BOTÓN MÉTRICAS BIOMECÁNICAS DIRIGE A GPS */}
          <button 
            onClick={() => setCurrentView('gps')}
            style={{ 
              backgroundColor: '#00FF87',
              color: '#0F172A',
              border: 'none',
              padding: '0.6rem 1.2rem',
              borderRadius: '8px',
              fontWeight: '700', 
              fontSize: '0.95rem', 
              cursor: 'pointer',
              boxShadow: '0 0 10px rgba(0, 255, 135, 0.3)'
            }}>
            Métricas Biomecánicas ↗
          </button>

          {/* PERFIL Y SALIR */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.8rem',
            backgroundColor: '#0F172A',
            padding: '0.4rem 0.9rem',
            borderRadius: '30px',
            border: '1px solid #334155',
            marginLeft: '0.5rem'
          }}>
            <span style={{ fontWeight: '700', fontSize: '0.85rem', color: '#00FF87' }}>
              👤 {currentUser.name} <span style={{ color: '#94A3B8', fontWeight: '400' }}>({currentUser.role === 'gimnasio' ? 'Gimnasio' : 'Atleta'})</span>
            </span>
            <button 
              onClick={handleLogout}
              style={{
                backgroundColor: '#EF4444',
                color: '#FFFFFF',
                border: 'none',
                padding: '0.45rem 1rem',
                borderRadius: '20px',
                fontWeight: '700',
                fontSize: '0.8rem',
                cursor: 'pointer'
              }}>
              Cerrar Sesión
            </button>
          </div>
        </div>
      </nav>

      {/* SECCIÓN HERO PRINCIPAL DE BIOMETRA */}
      <section style={{ 
        padding: '7rem 4rem 5rem 4rem', 
        maxWidth: '1200px',
        background: 'radial-gradient(circle at top left, rgba(0,255,135,0.08) 0%, rgba(15,23,42,1) 60%)'
      }}>
        <div style={{
          display: 'inline-block',
          backgroundColor: 'rgba(0,255,135,0.1)',
          color: '#00FF87',
          padding: '0.4rem 1rem',
          borderRadius: '20px',
          fontSize: '0.85rem',
          fontWeight: '700',
          marginBottom: '1.5rem',
          border: '1px solid rgba(0,255,135,0.3)'
        }}>
          ⚡ TECNOLOGÍA DE ALTO RENDIMIENTO
        </div>

        <h1 style={{ 
          fontSize: '4.5rem', 
          fontWeight: '900', 
          margin: '0 0 1.2rem 0', 
          letterSpacing: '-1.5px',
          lineHeight: '1.1',
          background: 'linear-gradient(135deg, #FFFFFF 0%, #94A3B8 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          Biometra
        </h1>

        <p style={{ 
          fontSize: '1.3rem', 
          color: '#94A3B8', 
          marginBottom: '2.5rem', 
          maxWidth: '650px', 
          lineHeight: '1.6',
          fontWeight: '400'
        }}>
          La plataforma definitiva de análisis biomecánico en tiempo real. Optimiza tu técnica en el gimnasio, previene lesiones y eleva tu entrenamiento al siguiente nivel.
        </p>

        <div style={{ display: 'flex', gap: '1.2rem' }}>
          <button 
            onClick={() => setCurrentView('gps')}
            style={{
              backgroundColor: '#00FF87',
              color: '#0F172A',
              border: 'none',
              padding: '1rem 2.2rem',
              borderRadius: '10px',
              fontWeight: '800',
              fontSize: '1rem',
              cursor: 'pointer',
              boxShadow: '0 4px 20px rgba(0, 255, 135, 0.4)'
            }}>
            Comenzar Entrenamiento
          </button>
          <button 
            onClick={() => setCurrentView('ejercicios')}
            style={{
              backgroundColor: 'transparent',
              color: '#F8FAFC',
              border: '1px solid #334155',
              padding: '1rem 2.2rem',
              borderRadius: '10px',
              fontWeight: '700',
              fontSize: '1rem',
              cursor: 'pointer'
            }}>
            Explorar Ejercicios
          </button>
        </div>
      </section>

      {/* SECCIÓN ANÁLISIS DE MOVIMIENTO */}
      <section id="metricas" style={{ padding: '2rem 4rem 5rem 4rem' }}>
        <h2 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '2.5rem', color: '#FFFFFF' }}>
          Análisis Biomecánico de Movimiento
        </h2>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '2rem'
        }}>
          {/* TARJETA 1 */}
          <div style={{ 
            backgroundColor: '#1E293B', 
            padding: '1.5rem', 
            borderRadius: '16px',
            border: '1px solid #334155',
            boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
          }}>
            <div style={{ borderRadius: '10px', overflow: 'hidden', height: '200px', marginBottom: '1.2rem' }}>
              <img 
                src="https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=600&auto=format&fit=crop" 
                alt="Tracking 3D Biometra"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
              />
            </div>
            <h3 style={{ fontSize: '1.3rem', margin: '0 0 0.5rem 0', fontWeight: '800', color: '#00FF87' }}>
              Rastreo Articular 3D
            </h3>
            <p style={{ color: '#94A3B8', margin: 0, fontSize: '0.95rem', lineHeight: '1.5' }}>
              Detección de puntos cinemáticos en hombros, cadera, rodillas y tobillos para perfeccionar tu postura en cada repetición.
            </p>
          </div>

          {/* TARJETA 2 */}
          <div style={{ 
            backgroundColor: '#1E293B', 
            padding: '1.5rem', 
            borderRadius: '16px',
            border: '1px solid #334155',
            boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
          }}>
            <div style={{ borderRadius: '10px', overflow: 'hidden', height: '200px', marginBottom: '1.2rem' }}>
              <img 
                src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=600&auto=format&fit=crop" 
                alt="Medición de Ángulos" 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
            <h3 style={{ fontSize: '1.3rem', margin: '0 0 0.5rem 0', fontWeight: '800', color: '#38BDF8' }}>
              Cálculo de Ángulos y ROM
            </h3>
            <p style={{ color: '#94A3B8', margin: 0, fontSize: '0.95rem', lineHeight: '1.5' }}>
              Medición automática del rango de movimiento profundo en sentadillas, press de banca y peso muerto.
            </p>
          </div>

          {/* TARJETA 3 */}
          <div style={{ 
            backgroundColor: '#1E293B', 
            padding: '1.5rem', 
            borderRadius: '16px',
            border: '1px solid #334155',
            boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
          }}>
            <div style={{ borderRadius: '10px', overflow: 'hidden', height: '200px', marginBottom: '1.2rem' }}>
              <img 
                src="https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=600&auto=format&fit=crop" 
                alt="Prevención de Lesiones" 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
            <h3 style={{ fontSize: '1.3rem', margin: '0 0 0.5rem 0', fontWeight: '800', color: '#F43F5E' }}>
              Prevención de Lesiones
            </h3>
            <p style={{ color: '#94A3B8', margin: 0, fontSize: '0.95rem', lineHeight: '1.5' }}>
              Alertas biomecánicas instantáneas si la espalda se curva o las rodillas colapsan hacia adentro.
            </p>
          </div>
        </div>
      </section>

      {/* SECCIÓN UBICACIÓN CON PRECISIÓN */}
      <section style={{ padding: '2rem 4rem 6rem 4rem', backgroundColor: '#090D16' }}>
        <h2 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '3rem', color: '#FFFFFF' }}>
          Gimnasios y Centros Oficiales
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '4rem', alignItems: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div>
              <h3 style={{ fontSize: '1.25rem', margin: '0 0 0.5rem 0', fontWeight: '800', color: '#00FF87' }}>
                Red de Gimnasios Adheridos
              </h3>
              <p style={{ color: '#94A3B8', margin: 0, fontSize: '1rem', lineHeight: '1.6' }}>
                Encuentra las instalaciones deportivas y centros de alto rendimiento equipados con cámaras Biometra.
              </p>
            </div>

            <div>
              <h3 style={{ fontSize: '1.25rem', margin: '0 0 0.5rem 0', fontWeight: '800', color: '#38BDF8' }}>
                Sincronización Multidispositivo
              </h3>
              <p style={{ color: '#94A3B8', margin: 0, fontSize: '1rem', lineHeight: '1.6' }}>
                Revisa tus métricas, gráficos de rendimiento y videos desde tu teléfono o computadora.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <button 
                onClick={() => setCurrentView('gps')}
                style={{
                  backgroundColor: '#38BDF8',
                  color: '#0F172A',
                  border: 'none',
                  padding: '0.9rem 1.8rem',
                  borderRadius: '8px',
                  fontWeight: '800',
                  fontSize: '0.95rem',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(56, 189, 248, 0.3)',
                  transition: 'transform 0.2s ease'
                }}>
                Ver Mapa de Centros
              </button>
            </div>
          </div>

          <div style={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid #334155', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
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
      <footer style={{
        backgroundColor: '#1E293B',
        padding: '3rem 4rem',
        display: 'flex',
        justifyContent: 'space-between',
        borderTop: '1px solid #334155'
      }}>
        <div>
          <h3 style={{ margin: '0 0 0.8rem 0', fontSize: '1.3rem', fontWeight: '900', color: '#FFFFFF' }}>
            🏋️‍♂️ Biometra
          </h3>
          <p style={{ margin: '0 0 1rem 0', fontSize: '0.85rem', color: '#94A3B8' }}>
            Tecnología y ciencia aplicada al entrenamiento físico.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '4rem' }}>
          <div>
            <h4 style={{ margin: '0 0 0.8rem 0', fontSize: '0.95rem', fontWeight: '800', color: '#00FF87' }}>Plataforma</h4>
            <p style={{ margin: '0.4rem 0', fontSize: '0.85rem', color: '#94A3B8' }}>Análisis Biomecánico</p>
            <p style={{ margin: '0.4rem 0', fontSize: '0.85rem', color: '#94A3B8' }}>Métricas en Vivo</p>
          </div>
          <div>
            <h4 style={{ margin: '0 0 0.8rem 0', fontSize: '0.95rem', fontWeight: '800', color: '#38BDF8' }}>Soporte</h4>
            <p style={{ margin: '0.4rem 0', fontSize: '0.85rem', color: '#94A3B8' }}>Contacto</p>
            <p style={{ margin: '0.4rem 0', fontSize: '0.85rem', color: '#94A3B8' }}>Privacidad</p>
          </div>
        </div>
      </footer>
    </div>
  );
}