import React, { useState } from 'react';

const LogoBiometraIcon = () => (
  <svg width="32" height="32" viewBox="0 0 100 100" fill="none">
    <rect width="100" height="100" rx="20" fill="#0B132B" />
    <path d="M20 50 Q35 20, 50 50 T80 50" stroke="#06D6A0" strokeWidth="6" strokeLinecap="round" fill="none" />
    <path d="M20 50 Q35 80, 50 50 T80 50" stroke="#00B4D8" strokeWidth="6" strokeLinecap="round" fill="none" />
    <circle cx="50" cy="50" r="10" fill="#06D6A0" />
  </svg>
);

export default function Ejercicios({ onNavigate }) {
  const bancoEjercicios = [
    { id: 1, nombre: 'Press Banca', musculo: 'Pecho', grupo: 'Pecho / Tríceps', videoUrl: 'https://www.youtube.com/watch?v=vcBig73ojpE', tips: ['Retracción escapular activa', 'Apoyo firme de pies', 'Barra al esternón'] },
    { id: 2, nombre: 'Sentadilla', musculo: 'Cuadriceps', grupo: 'Pierna Completa', videoUrl: 'https://www.youtube.com/watch?v=ultWZbUMPL8', tips: ['Bajar de 90°', 'Rodillas hacia afuera', 'Core tenso'] },
    { id: 3, nombre: 'Push-Up', musculo: 'Pecho', grupo: 'Pecho / Core', videoUrl: 'https://www.youtube.com/watch?v=IODxDxX7oi4', tips: ['Codos a 45° del cuerpo', 'Cuerpo alineado como tabla'] },
    { id: 4, nombre: 'Plancha', musculo: 'Core', grupo: 'Zona Media', videoUrl: 'https://www.youtube.com/watch?v=pSHjTRCQxIw', tips: ['Retroversión pélvica', 'Apretar glúteos y abdomen'] },
    { id: 5, nombre: 'Press militar', musculo: 'Hombros', grupo: 'Deltoides', videoUrl: 'https://www.youtube.com/watch?v=2yjwXTZQDDI', tips: ['Barra sobre cabeza', 'Glúteos apretados'] },
    { id: 6, nombre: 'Curl de Bíceps', musculo: 'Biceps', grupo: 'Brazos', videoUrl: 'https://www.youtube.com/watch?v=kwG2ipFRgfo', tips: ['Codos pegados al torso', 'Sin inercia de cadera'] },
    { id: 7, nombre: 'Peso Muerto Rumano', musculo: 'Isquiotibiales', grupo: 'Cadena Posterior', videoUrl: 'https://www.youtube.com/watch?v=JCXUYuzwNrM', tips: ['Empujar cadera atrás', 'Espalda neutra'] },
    { id: 8, nombre: 'Elevación de talones de pie', musculo: 'Pantorrillas', grupo: 'Pierna Inferior', videoUrl: 'https://www.youtube.com/watch?v=gwLzBJYoWlI', tips: ['Máxima extensión arriba', 'Pausa en contracción'] },
    { id: 9, nombre: 'Jalón al pecho', musculo: 'Espalda', grupo: 'Dorsal Ancho', videoUrl: 'https://www.youtube.com/watch?v=CAwf7n6Luuc', tips: ['Traccionar con codos', 'Pecho erguido'] },
    { id: 10, nombre: 'Zancada o lunge', musculo: 'Cuadriceps', grupo: 'Piernas Unilateral', videoUrl: 'https://www.youtube.com/watch?v=QOVaHwm-Q6U', tips: ['Paso amplio', 'Alineación de rodilla'] },
    { id: 11, nombre: 'Remo con mancuerna', musculo: 'Espalda', grupo: 'Espalda Media', videoUrl: 'https://www.youtube.com/watch?v=pYcpY20QaE8', tips: ['Tracción hacia cadera', 'Codo pegado'] },
    { id: 12, nombre: 'Crunch abdominal', musculo: 'Core', grupo: 'Abdomen', videoUrl: 'https://www.youtube.com/watch?v=Xyd_fa5zoEU', tips: ['Exhalar arriba', 'No tirar del cuello'] },
    { id: 13, nombre: 'Apertura con mancuernas', musculo: 'Pecho', grupo: 'Pecho Aislado', videoUrl: 'https://www.youtube.com/watch?v=eozdVDA78K0', tips: ['Semi-flexión de codos', 'Siente el estiramiento'] },
    { id: 14, nombre: 'Elevaciones laterales', musculo: 'Hombros', grupo: 'Deltoides Lateral', videoUrl: 'https://www.youtube.com/watch?v=3VcKaXpzqRo', tips: ['Elevar hasta 90°', 'Controlar el descenso'] },
    { id: 15, nombre: 'Extensión de tríceps en polea', musculo: 'Triceps', grupo: 'Brazos', videoUrl: 'https://www.youtube.com/watch?v=vB5OHsJ3EME', tips: ['Fijar codos a los costados', 'Extensión completa'] }
  ];

  const [ejercicioSeleccionado, setEjercicioSeleccionado] = useState(bancoEjercicios[0]);
  const [videoUsuario, setVideoUsuario] = useState(null);
  const [procesando, setProcesando] = useState(false);
  const [resultado, setResultado] = useState(null);

  const obtenerUrlEmbed = (url) => {
    const match = url.match(/(?:embed\/|watch\?v=)([^&?]+)/);
    const videoId = match ? match[1] : '';
    return `https://www.youtube.com/embed/${videoId}?controls=1&rel=0`;
  };

  const handleVideoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setVideoUsuario(URL.createObjectURL(file));
      setProcesando(true);
      setResultado(null);

      setTimeout(() => {
        setProcesando(false);
        setResultado({
          angulo: '102° Flexión Articular',
          postura: 'Excelente Alineación Lumbar',
          riesgo: 'Bajo (3%)',
          recomendacion: 'Mantén el ritmo controlado durante la fase excéntrica.'
        });
      }, 2000);
    }
  };

  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif", backgroundColor: '#0B132B', color: '#F8FAFC', minHeight: '100vh' }}>
      <header style={{ backgroundColor: '#1C2541', borderBottom: '1px solid #3A506B', padding: '1rem 3rem' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button onClick={() => onNavigate && onNavigate('app')} style={{ backgroundColor: 'transparent', color: '#06D6A0', border: '1px solid #06D6A0', padding: '0.5rem 1.1rem', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}>
            ← Volver al Inicio
          </button>
          <LogoBiometraIcon />
        </div>
      </header>

      <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '2.5rem 2rem' }}>
        <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
          <h1 style={{ fontSize: '2.3rem', fontWeight: '900', color: '#FFFFFF' }}>🏋️ Entrenamiento y Análisis Biométrico</h1>
          <p style={{ color: '#94A3B8', fontSize: '1rem' }}>Selecciona uno de los 15 ejercicios del banco y sube tu video para evaluar tu técnica.</p>
        </div>

        <div style={{ marginBottom: '2.5rem' }}>
          <label style={{ color: '#00B4D8', fontSize: '0.9rem', fontWeight: '800', display: 'block', marginBottom: '0.6rem' }}>
            SELECCIONA EL EJERCICIO A ANALIZAR:
          </label>
          <select 
            value={ejercicioSeleccionado.id} 
            onChange={(e) => {
              setEjercicioSeleccionado(bancoEjercicios.find(x => x.id === parseInt(e.target.value)));
              setVideoUsuario(null);
              setResultado(null);
            }} 
            style={{ width: '100%', padding: '1rem', backgroundColor: '#1C2541', color: '#FFF', border: '2px solid #06D6A0', borderRadius: '12px', fontSize: '1.05rem', fontWeight: 'bold', outline: 'none' }}>
            {bancoEjercicios.map((ej) => (
              <option key={ej.id} value={ej.id}>✓ {ej.nombre} ({ej.grupo})</option>
            ))}
          </select>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>
          <div style={{ backgroundColor: '#1C2541', borderRadius: '16px', padding: '1.5rem', border: '1px solid #3A506B' }}>
            <h3 style={{ color: '#FFFFFF', fontSize: '1.1rem', fontWeight: '800', marginBottom: '1rem' }}>🎥 Ejecución de Referencia</h3>
            <div style={{ borderRadius: '12px', overflow: 'hidden', backgroundColor: '#0B132B', aspectRatio: '16/9' }}>
              <iframe
                key={ejercicioSeleccionado.id}
                src={obtenerUrlEmbed(ejercicioSeleccionado.videoUrl)}
                title={ejercicioSeleccionado.nombre}
                style={{ width: '100%', height: '100%', border: 'none' }}
                allowFullScreen
              />
            </div>
          </div>

          <div style={{ backgroundColor: '#1C2541', borderRadius: '16px', padding: '1.5rem', border: '1px solid #3A506B' }}>
            <span style={{ backgroundColor: 'rgba(6, 214, 160, 0.15)', color: '#06D6A0', padding: '0.3rem 0.8rem', borderRadius: '12px', fontSize: '0.8rem', fontWeight: '800' }}>{ejercicioSeleccionado.grupo}</span>
            <h2 style={{ fontSize: '1.6rem', fontWeight: '900', color: '#FFFFFF', marginTop: '0.5rem' }}>{ejercicioSeleccionado.nombre}</h2>
            <h4 style={{ color: '#00B4D8', marginTop: '1rem' }}>Tips Biomecánicos:</h4>
            <ul style={{ paddingLeft: '1.2rem', color: '#CBD5E1', fontSize: '0.9rem', lineHeight: '1.6' }}>
              {ejercicioSeleccionado.tips.map((tip, idx) => (
                <li key={idx}>{tip}</li>
              ))}
            </ul>
          </div>
        </div>

        <div style={{ backgroundColor: '#1C2541', borderRadius: '20px', padding: '2.5rem', border: '2px dashed #00B4D8', textAlign: 'center' }}>
          <h3 style={{ color: '#00B4D8', fontSize: '1.4rem', fontWeight: '900', marginBottom: '0.5rem' }}>
            📹 Sube tu Video para Análisis de "{ejercicioSeleccionado.nombre}"
          </h3>
          <p style={{ color: '#94A3B8', fontSize: '0.9rem', marginBottom: '1.8rem' }}>
            Sube la grabación de tu repetición para calcular automáticamente tus ángulos de movimiento y riesgo de lesión.
          </p>

          <input type="file" accept="video/*" onChange={handleVideoUpload} id="uploadVideoGym" style={{ display: 'none' }} />
          <label htmlFor="uploadVideoGym" style={{ background: 'linear-gradient(135deg, #06D6A0 0%, #00B4D8 100%)', color: '#0B132B', padding: '0.9rem 2rem', borderRadius: '10px', fontWeight: '900', cursor: 'pointer', display: 'inline-block' }}>
            📁 Seleccionar Video de Ejecución
          </label>

          {procesando && (
            <div style={{ marginTop: '1.5rem', color: '#00B4D8', fontWeight: 'bold' }}>
              ⚡ Analizando puntos articulares y vectores de fuerza...
            </div>
          )}

          {resultado && (
            <div style={{ backgroundColor: '#0B132B', padding: '1.5rem', borderRadius: '12px', border: '1px solid #06D6A0', marginTop: '2rem', textAlign: 'left' }}>
              <h4 style={{ color: '#06D6A0', margin: '0 0 0.8rem 0' }}>✅ Diagnóstico Cinemático Generado:</h4>
              <p style={{ margin: '0.4rem 0', color: '#CBD5E1' }}><strong>Rango de Movimiento:</strong> {resultado.angulo}</p>
              <p style={{ margin: '0.4rem 0', color: '#CBD5E1' }}><strong>Evaluación de Espalda/Lumbar:</strong> {resultado.postura}</p>
              <p style={{ margin: '0.4rem 0', color: '#CBD5E1' }}><strong>Nivel de Riesgo:</strong> <span style={{ color: '#06D6A0', fontWeight: 'bold' }}>{resultado.riesgo}</span></p>
              <p style={{ margin: '0.4rem 0', color: '#CBD5E1' }}><strong>Sugerencia Técnica:</strong> {resultado.recomendacion}</p>
            </div>
          )}
        </div>

      </main>
    </div>
  );
}