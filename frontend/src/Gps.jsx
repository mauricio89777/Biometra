import React, { useState } from 'react';

// Icono biomecánico/tecnológico para el logo
const BiometraLogoIcon = () => (
  <svg 
    width="32" 
    height="32" 
    viewBox="0 0 100 100" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg" 
    style={{ verticalAlign: 'middle' }}
  >
    <rect width="100" height="100" rx="20" fill="#020617" />
    <path d="M20 50 Q35 20, 50 50 T80 50" stroke="#00FF87" strokeWidth="6" strokeLinecap="round" fill="none" />
    <path d="M20 50 Q35 80, 50 50 T80 50" stroke="#38bdf8" strokeWidth="6" strokeLinecap="round" fill="none" />
    <circle cx="50" cy="50" r="10" fill="#00FF87" />
    <circle cx="50" cy="50" r="4" fill="#020617" />
    <circle cx="20" cy="50" r="5" fill="#38bdf8" />
    <circle cx="80" cy="50" r="5" fill="#00FF87" />
  </svg>
);

export default function Gps({ onNavigate }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRegion, setFilterRegion] = useState('todas');

  // Gimnasios generales en todo Chile
  const gimnasiosChile = [
    {
      id: 1,
      nombre: 'Smart Fit - Sede Apoquindo',
      comuna: 'Las Condes',
      region: 'RM',
      direccion: 'Av. Apoquindo 4500, Las Condes, Santiago',
      distancia: '1.2 km',
      telefono: '+56 9 8765 4321',
      tipo: 'Gimnasio Comercial / Maquinaria Moderna',
      estado: 'Abierto',
      mapaQuery: 'Smart+Fit+Apoquindo+Las+Condes+Santiago',
      fechaApertura: '10 de Agosto de 2018',
      arrendador: 'Grupo Patio Comercial',
      horarioApertura: '06:00 - 22:30 hrs',
      costoMatricula: '$29.990 CLP'
    },
    {
      id: 2,
      nombre: 'Gimnasio Pacific Fitness - Providencia',
      comuna: 'Providencia',
      region: 'RM',
      direccion: 'Av. Providencia 1234, Providencia, Santiago',
      distancia: '2.4 km',
      telefono: '+56 9 1234 5678',
      tipo: 'Cadena de Gimnasios / Pesas Libres',
      estado: 'Abierto',
      mapaQuery: 'Pacific+Fitness+Providencia+Santiago',
      fechaApertura: '15 de Marzo de 2015',
      arrendador: 'Inmobiliaria Providencia',
      horarioApertura: '06:00 - 23:00 hrs',
      costoMatricula: '$25.000 CLP'
    },
    {
      id: 3,
      nombre: 'Energy Fitness - Ñuñoa Irarrázaval',
      comuna: 'Ñuñoa',
      region: 'RM',
      direccion: 'Av. Irarrázaval 2400, Ñuñoa, Santiago',
      distancia: '3.1 km',
      telefono: '+56 9 5555 6666',
      tipo: 'Gimnasio Urbano / Clases Dirigidas',
      estado: 'Abierto',
      mapaQuery: 'Energy+Fitness+Irarrazaval+Nunoa+Santiago',
      fechaApertura: '01 de Noviembre de 2019',
      arrendador: 'Rentas Inmobiliarias Ñuñoa',
      horarioApertura: '06:30 - 22:00 hrs',
      costoMatricula: '$27.000 CLP'
    },
    {
      id: 4,
      nombre: 'Sportlife - Moneda',
      comuna: 'Santiago Centro',
      region: 'RM',
      direccion: 'Moneda 970, Santiago Centro',
      distancia: '4.8 km',
      telefono: '+56 9 4444 3333',
      tipo: 'Centro Deportivo / Cardio y Musculación',
      estado: 'Abierto',
      mapaQuery: 'Sportlife+Moneda+Santiago+Centro',
      fechaApertura: '22 de Enero de 2016',
      arrendador: 'Inversiones Centro Histórico',
      horarioApertura: '06:00 - 22:00 hrs',
      costoMatricula: '$32.000 CLP'
    },
    {
      id: 5,
      nombre: 'Gimnasio Olimpo - Viña del Mar',
      comuna: 'Viña del Mar',
      region: 'Valparaíso',
      direccion: 'Av. San Martín 650, Viña del Mar',
      distancia: '118 km',
      telefono: '+56 32 299 8877',
      tipo: 'Gimnasio Local de Culturismo y Fit',
      estado: 'Abierto',
      mapaQuery: 'San+Martin+650+Vina+del+Mar',
      fechaApertura: '05 de Diciembre de 2017',
      arrendador: 'Inmobiliaria Costa Mar',
      horarioApertura: '07:00 - 22:00 hrs',
      costoMatricula: '$22.000 CLP'
    },
    {
      id: 6,
      nombre: 'Gimnasio Biobío Fitness - Concepción',
      comuna: 'Concepción',
      region: 'Biobío',
      direccion: 'O\'Higgins 430, Concepción',
      distancia: '490 km',
      telefono: '+56 41 234 5678',
      tipo: 'Gimnasio Comunitario y Funcional',
      estado: 'Abierto',
      mapaQuery: 'OHiggins+430+Concepcion',
      fechaApertura: '18 de Septiembre de 2020',
      arrendador: 'Comercial Biobío Urbano',
      horarioApertura: '06:30 - 22:30 hrs',
      costoMatricula: '$20.000 CLP'
    },
    {
      id: 7,
      nombre: 'Nordic Gym - Antofagasta Costanera',
      comuna: 'Antofagasta',
      region: 'Antofagasta',
      direccion: 'Av. Grecia 1820, Antofagasta',
      distancia: '1.360 km',
      telefono: '+56 55 288 9900',
      tipo: 'Centro de Entrenamiento Crossfit y Pesas',
      estado: 'Abierto',
      mapaQuery: 'Av+Grecia+1820+Antofagasta',
      fechaApertura: '12 de Febrero de 2022',
      arrendador: 'Inmobiliaria Norte Grande',
      horarioApertura: '06:00 - 22:00 hrs',
      costoMatricula: '$35.000 CLP'
    },
    {
      id: 8,
      nombre: 'Sportlife - Temuco Alemania',
      comuna: 'Temuco',
      region: 'Araucanía',
      direccion: 'Av. Alemania 0825, Temuco',
      distancia: '670 km',
      telefono: '+56 45 277 6655',
      tipo: 'Gimnasio Familiar y Fitness',
      estado: 'Abierto',
      mapaQuery: 'Av+Alemania+0825+Temuco',
      fechaApertura: '04 de Julio de 2019',
      arrendador: 'Inversiones Araucanía',
      horarioApertura: '07:00 - 22:00 hrs',
      costoMatricula: '$28.000 CLP'
    }
  ];

  // Estado del gimnasio seleccionado (por defecto el primero)
  const [selectedGym, setSelectedGym] = useState(gimnasiosChile[0]);

  const pasosInstrucciones = [
    {
      paso: 'PASO 1',
      titulo: 'Ubicación GPS',
      desc: 'La aplicación consulta la ubicación de tu dispositivo para calcular la distancia exacta hasta cada gimnasio.'
    },
    {
      paso: 'PASO 2',
      titulo: 'Selecciona Rango',
      desc: 'Filtra por sedes cercanas (<3km), rango medio o distantes para elegir según tu conveniencia.'
    },
    {
      paso: 'PASO 3',
      titulo: 'Enfoque en Mapa',
      desc: 'Al hacer clic en una sede del panel, el mapa interactivo se centra de inmediato en la dirección elegida.'
    },
    {
      paso: 'PASO 4',
      titulo: 'Contacto Directo',
      desc: 'Llama o escribe directamente al número y redes de la sede para reservar o consultar por la plataforma.'
    },
    {
      paso: 'PASO 5',
      titulo: 'Conexión AI',
      desc: 'Al ingresar al gimnasio, tu cuenta se vincula automáticamente con las cámaras Biometra instaladas en el recinto.'
    }
  ];

  // Filtrado por región y palabra clave
  const gimnasiosFiltrados = gimnasiosChile.filter(gym => {
    const coincideTexto = 
      gym.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      gym.direccion.toLowerCase().includes(searchQuery.toLowerCase()) ||
      gym.comuna.toLowerCase().includes(searchQuery.toLowerCase());

    const coincideRegion = filterRegion === 'todas' || gym.region === filterRegion;

    return coincideTexto && coincideRegion;
  });

  return (
    <div style={{
      fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
      backgroundColor: '#0F172A',
      color: '#F8FAFC',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* NAVBAR SUPERIOR UNIFICADO */}
      <header style={{ 
        backgroundColor: '#1E293B', 
        borderBottom: '1px solid #334155', 
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
          
          {/* BOTÓN VOLVER AL INICIO Y LOGO */}
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
                fontSize: '0.9rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              ← Volver al Inicio
            </button>

            <div 
              onClick={() => onNavigate && onNavigate('home')}
              style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer' }}
            >
              <BiometraLogoIcon />
              <span style={{ 
                fontSize: '1.6rem', 
                fontWeight: '900', 
                letterSpacing: '-0.5px',
                background: 'linear-gradient(90deg, #FFFFFF 0%, #E2E8F0 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                BIOMETRA
              </span>
            </div>
          </div>

          {/* MENÚ DE NAVEGACIÓN */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: '1.8rem' }}>
            <button 
              onClick={() => onNavigate && onNavigate('home')}
              style={{
                backgroundColor: '#00FF87',
                color: '#0F172A',
                padding: '0.55rem 1.2rem',
                borderRadius: '8px',
                fontWeight: '800',
                fontSize: '0.9rem',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 0 10px rgba(0, 255, 135, 0.3)'
              }}
            >
              Inicio
            </button>

            <button 
              onClick={() => onNavigate && onNavigate('ejercicios')}
              style={{ 
                background: 'none', 
                border: 'none', 
                color: '#CBD5E1', 
                fontSize: '0.95rem', 
                cursor: 'pointer', 
                fontWeight: '600' 
              }}
            >
              Ejercicios
            </button>

            <button 
              onClick={() => onNavigate && onNavigate('perfil')}
              style={{
                backgroundColor: '#38BDF8',
                color: '#0F172A',
                padding: '0.55rem 1.2rem',
                borderRadius: '20px',
                fontWeight: '700',
                fontSize: '0.85rem',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 0 10px rgba(56, 189, 248, 0.3)'
              }}
            >
              👤 Ver Perfil
            </button>
          </nav>
        </div>
      </header>

      {/* CONTENIDO PRINCIPAL */}
      <main style={{ maxWidth: '1280px', margin: '0 auto', width: '100%', padding: '3rem 2rem', boxSizing: 'border-box' }}>
        
        {/* SECCIÓN PASO A PASO */}
        <div style={{
          backgroundColor: '#1E293B',
          borderRadius: '16px',
          padding: '2.5rem',
          border: '1px solid #334155',
          marginBottom: '3.5rem',
          boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
        }}>
          <h2 style={{ 
            color: '#00FF87', 
            fontSize: '1.8rem', 
            fontWeight: '900', 
            margin: '0 0 2rem 0',
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem'
          }}>
            ⚙️ Paso a Paso: ¿Cómo funciona este mapa de detección?
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1.5rem'
          }}>
            {pasosInstrucciones.map((item, index) => (
              <div 
                key={index}
                style={{
                  backgroundColor: '#0F172A',
                  padding: '1.5rem',
                  borderRadius: '12px',
                  border: '1px solid #334155',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.6rem'
                }}
              >
                <span style={{ color: '#00FF87', fontWeight: '800', fontSize: '0.85rem' }}>
                  {item.paso}
                </span>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '800', color: '#FFFFFF' }}>
                  {item.titulo}
                </h3>
                <p style={{ margin: 0, color: '#94A3B8', fontSize: '0.85rem', lineHeight: '1.4' }}>
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ENCABEZADO SENCILLO Y FAMILIAR */}
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ 
            fontSize: '2.2rem', 
            fontWeight: '900', 
            color: '#FFFFFF', 
            margin: '0 0 0.4rem 0',
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem'
          }}>
            🏋️ Gimnasios Cerca de Ti
          </h2>
          <p style={{ color: '#94A3B8', fontSize: '1rem', margin: 0 }}>
            Encuentra centros de entrenamiento en todo el país, consulta sus datos principales y ubícalos fácilmente en el mapa.
          </p>
        </div>

        {/* CONTENEDOR PRINCIPAL */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))',
          gap: '2rem',
          alignItems: 'start'
        }}>
          
          {/* PANEL IZQUIERDO: BÚSQUEDA Y LISTA DE GIMNASIOS */}
          <div style={{
            backgroundColor: '#1E293B',
            borderRadius: '16px',
            padding: '2rem',
            border: '1px solid #334155',
            boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
          }}>
            <h3 style={{ margin: '0 0 1.2rem 0', color: '#38BDF8', fontSize: '1.2rem', fontWeight: '800' }}>
              🔎 Buscar Gimnasio
            </h3>

            {/* BARRA DE BÚSQUEDA */}
            <input 
              type="text" 
              placeholder="Buscar por nombre, comuna o calle..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '0.9rem',
                fontSize: '0.95rem',
                borderRadius: '8px',
                border: '1px solid #334155',
                backgroundColor: '#0F172A',
                color: '#FFFFFF',
                marginBottom: '1rem',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />

            {/* FILTRO DE REGIÓN */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ fontSize: '0.8rem', color: '#94A3B8', display: 'block', marginBottom: '0.4rem', fontWeight: '700' }}>
                SELECCIONAR ZONA / REGIÓN:
              </label>
              <select
                value={filterRegion}
                onChange={(e) => setFilterRegion(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.7rem',
                  borderRadius: '8px',
                  backgroundColor: '#0F172A',
                  color: '#FFFFFF',
                  border: '1px solid #334155',
                  fontWeight: '600',
                  outline: 'none'
                }}
              >
                <option value="todas">Todas las Regiones</option>
                <option value="RM">Región Metropolitana</option>
                <option value="Valparaíso">Valparaíso / Viña del Mar</option>
                <option value="Biobío">Biobío / Concepción</option>
                <option value="Antofagasta">Antofagasta</option>
                <option value="Araucanía">Araucanía / Temuco</option>
              </select>
            </div>

            {/* CONTADOR DE RESULTADOS */}
            <div style={{ fontSize: '0.85rem', color: '#94A3B8', marginBottom: '1rem', fontWeight: '600' }}>
              {gimnasiosFiltrados.length} gimnasio(s) disponible(s):
            </div>

            {/* LISTA DE GIMNASIOS */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '480px', overflowY: 'auto' }}>
              {gimnasiosFiltrados.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#64748B' }}>
                  No se encontraron gimnasios con ese criterio de búsqueda.
                </div>
              ) : (
                gimnasiosFiltrados.map((gym) => (
                  <div 
                    key={gym.id}
                    onClick={() => setSelectedGym(gym)}
                    style={{
                      backgroundColor: selectedGym?.id === gym.id ? '#0F172A' : '#182234',
                      border: selectedGym?.id === gym.id ? '1px solid #00FF87' : '1px solid #334155',
                      borderRadius: '12px',
                      padding: '1.2rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                      <h4 style={{ margin: 0, fontSize: '1rem', color: '#FFFFFF', fontWeight: '800' }}>
                        {gym.nombre}
                      </h4>
                      <span style={{ 
                        backgroundColor: 'rgba(0, 255, 135, 0.15)', 
                        color: '#00FF87', 
                        padding: '0.2rem 0.6rem', 
                        borderRadius: '12px',
                        fontSize: '0.75rem',
                        fontWeight: '800'
                      }}>
                        {gym.distancia}
                      </span>
                    </div>

                    <p style={{ margin: '0 0 0.5rem 0', color: '#94A3B8', fontSize: '0.85rem' }}>
                      📍 {gym.direccion}
                    </p>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.8rem', paddingTop: '0.6rem', borderTop: '1px solid #1E293B' }}>
                      <span style={{ color: '#38BDF8', fontSize: '0.8rem', fontWeight: '600' }}>
                        🏋️ {gym.tipo}
                      </span>
                      <span style={{ color: '#00FF87', fontSize: '0.8rem', fontWeight: '700' }}>
                        📞 {gym.telefono}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* PANEL DERECHO: MAPA DINÁMICO QUE SE MOVERÁ + INFORMACIÓN ÚTIL DE LA SEDE */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            {/* MINIMAPA INTERACTIVO ACTUALIZABLE */}
            <div style={{
              backgroundColor: '#1E293B',
              borderRadius: '16px',
              overflow: 'hidden',
              border: '1px solid #334155',
              boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
              height: '380px'
            }}>
              <iframe
                key={selectedGym?.id || 'default'}
                title={`Mapa de ${selectedGym?.nombre}`}
                src={`https://www.google.com/maps?q=${selectedGym?.mapaQuery || 'Chile'}&output=embed`}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
              />
            </div>

            {/* SECCIÓN DE DETALLES DEL GIMNASIO SELECCIONADO */}
            {selectedGym && (
              <div style={{
                backgroundColor: '#1E293B',
                borderRadius: '16px',
                padding: '1.8rem',
                border: '1px solid #00FF87',
                boxShadow: '0 0 25px rgba(0,255,135,0.15)'
              }}>
                <span style={{ color: '#00FF87', fontSize: '0.8rem', fontWeight: '800', letterSpacing: '0.5px' }}>
                  GIMNASIO SELECCIONADO
                </span>

                <h3 style={{ margin: '0.3rem 0 0.4rem 0', color: '#FFFFFF', fontSize: '1.4rem', fontWeight: '900' }}>
                  {selectedGym.nombre}
                </h3>
                <p style={{ margin: '0 0 1.2rem 0', color: '#94A3B8', fontSize: '0.9rem' }}>
                  📍 {selectedGym.direccion}
                </p>

                {/* DETALLES PRÁCTICOS */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '1rem',
                  backgroundColor: '#0F172A',
                  padding: '1.2rem',
                  borderRadius: '12px',
                  border: '1px solid #334155',
                  fontSize: '0.88rem'
                }}>
                  <div>
                    <span style={{ color: '#64748B', display: 'block', fontWeight: '600' }}>Apertura del Local:</span>
                    <strong style={{ color: '#F8FAFC' }}>{selectedGym.fechaApertura}</strong>
                  </div>

                  <div>
                    <span style={{ color: '#64748B', display: 'block', fontWeight: '600' }}>Arrendador / Administración:</span>
                    <strong style={{ color: '#F8FAFC' }}>{selectedGym.arrendador}</strong>
                  </div>

                  <div>
                    <span style={{ color: '#64748B', display: 'block', fontWeight: '600' }}>Horario de Atención:</span>
                    <strong style={{ color: '#00FF87' }}>{selectedGym.horarioApertura}</strong>
                  </div>

                  <div>
                    <span style={{ color: '#64748B', display: 'block', fontWeight: '600' }}>Costo de Matrícula:</span>
                    <strong style={{ color: '#38BDF8' }}>{selectedGym.costoMatricula}</strong>
                  </div>
                </div>

              </div>
            )}

          </div>

        </div>

      </main>
    </div>
  );
}