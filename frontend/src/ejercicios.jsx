import React, { useState } from 'react';

// LOGO BIOMETRA
const LogoBiometraIcon = () => (
  <svg
    width="36"
    height="36"
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <linearGradient id="kineticGradientEx" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#06D6A0" />
        <stop offset="100%" stopColor="#00B4D8" />
      </linearGradient>
    </defs>

    <rect width="100" height="100" rx="22" fill="#0B132B" />

    <path
      d="M50 15 L80 32.5 L80 67.5 L50 85 L20 67.5 L20 32.5 Z"
      stroke="#3A506B"
      strokeWidth="3"
      strokeLinejoin="round"
      opacity="0.6"
    />

    <circle cx="50" cy="50" r="8" fill="#FFFFFF" />
    <circle cx="50" cy="50" r="14" stroke="#00B4D8" strokeWidth="4" opacity="0.8"/>

    <path
      d="M50 36 V22 M50 22 L44 28 M50 22 L56 28"
      stroke="#00B4D8"
      strokeWidth="5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />

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

  // 1. BANCO DE EJERCICIOS (Mapeado con `key` para Python)

  const bancoEjercicios = [
    {
      key: 'press_banca',
      nombre: 'Press Banca',
      musculo: 'Pecho',
      grupo: 'Pecho / Tríceps',
      videoUrl: 'https://www.youtube.com/watch?v=vcBig73ojpE',
      camera: 'lateral',
      tips: ['Retracción escapular activa', 'Apoyo firme de pies', 'Barra al esternón']
    },
    {
      key: 'sentadilla',
      nombre: 'Sentadilla',
      musculo: 'Cuádriceps',
      grupo: 'Pierna Completa',
      videoUrl: 'https://www.youtube.com/watch?v=ultWZbUMPL8',
      camera: 'lateral',
      tips: ['Bajar con profundidad controlada', 'Rodillas alineadas con los pies', 'Core tenso']
    },
    {
      key: 'flexiones',
      nombre: 'Push-Up',
      musculo: 'Pecho',
      grupo: 'Pecho / Core',
      videoUrl: 'https://www.youtube.com/watch?v=IODxDxX7oi4',
      camera: 'lateral',
      tips: ['Codos a 45° del cuerpo', 'Cuerpo alineado como tabla']
    },
    {
      key: 'plancha',
      nombre: 'Plancha',
      musculo: 'Core',
      grupo: 'Zona Media',
      videoUrl: 'https://www.youtube.com/watch?v=pSHjTRCQxIw',
      camera: 'lateral',
      tips: ['Retroversión pélvica', 'Apretar glúteos y abdomen']
    },
    {
      key: 'press_militar',
      nombre: 'Press militar',
      musculo: 'Hombros',
      grupo: 'Deltoides',
      videoUrl: 'https://www.youtube.com/watch?v=2yjwXTZQDDI',
      camera: 'frontal',
      tips: ['Barra sobre cabeza', 'Glúteos apretados']
    },
    {
      key: 'curl_biceps',
      nombre: 'Curl de Bíceps',
      musculo: 'Bíceps',
      grupo: 'Brazos',
      videoUrl: 'https://www.youtube.com/watch?v=kwG2ipFRgfo',
      camera: 'lateral',
      tips: ['Codos pegados al torso', 'Sin inercia de cadera']
    },
    {
      key: 'peso_muerto_rumano',
      nombre: 'Peso Muerto Rumano',
      musculo: 'Isquiotibiales',
      grupo: 'Cadena Posterior',
      videoUrl: 'https://www.youtube.com/watch?v=JCXUYuzwNrM',
      camera: 'lateral',
      tips: ['Empujar cadera atrás', 'Espalda neutra']
    },
    {
      key: 'elevacion_talones',
      nombre: 'Elevación de talones de pie',
      musculo: 'Pantorrillas',
      grupo: 'Pierna Inferior',
      videoUrl: 'https://www.youtube.com/watch?v=gwLzBJYoWlI',
      camera: 'lateral',
      tips: ['Máxima extensión arriba', 'Pausa en contracción']
    },
    {
      key: 'jalon_pecho',
      nombre: 'Jalón al pecho',
      musculo: 'Espalda',
      grupo: 'Dorsal Ancho',
      videoUrl: 'https://www.youtube.com/watch?v=CAwf7n6Luuc',
      camera: 'frontal',
      tips: ['Traccionar con codos', 'Pecho erguido']
    },
    {
      key: 'zancada',
      nombre: 'Zancada o lunge',
      musculo: 'Cuádriceps',
      grupo: 'Piernas Unilateral',
      videoUrl: 'https://www.youtube.com/watch?v=QOVaHwm-Q6U',
      camera: 'lateral',
      tips: ['Paso amplio', 'Alineación de rodilla']
    },
    {
      key: 'remo_mancuerna',
      nombre: 'Remo con mancuerna',
      musculo: 'Espalda',
      grupo: 'Espalda Media',
      videoUrl: 'https://www.youtube.com/watch?v=pYcpY20QaE8',
      camera: 'lateral',
      tips: ['Tracción hacia cadera', 'Codo pegado']
    },
    {
      key: 'crunch',
      nombre: 'Crunch abdominal',
      musculo: 'Core',
      grupo: 'Abdomen',
      videoUrl: 'https://www.youtube.com/watch?v=Xyd_fa5zoEU',
      camera: 'lateral',
      tips: ['Exhalar arriba', 'No tirar del cuello']
    },
    {
      key: 'apertura_mancuernas',
      nombre: 'Apertura con mancuernas',
      musculo: 'Pecho',
      grupo: 'Pecho Aislado',
      videoUrl: 'https://www.youtube.com/watch?v=eozdVDA78K0',
      camera: 'frontal',
      tips: ['Semi-flexión de codos', 'Controlar el estiramiento']
    },
    {
      key: 'elevaciones_laterales',
      nombre: 'Elevaciones laterales',
      musculo: 'Hombros',
      grupo: 'Deltoides Lateral',
      videoUrl: 'https://www.youtube.com/watch?v=3VcKaXpzqRo',
      camera: 'frontal',
      tips: ['Elevar hasta 90°', 'Controlar el descenso']
    },
    {
      key: 'extension_triceps',
      nombre: 'Extensión de tríceps en polea',
      musculo: 'Tríceps',
      grupo: 'Brazos',
      videoUrl: 'https://www.youtube.com/watch?v=vB5OHsJ3EME',
      camera: 'frontal',
      tips: ['Fijar codos a los costados', 'Extensión controlada']
    }
  ];


  const [ejercicioSeleccionado, setEjercicioSeleccionado] =
    useState(bancoEjercicios[0]);

  const [videoUsuario, setVideoUsuario] = useState(null);
  const [procesando, setProcesando] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [error, setError] = useState(null);


  const obtenerUrlEmbed = (url) => {
    const match = url.match(/(?:embed\/|watch\?v=)([^&?]+)/);
    const videoId = match ? match[1] : '';

    return `https://www.youtube.com/embed/${videoId}?controls=1&rel=0`;
  };

  const seleccionarEjercicioPorKey = (exerciseKey) => {
    const seleccionado = bancoEjercicios.find(
      (ej) => ej.key === exerciseKey
    );

    if (!seleccionado) return;

    setEjercicioSeleccionado(seleccionado);
    setResultado(null);
    setError(null);
  };

  const handleVideoUpload = (e) => {
    const archivo = e.target.files?.[0];

    if (!archivo) return;

    if (!archivo.type.startsWith('video/')) {
      setError('Selecciona un archivo de video válido.');
      setVideoUsuario(null);
      return;
    }

    setVideoUsuario(archivo);
    setResultado(null);
    setError(null);
  };

// AnalsisIA

  const iniciarAnalisis = async (e) => {
    e.preventDefault();

    if (!videoUsuario) {
      setError('Primero debes seleccionar un video.');
      return;
    }

    setProcesando(true);
    setResultado(null);
    setError(null);

    const formData = new FormData();

    formData.append('video', videoUsuario);
    formData.append('exercise', ejercicioSeleccionado.key);

    try {
      const response = await fetch('http://localhost:3000/videos/analizar', {
        method: 'POST',
        body: formData
      });

      const responseText = await response.text();
      
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        throw new Error(`Respuesta no válida del servidor: ${responseText || response.statusText}`);
      }

      if (!response.ok) {
        throw new Error(data.error || 'Error durante el análisis.');
      }

      console.log("CLAVES DEL JSON DE PYTHON:", Object.keys(data));
      setResultado(data);

    } catch (err) {
      setError(err.message || 'No se pudo procesar el video.');
    } finally {
      setProcesando(false);
    }
  };


  return (
    <div style={{
      fontFamily: "'Inter', system-ui, sans-serif",
      backgroundColor: '#0B132B',
      color: '#F8FAFC',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column'
    }}>

      {/* HEADER */}

      <header style={{
        backgroundColor: '#1C2541',
        borderBottom: '1px solid #3A506B',
        padding: '1rem 3rem'
      }}>
        <div style={{
          maxWidth: '1280px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>

          <button
            onClick={() => onNavigate?.('app')}
            style={{
              backgroundColor: 'transparent',
              color: '#06D6A0',
              border: '1px solid #06D6A0',
              padding: '0.5rem 1.1rem',
              borderRadius: '8px',
              fontWeight: '700',
              cursor: 'pointer'
            }}
          >
            ← Volver al Inicio
          </button>

          <div
            onClick={() => onNavigate?.('app')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.8rem',
              cursor: 'pointer'
            }}
          >
            <LogoBiometraIcon />
            <span className="brand-name">BIOMETRA</span>
          </div>

        </div>
      </header>

      <main style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '2.5rem 2rem',
        flex: 1,
        width: '100%',
        boxSizing: 'border-box'
      }}>

  

        <section style={{ marginBottom: '3rem' }}>

          <div style={{
            marginBottom: '2rem',
            textAlign: 'center'
          }}>
            <h1 style={{
              fontSize: '2.3rem',
              fontWeight: '900',
              color: '#FFFFFF'
            }}>
              Biblioteca de Ejercicios
            </h1>

            <p style={{ color: '#94A3B8' }}>
              Explora los ejercicios y aprende su correcta ejecución.
            </p>
          </div>

          {/* SELECTOR BASADO EN `key` */}

          <div style={{ marginBottom: '2rem' }}>

            <label style={{
              color: '#00B4D8',
              fontWeight: '800',
              display: 'block',
              marginBottom: '0.6rem'
            }}>
              SELECCIONA UN EJERCICIO:
            </label>

            <select
              value={ejercicioSeleccionado.key}
              onChange={(e) => seleccionarEjercicioPorKey(e.target.value)}
              style={{
                width: '100%',
                padding: '1rem',
                backgroundColor: '#1C2541',
                color: '#FFF',
                border: '2px solid #06D6A0',
                borderRadius: '12px',
                fontSize: '1rem',
                fontWeight: 'bold'
              }}
            >
              {bancoEjercicios.map((ej) => (
                <option key={ej.key} value={ej.key}>
                  {ej.nombre} — {ej.grupo}
                </option>
              ))}
            </select>

          </div>

          {/* VIDEO Y RECOMENDACIONES */}

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '2rem'
          }}>

            {/* VIDEO DEMOSTRATIVO */}

            <div style={{
              backgroundColor: '#1C2541',
              borderRadius: '16px',
              padding: '1.5rem',
              border: '1px solid #3A506B'
            }}>

              <h2 style={{
                color: '#FFFFFF',
                fontSize: '1.4rem',
                marginTop: 0
              }}>
                {ejercicioSeleccionado.nombre}
              </h2>

              <div style={{
                position: 'relative',
                width: '100%',
                paddingBottom: '56.25%',
                borderRadius: '12px',
                overflow: 'hidden'
              }}>
                <iframe
                  src={obtenerUrlEmbed(ejercicioSeleccionado.videoUrl)}
                  title={`Demostración de ${ejercicioSeleccionado.nombre}`}
                  style={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    border: 'none',
                    top: 0,
                    left: 0
                  }}
                  allowFullScreen
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                />
              </div>

              <p style={{
                color: '#94A3B8',
                fontSize: '0.9rem',
                marginBottom: 0
              }}>
                Video demostrativo de la ejecución del ejercicio.
              </p>

            </div>

            {/* INFORMACIÓN BIOMECÁNICA */}

            <div style={{
              backgroundColor: '#1C2541',
              borderRadius: '16px',
              padding: '1.5rem',
              border: '1px solid #3A506B'
            }}>

              <span style={{
                backgroundColor: 'rgba(6, 214, 160, 0.15)',
                color: '#06D6A0',
                padding: '0.4rem 0.8rem',
                borderRadius: '12px',
                fontSize: '0.8rem',
                fontWeight: '800'
              }}>
                Cámara: {ejercicioSeleccionado.camera}
              </span>

              <h3 style={{
                color: '#00B4D8',
                marginTop: '1.5rem'
              }}>
                Información del ejercicio
              </h3>

              <p style={{ color: '#CBD5E1' }}>
                <strong>Grupo muscular:</strong>{' '}
                {ejercicioSeleccionado.grupo}
              </p>

              <p style={{ color: '#CBD5E1' }}>
                <strong>Músculo principal:</strong>{' '}
                {ejercicioSeleccionado.musculo}
              </p>

              <h4 style={{ color: '#00B4D8' }}>
                Recomendaciones técnicas
              </h4>

              <ul style={{
                color: '#CBD5E1',
                lineHeight: '1.8',
                paddingLeft: '1.2rem'
              }}>
                {ejercicioSeleccionado.tips.map((tip, idx) => (
                  <li key={idx}>{tip}</li>
                ))}
              </ul>

            </div>

          </div>

        </section>

        <section style={{ marginTop: '4rem' }}>

          <div style={{
            textAlign: 'center',
            marginBottom: '2rem'
          }}>
            <h2 style={{
              fontSize: '2rem',
              fontWeight: '900',
              color: '#06D6A0'
            }}>
              Análisis de Movimiento con IA
            </h2>

            <p style={{ color: '#94A3B8' }}>
              Carga tu propia grabación para evaluar la técnica mediante
              visión por computadora y MediaPipe.
            </p>
          </div>

          <form onSubmit={iniciarAnalisis}>

            <div style={{
              backgroundColor: '#1C2541',
              borderRadius: '20px',
              padding: '2.5rem',
              border: '2px dashed #00B4D8',
              textAlign: 'center'
            }}>

              <h3 style={{ color: '#00B4D8' }}>
                Analizar: {ejercicioSeleccionado.nombre}
              </h3>

              <p style={{
                color: '#94A3B8',
                fontSize: '0.9rem'
              }}>
                El video será procesado utilizando la configuración
                biomecánica correspondiente al ejercicio seleccionado.
              </p>

              {/* INPUT DE VIDEO */}

              <input
                type="file"
                accept="video/*"
                onChange={handleVideoUpload}
                id="uploadVideoGym"
                disabled={procesando}
                style={{ display: 'none' }}
              />

              <label
                htmlFor="uploadVideoGym"
                style={{
                  background: 'linear-gradient(135deg, #06D6A0 0%, #00B4D8 100%)',
                  color: '#0B132B',
                  padding: '0.9rem 2rem',
                  borderRadius: '10px',
                  fontWeight: '900',
                  cursor: procesando ? 'not-allowed' : 'pointer',
                  display: 'inline-block'
                }}
              >
                Añadir video de ejecución
              </label>

              {videoUsuario && (
                <div style={{
                  marginTop: '1.5rem',
                  color: '#06D6A0'
                }}>
                  <p>Video seleccionado:</p>
                  <strong>{videoUsuario.name}</strong>
                  <p style={{ fontSize: '0.8rem' }}>
                    {(videoUsuario.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
              )}

              {/* BOTÓN DE ANÁLISIS */}

              <div style={{ marginTop: '2rem' }}>

                <button
                  type="submit"
                  disabled={procesando || !videoUsuario}
                  style={{
                    backgroundColor: '#06D6A0',
                    color: '#0B132B',
                    border: 'none',
                    padding: '1rem 2.5rem',
                    borderRadius: '10px',
                    fontWeight: '900',
                    cursor: procesando ? 'wait' : 'pointer',
                    opacity: procesando || !videoUsuario ? 0.5 : 1
                  }}
                >
                  {procesando
                    ? 'Procesando movimiento...'
                    : 'Empezar análisis de técnica'}
                </button>

              </div>

              {/* ESTADO DE PROCESAMIENTO */}

              {procesando && (
                <p style={{
                  color: '#00B4D8',
                  marginTop: '1.5rem'
                }}>
                  Procesando video con Python y MediaPipe...
                </p>
              )}

              {/* ERRORES */}

              {error && (
                <div style={{
                  marginTop: '1.5rem',
                  padding: '1rem',
                  borderRadius: '8px',
                  color: '#FF6B6B',
                  backgroundColor: 'rgba(255, 107, 107, 0.1)'
                }}>
                  <strong>Error:</strong> {error}
                </div>
              )}

            </div>
          </form>

          {/* RESULTADOS Y VISUALIZACIÓN DEL ANÁLISIS (FUERA DEL FORMULARIO) */}
          {resultado && (() => {
            const dataAnalisis = resultado.analisis || resultado.datos || resultado;
            const puntuacionRaw = dataAnalisis.puntuacion ?? resultado.puntuacion ?? 85;
            const puntuacionVal = typeof puntuacionRaw === 'object' ? (puntuacionRaw.global ?? 85) : puntuacionRaw;
            
            const feedbackVal = dataAnalisis.feedback ?? resultado.feedback ?? [];
            const repeticionesVal = dataAnalisis.repeticiones ?? resultado.repeticiones ?? 0;
            const fpsVal = dataAnalisis.fps ?? resultado.fps ?? 30;

            // Usamos estrictamente 'video_procesado' si es un string (ruta válida), ignorando el booleano true/false
            const videoFinal = (typeof resultado.video_procesado === 'string' ? resultado.video_procesado : null) || 
                   (typeof resultado.video_procesado_h264 === 'string' ? resultado.video_procesado_h264 : null);            
            console.log("🎥 RUTA DEL VIDEO DETECTADA:", videoFinal);
            console.log("📦 OBJETO RESULTADO COMPLETO:", resultado);


            return (
              <div style={{
                backgroundColor: '#1C2541',
                padding: '2.5rem',
                borderRadius: '20px',
                border: '2px solid #06D6A0',
                marginTop: '3rem',
                textAlign: 'left',
                boxShadow: '0 12px 32px rgba(6, 214, 160, 0.2)'
              }}>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                  <h3 style={{ color: '#06D6A0', margin: 0, fontSize: '1.8rem', fontWeight: '900' }}>
                    ✨ Análisis Biomecánico Completado
                  </h3>
                  <span style={{ backgroundColor: 'rgba(6, 214, 160, 0.25)', color: '#06D6A0', padding: '0.5rem 1.2rem', borderRadius: '25px', fontWeight: 'bold', fontSize: '1.1rem' }}>
                    Puntuación: {puntuacionVal} / 100
                  </span>
                </div>

                {/* GRID PARA MOSTRAR VIDEO PROCESADO Y MÉTRICAS JUNTOS */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2.5rem', alignItems: 'start' }}>
                  
                  {/* COLUMNA 1: VIDEO PROCESADO */}
                  <div>
                    <h4 style={{ color: '#00B4D8', marginBottom: '0.8rem', fontSize: '1.1rem' }}>🎥 Video con Esqueleto Anotado:</h4>
                    {videoFinal ? (
                      <div style={{ borderRadius: '14px', overflow: 'hidden', backgroundColor: '#000', aspectRatio: '16/9', border: '1px solid #3A506B' }}>
                        <video 
                          controls 
                          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                          src={`http://localhost:3000/videos/stream?path=${encodeURIComponent(videoFinal)}`}
                        >
                          Tu navegador no soporta la reproducción de video.
                        </video>
                      </div>
                    ) : (
                      <p style={{ color: '#94A3B8', fontSize: '0.9rem' }}>No se encontró la ruta del video procesado.</p>
                    )}
                  </div>

                  {/* COLUMNA 2: INFORMACIÓN Y FEEDBACK HUMANO */}
                  <div>
                    <h4 style={{ color: '#00B4D8', marginBottom: '0.8rem', fontSize: '1.1rem' }}>📊 Métricas de Ejecución:</h4>
                    
                    <div style={{ backgroundColor: '#0B132B', padding: '1.2rem', borderRadius: '12px', marginBottom: '1.5rem', border: '1px solid #3A506B' }}>
                      <p style={{ color: '#CBD5E1', margin: '0.4rem 0' }}>
                        <strong>Ejercicio:</strong> {String(ejercicioSeleccionado?.nombre || 'Plancha')}
                      </p>
                      <p style={{ color: '#CBD5E1', margin: '0.4rem 0' }}>
                        <strong>Repeticiones:</strong> {Array.isArray(repeticionesVal) ? repeticionesVal.length : String(repeticionesVal)}
                      </p>
                      <p style={{ color: '#CBD5E1', margin: '0.4rem 0' }}>
                        <strong>FPS de Procesamiento:</strong> {String(fpsVal ? Number(fpsVal).toFixed(1) : 'N/D')}
                      </p>
                    </div>

                    <h4 style={{ color: '#00B4D8', marginBottom: '0.8rem', fontSize: '1.1rem' }}>💡 Feedback del Entrenador Virtual:</h4>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', maxHeight: '320px', overflowY: 'auto', paddingRight: '0.5rem' }}>
                      {Array.isArray(feedbackVal) && feedbackVal.length > 0 ? (
                        feedbackVal.map((item, idx) => (
                          <div key={idx} style={{ 
                            backgroundColor: '#0B132B', 
                            padding: '1.1rem', 
                            borderRadius: '12px', 
                            borderLeft: `4px solid ${item.nivel === 'aviso' ? '#F7931A' : '#06D6A0'}`,
                            borderTop: '1px solid #3A506B',
                            borderRight: '1px solid #3A506B',
                            borderBottom: '1px solid #3A506B'
                          }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                              <span style={{ color: '#06D6A0', fontWeight: 'bold', fontSize: '0.85rem', textTransform: 'uppercase' }}>
                                {item.metrica ? `Métrica: ${item.metrica}` : 'Observación técnica'}
                              </span>
                              {item.momentos_s && item.momentos_s.length > 0 && (
                                <span style={{ backgroundColor: 'rgba(247, 147, 26, 0.2)', color: '#F7931A', padding: '0.2rem 0.6rem', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                                  Minuto: {item.momentos_s.join(', ')} s
                                </span>
                              )}
                            </div>
                            
                            <p style={{ color: '#FFFFFF', margin: '0 0 0.6rem 0', fontSize: '0.95rem', lineHeight: '1.4' }}>
                              {item.mensaje}
                            </p>

                            {item.correccion && (
                              <p style={{ color: '#94A3B8', margin: 0, fontSize: '0.85rem', fontStyle: 'italic', borderTop: '1px solid #1C2541', paddingTop: '0.5rem' }}>
                                👉 <strong style={{ color: '#00B4D8' }}>Corrección:</strong> {item.correccion}
                              </p>
                            )}
                          </div>
                        ))
                      ) : (
                        <div style={{ backgroundColor: '#0B132B', padding: '1.2rem', borderRadius: '12px', border: '1px solid #3A506B' }}>
                          <p style={{ color: '#CBD5E1', margin: 0 }}>Buena técnica general registrada sin incidencias.</p>
                        </div>
                      )}
                    </div>

                    {/* ENLACE AL INFORME HTML SI VIENE EN EL JSON */}
                    {resultado.informe && (
                      <div style={{ marginTop: '1.5rem' }}>
                        <a 
                          href={`http://localhost:3000/videos/stream?path=${encodeURIComponent(resultado.informe)}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          style={{ color: '#06D6A0', textDecoration: 'underline', fontWeight: 'bold', fontSize: '1rem' }}
                        >
                          Ver informe HTML completo en pestaña nueva ↗
                        </a>
                      </div>
                    )}
                  </div>

                </div>

              </div>
            );
          })()}

        </section>
      </main>
    </div>
  );
}