
import React, { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function EjercicioCard({ ejercicio }) {
  const [fuenteVideo, setFuenteVideo] = useState(
    ejercicio.video_ayuda ? 'local' : 'youtube'
  );

  // Al cambiar de ejercicio, seleccionar nuevamente el video disponible.
  useEffect(() => {
    setFuenteVideo(ejercicio.video_ayuda ? 'local' : 'youtube');
  }, [ejercicio]);

  const obtenerUrlEmbed = (url) => {
    if (!url) return '';

    const match = url.match(
      /(?:youtube\.com\/embed\/|youtube\.com\/watch\?v=|youtu\.be\/)([^&?]+)/
    );

    return match
      ? `https://www.youtube.com/embed/${match[1]}?controls=1&rel=0`
      : '';
  };

  const videoLocal = ejercicio.video_ayuda;
  const videoYouTube = obtenerUrlEmbed(ejercicio.videoUrl);

  const urlLocal = videoLocal
    ? videoLocal.startsWith('http')
      ? videoLocal
      : `${API_URL}${videoLocal}`
    : '';

  const tieneVideoLocal = Boolean(urlLocal);
  const tieneVideoYouTube = Boolean(videoYouTube);
  const tieneAmbos = tieneVideoLocal && tieneVideoYouTube;

  return (
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
          {ejercicio.nombre}
        </h2>

        {/* SELECTOR DE VIDEO */}
        {tieneAmbos && (
          <div style={{
            display: 'flex',
            gap: '0.6rem',
            marginBottom: '1rem',
            flexWrap: 'wrap'
          }}>
            <button
              onClick={() => setFuenteVideo('local')}
              style={{
                padding: '0.6rem 1rem',
                borderRadius: '8px',
                border: '1px solid #06D6A0',
                backgroundColor: fuenteVideo === 'local' ? '#06D6A0' : 'transparent',
                color: fuenteVideo === 'local' ? '#0B132B' : '#06D6A0',
                fontWeight: '700',
                cursor: 'pointer'
              }}
            >
              Video subido
            </button>

            <button
              onClick={() => setFuenteVideo('youtube')}
              style={{
                padding: '0.6rem 1rem',
                borderRadius: '8px',
                border: '1px solid #00B4D8',
                backgroundColor: fuenteVideo === 'youtube' ? '#00B4D8' : 'transparent',
                color: fuenteVideo === 'youtube' ? '#0B132B' : '#00B4D8',
                fontWeight: '700',
                cursor: 'pointer'
              }}
            >
              Demo original
            </button>
          </div>
        )}

        <div style={{
          position: 'relative',
          width: '100%',
          paddingBottom: '56.25%',
          borderRadius: '12px',
          overflow: 'hidden',
          backgroundColor: '#000'
        }}>

          {((fuenteVideo === 'local' && tieneVideoLocal) ||
            (!tieneVideoYouTube && tieneVideoLocal)) ? (
            <video
              key={urlLocal}
              src={urlLocal}
              controls
              preload="metadata"
              playsInline
              style={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                top: 0,
                left: 0,
                objectFit: 'contain'
              }}
            >
              Tu navegador no puede reproducir este video.
            </video>
          ) : tieneVideoYouTube ? (
            <iframe
              key={videoYouTube}
              src={videoYouTube}
              title={`Demostración de ${ejercicio.nombre}`}
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
          ) : (
            <div style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#94A3B8'
            }}>
              No hay video demostrativo disponible.
            </div>
          )}

        </div>

        <p style={{
          color: '#94A3B8',
          fontSize: '0.9rem',
          marginBottom: 0,
          marginTop: '0.8rem'
        }}>
          {fuenteVideo === 'local' && tieneVideoLocal
            ? 'Video demostrativo subido por administración.'
            : tieneVideoYouTube
              ? 'Video demostrativo original de YouTube.'
              : 'No hay video disponible.'}
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
          Cámara: {ejercicio.camera || 'Lateral / Frontal'}
        </span>

        <h3 style={{
          color: '#00B4D8',
          marginTop: '1.5rem'
        }}>
          Información del ejercicio
        </h3>

        <p style={{ color: '#CBD5E1' }}>
          <strong>Grupo muscular:</strong>{' '}
          {ejercicio.grupo_muscular || ejercicio.grupo || 'General'}
        </p>

        <p style={{ color: '#CBD5E1' }}>
          <strong>Músculo principal:</strong>{' '}
          {ejercicio.musculo || 'Varios'}
        </p>

        {ejercicio.descripcion && (
          <p style={{
            color: '#94A3B8',
            fontSize: '0.85rem',
            marginTop: '0.8rem'
          }}>
            {ejercicio.descripcion}
          </p>
        )}
      </div>
    </div>
  );
}
