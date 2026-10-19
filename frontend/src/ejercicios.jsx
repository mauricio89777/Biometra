import React, { useState } from 'react';

const BiometraLogoIcon = () => (
  <svg width="32" height="32" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="100" height="100" rx="20" fill="#020617" />
    <path d="M20 50 Q35 20, 50 50 T80 50" stroke="#00FF87" strokeWidth="6" strokeLinecap="round" fill="none" />
    <path d="M20 50 Q35 80, 50 50 T80 50" stroke="#38bdf8" strokeWidth="6" strokeLinecap="round" fill="none" />
    <circle cx="50" cy="50" r="10" fill="#00FF87" />
  </svg>
);

export default function Ejercicios({ onNavigate }) {
  // Lista oficial de 20 ejercicios ingresados en la plataforma
  const bancoEjercicios = [
    { id: 1, nombre: 'Press de Banca Plano con Barra', musculo: 'Pecho', grupo: 'Pecho / Tríceps', videoUrl: 'https://www.youtube.com/watch?v=vcBig73ojpE', tips: ['Escápulas retráctiles', 'Barra al esternón', 'Pies firmes'] },
    { id: 2, nombre: 'Press Inclinado con Mancuernas', musculo: 'Pecho', grupo: 'Pecho Superior', videoUrl: 'https://www.youtube.com/watch?v=8iPEnn-ltC8', tips: ['Inclinación 30°', 'Codos a 45°', 'Rango completo'] },
    { id: 3, nombre: 'Aperturas en Polea Alta', musculo: 'Pecho', grupo: 'Pecho Aislado', videoUrl: 'https://www.youtube.com/watch?v=taI4XduLpTk', tips: ['Flexión leve de codos', 'Cruzar al centro', 'Control al regresar'] },
    { id: 4, nombre: 'Fondos en Paralelas para Pecho', musculo: 'Pecho', grupo: 'Pecho / Tríceps', videoUrl: 'https://www.youtube.com/watch?v=2z8JmcrW-As', tips: ['Torso inclinado adelante', 'Bajar hasta 90° de codo'] },
    
    { id: 5, nombre: 'Dominadas Pronadas (Pull-ups)', musculo: 'Espalda', grupo: 'Dorsal Ancho', videoUrl: 'https://www.youtube.com/watch?v=eGo4IYlbE5g', tips: ['Agarre ancho', 'Llevar pecho a la barra', 'Bajada lenta'] },
    { id: 6, nombre: 'Remo con Barra', musculo: 'Espalda', grupo: 'Espalda Media', videoUrl: 'https://www.youtube.com/watch?v=FWJR5Ve8bnQ', tips: ['Espalda recta 45°', 'Tirar hacia la cadera', 'Codos pegados'] },
    { id: 7, nombre: 'Jalón al Pecho en Polea', musculo: 'Espalda', grupo: 'Dorsal Ancho', videoUrl: 'https://www.youtube.com/watch?v=CAwf7n6Luuc', tips: ['Barra a la clavícula', 'Sin balanceo lumbar'] },
    { id: 8, nombre: 'Remo Unilateral con Mancuerna', musculo: 'Espalda', grupo: 'Dorsal / Romboides', videoUrl: 'https://www.youtube.com/watch?v=pYcpY20QaE8', tips: ['Tracción a la cadera', 'Mantener alineación'] },

    { id: 9, nombre: 'Sentadilla Libre con Barra', musculo: 'Cuadriceps', grupo: 'Pierna Completa', videoUrl: 'https://www.youtube.com/watch?v=ultWZbUMPL8', tips: ['Bajar de 90°', 'Rodillas hacia afuera', 'Core tenso'] },
    { id: 10, nombre: 'Sentadilla Búlgara con Mancuernas', musculo: 'Cuadriceps', grupo: 'Pierna Unilateral', videoUrl: 'https://www.youtube.com/watch?v=2C-uNgKwPLE', tips: ['Descenso vertical', 'Apoyo firme del pie delantero'] },
    { id: 11, nombre: 'Prensa de Piernas 45°', musculo: 'Cuadriceps', grupo: 'Cuádriceps / Glúteos', videoUrl: 'https://www.youtube.com/watch?v=IZxyjW7MPJQ', tips: ['Sin hiperextender rodillas', 'Espalda pegada'] },
    { id: 12, nombre: 'Peso Muerto Rumano', musculo: 'Isquiotibiales', grupo: 'Cadena Posterior', videoUrl: 'https://www.youtube.com/watch?v=JCXUYuzwNrM', tips: ['Empujar cadera atrás', 'Espalda neutra'] },
    { id: 13, nombre: 'Curl de Piernas Tumbado', musculo: 'Isquiotibiales', grupo: 'Isquios Aislados', videoUrl: 'https://www.youtube.com/watch?v=1Tq3QdYUuHs', tips: ['Pausa en la cima', 'Negativa lenta'] },

    { id: 14, nombre: 'Hip Thrust con Barra', musculo: 'Glutios', grupo: 'Glúteo Mayor', videoUrl: 'https://www.youtube.com/watch?v=SEdqd1n0cvg', tips: ['Retroversion pélvica arriba', 'Barbilla al pecho'] },
    { id: 15, nombre: 'Patada de Glúteo en Polea', musculo: 'Glutios', grupo: 'Glúteo Aislado', videoUrl: 'https://www.youtube.com/watch?v=G30E30S41J8', tips: ['Movimiento controlado', 'Fijar zona lumbar'] },

    { id: 16, nombre: 'Press Militar con Barra', musculo: 'Hombros', grupo: 'Deltoides Anterior', videoUrl: 'https://www.youtube.com/watch?v=2yjwXTZQDDI', tips: ['Barra sobre la cabeza', 'Abdomen apretado'] },
    { id: 17, nombre: 'Elevaciones Laterales', musculo: 'Hombros', grupo: 'Deltoides Lateral', videoUrl: 'https://www.youtube.com/watch?v=3VcKaXpzqRo', tips: ['Subir a la altura de los hombros', 'Lento al bajar'] },
    { id: 18, nombre: 'Face Pulls en Polea Alta', musculo: 'Hombros', grupo: 'Deltoides Posterior', videoUrl: 'https://www.youtube.com/watch?v=V8dZ3pyiCBo', tips: ['Tirar hacia los ojos', 'Rotación externa'] },

    { id: 19, nombre: 'Curl de Bíceps con Barra Z', musculo: 'Biceps', grupo: 'Bíceps Braquial', videoUrl: 'https://www.youtube.com/watch?v=kwG2ipFRgfo', tips: ['Codos inmóviles', 'Sin inercia'] },
    { id: 20, nombre: 'Curl Martillo con Mancuernas', musculo: 'Biceps', grupo: 'Bíceps / Braquiorradial', videoUrl: 'https://www.youtube.com/watch?v=zC3Yb0orLuu', tips: ['Agarre neutro', 'Apretar arriba'] }
  ];

  const [ejercicioSeleccionado, setEjercicioSeleccionado] = useState(bancoEjercicios[0]);
  const [filtroMusculo, setFiltroMusculo] = useState('Todos');

  const ejerciciosFiltrados = filtroMusculo === 'Todos' 
    ? bancoEjercicios 
    : bancoEjercicios.filter(e => e.musculo.toLowerCase() === filtroMusculo.toLowerCase());

  // Convierte URL a reproductor limpio con controles interactivos (permite pausar y reproducir)
  const obtenerUrlReproductor = (url) => {
    let videoId = '';
    if (url.includes('/shorts/')) {
      videoId = url.split('/shorts/')[1].split('?')[0];
    } else {
      const match = url.match(/(?:embed\/|watch\?v=)([^&?]+)/);
      videoId = match ? match[1] : '';
    }
    return `https://www.youtube.com/embed/${videoId}?controls=1&rel=0&modestbranding=1`;
  };

  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif", backgroundColor: '#0A0F1D', color: '#F8FAFC', minHeight: '100vh' }}>
      <header style={{ backgroundColor: '#111827', borderBottom: '1px solid #1F2937', padding: '1rem 3rem' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button onClick={() => onNavigate && onNavigate('app')} style={{ backgroundColor: 'transparent', color: '#00FF87', border: '1px solid #00FF87', padding: '0.5rem 1.1rem', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}>
            ← Volver al Inicio
          </button>
          <BiometraLogoIcon />
        </div>
      </header>

      <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '2.5rem 2rem' }}>
        <div style={{ marginBottom: '2.5rem', textAlign: 'center' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: '900', color: '#FFFFFF' }}>🎯 Biomecánica y Análisis de Ejercicios</h1>
          <p style={{ color: '#94A3B8', fontSize: '1.1rem' }}>Filtra los 20 ejercicios ingresados seleccionando el grupo muscular.</p>
        </div>

        {/* SELECCIONADOR ANATÓMICO */}
        <div style={{ backgroundColor: '#111827', borderRadius: '20px', padding: '2rem', border: '1px solid #1F2937', marginBottom: '2.5rem' }}>
          <h3 style={{ color: '#00FF87', fontSize: '1.2rem', fontWeight: '800', marginBottom: '1.5rem' }}>🧍‍♂️ Seleccionador Anatómico Muscular</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', alignItems: 'center' }}>
            
            <div style={{ backgroundColor: '#090D16', borderRadius: '16px', padding: '1.5rem', border: '1px solid #374151', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <svg width="180" height="220" viewBox="0 0 100 150" fill="none">
                <circle cx="50" cy="18" r="10" fill="#334155" />
                <circle cx="28" cy="38" r="7" fill={filtroMusculo === 'Hombros' ? '#00FF87' : '#475569'} onClick={() => setFiltroMusculo('Hombros')} style={{ cursor: 'pointer' }} />
                <circle cx="72" cy="38" r="7" fill={filtroMusculo === 'Hombros' ? '#00FF87' : '#475569'} onClick={() => setFiltroMusculo('Hombros')} style={{ cursor: 'pointer' }} />
                <rect x="36" y="34" width="28" height="18" rx="4" fill={filtroMusculo === 'Pecho' ? '#00FF87' : '#38BDF8'} onClick={() => setFiltroMusculo('Pecho')} style={{ cursor: 'pointer' }} />
                <rect x="22" y="46" width="10" height="16" rx="3" fill={filtroMusculo === 'Biceps' ? '#00FF87' : '#38BDF8'} onClick={() => setFiltroMusculo('Biceps')} style={{ cursor: 'pointer' }} />
                <rect x="68" y="46" width="10" height="16" rx="3" fill={filtroMusculo === 'Biceps' ? '#00FF87' : '#38BDF8'} onClick={() => setFiltroMusculo('Biceps')} style={{ cursor: 'pointer' }} />
                <rect x="36" y="78" width="12" height="30" rx="4" fill={filtroMusculo === 'Cuadriceps' ? '#00FF87' : '#38BDF8'} onClick={() => setFiltroMusculo('Cuadriceps')} style={{ cursor: 'pointer' }} />
                <rect x="52" y="78" width="12" height="30" rx="4" fill={filtroMusculo === 'Cuadriceps' ? '#00FF87' : '#38BDF8'} onClick={() => setFiltroMusculo('Cuadriceps')} style={{ cursor: 'pointer' }} />
              </svg>
            </div>

            <div>
              <p style={{ color: '#94A3B8', fontSize: '0.9rem', marginBottom: '1rem' }}>Filtra según los músculos disponibles:</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.8rem' }}>
                {['Todos', 'Pecho', 'Espalda', 'Cuadriceps', 'Isquiotibiales', 'Glutios', 'Hombros', 'Biceps'].map((musculo) => (
                  <button key={musculo} onClick={() => setFiltroMusculo(musculo)} style={{ backgroundColor: filtroMusculo === musculo ? '#00FF87' : '#1E293B', color: filtroMusculo === musculo ? '#090D16' : '#F8FAFC', border: '1px solid #374151', padding: '0.6rem 1.2rem', borderRadius: '10px', fontWeight: '800', cursor: 'pointer' }}>
                    {musculo}
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* LISTA DE DESPLIEGUE */}
        <div style={{ marginBottom: '2rem' }}>
          <label style={{ color: '#38BDF8', fontSize: '0.9rem', fontWeight: '800', display: 'block', marginBottom: '0.5rem' }}>
            SELECCIONA EL EJERCICIO ({ejerciciosFiltrados.length} disponibles):
          </label>
          <select value={ejercicioSeleccionado.id} onChange={(e) => setEjercicioSeleccionado(bancoEjercicios.find(x => x.id === parseInt(e.target.value)))} style={{ width: '100%', padding: '1rem', backgroundColor: '#111827', color: '#FFF', border: '2px solid #00FF87', borderRadius: '12px', fontSize: '1rem', fontWeight: 'bold' }}>
            {ejerciciosFiltrados.map((ej) => (
              <option key={ej.id} value={ej.id}>{ej.nombre} ({ej.grupo})</option>
            ))}
          </select>
        </div>

        {/* DEMOSTRACIÓN DEL EJERCICIO CON CONTROLES INTERACTIVOS (PAUSAR / REPRODUCIR) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
          <div style={{ backgroundColor: '#111827', borderRadius: '16px', padding: '1.5rem', border: '1px solid #1F2937' }}>
            <h3 style={{ color: '#FFFFFF', fontSize: '1.2rem', fontWeight: '800', marginBottom: '1rem' }}>🎥 Demostración del Ejercicio (Interactiva)</h3>
            <div style={{ borderRadius: '12px', overflow: 'hidden', backgroundColor: '#000', aspectRatio: '16/9' }}>
              <iframe
                key={ejercicioSeleccionado.id}
                src={obtenerUrlReproductor(ejercicioSeleccionado.videoUrl)}
                title={ejercicioSeleccionado.nombre}
                style={{ width: '100%', height: '100%', border: 'none' }}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>

          <div style={{ backgroundColor: '#111827', borderRadius: '16px', padding: '1.5rem', border: '1px solid #1F2937' }}>
            <span style={{ backgroundColor: 'rgba(0, 255, 135, 0.15)', color: '#00FF87', padding: '0.3rem 0.8rem', borderRadius: '12px', fontSize: '0.8rem', fontWeight: '800' }}>{ejercicioSeleccionado.grupo}</span>
            <h2 style={{ fontSize: '1.6rem', fontWeight: '900', color: '#FFFFFF', marginTop: '0.5rem' }}>{ejercicioSeleccionado.nombre}</h2>
            <h4 style={{ color: '#38BDF8', marginTop: '1rem' }}>Puntos Clave de Ejecución:</h4>
            <ul style={{ paddingLeft: '1.2rem', color: '#CBD5E1', fontSize: '0.9rem', lineHeight: '1.6' }}>
              {ejercicioSeleccionado.tips.map((tip, idx) => (
                <li key={idx}>{tip}</li>
              ))}
            </ul>
          </div>
        </div>

      </main>
    </div>
  );
}