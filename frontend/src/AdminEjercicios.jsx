import React, { useState, useEffect } from 'react';

export default function AdminEjercicios() {
  const [ejercicios, setEjercicios] = useState([]);
  const [loading, setLoading] = useState(true);

  // Cargar todos los ejercicios (activos e inactivos)
  const cargarEjerciciosAdmin = async () => {
    try {
      const res = await fetch('http://localhost:3000/ejercicios/admin/listar');
      const data = await res.json();
      setEjercicios(data);
      setLoading(false);
    } catch (err) {
      console.error("Error al cargar administración:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarEjerciciosAdmin();
  }, []);

  // Función para ocultar / mostrar ejercicio
  const toggleActivo = async (id, estadoActual) => {
    try {
      const res = await fetch(`http://localhost:3000/ejercicios/admin/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activo: !estadoActual })
      });
      if (res.ok) {
        // Recargamos la lista
        cargarEjerciciosAdmin();
      }
    } catch (err) {
      console.error("Error al actualizar visibilidad:", err);
    }
  };

  // Función para sincronizar con Python desde el panel admin
  const sincronizar = async () => {
    try {
      const res = await fetch('http://localhost:3000/ejercicios/sincronizar', { method: 'POST' });
      if (res.ok) {
        alert('Ejercicios sincronizados con éxito desde Python');
        cargarEjerciciosAdmin();
      }
    } catch (err) {
      console.error("Error al sincronizar:", err);
    }
  };

  if (loading) return <div style={{ color: '#FFF', padding: '2rem' }}>Cargando panel de administración...</div>;

  return (
    <div style={{ backgroundColor: '#0B132B', color: '#FFF', padding: '2rem', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h1>Panel de Administración: Ejercicios e IA</h1>
          <button 
            onClick={sincronizar}
            style={{ backgroundColor: '#06D6A0', color: '#0B132B', border: 'none', padding: '0.8rem 1.5rem', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
          >
            🔄 Sincronizar con Python
          </button>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: '#1C2541', borderRadius: '12px', overflow: 'hidden' }}>
          <thead>
            <tr style={{ backgroundColor: '#3A506B', textAlign: 'left' }}>
              <th style={{ padding: '1rem' }}>ID</th>
              <th style={{ padding: '1rem' }}>Nombre</th>
              <th style={{ padding: '1rem' }}>Script Key</th>
              <th style={{ padding: '1rem' }}>Tipo</th>
              <th style={{ padding: '1rem' }}>Estado</th>
              <th style={{ padding: '1rem' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {ejercicios.map((ej) => (
              <tr key={ej.id} style={{ borderBottom: '1px solid #3A506B' }}>
                <td style={{ padding: '1rem' }}>{ej.id}</td>
                <td style={{ padding: '1rem', fontWeight: 'bold' }}>{ej.nombre}</td>
                <td style={{ padding: '1rem', color: '#00B4D8' }}>{ej.script_key}</td>
                <td style={{ padding: '1rem' }}>{ej.tipo || 'N/D'}</td>
                <td style={{ padding: '1rem' }}>
                  <span style={{ 
                    padding: '0.3rem 0.8rem', 
                    borderRadius: '12px', 
                    fontSize: '0.8rem', 
                    backgroundColor: ej.activo ? 'rgba(6, 214, 160, 0.2)' : 'rgba(255, 107, 107, 0.2)',
                    color: ej.activo ? '#06D6A0' : '#FF6B6B'
                  }}>
                    {ej.activo ? 'Visible (Activo)' : 'Oculto'}
                  </span>
                </td>
                <td style={{ padding: '1rem' }}>
                  <button 
                    onClick={() => toggleActivo(ej.id, ej.activo)}
                    style={{ 
                      backgroundColor: ej.activo ? '#FF6B6B' : '#06D6A0', 
                      color: '#0B132B', 
                      border: 'none', 
                      padding: '0.5rem 1rem', 
                      borderRadius: '6px', 
                      fontWeight: 'bold', 
                      cursor: 'pointer' 
                    }}
                  >
                    {ej.activo ? 'Ocultar' : 'Mostrar'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}