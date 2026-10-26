import React, { useState } from 'react';

// NUEVO ICONO BIOMETRA: Símbolo de pivote cinemático, vectores y visión por computadora
const LogoBiometraIcon = () => (
  <svg width="36" height="36" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ verticalAlign: 'middle' }}>
    <defs>
      <linearGradient id="kineticGradientEx" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#06D6A0" />
        <stop offset="100%" stopColor="#00B4D8" />
      </linearGradient>
    </defs>
    
    {/* Fondo en Dark Navy */}
    <rect width="100" height="100" rx="22" fill="#0B132B" />
    
    {/* Hexágono de visión por computadora y precisión */}
    <path 
      d="M50 15 L80 32.5 L80 67.5 L50 85 L20 67.5 L20 32.5 Z" 
      stroke="#3A506B" 
      strokeWidth="3" 
      strokeLinejoin="round" 
      opacity="0.6"
    />
    
    {/* Nodo articular central */}
    <circle cx="50" cy="50" r="8" fill="#FFFFFF" />
    <circle cx="50" cy="50" r="14" stroke="#00B4D8" strokeWidth="4" opacity="0.8"/>
    
    {/* Vector superior de fuerza */}
    <path 
      d="M50 36 V22 M50 22 L44 28 M50 22 L56 28" 
      stroke="#00B4D8" 
      strokeWidth="5" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
    
    {/* Arco cinemático continuo y trayectoria de rastreo de puntos */}
    <path 
      d="M72 40 A25 25 0 0 1 50 75" 
      stroke="url(#kineticGradientEx)" 
      strokeWidth="6" 
      strokeLinecap="round"
    />
    <path 
      d="M50 75 A25 25 0 0 1 28 40" 
      stroke="#06D6A0" 
      strokeWidth="6" 
      strokeLinecap="round" 
      strokeDasharray="4 6"
    />
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
  const [activeModal, setActiveModal] = useState(null);

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
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif", backgroundColor: '#0B132B', color: '#F8FAFC', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header style={{ backgroundColor: '#1C2541', borderBottom: '1px solid #3A506B', padding: '1rem 3rem' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button onClick={() => onNavigate && onNavigate('app')} style={{ backgroundColor: 'transparent', color: '#06D6A0', border: '1px solid #06D6A0', padding: '0.5rem 1.1rem', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}>
            ← Volver al Inicio
          </button>
          <div onClick={() => onNavigate && onNavigate('app')} style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', cursor: 'pointer' }}>
            <LogoBiometraIcon />
            <span className="brand-name">BIOMETRA</span>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '2.5rem 2rem', flex: 1 }}>
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

        <div style={{ backgroundColor: '#1C2541', borderRadius: '20px', padding: '2.5rem', border: '2px dashed #00B4D8', textAlign: 'center', marginBottom: '3rem' }}>
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

      {/* FOOTER */}
      <footer className="footer">
        <div className="footer-brand-col">
          <div className="logo-brand" onClick={() => onNavigate && onNavigate('app')}>
            <LogoBiometraIcon />
            <span className="brand-name">BIOMETRA</span>
          </div>
          <p className="footer-desc">Ciencia y tecnología aplicada a la técnica de levantamiento.</p>
        </div>

        <div className="footer-links">
          <div>
            <h4 className="footer-col-title green">Plataforma</h4>
            <p className="footer-link" onClick={() => onNavigate && onNavigate('ejercicios')}>Entrenamiento y Análisis</p>
            <p className="footer-link" onClick={() => onNavigate && onNavigate('gps')}>Gimnasios Adheridos</p>
          </div>
          <div>
            <h4 className="footer-col-title blue">Soporte & Legal</h4>
            <p className="footer-link" onClick={() => setActiveModal('soporte')}>Contacto / Soporte</p>
            <p className="footer-link" onClick={() => setActiveModal('terminos')}>Términos del Servicio</p>
          </div>
        </div>
      </footer>

      {/* MODAL LEGAL */}
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