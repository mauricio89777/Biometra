import React from 'react';

export default function ResultadoAnalisis({ resultado, ejercicioSeleccionado }) {
  if (!resultado) return null;

  const dataAnalisis = resultado.analisis || resultado.datos || resultado;
  const puntuacionRaw = dataAnalisis.puntuacion ?? resultado.puntuacion ?? 85;
  const puntuacionVal = typeof puntuacionRaw === 'object' ? (puntuacionRaw.global ?? 85) : puntuacionRaw;
  
  const feedbackVal = dataAnalisis.feedback ?? resultado.feedback ?? [];
  const repeticionesVal = dataAnalisis.repeticiones ?? resultado.repeticiones ?? 0;
  const fpsVal = dataAnalisis.fps ?? resultado.fps ?? 30;

  const videoFinal = (typeof resultado.video_procesado === 'string' ? resultado.video_procesado : null) || 
         (typeof resultado.video_procesado_h264 === 'string' ? resultado.video_procesado_h264 : null);

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
          ✨ Análisis Biomecánico Completado y Guardado
        </h3>
        <span style={{ backgroundColor: 'rgba(6, 214, 160, 0.25)', color: '#06D6A0', padding: '0.5rem 1.2rem', borderRadius: '25px', fontWeight: 'bold', fontSize: '1.1rem' }}>
          Puntuación: {puntuacionVal} / 100
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2.5rem', alignItems: 'start' }}>
        
        <div>
          <h4 style={{ color: '#00B4D8', marginBottom: '0.8rem', fontSize: '1.1rem' }}>🎥 Video con Esqueleto Anotado:</h4>
          {videoFinal ? (
            <div style={{ borderRadius: '14px', overflow: 'hidden', backgroundColor: '#000', aspectRatio: '16/9', border: '1px solid #3A506B' }}>
              <video 
                controls 
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                src={`http://localhost:3000/videos/stream?path=${encodeURIComponent(videoFinal)}`}
              />
            </div>
          ) : (
            <p style={{ color: '#94A3B8', fontSize: '0.9rem' }}>No se encontró la ruta del video procesado.</p>
          )}
        </div>

        <div>
          <h4 style={{ color: '#00B4D8', marginBottom: '0.8rem', fontSize: '1.1rem' }}>📊 Métricas de Ejecución:</h4>
          <div style={{ backgroundColor: '#0B132B', padding: '1.2rem', borderRadius: '12px', marginBottom: '1.5rem', border: '1px solid #3A506B' }}>
            <p style={{ color: '#CBD5E1', margin: '0.4rem 0' }}><strong>Ejercicio:</strong> {ejercicioSeleccionado?.nombre}</p>
            <p style={{ color: '#CBD5E1', margin: '0.4rem 0' }}><strong>Repeticiones:</strong> {Array.isArray(repeticionesVal) ? repeticionesVal.length : repeticionesVal}</p>
            <p style={{ color: '#CBD5E1', margin: '0.4rem 0' }}><strong>FPS:</strong> {Number(fpsVal).toFixed(1)}</p>
          </div>

          <h4 style={{ color: '#00B4D8', marginBottom: '0.8rem', fontSize: '1.1rem' }}>💡 Feedback:</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', maxHeight: '320px', overflowY: 'auto' }}>
            {Array.isArray(feedbackVal) && feedbackVal.length > 0 ? (
              feedbackVal.map((item, idx) => (
                <div key={idx} style={{ backgroundColor: '#0B132B', padding: '1.1rem', borderRadius: '12px', borderLeft: `4px solid ${item.nivel === 'aviso' ? '#F7931A' : '#06D6A0'}`, border: '1px solid #3A506B' }}>
                  <p style={{ color: '#FFFFFF', margin: '0 0 0.6rem 0', fontSize: '0.95rem' }}>{item.mensaje}</p>
                </div>
              ))
            ) : (
              <p style={{ color: '#CBD5E1' }}>Buena técnica general registrada.</p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}