import React from 'react';


export default function EjercicioCard({ ejercicio }) {
  const obtenerUrlEmbed = (url) => {
    if (!url) return '';
    const match = url.match(/(?:embed\/|watch\?v=)([^&?]+)/);
    const videoId = match ? match[1] : '';
    return `https://www.youtube.com/embed/${videoId}?controls=1&rel=0`;
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
      
      {/* VIDEO DEMOSTRATIVO */}
      <div style={{ backgroundColor: '#1C2541', borderRadius: '16px', padding: '1.5rem', border: '1px solid #3A506B' }}>
        <h2 style={{ color: '#FFFFFF', fontSize: '1.4rem', marginTop: 0 }}>{ejercicio.nombre}</h2>
        <div style={{ position: 'relative', width: '100%', paddingBottom: '56.25%', borderRadius: '12px', overflow: 'hidden' }}>
          <iframe
            src={obtenerUrlEmbed(ejercicio.video_ayuda || ejercicio.videoUrl)}
            title={`Demostración de ${ejercicio.nombre}`}
            style={{ position: 'absolute', width: '100%', height: '100%', border: 'none', top: 0, left: 0 }}
            allowFullScreen
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          />
        </div>
        <p style={{ color: '#94A3B8', fontSize: '0.9rem', marginBottom: 0, marginTop: '0.8rem' }}>
          Video demostrativo de la ejecución.
        </p>
      </div>

      {/* INFORMACIÓN BIOMECÁNICA */}
      <div style={{ backgroundColor: '#1C2541', borderRadius: '16px', padding: '1.5rem', border: '1px solid #3A506B' }}>
        <span style={{ backgroundColor: 'rgba(6, 214, 160, 0.15)', color: '#06D6A0', padding: '0.4rem 0.8rem', borderRadius: '12px', fontSize: '0.8rem', fontWeight: '800' }}>
          Cámara: {ejercicio.camera || 'Lateral / Frontal'}
        </span>

        <h3 style={{ color: '#00B4D8', marginTop: '1.5rem' }}>Información del ejercicio</h3>
        <p style={{ color: '#CBD5E1' }}><strong>Grupo muscular:</strong> {ejercicio.grupo_muscular || ejercicio.grupo || 'General'}</p>
        <p style={{ color: '#CBD5E1' }}><strong>Músculo principal:</strong> {ejercicio.musculo || 'Varios'}</p>
        
        {ejercicio.descripcion && (
          <p style={{ color: '#94A3B8', fontSize: '0.85rem', marginTop: '0.8rem' }}>
            {ejercicio.descripcion}
          </p>
        )}
      </div>

    </div>
  );
}