import React, { useState , useEffect} from 'react';
import EjercicioCard from './components/EjercicioCard';
import AnalisisForm from './components/AnalisisForm';
import ResultadoAnalisis from './components/ResultadoAnalisis';
import { metadataEjercicios } from './utils/ejerciciosMetadata';
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
  
  const [bancoEjercicios, setBancoEjercicios] = useState([]);
  const [ejercicioSeleccionado, setEjercicioSeleccionado] = useState(null);
  const [videoUsuario, setVideoUsuario] = useState(null);
  const [procesando, setProcesando] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('http://localhost:3000/ejercicios')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          // Fusionamos la BD con el diccionario estático usando el script_key
          const ejerciciosFusionados = data.map((ej) => {
            const meta = metadataEjercicios[ej.script_key] || {
              videoUrl: 'https://www.youtube.com/watch?v=placeholder',
              camera: 'lateral',
              tips: ['Mantén una técnica controlada']
            };
            return { ...ej, ...meta }; // Unimos BD + Metadata visual
          });

          setBancoEjercicios(ejerciciosFusionados);
          setEjercicioSeleccionado(ejerciciosFusionados[0]);
        }
      })
      .catch((err) => console.error('Error cargando ejercicios:', err));
  }, []);

  const seleccionarEjercicioPorKey = (scriptKey) => {
    const seleccionado = bancoEjercicios.find(
      (ej) => ej.script_key === scriptKey
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
    formData.append('exercise', ejercicioSeleccionado.script_key); // Vinculación mediante script_key
    formData.append('usuario_id', 1); // ID de usuario por defecto para pruebas

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

      setResultado(data);

    } catch (err) {
      setError(err.message || 'No se pudo procesar el video.');
    } finally {
      setProcesando(false);
    }
  };

  if (!ejercicioSeleccionado) {
    return (
      <div style={{ color: '#FFF', textAlign: 'center', padding: '5rem', backgroundColor: '#0B132B', minHeight: '100vh' }}>
        <h2>Cargando biblioteca de ejercicios...</h2>
      </div>
    );
  }
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
            <span className="brand-name" style={{ fontWeight: 'bold' }}>BIOMETRA</span>
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

          <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
            <h1 style={{ fontSize: '2.3rem', fontWeight: '900', color: '#FFFFFF' }}>
              Biblioteca de Ejercicios
            </h1>
            <p style={{ color: '#94A3B8' }}>
              Explora los ejercicios sincronizados con tu base de datos y motor de Python.
            </p>
          </div>

          {/* SELECTOR BASADO EN SCRIPT_KEY DE LA BD */}
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
              value={ejercicioSeleccionado.script_key}
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
                <option key={ej.script_key} value={ej.script_key}>
                  {ej.nombre} — [{ej.tipo || 'General'}]
                </option>
              ))}
            </select>
          </div>

          {/* COMPONENTE DE TARJETA E INFORMACIÓN */}
          <EjercicioCard ejercicio={ejercicioSeleccionado} />

        </section>

        <section style={{ marginTop: '4rem' }}>

          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: '900', color: '#06D6A0' }}>
              Análisis de Movimiento con IA
            </h2>
            <p style={{ color: '#94A3B8' }}>
              Carga tu propia grabación para evaluar la técnica y guardarla en tu historial.
            </p>
          </div>

          {/* COMPONENTE DE FORMULARIO DE SUBIDA */}
          <AnalisisForm 
            ejercicio={ejercicioSeleccionado}
            videoUsuario={videoUsuario}
            onVideoChange={handleVideoUpload}
            onSubmit={iniciarAnalisis}
            procesando={procesando}
            error={error}
          />

          {/* COMPONENTE DE RESULTADOS DEL ANÁLISIS */}
          <ResultadoAnalisis 
            resultado={resultado} 
            ejercicioSeleccionado={ejercicioSeleccionado} 
          />

        </section>
      </main>
    </div>
  );
}


  