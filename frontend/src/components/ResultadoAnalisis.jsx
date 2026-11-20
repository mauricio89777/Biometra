
import React, { useEffect, useState } from 'react';
import { videoService } from '../services/videoService';

export default function ResultadoAnalisis({ resultado, ejercicioSeleccionado }) {
  const [videoUrl, setVideoUrl] = useState('');
  const [cargandoVideo, setCargandoVideo] = useState(false);
  const [errorVideo, setErrorVideo] = useState('');

  // El backend devuelve video_id después de guardar el análisis.
  const videoId = resultado?.video_id ?? resultado?.datos_guardados?.id;

  useEffect(() => {
    let cancelado = false;
    let urlTemporal = null;

    const cargarVideo = async () => {
      if (!videoId) {
        setVideoUrl('');
        setErrorVideo('No se recibió el identificador del video.');
        return;
      }

      try {
        setCargandoVideo(true);
        setErrorVideo('');
        setVideoUrl('');

        const url = await videoService.obtenerArchivo(
          videoId,
          'procesado'
        );

        if (cancelado) {
          URL.revokeObjectURL(url);
          return;
        }

        urlTemporal = url;
        setVideoUrl(url);
      } catch (error) {
        console.error('Error al cargar el video procesado:', error);

        if (!cancelado) {
          setErrorVideo(
            error.response?.data?.error ||
            'No se pudo cargar el video procesado.'
          );
        }
      } finally {
        if (!cancelado) {
          setCargandoVideo(false);
        }
      }
    };

    cargarVideo();

    // Liberar la URL temporal al desmontar o cambiar de video.
    return () => {
      cancelado = true;

      if (urlTemporal) {
        URL.revokeObjectURL(urlTemporal);
      }
    };
  }, [videoId]);

  if (!resultado) return null;

  const dataAnalisis = resultado.analisis || resultado.datos || resultado;

  const puntuacionRaw =
    dataAnalisis.puntuacion ?? resultado.puntuacion ?? 85;

  const puntuacionVal =
    typeof puntuacionRaw === 'object'
      ? (puntuacionRaw.global ?? 85)
      : puntuacionRaw;

  const feedbackVal =
    dataAnalisis.feedback ?? resultado.feedback ?? [];

  const repeticionesVal =
    dataAnalisis.repeticiones ?? resultado.repeticiones ?? 0;

  const fpsVal = dataAnalisis.fps ?? resultado.fps ?? 30;

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

      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <h3 style={{
          color: '#06D6A0',
          margin: 0,
          fontSize: '1.8rem',
          fontWeight: '900'
        }}>
          ✨ Análisis Biomecánico Completado y Guardado
        </h3>

        <span style={{
          backgroundColor: 'rgba(6, 214, 160, 0.25)',
          color: '#06D6A0',
          padding: '0.5rem 1.2rem',
          borderRadius: '25px',
          fontWeight: 'bold',
          fontSize: '1.1rem'
        }}>
          Puntuación: {puntuacionVal} / 100
        </span>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '2.5rem',
        alignItems: 'start'
      }}>

        {/* VIDEO PROCESADO */}
        <div>
          <h4 style={{
            color: '#00B4D8',
            marginBottom: '0.8rem',
            fontSize: '1.1rem'
          }}>
            🎥 Video con Esqueleto Anotado:
          </h4>

          <div style={{
            borderRadius: '14px',
            overflow: 'hidden',
            backgroundColor: '#000',
            aspectRatio: '16/9',
            border: '1px solid #3A506B'
          }}>
            {cargandoVideo ? (
              <div style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#00B4D8'
              }}>
                Cargando video procesado...
              </div>
            ) : errorVideo ? (
              <div style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '1rem',
                boxSizing: 'border-box',
                color: '#FF6B6B',
                textAlign: 'center'
              }}>
                {errorVideo}
              </div>
            ) : videoUrl ? (
              <video
                controls
                preload="metadata"
                playsInline
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain'
                }}
                src={videoUrl}
              />
            ) : null}
          </div>
        </div>

        {/* METRICAS */}
        <div>
          <h4 style={{
            color: '#00B4D8',
            marginBottom: '0.8rem',
            fontSize: '1.1rem'
          }}>
            📊 Métricas de Ejecución:
          </h4>

          <div style={{
            backgroundColor: '#0B132B',
            padding: '1.2rem',
            borderRadius: '12px',
            marginBottom: '1.5rem',
            border: '1px solid #3A506B'
          }}>
            <p style={{ color: '#CBD5E1', margin: '0.4rem 0' }}>
              <strong>Ejercicio:</strong> {ejercicioSeleccionado?.nombre}
            </p>

            <p style={{ color: '#CBD5E1', margin: '0.4rem 0' }}>
              <strong>Repeticiones:</strong>{' '}
              {Array.isArray(repeticionesVal)
                ? repeticionesVal.length
                : repeticionesVal}
            </p>

            <p style={{ color: '#CBD5E1', margin: '0.4rem 0' }}>
              <strong>FPS:</strong> {Number(fpsVal).toFixed(1)}
            </p>
          </div>

          {/* FEEDBACK */}
          <h4 style={{
            color: '#00B4D8',
            marginBottom: '0.8rem',
            fontSize: '1.1rem'
          }}>
            💡 Feedback:
          </h4>

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.8rem',
            maxHeight: '320px',
            overflowY: 'auto'
          }}>
            {Array.isArray(feedbackVal) && feedbackVal.length > 0 ? (
              feedbackVal.map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    backgroundColor: '#0B132B',
                    padding: '1.1rem',
                    borderRadius: '12px',
                    borderLeft: `4px solid ${
                      item.nivel === 'aviso' ? '#F7931A' : '#06D6A0'
                    }`,
                    border: '1px solid #3A506B'
                  }}
                >
                  <p style={{
                    color: '#FFFFFF',
                    margin: '0 0 0.6rem 0',
                    fontSize: '0.95rem'
                  }}>
                    {item.mensaje}
                  </p>
                </div>
              ))
            ) : (
              <p style={{ color: '#CBD5E1' }}>
                Buena técnica general registrada.
              </p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
