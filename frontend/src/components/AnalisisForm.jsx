import React from 'react';

export default function AnalisisForm({ ejercicio, videoUsuario, onVideoChange, onSubmit, procesando, error }) {
  return (
    <form onSubmit={onSubmit}>
      <div style={{ backgroundColor: '#1C2541', borderRadius: '20px', padding: '2.5rem', border: '2px dashed #00B4D8', textAlign: 'center' }}>
        
        <h3 style={{ color: '#00B4D8' }}>Analizar: {ejercicio.nombre}</h3>
        <p style={{ color: '#94A3B8', fontSize: '0.9rem' }}>
          El video será procesado utilizando la configuración biomecánica correspondiente al ejercicio seleccionado.
        </p>

        <input
          type="file"
          accept="video/*"
          onChange={onVideoChange}
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
          <div style={{ marginTop: '1.5rem', color: '#06D6A0' }}>
            <p>Video seleccionado:</p>
            <strong>{videoUsuario.name}</strong>
            <p style={{ fontSize: '0.8rem' }}>{(videoUsuario.size / (1024 * 1024)).toFixed(2)} MB</p>
          </div>
        )}

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
            {procesando ? 'Procesando movimiento...' : 'Empezar análisis de técnica'}
          </button>
        </div>

        {procesando && (
          <p style={{ color: '#00B4D8', marginTop: '1.5rem' }}>Procesando video con Python y MediaPipe...</p>
        )}

        {error && (
          <div style={{ marginTop: '1.5rem', padding: '1rem', borderRadius: '8px', color: '#FF6B6B', backgroundColor: 'rgba(255, 107, 107, 0.1)' }}>
            <strong>Error:</strong> {error}
          </div>
        )}

      </div>
    </form>
  );
}