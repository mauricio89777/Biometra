import React, { useState, useEffect } from 'react';
import EjercicioCard from './components/EjercicioCard';
import AnalisisForm from './components/AnalisisForm';
import ResultadoAnalisis from './components/ResultadoAnalisis';
import { metadataEjercicios } from './utils/ejerciciosMetadata';

// LOGO BIOMETRA
const LogoBiometraIcon = ({ bg = '#0B132B', size = 36 }) => (
  <svg
    width={size}
    height={size}
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

    <rect width="100" height="100" rx="22" fill={bg} />

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

export default function Ejercicios({ user, onNavigate }) {
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';  
  const [registrosEjercicio, setRegistrosEjercicio] = useState([]);
  const [registroSeleccionadoId, setRegistroSeleccionadoId] = useState('');
  const [cargandoRegistros, setCargandoRegistros] = useState(false);
  const [bancoEjercicios, setBancoEjercicios] = useState([]);
  const [ejercicioSeleccionado, setEjercicioSeleccionado] = useState(null);
  const [videoUsuario, setVideoUsuario] = useState(null);
  const [procesando, setProcesando] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [error, setError] = useState(null);
  const [activeModal, setActiveModal] = useState(null);

  useEffect(() => {
    fetch(`${API_URL}/ejercicios`)
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

  useEffect(() => {
    const cargarRegistrosUsuario = async () => {
      if (!user?.id) {
        setRegistrosEjercicio([]);
        return;
      }

      setCargandoRegistros(true);

      try {
        const token = localStorage.getItem('token');

        const response = await fetch(
          `${API_URL}/sesiones/usuario/${user.id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error || 'No se pudo cargar tu historial de entrenamiento.'
          );
        }

        if (!Array.isArray(data)) {
          throw new Error('La respuesta del historial no tiene un formato válido.');
        }

        // Convertimos las sesiones en una lista de registros individuales.
        const registros = data.flatMap((sesion) =>
          (sesion.registros || []).map((registro) => ({
            ...registro,
            fechaSesion: sesion.fecha
          }))
        );

        setRegistrosEjercicio(registros);

      } catch (err) {
        console.error('Error cargando registros:', err);
        setRegistrosEjercicio([]);
        setError(err.message || 'No se pudo cargar el historial.');
      } finally {
        setCargandoRegistros(false);
      }
    };

    cargarRegistrosUsuario();
  }, [user?.id]);

  const registrosCompatibles = registrosEjercicio.filter(
    (registro) =>
      Number(registro.ejercicio_id) === Number(ejercicioSeleccionado?.id)
  );

  const registroSeleccionado = registrosCompatibles.find(
    (registro) => String(registro.id) === String(registroSeleccionadoId)
  );

  const seleccionarEjercicioPorKey = (scriptKey) => {
    const seleccionado = bancoEjercicios.find(
      (ej) => ej.script_key === scriptKey
    );
    if (!seleccionado) return;

    setEjercicioSeleccionado(seleccionado);
    setRegistroSeleccionadoId('');
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

    if (!registroSeleccionado) {
      setError('Primero debes seleccionar un registro de entrenamiento.');
      return;
    }

    if (!user?.id) {
      setError('No se pudo identificar al usuario autenticado.');
      return;
    }

    setProcesando(true);
    setResultado(null);
    setError(null);

    const formData = new FormData();

    formData.append('video', videoUsuario);
    formData.append('exercise', ejercicioSeleccionado.script_key);
    formData.append('registro_ejercicio_id', registroSeleccionado.id);

    try {
      const token = localStorage.getItem('token');

      const response = await fetch(`${API_URL}/videos/analizar`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });

      const responseText = await response.text();

      let data;

      try {
        data = JSON.parse(responseText);
      } catch {
        throw new Error(
          `Respuesta no válida del servidor: ${responseText || response.statusText}`
        );
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
        padding: '1rem 3rem',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
      }}>
        <div style={{ 
          maxWidth: '1280px', 
          margin: '0 auto', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center' 
        }}>
          {/* GRUPO IZQUIERDO: Botón Volver + Logo BIOMETRA */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <button 
              onClick={() => onNavigate?.('app')}
              style={{
                backgroundColor: 'transparent',
                color: '#06D6A0',
                border: '1px solid #06D6A0',
                padding: '0.5rem 1.1rem',
                borderRadius: '8px',
                fontWeight: '700',
                fontSize: '0.9rem',
                cursor: 'pointer'
              }}
            >
              ← Volver al Inicio
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'default' }}>
              <LogoBiometraIcon />
              <span className="brand-name" style={{ fontWeight: 'bold' }}>BIOMETRA</span>
            </div>
          </div>

          {/* GRUPO DERECHO: Botón Gimnasios/Sedes con estilo píldora + Mi Perfil */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
            <button 
              onClick={() => onNavigate?.('gps')} 
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(6, 214, 160, 0.28)';
                e.currentTarget.style.boxShadow = '0 0 15px rgba(6, 214, 160, 0.35)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(6, 214, 160, 0.14)';
                e.currentTarget.style.boxShadow = '0 0 10px rgba(6, 214, 160, 0.15)';
              }}
              style={{ 
                backgroundColor: 'rgba(6, 214, 160, 0.14)', 
                color: '#06D6A0', 
                border: '1px solid #06D6A0', 
                padding: '0.55rem 1.2rem', 
                borderRadius: '20px', 
                fontSize: '0.9rem', 
                cursor: 'pointer', 
                fontWeight: '700',
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                boxShadow: '0 0 10px rgba(6, 214, 160, 0.15)',
                transition: 'all 0.2s ease'
              }}
            >
              📍 Gimnasios/Sedes
            </button>
            <button 
              onClick={() => onNavigate?.('perfil')} 
              style={{ 
                backgroundColor: '#38BDF8', 
                color: '#0F172A', 
                padding: '0.55rem 1.2rem', 
                borderRadius: '20px', 
                fontWeight: '700', 
                border: 'none', 
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}
            >
              👤 Mi Perfil
            </button>
          </nav>
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

          {/* SELECCIÓN DEL ENTRENAMIENTO QUE SE DESEA ANALIZAR */}
          <div style={{
            marginBottom: '1.5rem',
            padding: '1.5rem',
            backgroundColor: '#1C2541',
            border: '1px solid #3A506B',
            borderRadius: '12px'
          }}>
            <label style={{
              display: 'block',
              color: '#00B4D8',
              fontWeight: '800',
              marginBottom: '0.8rem'
            }}>
              SELECCIONA TU REGISTRO DE ENTRENAMIENTO:
            </label>

            {cargandoRegistros ? (
              <p style={{ color: '#94A3B8' }}>
                Cargando tu historial...
              </p>
            ) : registrosCompatibles.length === 0 ? (
              <p style={{ color: '#FBBF24' }}>
                No tienes registros de este ejercicio. Primero debes registrarlo
                desde tu panel de entrenamiento.
              </p>
            ) : (
              <select
                value={registroSeleccionadoId}
                onChange={(e) => {
                  setRegistroSeleccionadoId(e.target.value);
                  setResultado(null);
                  setError(null);
                }}
                style={{
                  width: '100%',
                  padding: '0.9rem',
                  backgroundColor: '#0B132B',
                  color: '#FFFFFF',
                  border: '1px solid #06D6A0',
                  borderRadius: '8px',
                  fontSize: '1rem'
                }}
              >
                <option value="">Selecciona un entrenamiento...</option>

                {registrosCompatibles.map((registro) => (
                  <option key={registro.id} value={registro.id}>
                    Registro #{registro.id} — {
                      new Date(registro.fechaSesion).toLocaleDateString()
                    }
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* COMPONENTE DE FORMULARIO DE SUBIDA */}
          <AnalisisForm 
            ejercicio={ejercicioSeleccionado}
            registroSeleccionado={registroSeleccionado}
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

      {/* FOOTER INTERACTIVO */}
      <footer style={{
        backgroundColor: '#080D1A',
        padding: '2.5rem 3.5rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        flexWrap: 'wrap',
        gap: '2rem',
        boxSizing: 'border-box',
        width: '100%'
      }}>
        <div>
          <div
            style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', cursor: 'default', marginBottom: '0.9rem' }}
          >
            <LogoBiometraIcon bg="#020617" size={40} />
            <span style={{
              fontSize: '1.9rem',
              fontWeight: '900',
              letterSpacing: '0.08em',
              background: 'linear-gradient(90deg, #06D6A0, #00B4D8)',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              color: 'transparent'
            }}>
              BIOMETRA
            </span>
          </div>
          <p style={{ margin: 0, color: '#94A3B8', fontSize: '1rem' }}>
            Ciencia y tecnología aplicada a la técnica de levantamiento.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '3.5rem', flexWrap: 'wrap' }}>
          <div>
            <h4 style={{ margin: '0 0 1rem 0', color: '#06D6A0', fontSize: '1.2rem', fontWeight: '800' }}>Plataforma</h4>
            <p
              onClick={() => onNavigate && onNavigate('ejercicios')}
              style={{ margin: '0 0 0.7rem 0', color: '#94A3B8', fontSize: '1.05rem', cursor: 'pointer' }}
            >
              Entrenamiento y Análisis
            </p>
            <p
              onClick={() => onNavigate && onNavigate('gps')}
              style={{ margin: 0, color: '#94A3B8', fontSize: '1.05rem', cursor: 'pointer' }}
            >
              Gimnasios Adheridos
            </p>
          </div>
          <div>
            <h4 style={{ margin: '0 0 1rem 0', color: '#00B4D8', fontSize: '1.2rem', fontWeight: '800' }}>Soporte & Legal</h4>
            <p
              onClick={() => setActiveModal('soporte')}
              style={{ margin: '0 0 0.7rem 0', color: '#94A3B8', fontSize: '1.05rem', cursor: 'pointer' }}
            >
              Contacto / Soporte
            </p>
            <p
              onClick={() => setActiveModal('terminos')}
              style={{ margin: 0, color: '#94A3B8', fontSize: '1.05rem', cursor: 'pointer' }}
            >
              Términos del Servicio
            </p>
          </div>
        </div>
      </footer>

      {/* MODAL INTERACTIVO DE SOPORTE Y TÉRMINOS LEGALES */}
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
                  <p>Queda strictly prohibida la ingeniería inversa, descompilación, extracción de modelos de aprendizaje profundo o redistribución no autorizada del código fuente, interfaces visuales, iso-logotipos o algoritmos propios de la plataforma Biometra. Todos los derechos quedan reservados.</p>

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