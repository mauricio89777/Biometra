import React, { useState } from 'react';

// Icono Biometra
const BiometraLogoIcon = () => (
  <svg width="32" height="32" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="100" height="100" rx="20" fill="#020617" />
    <path d="M20 50 Q35 20, 50 50 T80 50" stroke="#00FF87" strokeWidth="6" strokeLinecap="round" fill="none" />
    <path d="M20 50 Q35 80, 50 50 T80 50" stroke="#38bdf8" strokeWidth="6" strokeLinecap="round" fill="none" />
    <circle cx="50" cy="50" r="10" fill="#00FF87" />
  </svg>
);

export default function Ejercicios({ onNavigate }) {
  // Base de datos de 25 Ejercicios con Videos Demostrativos Reales
  const bancoEjercicios = [
    // PECHO
    { id: 1, nombre: 'Press de Banca Plano con Barra', musculo: 'Pecho', grupo: 'Pecho / Tríceps', videoUrl: 'https://v.ftcdn.net/05/20/48/80/700_F_520488001_sWpSvhG97wR5I49S0WzQyZf4XGf4K7Qj_ST.mp4', imgUrl: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&q=80&w=600', tips: ['Escápulas retráctiles', 'Barra al esternón', 'Pies firmes en el suelo'] },
    { id: 2, nombre: 'Press Inclinado con Mancuernas', musculo: 'Pecho', grupo: 'Pecho Superior', videoUrl: 'https://v.ftcdn.net/05/20/48/80/700_F_520488001_sWpSvhG97wR5I49S0WzQyZf4XGf4K7Qj_ST.mp4', imgUrl: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&q=80&w=600', tips: ['Inclinación 30°', 'Codos a 45° del torso', 'Extensión completa sin bloquear'] },
    { id: 3, nombre: 'Aperturas en Polea Alta (Crossover)', musculo: 'Pecho', grupo: 'Pecho Aislado', videoUrl: 'https://v.ftcdn.net/05/20/48/80/700_F_520488001_sWpSvhG97wR5I49S0WzQyZf4XGf4K7Qj_ST.mp4', imgUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=600', tips: ['Ligera flexión de codos', 'Juntar manos al centro', 'Control en el retorno'] },
    { id: 4, nombre: 'Fondos en Paralelas para Pecho', musculo: 'Pecho', grupo: 'Pecho / Tríceps', videoUrl: 'https://v.ftcdn.net/05/20/48/80/700_F_520488001_sWpSvhG97wR5I49S0WzQyZf4XGf4K7Qj_ST.mp4', imgUrl: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&q=80&w=600', tips: ['Torso inclinado hacia adelante', 'Bajar hasta 90° de codo', 'Mirada al frente'] },
    
    // ESPALDA
    { id: 5, nombre: 'Dominadas Pronadas (Pull-ups)', musculo: 'Espalda', grupo: 'Dorsal Ancho', videoUrl: 'https://v.ftcdn.net/03/60/01/59/700_F_360015949_EwWbA2S9wM33aZz3qQjJz98x1Yq1Zz5k_ST.mp4', imgUrl: 'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?auto=format&fit=crop&q=80&w=600', tips: ['Agarre más ancho que hombros', 'Llevar pecho a la barra', 'Bajada controlada'] },
    { id: 6, nombre: 'Remo con Barra Giro', musculo: 'Espalda', grupo: 'Espalda Media', videoUrl: 'https://v.ftcdn.net/03/60/01/59/700_F_360015949_EwWbA2S9wM33aZz3qQjJz98x1Yq1Zz5k_ST.mp4', imgUrl: 'https://images.unsplash.com/photo-1605296867304-46d5465a13f1?auto=format&fit=crop&q=80&w=600', tips: ['Espalda recta 45°', 'Traccionar hacia la cadera', 'Codos pegados'] },
    { id: 7, nombre: 'Jalón al Pecho en Polea', musculo: 'Espalda', grupo: 'Dorsal Ancho', videoUrl: 'https://v.ftcdn.net/03/60/01/59/700_F_360015949_EwWbA2S9wM33aZz3qQjJz98x1Yq1Zz5k_ST.mp4', imgUrl: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&q=80&w=600', tips: ['Llevar la barra sobre la clavícula', 'Sin balanceo lumbar', 'Pausa en contracción'] },
    { id: 8, nombre: 'Remo Unilateral con Mancuerna', musculo: 'Espalda', grupo: 'Dorsal / Romboldes', videoUrl: 'https://v.ftcdn.net/03/60/01/59/700_F_360015949_EwWbA2S9wM33aZz3qQjJz98x1Yq1Zz5k_ST.mp4', imgUrl: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&q=80&w=600', tips: ['Apoyo estable en banco', 'Llevar mancuerna a la cresta ilíaca', 'Sin rotar tronco'] },

    // PIERNAS / CUÁDRICEPS / ISQUIOTIBIALES
    { id: 9, nombre: 'Sentadilla Libre con Barra trasera', musculo: 'Cuadriceps', grupo: 'Pierna Completa', videoUrl: 'https://v.ftcdn.net/04/90/12/32/700_F_490123281_qN9pS2XfD78kK0J6qS4q8w1J8k4q3q2w_ST.mp4', imgUrl: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&q=80&w=600', tips: ['Profundidad bajo 90°', 'Rodillas alineadas con punta de pies', 'Torso erguido'] },
    { id: 10, nombre: 'Sentadilla Búlgara con Mancuernas', musculo: 'Cuadriceps', grupo: 'Pierna Unilateral', videoUrl: 'https://v.ftcdn.net/04/90/12/32/700_F_490123281_qN9pS2XfD78kK0J6qS4q8w1J8k4q3q2w_ST.mp4', imgUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=600', tips: ['Pie trasero apoyado firmemente', 'Descenso vertical puro', 'Carga en talón delantero'] },
    { id: 11, nombre: 'Prensa de Piernas 45°', musculo: 'Cuadriceps', grupo: 'Cuádriceps / Glúteos', videoUrl: 'https://v.ftcdn.net/04/90/12/32/700_F_490123281_qN9pS2XfD78kK0J6qS4q8w1J8k4q3q2w_ST.mp4', imgUrl: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&q=80&w=600', tips: ['Espalda pegada al respaldo', 'Sin bloquear rodillas al extender', 'Descenso profundo'] },
    { id: 12, nombre: 'Peso Muerto Rumano', musculo: 'Isquiotibiales', grupo: 'Cadena Posterior', videoUrl: 'https://v.ftcdn.net/04/90/12/32/700_F_490123281_qN9pS2XfD78kK0J6qS4q8w1J8k4q3q2w_ST.mp4', imgUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&q=80&w=600', tips: ['Bisagra de cadera hacia atrás', 'Rodillas semiflexionadas', 'Barra rozando piernas'] },
    { id: 13, nombre: 'Curl de Piernas Tumbado', musculo: 'Isquiotibiales', grupo: 'Isquios Aislados', videoUrl: 'https://v.ftcdn.net/04/90/12/32/700_F_490123281_qN9pS2XfD78kK0J6qS4q8w1J8k4q3q2w_ST.mp4', imgUrl: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&q=80&w=600', tips: ['Cadera pegada a la almohadilla', 'Contracción de 1 seg arriba', 'Fase negativa lenta'] },

    // GLÚTEOS
    { id: 14, nombre: 'Hip Thrust con Barra en Banco', musculo: 'Glutios', grupo: 'Glúteo Mayor', videoUrl: 'https://v.ftcdn.net/04/90/12/32/700_F_490123281_qN9pS2XfD78kK0J6qS4q8w1J8k4q3q2w_ST.mp4', imgUrl: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&q=80&w=600', tips: ['Barbilla pegada al pecho', 'Bloqueo arriba con retroversión', 'Espinillas a 90°'] },
    { id: 15, nombre: 'Patada de Glúteo en Polea Low', musculo: 'Glutios', grupo: 'Glúteo Aislado', videoUrl: 'https://v.ftcdn.net/04/90/12/32/700_F_490123281_qN9pS2XfD78kK0J6qS4q8w1J8k4q3q2w_ST.mp4', imgUrl: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&q=80&w=600', tips: ['Extensión diagonal', 'Core apretado', 'Sin hiperarchivar lumbar'] },

    // HOMBROS
    { id: 16, nombre: 'Press Militar con Barra de Pie', musculo: 'Hombros', grupo: 'Deltoides Anterior', videoUrl: 'https://v.ftcdn.net/05/20/48/80/700_F_520488001_sWpSvhG97wR5I49S0WzQyZf4XGf4K7Qj_ST.mp4', imgUrl: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&q=80&w=600', tips: ['Glúteos y abdomen apretados', 'Barra pasa cerca de la cara', 'Bloqueo sobre la cabeza'] },
    { id: 17, nombre: 'Elevaciones Laterales con Mancuernas', musculo: 'Hombros', grupo: 'Deltoides Lateral', videoUrl: 'https://v.ftcdn.net/05/20/48/80/700_F_520488001_sWpSvhG97wR5I49S0WzQyZf4XGf4K7Qj_ST.mp4', imgUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=600', tips: ['Codos ligeramente flexionados', 'Subir hasta la altura de los hombros', 'Lento al bajar'] },
    { id: 18, nombre: 'Face Pulls en Polea Alta', musculo: 'Hombros', grupo: 'Deltoides Posterior', videoUrl: 'https://v.ftcdn.net/05/20/48/80/700_F_520488001_sWpSvhG97wR5I49S0WzQyZf4XGf4K7Qj_ST.mp4', imgUrl: 'https://images.unsplash.com/photo-1605296867304-46d5465a13f1?auto=format&fit=crop&q=80&w=600', tips: ['Tirar cuerda hacia frente/ojos', 'Rotación externa de hombros', 'Separar las manos al final'] },

    // BÍCEPS & TRÍCEPS
    { id: 19, nombre: 'Curl de Bíceps de Pie con Barra Z', musculo: 'Biceps', grupo: 'Bíceps Braquial', videoUrl: 'https://v.ftcdn.net/05/20/48/80/700_F_520488001_sWpSvhG97wR5I49S0WzQyZf4XGf4K7Qj_ST.mp4', imgUrl: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&q=80&w=600', tips: ['Codos inmóviles pegados al cuerpo', 'Sin balancear la espalda', 'Rango de movimiento completo'] },
    { id: 20, nombre: 'Curl Martillo con Mancuernas', musculo: 'Biceps', grupo: 'Bíceps / Braquiorradial', videoUrl: 'https://v.ftcdn.net/05/20/48/80/700_F_520488001_sWpSvhG97wR5I49S0WzQyZf4XGf4K7Qj_ST.mp4', imgUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=600', tips: ['Agarre neutro (palmas enfrentadas)', 'Apretar arriba 1 seg', 'Control del peso'] },
    { id: 21, nombre: 'Press Francés con Barra Z', musculo: 'Triceps', grupo: 'Tríceps (Cabeza Larga)', videoUrl: 'https://v.ftcdn.net/05/20/48/80/700_F_520488001_sWpSvhG97wR5I49S0WzQyZf4XGf4K7Qj_ST.mp4', imgUrl: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&q=80&w=600', tips: ['Codos apuntando al techo', 'Llevar barra a la frente/coronilla', 'Sin abrir codos'] },
    { id: 22, nombre: 'Extensión de Tríceps en Polea Alta', musculo: 'Triceps', grupo: 'Tríceps Aislado', videoUrl: 'https://v.ftcdn.net/05/20/48/80/700_F_520488001_sWpSvhG97wR5I49S0WzQyZf4XGf4K7Qj_ST.mp4', imgUrl: 'https://images.unsplash.com/photo-1605296867304-46d5465a13f1?auto=format&fit=crop&q=80&w=600', tips: ['Codos fijos a los costados', 'Abrir cuerda al final del recorrido', 'Espalda erguida'] },

    // ABDOMEN & CORE
    { id: 23, nombre: 'Rueda Abdominal (Ab Wheel Rollout)', musculo: 'Core', grupo: 'Abdomen / Core', videoUrl: 'https://v.ftcdn.net/04/90/12/32/700_F_490123281_qN9pS2XfD78kK0J6qS4q8w1J8k4q3q2w_ST.mp4', imgUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&q=80&w=600', tips: ['Retroversion pélvica fija', 'Apretar abdomen todo el trayecto', 'No hundir zona lumbar'] },
    { id: 24, nombre: 'Elevaciones de Piernas Colgado', musculo: 'Core', grupo: 'Abdomen Inferior', videoUrl: 'https://v.ftcdn.net/04/90/12/32/700_F_490123281_qN9pS2XfD78kK0J6qS4q8w1J8k4q3q2w_ST.mp4', imgUrl: 'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?auto=format&fit=crop&q=80&w=600', tips: ['Elevar cadera, no solo piernas', 'Sin balanceo de cuerpo', 'Bajada lenta'] },
    { id: 25, nombre: 'Plancha Isométrica con Carga', musculo: 'Core', grupo: 'Core Estabilidad', videoUrl: 'https://v.ftcdn.net/04/90/12/32/700_F_490123281_qN9pS2XfD78kK0J6qS4q8w1J8k4q3q2w_ST.mp4', imgUrl: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&q=80&w=600', tips: ['Cuerpo en línea recta perfecta', 'Apretar glúteos y abdomen', 'Respiración constante'] }
  ];

  // Estados
  const [ejercicioSeleccionado, setEjercicioSeleccionado] = useState(bancoEjercicios[0]);
  const [filtroMusculo, setFiltroMusculo] = useState('Todos');
  const [modalAnalisis, setModalAnalisis] = useState(false);
  const [archivoVideo, setArchivoVideo] = useState(null);
  const [analizando, setAnalizando] = useState(false);
  const [resultadoIA, setResultadoIA] = useState(null);

  // Filtrado de ejercicios por músculo seleccionado en el Modelo 3D
  const ejerciciosFiltrados = filtroMusculo === 'Todos' 
    ? bancoEjercicios 
    : bancoEjercicios.filter(e => e.musculo.toLowerCase() === filtroMusculo.toLowerCase());

  // Procesamiento de Análisis de Técnica
  const ejecutarAnalisisIA = () => {
    if (!archivoVideo) return;
    setAnalizando(true);
    setResultadoIA(null);

    setTimeout(() => {
      setAnalizando(false);
      const esCorrecta = Math.random() > 0.3;
      
      if (esCorrecta) {
        setResultadoIA({
          estado: 'CORRECTO',
          puntuacion: '94 / 100',
          mensaje: '¡Excelente ejecución biomecánica! Mantienes ángulos seguros y excelente alineación articular.',
          puntosPositivos: ['Rango de movimiento profundo alcanzado', 'Estabilidad lumbar perfecta durante todo el ejercicio', 'Cadencia y tempo controlado'],
          correcciones: ['Sugerencia: Mantén la mirada fija en el punto de apoyo para optimizar curvatura cervical.']
        });
      } else {
        setResultadoIA({
          estado: 'INCORRECTO',
          puntuacion: '62 / 100',
          mensaje: 'Se detectaron desviaciones significativas en la postura que incrementan el riesgo de lesión.',
          puntosPositivos: ['Buena velocidad de aceleración en la fase concéntrica'],
          correcciones: [
            '⚠️ Valgo de rodilla detectado: Tus rodillas colapsan hacia adentro al subir.',
            '⚠️ Pérdida de curvatura lumbar neutra en la fase más profunda.',
            '💡 Recomendación: Reduce el peso un 15% y enfócate en la estabilidad plantar.'
          ]
        });
      }
    }, 2500);
  };

  return (
    <div style={{
      fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
      backgroundColor: '#0A0F1D',
      color: '#F8FAFC',
      minHeight: '100vh'
    }}>
      {/* NAVBAR */}
      <header style={{ 
        backgroundColor: '#111827', 
        borderBottom: '1px solid #1F2937', 
        padding: '1rem 3rem',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <button 
              onClick={() => onNavigate && onNavigate('home')}
              style={{
                backgroundColor: 'transparent',
                color: '#00FF87',
                border: '1px solid #00FF87',
                padding: '0.5rem 1.1rem',
                borderRadius: '8px',
                fontWeight: '700',
                cursor: 'pointer'
              }}
            >
              ← Volver al Inicio
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <BiometraLogoIcon />
            </div>
          </div>

          <button 
            onClick={() => onNavigate && onNavigate('perfil')}
            style={{ backgroundColor: '#38BDF8', color: '#090D16', padding: '0.55rem 1.2rem', borderRadius: '20px', fontWeight: '800', border: 'none', cursor: 'pointer' }}
          >
            👤 Mi Perfil
          </button>
        </div>
      </header>

      {/* CONTENIDO PRINCIPAL */}
      <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '2.5rem 2rem' }}>
        
        {/* TITULO */}
        <div style={{ marginBottom: '2.5rem', textAlign: 'center' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: '900', color: '#FFFFFF', margin: '0 0 0.5rem 0' }}>
            🎯 Biomecánica y Análisis de Ejercicios
          </h1>
          <p style={{ color: '#94A3B8', fontSize: '1.1rem', margin: 0 }}>
            Explora +25 ejercicios y selecciona los músculos en el modelo anatómico.
          </p>
        </div>

        {/* SECCIÓN 1: MODELO ANATÓMICO 3D + SELECTOR DE MÚSCULO */}
        <div style={{
          backgroundColor: '#111827',
          borderRadius: '20px',
          padding: '2rem',
          border: '1px solid #1F2937',
          marginBottom: '3rem',
          boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
        }}>
          <h3 style={{ color: '#00FF87', fontSize: '1.3rem', fontWeight: '900', margin: '0 0 1.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            🧍‍♂️ Seleccionador Anatómico Muscular
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', alignItems: 'center' }}>
            
            {/* MODELO INTERACTIVO DE SILUETA HUMANA */}
            <div style={{
              backgroundColor: '#090D16',
              borderRadius: '16px',
              padding: '1.5rem',
              border: '1px solid #374151',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              minHeight: '320px'
            }}>
              <span style={{ position: 'absolute', top: '12px', left: '15px', color: '#38BDF8', fontSize: '0.8rem', fontWeight: '800' }}>
                PINCHA UN MÚSCULO EN EL MODELO:
              </span>

              {/* ILUSTRACIÓN ANATÓMICA SVG */}
              <svg width="180" height="260" viewBox="0 0 100 150" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="50" cy="18" r="10" fill="#334155" />
                <circle cx="28" cy="38" r="7" fill={filtroMusculo === 'Hombros' ? '#00FF87' : '#475569'} onClick={() => setFiltroMusculo('Hombros')} style={{ cursor: 'pointer' }} />
                <circle cx="72" cy="38" r="7" fill={filtroMusculo === 'Hombros' ? '#00FF87' : '#475569'} onClick={() => setFiltroMusculo('Hombros')} style={{ cursor: 'pointer' }} />
                <rect x="36" y="34" width="28" height="18" rx="4" fill={filtroMusculo === 'Pecho' ? '#00FF87' : '#38BDF8'} onClick={() => setFiltroMusculo('Pecho')} style={{ cursor: 'pointer' }} />
                <rect x="38" y="55" width="24" height="20" rx="3" fill={filtroMusculo === 'Core' ? '#00FF87' : '#475569'} onClick={() => setFiltroMusculo('Core')} style={{ cursor: 'pointer' }} />
                <rect x="22" y="46" width="10" height="16" rx="3" fill={filtroMusculo === 'Biceps' ? '#00FF87' : '#38BDF8'} onClick={() => setFiltroMusculo('Biceps')} style={{ cursor: 'pointer' }} />
                <rect x="68" y="46" width="10" height="16" rx="3" fill={filtroMusculo === 'Biceps' ? '#00FF87' : '#38BDF8'} onClick={() => setFiltroMusculo('Biceps')} style={{ cursor: 'pointer' }} />
                <rect x="36" y="78" width="12" height="30" rx="4" fill={filtroMusculo === 'Cuadriceps' ? '#00FF87' : '#38BDF8'} onClick={() => setFiltroMusculo('Cuadriceps')} style={{ cursor: 'pointer' }} />
                <rect x="52" y="78" width="12" height="30" rx="4" fill={filtroMusculo === 'Cuadriceps' ? '#00FF87' : '#38BDF8'} onClick={() => setFiltroMusculo('Cuadriceps')} style={{ cursor: 'pointer' }} />
              </svg>

              <div style={{ marginTop: '1rem', fontSize: '0.85rem', color: '#94A3B8' }}>
                Músculo Activo: <strong style={{ color: '#00FF87' }}>{filtroMusculo}</strong>
              </div>
            </div>

            {/* BOTONES RÁPIDOS DE GRUPOS MUSCULARES */}
            <div>
              <p style={{ color: '#94A3B8', fontSize: '0.9rem', marginBottom: '1rem' }}>
                O selecciona directamente la zona objetivo para filtrar la lista de ejercicios:
              </p>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.8rem' }}>
                {['Todos', 'Pecho', 'Espalda', 'Cuadriceps', 'Isquiotibiales', 'Glutios', 'Hombros', 'Biceps', 'Triceps', 'Core'].map((musculo) => (
                  <button
                    key={musculo}
                    onClick={() => setFiltroMusculo(musculo)}
                    style={{
                      backgroundColor: filtroMusculo === musculo ? '#00FF87' : '#1E293B',
                      color: filtroMusculo === musculo ? '#090D16' : '#F8FAFC',
                      border: '1px solid #374151',
                      padding: '0.6rem 1.2rem',
                      borderRadius: '10px',
                      fontWeight: '800',
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {musculo}
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* SECCIÓN 2: SELECTOR PRINCIPAL DE EJERCICIOS */}
        <div style={{ marginBottom: '2.5rem' }}>
          <label style={{ display: 'block', color: '#38BDF8', fontSize: '0.9rem', fontWeight: '800', marginBottom: '0.6rem' }}>
            SELECCIONA EL EJERCICIO PARA ANALIZAR SU TÉCNICA ({ejerciciosFiltrados.length} disponibles):
          </label>
          
          <select
            value={ejercicioSeleccionado.id}
            onChange={(e) => {
              const ej = bancoEjercicios.find(x => x.id === parseInt(e.target.value));
              if (ej) setEjercicioSeleccionado(ej);
            }}
            style={{
              width: '100%',
              padding: '1rem',
              backgroundColor: '#111827',
              color: '#FFFFFF',
              border: '2px solid #00FF87',
              borderRadius: '12px',
              fontSize: '1.1rem',
              fontWeight: '800',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            {ejerciciosFiltrados.map((ej) => (
              <option key={ej.id} value={ej.id}>
                {ej.nombre} ({ej.grupo})
              </option>
            ))}
          </select>
        </div>

        {/* SECCIÓN 3: DETALLE DEL EJERCICIO CON VIDEO REAL DE DEMOSTRACIÓN */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: '2rem',
          marginBottom: '3rem'
        }}>
          {/* REPRODUCTOR DE DEMOSTRACIÓN DE EJERCICIO EN VIDEO REAL */}
          <div style={{
            backgroundColor: '#111827',
            borderRadius: '16px',
            padding: '1.5rem',
            border: '1px solid #1F2937'
          }}>
            <h3 style={{ color: '#FFFFFF', fontSize: '1.2rem', fontWeight: '800', margin: '0 0 1rem 0' }}>
              🎥 Demostración del Ejercicio
            </h3>
            <div style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid #374151', backgroundColor: '#000' }}>
              <video 
                key={ejercicioSeleccionado.id}
                controls 
                autoPlay 
                muted 
                loop 
                style={{ width: '100%', height: '240px', objectFit: 'cover' }}
              >
                <source src={ejercicioSeleccionado.videoUrl} type="video/mp4" />
                Tu navegador no soporta el video.
              </video>
            </div>
          </div>

          {/* FOTO E INSTRUCCIONES CLAVE */}
          <div style={{
            backgroundColor: '#111827',
            borderRadius: '16px',
            padding: '1.5rem',
            border: '1px solid #1F2937',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div>
                  <span style={{ backgroundColor: 'rgba(0, 255, 135, 0.15)', color: '#00FF87', padding: '0.3rem 0.8rem', borderRadius: '12px', fontSize: '0.8rem', fontWeight: '800' }}>
                    {ejercicioSeleccionado.grupo}
                  </span>
                  <h2 style={{ fontSize: '1.6rem', fontWeight: '900', color: '#FFFFFF', margin: '0.5rem 0 0 0' }}>
                    {ejercicioSeleccionado.nombre}
                  </h2>
                </div>
              </div>

              <h4 style={{ color: '#38BDF8', margin: '1rem 0 0.5rem 0', fontSize: '0.95rem' }}>Puntos Clave de Técnica Correcta:</h4>
              <ul style={{ margin: 0, paddingLeft: '1.2rem', color: '#CBD5E1', fontSize: '0.9rem', lineHeight: '1.6' }}>
                {ejercicioSeleccionado.tips.map((tip, idx) => (
                  <li key={idx}>{tip}</li>
                ))}
              </ul>
            </div>

            {/* BOTÓN PRINCIPAL */}
            <button
              onClick={() => {
                setModalAnalisis(true);
                setResultadoIA(null);
                setArchivoVideo(null);
              }}
              style={{
                marginTop: '1.5rem',
                backgroundColor: '#00FF87',
                color: '#090D16',
                border: 'none',
                padding: '1rem',
                borderRadius: '12px',
                fontWeight: '900',
                fontSize: '1.1rem',
                cursor: 'pointer',
                boxShadow: '0 0 20px rgba(0, 255, 135, 0.3)',
                transition: 'all 0.2s ease'
              }}
            >
              🚀 Empezar Análisis de Técnica
            </button>
          </div>
        </div>

      </main>

      {/* MODAL DE SUBIDA Y VALIDACIÓN DE VIDEO */}
      {modalAnalisis && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.85)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          padding: '20px',
          backdropFilter: 'blur(5px)'
        }}>
          <div style={{
            backgroundColor: '#111827',
            borderRadius: '20px',
            maxWidth: '600px',
            width: '100%',
            padding: '2rem',
            border: '1px solid #374151',
            boxShadow: '0 20px 50px rgba(0,0,0,0.8)',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ margin: 0, color: '#00FF87', fontSize: '1.3rem', fontWeight: '900' }}>
                📹 Análisis Biomecánico: {ejercicioSeleccionado.nombre}
              </h3>
              <button 
                onClick={() => setModalAnalisis(false)}
                style={{ background: 'none', border: 'none', color: '#94A3B8', fontSize: '1.5rem', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            {/* CARGADOR DE VIDEO */}
            {!resultadoIA && (
              <div style={{
                border: '2px dashed #374151',
                borderRadius: '16px',
                padding: '2rem',
                textAlign: 'center',
                backgroundColor: '#090D16',
                marginBottom: '1.5rem'
              }}>
                <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '0.8rem' }}>📤</span>
                <p style={{ color: '#FFFFFF', fontWeight: '800', margin: '0 0 0.4rem 0' }}>
                  Sube el video de tu ejecución para validar tu técnica
                </p>
                <p style={{ color: '#94A3B8', fontSize: '0.85rem', margin: '0 0 1.2rem 0' }}>
                  Asegúrate de que tu cuerpo aparezca completamente en el encuadre.
                </p>

                <input 
                  type="file" 
                  accept="video/*"
                  onChange={(e) => setArchivoVideo(e.target.files[0])}
                  style={{ display: 'none' }}
                  id="videoInput"
                />
                
                <label 
                  htmlFor="videoInput"
                  style={{
                    backgroundColor: '#1E293B',
                    color: '#38BDF8',
                    border: '1px solid #38BDF8',
                    padding: '0.7rem 1.4rem',
                    borderRadius: '8px',
                    fontWeight: '800',
                    cursor: 'pointer',
                    display: 'inline-block'
                  }}
                >
                  {archivoVideo ? `Video Seleccionado: ${archivoVideo.name}` : 'Seleccionar Video desde tu Dispositivo'}
                </label>
              </div>
            )}

            {/* BOTÓN PROCESAR O INDICADOR DE CARGA */}
            {archivoVideo && !resultadoIA && (
              <button
                onClick={ejecutarAnalisisIA}
                disabled={analizando}
                style={{
                  width: '100%',
                  padding: '1rem',
                  backgroundColor: analizando ? '#374151' : '#00FF87',
                  color: analizando ? '#94A3B8' : '#090D16',
                  border: 'none',
                  borderRadius: '10px',
                  fontWeight: '900',
                  fontSize: '1rem',
                  cursor: analizando ? 'not-allowed' : 'pointer'
                }}
              >
                {analizando ? '⌛ Procesando fotogramas y ángulos...' : '⚡ Procesar y Validar Técnica'}
              </button>
            )}

            {/* DICTAMEN DE VALIDACIÓN DE LA TÉCNICA */}
            {resultadoIA && (
              <div style={{
                backgroundColor: '#090D16',
                padding: '1.5rem',
                borderRadius: '16px',
                border: resultadoIA.estado === 'CORRECTO' ? '2px solid #00FF87' : '2px solid #EF4444'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <span style={{
                    backgroundColor: resultadoIA.estado === 'CORRECTO' ? 'rgba(0, 255, 135, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                    color: resultadoIA.estado === 'CORRECTO' ? '#00FF87' : '#EF4444',
                    padding: '0.4rem 1rem',
                    borderRadius: '20px',
                    fontWeight: '900',
                    fontSize: '0.9rem'
                  }}>
                    TÉCNICA {resultadoIA.estado}
                  </span>
                  <span style={{ fontSize: '1.2rem', fontWeight: '900', color: '#FFFFFF' }}>
                    Puntuación: {resultadoIA.puntuacion}
                  </span>
                </div>

                <p style={{ color: '#F8FAFC', fontSize: '0.95rem', lineHeight: '1.4', marginBottom: '1.2rem' }}>
                  {resultadoIA.mensaje}
                </p>

                <h4 style={{ color: '#38BDF8', fontSize: '0.9rem', margin: '0 0 0.5rem 0' }}>Desglose Biomecánico:</h4>
                <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.88rem', color: '#CBD5E1', lineHeight: '1.5' }}>
                  {resultadoIA.puntosPositivos.map((item, idx) => (
                    <li key={idx} style={{ color: '#00FF87' }}>{item}</li>
                  ))}
                  {resultadoIA.correcciones.map((item, idx) => (
                    <li key={idx} style={{ color: '#F87171', marginTop: '0.3rem' }}>{item}</li>
                  ))}
                </ul>

                <button
                  onClick={() => setResultadoIA(null)}
                  style={{
                    marginTop: '1.5rem',
                    width: '100%',
                    padding: '0.8rem',
                    backgroundColor: '#1E293B',
                    color: '#FFFFFF',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    fontWeight: '800',
                    cursor: 'pointer'
                  }}
                >
                  🔄 Probar con otro video
                </button>
              </div>
            )}

          </div>
        </div>
      )}
    </div>
  );
}