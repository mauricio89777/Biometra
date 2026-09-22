import React, { useState } from 'react';

// Icono biomecánico/tecnológico para el logo
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

export default function Ejercicios({ onNavigate }) {
  const [selectedExercise, setSelectedExercise] = useState('');

  const ejerciciosLista = [
    {
      id: 1,
      titulo: 'Sentadilla búlgara',
      nivel: 'Ejercicio intermedio',
      imagen: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&w=600&q=80'
    },
    {
      id: 2,
      titulo: 'Sentadillas peso libre',
      nivel: 'Ejercicio de fácil acceso',
      imagen: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=600&q=80'
    },
    {
      id: 3,
      titulo: 'Press de Banca',
      nivel: 'Ejercicio intermedio',
      imagen: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=600&q=80'
    }
  ];

  return (
    <div style={{
      fontFamily: "'Inter', system-ui, sans-serif",
      backgroundColor: '#c4956a', // Tono cálido/ocre idéntico al fondo de tu imagen
      color: '#1a1a1a',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* NAVBAR SUPERIOR */}
      <header style={{ 
        backgroundColor: '#986b62', // Tono rosáceo/marrón de la barra superior en la imagen
        borderBottom: '1px solid rgba(0,0,0,0.1)', 
        padding: '1rem 2rem' 
      }}>
        <div style={{ 
          maxWidth: '1280px', 
          margin: '0 auto', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center' 
        }}>
          {/* LOGO E IDENTIDAD */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button 
              onClick={() => onNavigate && onNavigate('gps')}
              style={{
                backgroundColor: '#000000',
                color: '#FFFFFF',
                border: 'none',
                padding: '0.55rem 1.2rem',
                borderRadius: '8px',
                fontWeight: '700',
                fontSize: '0.9rem',
                cursor: 'pointer'
              }}
            >
              ← Volver a Biometra
            </button>

            <div style={{ display: 'flex', alignItems: 'center', marginLeft: '0.5rem' }}>
              <BiometraLogoIcon />
              <span style={{ fontSize: '1.4rem', fontWeight: '900', color: '#FFFFFF', letterSpacing: '-0.5px' }}>
                BIOMETRA
              </span>
            </div>
          </div>

          {/* MENÚ DE NAVEGACIÓN */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
            <button 
              onClick={() => onNavigate && onNavigate('gps')}
              style={{ background: 'none', border: 'none', color: '#ffffff', fontSize: '1rem', cursor: 'pointer', fontWeight: '600' }}
            >
              Página
            </button>
            <button 
              style={{ background: 'none', border: 'none', color: '#ffffff', fontSize: '1rem', cursor: 'pointer', fontWeight: '800', borderBottom: '2px solid #000' }}
            >
              Ejercicios
            </button>
            <button 
              onClick={() => onNavigate && onNavigate('gps')}
              style={{ background: 'none', border: 'none', color: '#ffffff', fontSize: '1rem', cursor: 'pointer', fontWeight: '600' }}
            >
              Página
            </button>
            <button style={{
              backgroundColor: '#000000',
              color: '#FFFFFF',
              padding: '0.55rem 1.2rem',
              borderRadius: '8px',
              fontWeight: '700',
              border: 'none',
              cursor: 'pointer'
            }}>
              Botón
            </button>
          </nav>
        </div>
      </header>

      {/* CONTENIDO PRINCIPAL DE EJERCICIOS */}
      <main style={{ maxWidth: '1200px', margin: '0 auto', width: '100%', padding: '3rem 2rem', boxSizing: 'border-box' }}>
        
        {/* SECCIÓN HERO (ILUSTRACIÓN A LA IZQUIERDA Y BÚSQUEDA A LA DERECHA) */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '3rem',
          alignItems: 'center',
          marginBottom: '4rem'
        }}>
          
          {/* TARJETA BLANCA DE TÉCNICA CORRECTA */}
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            padding: '2.5rem',
            boxShadow: '0 10px 25px rgba(0,0,0,0.08)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '380px'
          }}>
            {/* ENCABEZADO TÉCNICA CORRECTA */}
            <div style={{
              backgroundColor: '#f5b041',
              color: '#0b132b',
              padding: '0.6rem 2rem',
              fontWeight: '900',
              fontSize: '1.8rem',
              letterSpacing: '1px',
              borderRadius: '4px',
              textAlign: 'center',
              width: '100%',
              boxSizing: 'border-box'
            }}>
              TÉCNICA
            </div>
            
            <div style={{
              color: '#0b132b',
              fontWeight: '900',
              fontSize: '2rem',
              letterSpacing: '1px',
              marginTop: '0.5rem',
              marginBottom: '2rem',
              textAlign: 'center'
            }}>
              CORRECTA
            </div>

            {/* ILUSTRACIÓN DE CHECKLIST */}
            <div style={{
              backgroundColor: '#e2e8f0',
              padding: '1.5rem',
              borderRadius: '12px',
              width: '140px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              position: 'relative'
            }}>
              <div style={{
                width: '30px',
                height: '15px',
                backgroundColor: '#cbd5e1',
                borderRadius: '4px',
                position: 'absolute',
                top: '-8px',
                left: '50%',
                transform: 'translateX(-50%)'
              }}></div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: '#22c55e', fontWeight: 'bold' }}>✓</span>
                <div style={{ height: '6px', backgroundColor: '#f5b041', borderRadius: '3px', width: '100%' }}></div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: '#22c55e', fontWeight: 'bold' }}>✓</span>
                <div style={{ height: '6px', backgroundColor: '#f5b041', borderRadius: '3px', width: '100%' }}></div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: '#22c55e', fontWeight: 'bold' }}>✓</span>
                <div style={{ height: '6px', backgroundColor: '#f5b041', borderRadius: '3px', width: '100%' }}></div>
              </div>
            </div>
          </div>

          {/* FORMULARIO DE BÚSQUEDA DE EJERCICIO */}
          <div>
            <h1 style={{ fontSize: '2.5rem', fontWeight: '900', margin: '0 0 1.5rem 0', color: '#000000' }}>
              Búsqueda de ejercicio
            </h1>

            <div style={{ marginBottom: '1.2rem' }}>
              <select 
                value={selectedExercise}
                onChange={(e) => setSelectedExercise(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.9rem',
                  fontSize: '1rem',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: 'rgba(255, 255, 255, 0.4)',
                  color: '#4a3b32',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value="">Selecciona un ejercicio</option>
                <option value="sentadilla-bulgara">Sentadilla búlgara</option>
                <option value="sentadilla-libre">Sentadillas peso libre</option>
                <option value="press-banca">Press de banca</option>
              </select>
            </div>

            <p style={{ color: '#6e5648', fontSize: '1rem', margin: '0 0 2rem 0' }}>
              Busca ejercicios que mejoren tus habilidades.
            </p>

            <button 
              onClick={() => alert(`Iniciando análisis para: ${selectedExercise || 'Ejercicio general'}`)}
              style={{
                width: '100%',
                backgroundColor: '#000000',
                color: '#FFFFFF',
                padding: '1rem',
                borderRadius: '8px',
                border: 'none',
                fontWeight: '700',
                fontSize: '0.95rem',
                cursor: 'pointer',
                textTransform: 'lowercase'
              }}
            >
              empezar análisis
            </button>
          </div>

        </div>

        {/* SECCIÓN EJERCICIO RELACIONADOS */}
        <div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: '800', marginBottom: '2rem', color: '#000000' }}>
            Ejercicio relacionados
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '2.5rem'
          }}>
            {ejerciciosLista.map((item) => (
              <div key={item.id} style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  marginBottom: '1rem',
                  height: '320px',
                  boxShadow: '0 8px 20px rgba(0,0,0,0.06)'
                }}>
                  <img 
                    src={item.imagen} 
                    alt={item.titulo} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
                <h3 style={{ margin: '0 0 0.3rem 0', fontSize: '1.2rem', fontWeight: '800', color: '#000000' }}>
                  {item.titulo}
                </h3>
                <p style={{ margin: 0, color: '#8c6d58', fontSize: '0.95rem' }}>
                  {item.nivel}
                </p>
              </div>
            ))}
          </div>
        </div>

      </main>
    </div>
  );
}