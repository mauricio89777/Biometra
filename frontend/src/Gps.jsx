import React, { useState } from 'react';
import Ejercicios from './ejercicios';



 
// Nuevo icono biomecánico/tecnológico estilizado para el logo
const BiometraLogoIcon = () => (
  <svg 
    width="34" 
    height="34" 
    viewBox="0 0 100 100" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg" 
    style={{ verticalAlign: 'middle', marginRight: '8px' }}
  >
    <rect width="100" height="100" rx="20" fill="#020617" />
    <path d="M20 50 Q35 20, 50 50 T80 50" stroke="#00FF87" strokeWidth="6" strokeLinecap="round" fill="none" />
    <path d="M20 50 Q35 80, 50 50 T80 50" stroke="#38bdf8" strokeWidth="6" strokeLinecap="round" fill="none" />
    <circle cx="50" cy="50" r="10" fill="#00FF87" />
    <circle cx="50" cy="50" r="4" fill="#020617" />
    <circle cx="20" cy="50" r="5" fill="#38bdf8" />
    <circle cx="80" cy="50" r="5" fill="#00FF87" />
  </svg>
);

export default function Gps() {
  const [selectedGym, setSelectedGym] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [distanceRange, setDistanceRange] = useState('todos');
  const [showWorkModal, setShowWorkModal] = useState(false);

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };
  

  const gimnasios = [
    {
      id: 0,
      nombre: 'SmartFit Providencia',
      direccion: 'Av. Pedro de Valdivia 123, Providencia, Santiago',
      distanciaTipo: 'corto',
      distanciaKm: '1.2 km',
      contacto: '+56 9 4685 7788',
      redes: '@smartfit_cl',
      web: 'www.smartfit.cl',
      mapUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3329.8!2d-70.61!3d-33.42!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x9662cf6311111111%3A0x1111111111111111!2sProvidencia%2C%20Regi%C3%B3n%20Metropolitana!5e0!3m2!1ses!2scl!4v1600000000000!5m2!1ses!2scl'
    },
    {
      id: 1,
      nombre: 'Sportlife Las Condes',
      direccion: 'Av. Apoquindo 4500, Las Condes, Santiago',
      distanciaTipo: 'medio',
      distanciaKm: '5.8 km',
      contacto: '+56 9 4685 7788',
      redes: '@sportlife_lascondes',
      web: 'www.sportlife.cl',
      mapUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3328.5!2d-70.56!3d-33.40!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x9662c96766666666%3A0x2222222222222222!2sLas%20Condes%2C%20Regi%C3%B3n%20Metropolitana!5e0!3m2!1ses!2scl!4v1600000000000!5m2!1ses!2scl'
    },
    {
      id: 2,
      nombre: 'Energy Fitness Santiago Centro',
      direccion: 'Moneda 920, Santiago Centro',
      distanciaTipo: 'corto',
      distanciaKm: '2.5 km',
      contacto: '+56 9 4685 7788',
      redes: '@energyfitness_stgo',
      web: 'www.energy.cl',
      mapUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3329.2!2d-70.65!3d-33.44!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x9662c5a111111111%3A0x3333333333333333!2sSantiago%2C%20Regi%C3%B3n%20Metropolitana!5e0!3m2!1ses!2scl!4v1600000000000!5m2!1ses!2scl'
    },
    {
      id: 3,
      nombre: 'KineCentre Ñuñoa',
      direccion: 'Av. Irarrázaval 2400, Ñuñoa, Santiago',
      distanciaTipo: 'medio',
      distanciaKm: '4.1 km',
      contacto: '+56 9 4685 7788',
      redes: '@kinecentre_nunoa',
      web: 'www.kinecentre.cl',
      mapUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3329.9!2d-70.60!3d-33.45!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x9662cf0000000000%3A0x4444444444444444!2s%C3%91u%C3%B1oa%2C%20Regi%C3%B3n%20Metropolitana!5e0!3m2!1ses!2scl!4v1600000000000!5m2!1ses!2scl'
    },
    {
      id: 4,
      nombre: 'Pacific Fitness Maipú',
      direccion: 'Av. Pajaritos 3100, Maipú, Santiago',
      distanciaTipo: 'largo',
      distanciaKm: '14.5 km',
      contacto: '+56 9 4685 7788',
      redes: '@pacific_maipu',
      web: 'www.pacificfitness.cl',
      mapUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3327.1!2d-70.75!3d-33.51!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x9662c33333333333%3A0x5555555555555555!2sMaip%C3%BA%2C%20Regi%C3%B3n%20Metropolitana!5e0!3m2!1ses!2scl!4v1600000000000!5m2!1ses!2scl'
    }
  ];

  const gimnasiosFiltrados = gimnasios.filter(g => {
    const cumpleTexto = g.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         g.direccion.toLowerCase().includes(searchTerm.toLowerCase());
    const cumpleRango = distanceRange === 'todos' || g.distanciaTipo === distanceRange;
    return cumpleTexto && cumpleRango;
  });

  return (
    <div style={{
      fontFamily: "'Inter', system-ui, sans-serif",
      backgroundColor: '#090d16',
      color: '#f8fafc',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between'
    }}>
      
      {/* NAVBAR UNIFICADA */}
      <header style={{ backgroundColor: '#0f172a', borderBottom: '1px solid #1e293b', padding: '1rem 2rem' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button style={{
              backgroundColor: '#000000',
              color: '#FFFFFF',
              border: '1px solid #334155',
              padding: '0.55rem 1.2rem',
              borderRadius: '8px',
              fontWeight: '700',
              fontSize: '0.9rem',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              ← Volver a Biometra
            </button>

            <div style={{ display: 'flex', alignItems: 'center', marginLeft: '0.5rem' }}>
              <BiometraLogoIcon />
              <span style={{ fontSize: '1.4rem', fontWeight: '900', color: '#FFFFFF', letterSpacing: '-0.5px' }}>
                BIOMETRA
              </span>
            </div>
          </div>

          <nav style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
            <button 
              onClick={() => scrollToSection('sobre-nosotros')}
              style={{ background: 'none', border: 'none', color: '#cbd5e1', fontSize: '0.95rem', cursor: 'pointer', padding: 0 }}
            >
              Sobre Nosotros
            </button>
            <span style={{ color: '#cbd5e1', fontSize: '0.95rem', cursor: 'default' }}>Ejercicios</span>
            <a href="#metricas" style={{
              backgroundColor: '#00FF87',
              color: '#020617',
              padding: '0.55rem 1.2rem',
              borderRadius: '8px',
              fontWeight: '800',
              textDecoration: 'none',
              fontSize: '0.9rem'
            }}>
              Métricas Biomecánicas ↗
            </a>
          </nav>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', backgroundColor: '#1e293b', padding: '0.4rem 0.6rem 0.4rem 1rem', borderRadius: '30px', border: '1px solid #334155' }}>
            <span style={{ fontSize: '0.9rem', color: '#f8fafc', fontWeight: '600' }}>👤 er (Atleta)</span>
            <button style={{
              backgroundColor: '#ef4444',
              color: '#ffffff',
              border: 'none',
              padding: '0.4rem 0.9rem',
              borderRadius: '20px',
              fontWeight: '700',
              fontSize: '0.8rem',
              cursor: 'pointer'
            }}>
              Cerrar Sesión
            </button>
          </div>

        </div>
      </header>

      {/* CONTENIDO PRINCIPAL */}
      <main style={{ padding: '3rem 2rem', maxWidth: '1280px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
        
        {/* 1. PASO A PASO DEL FUNCIONAMIENTO (AHORA ARRIBA) */}
        <div style={{ backgroundColor: '#0f172a', padding: '2rem', borderRadius: '16px', border: '1px solid #1e293b', marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.5rem', color: '#00FF87', marginTop: 0, marginBottom: '1.2rem', fontWeight: '800' }}>
            ⚙️ Paso a Paso: ¿Cómo funciona este mapa de detección?
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '1rem' }}>
            
            <div style={{ backgroundColor: '#020617', padding: '1.2rem', borderRadius: '12px', border: '1px solid #1e293b' }}>
              <div style={{ color: '#00FF87', fontWeight: '900', fontSize: '1.1rem', marginBottom: '0.4rem' }}>PASO 1</div>
              <h3 style={{ fontSize: '0.95rem', color: '#FFFFFF', margin: '0 0 0.5rem 0' }}>Ubicación GPS</h3>
              <p style={{ color: '#94a3b8', fontSize: '0.85rem', lineHeight: '1.5', margin: 0 }}>
                La aplicación consulta la ubicación de tu dispositivo para calcular la distancia exacta hasta cada gimnasio.
              </p>
            </div>

            <div style={{ backgroundColor: '#020617', padding: '1.2rem', borderRadius: '12px', border: '1px solid #1e293b' }}>
              <div style={{ color: '#38bdf8', fontWeight: '900', fontSize: '1.1rem', marginBottom: '0.4rem' }}>PASO 2</div>
              <h3 style={{ fontSize: '0.95rem', color: '#FFFFFF', margin: '0 0 0.5rem 0' }}>Selecciona Rango</h3>
              <p style={{ color: '#94a3b8', fontSize: '0.85rem', lineHeight: '1.5', margin: 0 }}>
                Filtra por sedes cercanas (&lt;3km), rango medio o distantes para elegir según tu conveniencia.
              </p>
            </div>

            <div style={{ backgroundColor: '#020617', padding: '1.2rem', borderRadius: '12px', border: '1px solid #1e293b' }}>
              <div style={{ color: '#f43f5e', fontWeight: '900', fontSize: '1.1rem', marginBottom: '0.4rem' }}>PASO 3</div>
              <h3 style={{ fontSize: '0.95rem', color: '#FFFFFF', margin: '0 0 0.5rem 0' }}>Enfoque en Mapa</h3>
              <p style={{ color: '#94a3b8', fontSize: '0.85rem', lineHeight: '1.5', margin: 0 }}>
                Al hacer clic en una sede del panel, el mapa interactivo se centra de inmediato en la dirección elegida.
              </p>
            </div>

            <div style={{ backgroundColor: '#020617', padding: '1.2rem', borderRadius: '12px', border: '1px solid #1e293b' }}>
              <div style={{ color: '#00FF87', fontWeight: '900', fontSize: '1.1rem', marginBottom: '0.4rem' }}>PASO 4</div>
              <h3 style={{ fontSize: '0.95rem', color: '#FFFFFF', margin: '0 0 0.5rem 0' }}>Contacto Directo</h3>
              <p style={{ color: '#94a3b8', fontSize: '0.85rem', lineHeight: '1.5', margin: 0 }}>
                Llama o escribe directamente al número y redes de la sede para reservar o consultar por la plataforma.
              </p>
            </div>

            <div style={{ backgroundColor: '#020617', padding: '1.2rem', borderRadius: '12px', border: '1px solid #1e293b' }}>
              <div style={{ color: '#38bdf8', fontWeight: '900', fontSize: '1.1rem', marginBottom: '0.4rem' }}>PASO 5</div>
              <h3 style={{ fontSize: '0.95rem', color: '#FFFFFF', margin: '0 0 0.5rem 0' }}>Conexión AI</h3>
              <p style={{ color: '#94a3b8', fontSize: '0.85rem', lineHeight: '1.5', margin: 0 }}>
                Al ingresar al gimnasio, tu cuenta se vincula automáticamente con las cámaras Biometra instaladas en el recinto.
              </p>
            </div>

          </div>
        </div>

        {/* 2. TÍTULO SECCIÓN MAPA */}
        <div style={{ marginBottom: '1.5rem' }}>
          <h1 style={{ fontSize: '2.2rem', color: '#FFFFFF', margin: 0, fontWeight: '900' }}>
            📍 Mapa e Instalaciones de Gimnasios
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '1rem', marginTop: '0.4rem' }}>
            Ubica los gimnasios con tecnología Biometra cerca de ti y contáctate directamente con sus sedes.
          </p>
        </div>

        {/* FILTROS POR DISTANCIA */}
        <div style={{ marginBottom: '1.5rem', backgroundColor: '#0f172a', padding: '1rem', borderRadius: '12px', border: '1px solid #1e293b' }}>
          <span style={{ fontSize: '0.9rem', color: '#cbd5e1', fontWeight: 'bold', marginRight: '1rem', display: 'inline-block', marginBottom: '0.5rem' }}>
            🎯 Filtrar por tu ubicación:
          </span>
          <div style={{ display: 'inline-flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => setDistanceRange('todos')}
              style={{
                padding: '0.55rem 1.1rem',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: distanceRange === 'todos' ? '#00FF87' : '#1e293b',
                color: distanceRange === 'todos' ? '#0f172a' : '#94a3b8',
                fontWeight: '700',
                fontSize: '0.85rem',
                cursor: 'pointer'
              }}>
              🌐 Todos
            </button>
            <button
              onClick={() => setDistanceRange('corto')}
              style={{
                padding: '0.55rem 1.1rem',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: distanceRange === 'corto' ? '#00FF87' : '#1e293b',
                color: distanceRange === 'corto' ? '#0f172a' : '#94a3b8',
                fontWeight: '700',
                fontSize: '0.85rem',
                cursor: 'pointer'
              }}>
              🟢 Cerca de tu posición (&lt; 3 km)
            </button>
            <button
              onClick={() => setDistanceRange('medio')}
              style={{
                padding: '0.55rem 1.1rem',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: distanceRange === 'medio' ? '#38bdf8' : '#1e293b',
                color: distanceRange === 'medio' ? '#0f172a' : '#94a3b8',
                fontWeight: '700',
                fontSize: '0.85rem',
                cursor: 'pointer'
              }}>
              🟡 Mediano Rango (3 - 10 km)
            </button>
            <button
              onClick={() => setDistanceRange('largo')}
              style={{
                padding: '0.55rem 1.1rem',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: distanceRange === 'largo' ? '#f43f5e' : '#1e293b',
                color: distanceRange === 'largo' ? '#ffffff' : '#94a3b8',
                fontWeight: '700',
                fontSize: '0.85rem',
                cursor: 'pointer'
              }}>
              🔴 Lejos de tu posición (&gt; 10 km)
            </button>
          </div>
        </div>

        {/* MAPA Y PANEL */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '2rem', alignItems: 'start', marginBottom: '2rem' }}>
          
          <div style={{ borderRadius: '14px', overflow: 'hidden', border: '1px solid #1e293b', boxShadow: '0 10px 30px rgba(0,0,0,0.4)', height: '580px' }}>
            <iframe
              title="Mapa de Gimnasios"
              src={gimnasios[selectedGym]?.mapUrl || gimnasios[0].mapUrl}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
            />
          </div>

          <div style={{ backgroundColor: '#0f172a', padding: '1.2rem', borderRadius: '14px', border: '1px solid #1e293b' }}>
            <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem', color: '#38bdf8' }}>Sedes Encontradas</h3>
            
            <input 
              type="text" 
              placeholder="🔍 Buscar gimnasio o dirección..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '8px',
                border: '1px solid #334155',
                backgroundColor: '#020617',
                color: '#fff',
                marginBottom: '1rem',
                boxSizing: 'border-box'
              }}
            />

            <div style={{ maxHeight: '450px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.8rem', paddingRight: '4px' }}>
              {gimnasiosFiltrados.length === 0 ? (
                <p style={{ color: '#94a3b8', fontSize: '0.9rem', textAlign: 'center', padding: '1rem' }}>
                  No se encontraron gimnasios en esta categoría.
                </p>
              ) : (
                gimnasiosFiltrados.map((gym) => (
                  <div 
                    key={gym.id}
                    onClick={() => setSelectedGym(gym.id)}
                    style={{
                      backgroundColor: selectedGym === gym.id ? '#020617' : '#1e293b',
                      borderLeft: selectedGym === gym.id ? '4px solid #00FF87' : '4px solid transparent',
                      padding: '1rem',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: '800', fontSize: '0.95rem', color: '#FFFFFF' }}>{gym.nombre}</span>
                      <span style={{ 
                        fontSize: '0.75rem', 
                        padding: '0.2rem 0.5rem', 
                        borderRadius: '12px', 
                        backgroundColor: gym.distanciaTipo === 'corto' ? 'rgba(0,255,135,0.2)' : gym.distanciaTipo === 'medio' ? 'rgba(56,189,248,0.2)' : 'rgba(244,63,94,0.2)',
                        color: gym.distanciaTipo === 'corto' ? '#00FF87' : gym.distanciaTipo === 'medio' ? '#38bdf8' : '#f43f5e',
                        fontWeight: 'bold'
                      }}>
                        {gym.distanciaKm}
                      </span>
                    </div>

                    <div style={{ color: '#94a3b8', fontSize: '0.82rem', marginTop: '0.4rem', lineHeight: '1.4' }}>
                      📍 <strong>Dirección:</strong> {gym.direccion}
                    </div>

                    <div style={{ color: '#00FF87', fontSize: '0.82rem', marginTop: '0.4rem' }}>
                      📞 <strong>Contacto:</strong> {gym.contacto}
                    </div>

                    <div style={{ color: '#38bdf8', fontSize: '0.82rem', marginTop: '0.2rem', display: 'flex', gap: '0.8rem' }}>
                      <span>📲 {gym.redes}</span>
                      <span>🌐 {gym.web}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </main>

      {/* MODAL TRABAJA CON NOSOTROS */}
      {showWorkModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.8)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          padding: '1rem'
        }}>
          <div style={{ backgroundColor: '#0f172a', padding: '2rem', borderRadius: '16px', maxWidth: '500px', width: '100%', border: '1px solid #334155' }}>
            <h3 style={{ marginTop: 0, color: '#00FF87', fontSize: '1.4rem' }}>💼 Trabaja con Nosotros</h3>
            <p style={{ color: '#cbd5e1', fontSize: '0.9rem' }}>
              Buscamos entrenadores, desarrolladores e ingenieros biomecánicos para sumarse al equipo Biometra.
            </p>
            <input type="text" placeholder="Tu Nombre Completo" style={{ width: '100%', padding: '0.75rem', marginBottom: '0.8rem', borderRadius: '8px', border: '1px solid #334155', backgroundColor: '#020617', color: '#fff', boxSizing: 'border-box' }} />
            <input type="email" placeholder="Correo Electrónico" style={{ width: '100%', padding: '0.75rem', marginBottom: '0.8rem', borderRadius: '8px', border: '1px solid #334155', backgroundColor: '#020617', color: '#fff', boxSizing: 'border-box' }} />
            <textarea placeholder="Cuéntanos sobre tu experiencia..." rows={3} style={{ width: '100%', padding: '0.75rem', marginBottom: '1rem', borderRadius: '8px', border: '1px solid #334155', backgroundColor: '#020617', color: '#fff', boxSizing: 'border-box' }}></textarea>
            
            <div style={{ display: 'flex', gap: '0.8rem', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowWorkModal(false)} style={{ backgroundColor: '#334155', color: '#fff', border: 'none', padding: '0.6rem 1.2rem', borderRadius: '8px', cursor: 'pointer' }}>Cancelar</button>
              <button onClick={() => { alert('¡Postulación enviada correctamente!'); setShowWorkModal(false); }} style={{ backgroundColor: '#00FF87', color: '#0f172a', fontWeight: 'bold', border: 'none', padding: '0.6rem 1.2rem', borderRadius: '8px', cursor: 'pointer' }}>Enviar Postulación</button>
            </div>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer style={{
        backgroundColor: '#020617',
        padding: '3.5rem 2rem 2rem 2rem',
        borderTop: '1px solid #1e293b',
        marginTop: 'auto'
      }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '2.5rem' }}>
          
          {/* SECCIÓN SOBRE NOSOTROS CON ANCLA */}
          <div id="sobre-nosotros">
            <h3 style={{ margin: '0 0 0.8rem 0', fontSize: '1.3rem', fontWeight: '900', color: '#00FF87' }}>
              Biometra
            </h3>
            <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: '#FFFFFF', fontWeight: 'bold' }}>
              Sobre Nosotros
            </p>
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#94A3B8', lineHeight: '1.6' }}>
              Somos una plataforma pionera enfocada en la innovación deportiva y el seguimiento cinemático. Desarrollamos herramientas biométricas para conectar atletas y gimnasios en tiempo real.
            </p>
          </div>

          <div>
            <h4 style={{ margin: '0 0 0.8rem 0', fontSize: '0.95rem', fontWeight: '800', color: '#FFFFFF' }}>Páginas Oficiales</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '0.85rem', color: '#94A3B8', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              <li><a href="https://www.biometra.com" target="_blank" rel="noreferrer" style={{ color: '#38BDF8', textDecoration: 'none', fontWeight: 'bold' }}>🌐 Página Oficial de Biometra</a></li>
              <li><a href="#instalaciones" style={{ color: '#94A3B8', textDecoration: 'none' }}>Mapa de Instalaciones y Sedes</a></li>
              <li><a href="#metricas" style={{ color: '#94A3B8', textDecoration: 'none' }}>Métricas y Análisis Biomecánico</a></li>
            </ul>
          </div>

          <div>
            <h4 style={{ margin: '0 0 0.8rem 0', fontSize: '0.95rem', fontWeight: '800', color: '#FFFFFF' }}>Unirse</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '0.85rem', color: '#94A3B8', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              <li>
                <button 
                  onClick={() => setShowWorkModal(true)} 
                  style={{ background: 'none', border: 'none', color: '#00FF87', padding: 0, cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem' }}>
                  💼 Trabaja con Nosotros
                </button>
              </li>
              <li><a href="#afiliar" style={{ color: '#94A3B8', textDecoration: 'none' }}>Afiliar mi Gimnasio</a></li>
              <li><a href="#prensa" style={{ color: '#94A3B8', textDecoration: 'none' }}>Alianzas y Prensa</a></li>
            </ul>
          </div>

          <div>
            <h4 style={{ margin: '0 0 0.8rem 0', fontSize: '0.95rem', fontWeight: '800', color: '#FFFFFF' }}>Contacto y Redes</h4>
            <p style={{ margin: '0 0 0.4rem 0', fontSize: '0.85rem', color: '#94A3B8' }}>📧 <strong>gym@biometra.com</strong></p>
            <p style={{ margin: '0 0 0.8rem 0', fontSize: '0.85rem', color: '#94A3B8' }}>📞 <strong>+56 9 4685 7788</strong></p>
            <div style={{ display: 'flex', gap: '1rem', fontSize: '1.2rem', cursor: 'pointer' }}>
              <span>📷</span>
              <span>💼</span>
              <span>🌐</span>
            </div>
          </div>

        </div>

        <div style={{ maxWidth: '1280px', margin: '2.5rem auto 0 auto', paddingTop: '1.5rem', borderTop: '1px solid #1e293b', textAlign: 'center', fontSize: '0.8rem', color: '#64748b' }}>
          © {new Date().getFullYear()} Biometra Inc. Todos los derechos reservados.
        </div>
      </footer>

    </div>
  );
}