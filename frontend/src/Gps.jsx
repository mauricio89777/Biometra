import React, { useState } from 'react';

// NUEVO ICONO BIOMETRA: Símbolo de pivote cinemático, vectores y visión por computadora
const BiometraLogoIcon = () => (
  <svg 
    width="32" 
    height="32" 
    viewBox="0 0 100 100" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg" 
    style={{ verticalAlign: 'middle' }}
  >
    <defs>
      <linearGradient id="kineticGradientGps" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#00FF87" />
        <stop offset="100%" stopColor="#38BDF8" />
      </linearGradient>
    </defs>

    {/* Fondo en Dark Navy */}
    <rect width="100" height="100" rx="22" fill="#020617" />

    {/* Hexágono de visión por computadora y precisión */}
    <path 
      d="M50 15 L80 32.5 L80 67.5 L50 85 L20 67.5 L20 32.5 Z" 
      stroke="#334155" 
      strokeWidth="3" 
      strokeLinejoin="round" 
      opacity="0.6"
    />

    {/* Nodo articular central */}
    <circle cx="50" cy="50" r="8" fill="#FFFFFF" />
    <circle cx="50" cy="50" r="14" stroke="#38BDF8" strokeWidth="4" opacity="0.8"/>

    {/* Vector superior de fuerza */}
    <path 
      d="M50 36 V22 M50 22 L44 28 M50 22 L56 28" 
      stroke="#38BDF8" 
      strokeWidth="5" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />

    {/* Arco cinemático continuo y trayectoria de rastreo de puntos */}
    <path 
      d="M72 40 A25 25 0 0 1 50 75" 
      stroke="url(#kineticGradientGps)" 
      strokeWidth="6" 
      strokeLinecap="round"
    />
    <path 
      d="M50 75 A25 25 0 0 1 28 40" 
      stroke="#00FF87" 
      strokeWidth="6" 
      strokeLinecap="round" 
      strokeDasharray="4 6"
    />
  </svg>
);

export default function Gps({ onNavigate }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRegion, setFilterRegion] = useState('todas');
  const [filterMarca, setFilterMarca] = useState('todas');
  const [activeModal, setActiveModal] = useState(null);

  // BASE DE DATOS UNIFICADA CON TODAS LAS REGIONES Y MARCAS SOLICITADAS
  const gimnasiosChile = [
    // XV - ARICA Y PARINACOTA
    { id: 1, marca: 'Smart Fit', nombre: 'Smart Fit - Sucursal Arica', comuna: 'Arica', region: 'Arica y Parinacota', direccion: 'Av. Diego Portales 157, Arica', distancia: '2.048 km', telefono: '+56 58 220 1100', tipo: 'Cadena Internacional', mapaQuery: 'Smart+Fit+Diego+Portales+157+Arica', fechaApertura: '10/05/2020', arrendador: 'Comercial Arica', horarioApertura: '06:00 - 22:30 hrs', costoMatricula: '$29.990 CLP' },
    { id: 2, marca: 'Smart Fit', nombre: 'Smart Fit - Sucursal Mallplaza Arica', comuna: 'Arica', region: 'Arica y Parinacota', direccion: 'Av. Diego Portales 640, Arica', distancia: '2.050 km', telefono: '+56 58 220 1101', tipo: 'Cadena Internacional', mapaQuery: 'Smart+Fit+Mall+Plaza+Arica', fechaApertura: '15/03/2021', arrendador: 'Mallplaza Arica', horarioApertura: '06:00 - 22:30 hrs', costoMatricula: '$29.990 CLP' },

    // I - TARAPACÁ
    { id: 3, marca: 'Smart Fit', nombre: 'Smart Fit - Iquique Vivar', comuna: 'Iquique', region: 'Tarapacá', direccion: 'Vivar 850, Iquique', distancia: '1.780 km', telefono: '+56 57 251 3300', tipo: 'Cadena Internacional', mapaQuery: 'Smart+Fit+Vivar+Iquique', fechaApertura: '10/04/2021', arrendador: 'Comercial Vivar', horarioApertura: '06:00 - 22:30 hrs', costoMatricula: '$29.990 CLP' },
    { id: 4, marca: 'Smart Fit', nombre: 'Smart Fit - Mallplaza Iquique', comuna: 'Iquique', region: 'Tarapacá', direccion: 'Av. Héroes de la Concepción 2555, Iquique', distancia: '1.782 km', telefono: '+56 57 251 3301', tipo: 'Cadena Internacional', mapaQuery: 'Smart+Fit+Mallplaza+Iquique', fechaApertura: '22/09/2022', arrendador: 'Mallplaza', horarioApertura: '06:00 - 22:30 hrs', costoMatricula: '$29.990 CLP' },
    { id: 5, marca: 'Pacific Fitness', nombre: 'Pacific Fitness - Sede Iquique', comuna: 'Iquique', region: 'Tarapacá', direccion: 'Tarapacá 465, Iquique', distancia: '1.781 km', telefono: '+56 57 242 1122', tipo: 'Gimnasio Comercial', mapaQuery: 'Pacific+Fitness+Iquique', fechaApertura: '15/05/2016', arrendador: 'Inmobiliaria Tarapacá', horarioApertura: '06:30 - 22:00 hrs', costoMatricula: '$24.000 CLP' },
    { id: 6, marca: 'Sportlife', nombre: 'Sportlife - Sede Teresa Wilms Montt', comuna: 'Iquique', region: 'Tarapacá', direccion: 'Teresa Wilms Montt 2260, Iquique', distancia: '1.785 km', telefono: '+56 57 242 8899', tipo: 'Centro Deportivo', mapaQuery: 'Sportlife+Teresa+Wilms+Montt+Iquique', fechaApertura: '04/11/2017', arrendador: 'Rentas Iquique', horarioApertura: '06:00 - 22:00 hrs', costoMatricula: '$32.000 CLP' },

    // II - ANTOFAGASTA
    { id: 7, marca: 'Smart Fit', nombre: 'Smart Fit - Antofagasta La Portada', comuna: 'Antofagasta', region: 'Antofagasta', direccion: 'Av. Pedro Aguirre Cerda 10578, Antofagasta', distancia: '1.358 km', telefono: '+56 55 264 7701', tipo: 'Cadena Internacional', mapaQuery: 'Smart+Fit+La+Portada+Antofagasta', fechaApertura: '10/03/2022', arrendador: 'Paseo La Portada', horarioApertura: '06:00 - 22:30 hrs', costoMatricula: '$29.990 CLP' },
    { id: 8, marca: 'Smart Fit', nombre: 'Smart Fit - Jumbo Punto de Encuentro', comuna: 'Antofagasta', region: 'Antofagasta', direccion: 'Av. Angamos 745, Antofagasta', distancia: '1.360 km', telefono: '+56 55 264 7702', tipo: 'Cadena Internacional', mapaQuery: 'Smart+Fit+Jumbo+Angamos+Antofagasta', fechaApertura: '15/11/2021', arrendador: 'Cencosud', horarioApertura: '06:00 - 22:30 hrs', costoMatricula: '$29.990 CLP' },
    { id: 9, marca: 'Smart Fit', nombre: 'Smart Fit - Mallplaza Antofagasta', comuna: 'Antofagasta', region: 'Antofagasta', direccion: 'Av. Balmaceda 2472, Antofagasta', distancia: '1.361 km', telefono: '+56 55 264 7703', tipo: 'Cadena Internacional', mapaQuery: 'Smart+Fit+Mallplaza+Antofagasta', fechaApertura: '12/01/2019', arrendador: 'Mallplaza', horarioApertura: '06:00 - 22:30 hrs', costoMatricula: '$29.990 CLP' },
    { id: 10, marca: 'Smart Fit', nombre: 'Smart Fit - Cenco Angamos', comuna: 'Antofagasta', region: 'Antofagasta', direccion: 'Av. Angamos 0211, Antofagasta', distancia: '1.362 km', telefono: '+56 55 264 7704', tipo: 'Cadena Internacional', mapaQuery: 'Smart+Fit+Cenco+Angamos+Antofagasta', fechaApertura: '05/08/2023', arrendador: 'Cencosud Shopping', horarioApertura: '06:00 - 22:30 hrs', costoMatricula: '$29.990 CLP' },
    { id: 11, marca: 'Smart Fit', nombre: 'Smart Fit - Sucursal Calama', comuna: 'Calama', region: 'Antofagasta', direccion: 'Av. Chorrillos 1631, Calama', distancia: '1.540 km', telefono: '+56 55 264 7705', tipo: 'Cadena Internacional', mapaQuery: 'Smart+Fit+Calama', fechaApertura: '18/06/2020', arrendador: 'Mallplaza Calama', horarioApertura: '06:00 - 22:30 hrs', costoMatricula: '$29.990 CLP' },
    { id: 12, marca: 'Sportlife', nombre: 'Sportlife - Antofagasta Angamos', comuna: 'Antofagasta', region: 'Antofagasta', direccion: 'Av. Angamos 1215, Antofagasta', distancia: '1.360 km', telefono: '+56 55 288 3311', tipo: 'Centro Deportivo', mapaQuery: 'Sportlife+Angamos+Antofagasta', fechaApertura: '14/07/2018', arrendador: 'Inmobiliaria Angamos', horarioApertura: '06:00 - 22:00 hrs', costoMatricula: '$32.000 CLP' },
    { id: 13, marca: 'Sportlife', nombre: 'Sportlife - Antofagasta Espacio Urbano', comuna: 'Antofagasta', region: 'Antofagasta', direccion: 'Zenteno 21, Antofagasta', distancia: '1.362 km', telefono: '+56 55 288 3312', tipo: 'Centro Deportivo', mapaQuery: 'Sportlife+Espacio+Urbano+Antofagasta', fechaApertura: '01/10/2020', arrendador: 'Espacio Urbano', horarioApertura: '06:00 - 22:00 hrs', costoMatricula: '$32.000 CLP' },

    // V - VALPARAÍSO
    { id: 14, marca: 'Smart Fit', nombre: 'Smart Fit - Valparaíso Plaza Victoria', comuna: 'Valparaíso', region: 'Valparaíso', direccion: 'Av. Brasil 1650, Valparaíso', distancia: '114 km', telefono: '+56 32 255 4401', tipo: 'Cadena Internacional', mapaQuery: 'Smart+Fit+Plaza+Victoria+Valparaiso', fechaApertura: '14/06/2019', arrendador: 'Paseo Victoria', horarioApertura: '06:00 - 22:30 hrs', costoMatricula: '$29.990 CLP' },
    { id: 15, marca: 'Smart Fit', nombre: 'Smart Fit - Valparaíso Paseo del Puerto', comuna: 'Valparaíso', region: 'Valparaíso', direccion: 'Plaza Sotomayor 50, Valparaíso', distancia: '116 km', telefono: '+56 32 255 4402', tipo: 'Cadena Internacional', mapaQuery: 'Smart+Fit+Paseo+del+Puerto+Valparaiso', fechaApertura: '20/11/2021', arrendador: 'EPV', horarioApertura: '06:00 - 22:30 hrs', costoMatricula: '$29.990 CLP' },
    { id: 16, marca: 'Smart Fit', nombre: 'Smart Fit - Viña Paseo Viña Centro', comuna: 'Viña del Mar', region: 'Valparaíso', direccion: 'Álvarez 646, Viña del Mar', distancia: '118 km', telefono: '+56 32 255 4403', tipo: 'Cadena Internacional', mapaQuery: 'Smart+Fit+Paseo+Vina+Centro', fechaApertura: '10/01/2020', arrendador: 'Paseo Viña', horarioApertura: '06:00 - 22:30 hrs', costoMatricula: '$29.990 CLP' },
    { id: 17, marca: 'Smart Fit', nombre: 'Smart Fit - Quilpué Mondrian', comuna: 'Quilpué', region: 'Valparaíso', direccion: 'Claudio Vicuña 680, Quilpué', distancia: '110 km', telefono: '+56 32 255 4404', tipo: 'Cadena Internacional', mapaQuery: 'Smart+Fit+Mondrian+Quilpue', fechaApertura: '05/08/2022', arrendador: 'Edificio Mondrian', horarioApertura: '06:00 - 22:30 hrs', costoMatricula: '$29.990 CLP' },
    { id: 18, marca: 'Smart Fit', nombre: 'Smart Fit - Quilpué Mall', comuna: 'Quilpué', region: 'Valparaíso', direccion: 'Av. Los Carrera 700, Quilpué', distancia: '111 km', telefono: '+56 32 255 4405', tipo: 'Cadena Internacional', mapaQuery: 'Smart+Fit+Mall+Quilpue', fechaApertura: '12/12/2022', arrendador: 'Mall Plaza del Sol', horarioApertura: '06:00 - 22:30 hrs', costoMatricula: '$29.990 CLP' },
    { id: 19, marca: 'Smart Fit', nombre: 'Smart Fit - Villa Alemana Av. Valparaíso', comuna: 'Villa Alemana', region: 'Valparaíso', direccion: 'Av. Valparaíso 500, Villa Alemana', distancia: '105 km', telefono: '+56 32 255 4406', tipo: 'Cadena Internacional', mapaQuery: 'Smart+Fit+Villa+Alemana', fechaApertura: '18/03/2023', arrendador: 'Paseo Villa Alemana', horarioApertura: '06:00 - 22:30 hrs', costoMatricula: '$29.990 CLP' },
    { id: 20, marca: 'Smart Fit', nombre: 'Smart Fit - Villa Alemana Líder Peñablanca', comuna: 'Villa Alemana', region: 'Valparaíso', direccion: 'Sarmiento 1100, Peñablanca', distancia: '102 km', telefono: '+56 32 255 4407', tipo: 'Cadena Internacional', mapaQuery: 'Smart+Fit+Lider+Penablanca', fechaApertura: '01/09/2023', arrendador: 'Walmart', horarioApertura: '06:00 - 22:30 hrs', costoMatricula: '$29.990 CLP' },

    // RM - REGIÓN METROPOLITANA
    { id: 48, marca: 'Pacific Fitness', nombre: 'Pacific Fitness - Santiago Centro (Merced)', comuna: 'Santiago Centro', region: 'RM', direccion: 'Merced 838 (Edificio Casa Colorada)', distancia: '3.2 km', telefono: '+56 2 2638 1100', tipo: 'Gimnasio Comercial', mapaQuery: 'Pacific+Fitness+Merced+838+Santiago', fechaApertura: '10/05/2014', arrendador: 'Edificio Casa Colorada', horarioApertura: '06:00 - 23:00 hrs', costoMatricula: '$25.000 CLP' },
    { id: 49, marca: 'Pacific Fitness', nombre: 'Pacific Fitness - Santiago Centro (Nataniel)', comuna: 'Santiago Centro', region: 'RM', direccion: 'Nataniel Cox 1187, esq. Santiaguillo', distancia: '3.8 km', telefono: '+56 2 2638 1101', tipo: 'Gimnasio Comercial', mapaQuery: 'Pacific+Fitness+Nataniel+Cox+1187', fechaApertura: '12/08/2015', arrendador: 'Inmobiliaria Nataniel', horarioApertura: '06:00 - 23:00 hrs', costoMatricula: '$25.000 CLP' },
    { id: 88, marca: 'Smart Fit', nombre: 'Smart Fit - Santiago Centro (Imperio)', comuna: 'Santiago Centro', region: 'RM', direccion: 'Huérfanos 830, Nivel Terrazas', distancia: '3.5 km', telefono: '+56 9 8765 4001', tipo: 'Cadena Internacional', mapaQuery: 'Smart+Fit+Huerfanos+830', fechaApertura: '10/08/2018', arrendador: 'Galería Imperio', horarioApertura: '06:00 - 22:30 hrs', costoMatricula: '$29.990 CLP' },
    { id: 103, marca: 'Smart Fit', nombre: 'Smart Fit - Las Condes (Escuela Militar)', comuna: 'Las Condes', region: 'RM', direccion: 'Av. Apoquindo 4501', distancia: '1.2 km', telefono: '+56 9 8765 4016', tipo: 'Cadena Internacional', mapaQuery: 'Smart+Fit+Apoquindo+4501', fechaApertura: '01/06/2017', arrendador: 'Apoquindo Center', horarioApertura: '06:00 - 22:30 hrs', costoMatricula: '$29.990 CLP' }
  ];

  const [selectedGym, setSelectedGym] = useState(gimnasiosChile[0]);

  const marcasDisponibles = ['todas', ...Array.from(new Set(gimnasiosChile.map(g => g.marca)))];
  const regionesDisponibles = ['todas', ...Array.from(new Set(gimnasiosChile.map(g => g.region)))];

  const gimnasiosFiltrados = gimnasiosChile.filter(gym => {
    const coincideTexto = 
      gym.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      gym.direccion.toLowerCase().includes(searchQuery.toLowerCase()) ||
      gym.comuna.toLowerCase().includes(searchQuery.toLowerCase()) ||
      gym.marca.toLowerCase().includes(searchQuery.toLowerCase());

    const coincideRegion = filterRegion === 'todas' || gym.region === filterRegion;
    const coincideMarca = filterMarca === 'todas' || gym.marca === filterMarca;

    return coincideTexto && coincideRegion && coincideMarca;
  });

  const obtenerUrlMapa = () => {
    if (searchQuery.trim().length > 3 && gimnasiosFiltrados.length === 0) {
      return `https://www.google.com/maps?q=gimnasios+${encodeURIComponent(searchQuery)}+Chile&output=embed`;
    }
    if (selectedGym) {
      return `https://www.google.com/maps?q=${selectedGym.mapaQuery}&output=embed`;
    }
    return `https://www.google.com/maps?q=Gimnasios+en+Chile&output=embed`;
  };

  return (
    <div style={{
      fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
      backgroundColor: '#0F172A',
      color: '#F8FAFC',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* NAVBAR NAVEGACIÓN COMPLETA */}
      <header style={{ 
        backgroundColor: '#1E293B', 
        borderBottom: '1px solid #334155', 
        padding: '1rem 3rem',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
      }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <button 
              onClick={() => onNavigate && onNavigate('app')}
              style={{
                backgroundColor: 'transparent',
                color: '#00FF87',
                border: '1px solid #00FF87',
                padding: '0.5rem 1.1rem',
                borderRadius: '8px',
                fontWeight: '700',
                fontSize: '0.9rem',
                cursor: 'pointer'
              }}
            >
              ← Volver al Inicio
            </button>

            <div onClick={() => onNavigate && onNavigate('app')} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer' }}>
              <BiometraLogoIcon />
              <span className="brand-name">BIOMETRA</span>
            </div>
          </div>

          <nav style={{ display: 'flex', alignItems: 'center', gap: '1.8rem' }}>
            <button onClick={() => onNavigate && onNavigate('app')} style={{ backgroundColor: '#00FF87', color: '#0F172A', padding: '0.55rem 1.2rem', borderRadius: '8px', fontWeight: '800', border: 'none', cursor: 'pointer' }}>
              Inicio
            </button>
            <button onClick={() => onNavigate && onNavigate('ejercicios')} style={{ background: 'none', border: 'none', color: '#CBD5E1', fontSize: '0.95rem', cursor: 'pointer', fontWeight: '600' }}>
              Ejercicios
            </button>
            <button onClick={() => onNavigate && onNavigate('perfil')} style={{ backgroundColor: '#38BDF8', color: '#0F172A', padding: '0.55rem 1.2rem', borderRadius: '20px', fontWeight: '700', border: 'none', cursor: 'pointer' }}>
              👤 Mi Perfil
            </button>
          </nav>
        </div>
      </header>

      {/* CONTENIDO PRINCIPAL Y MAPA */}
      <main style={{ maxWidth: '1280px', margin: '0 auto', width: '100%', padding: '2.5rem 2rem', boxSizing: 'border-box', flex: 1 }}>
        
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '2.2rem', fontWeight: '900', color: '#FFFFFF', margin: '0 0 0.4rem 0' }}>
            🏋️ Red Nacional Completa de Gimnasios en Chile
          </h2>
          <p style={{ color: '#94A3B8', fontSize: '1rem', margin: 0 }}>
            Visualiza todas las sedes, cadenas y ciudades de Chile. Escribe cualquier comuna o calle en la barra para explorar gimnasios en tiempo real.
          </p>
        </div>

        {/* ESTRUCTURA BÚSQUEDA + MAPA */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '2rem', alignItems: 'start' }}>
          
          {/* BÚSQUEDA Y LISTA DE RESULTADOS */}
          <div style={{ backgroundColor: '#1E293B', borderRadius: '16px', padding: '2rem', border: '1px solid #334155', boxShadow: '0 10px 30px rgba(0,0,0,0.3)' }}>
            <h3 style={{ margin: '0 0 1.2rem 0', color: '#38BDF8', fontSize: '1.2rem', fontWeight: '800' }}>
              🔎 Buscador por Ciudad, Marca o Comuna
            </h3>

            <input 
              type="text" 
              placeholder="Ej: Merced, Arica, Temuco, Power Fitness, Smart Fit..."
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

            {/* SELECTORES DESPLEGABLES */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <label style={{ fontSize: '0.75rem', color: '#94A3B8', display: 'block', marginBottom: '0.4rem', fontWeight: '700' }}>
                  REGIÓN DE CHILE:
                </label>
                <select
                  value={filterRegion}
                  onChange={(e) => setFilterRegion(e.target.value)}
                  style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', backgroundColor: '#0F172A', color: '#FFFFFF', border: '1px solid #334155', fontWeight: '600', outline: 'none' }}
                >
                  {regionesDisponibles.map(r => (
                    <option key={r} value={r}>{r === 'todas' ? 'Todas las Regiones' : r}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', color: '#94A3B8', display: 'block', marginBottom: '0.4rem', fontWeight: '700' }}>
                  CADENA / MARCA:
                </label>
                <select
                  value={filterMarca}
                  onChange={(e) => setFilterMarca(e.target.value)}
                  style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', backgroundColor: '#0F172A', color: '#FFFFFF', border: '1px solid #334155', fontWeight: '600', outline: 'none' }}
                >
                  {marcasDisponibles.map(m => (
                    <option key={m} value={m}>{m === 'todas' ? 'Todas las Marcas' : m}</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ fontSize: '0.85rem', color: '#94A3B8', marginBottom: '1rem', fontWeight: '600' }}>
              Sedes encontradas: {gimnasiosFiltrados.length}
            </div>

            {/* TARJETAS DE RESULTADOS */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '480px', overflowY: 'auto' }}>
              {gimnasiosFiltrados.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem', backgroundColor: '#0F172A', borderRadius: '12px', border: '1px dashed #334155' }}>
                  <p style={{ color: '#00FF87', fontWeight: '800', margin: '0 0 0.5rem 0' }}>🗺️ Buscando directo en el Mapa Google</p>
                  <p style={{ color: '#94A3B8', fontSize: '0.85rem', margin: 0 }}>
                    El mapa a la derecha está localizando automáticamente todos los gimnasios disponibles en "<strong>{searchQuery}</strong>".
                  </p>
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
                      <span style={{ backgroundColor: 'rgba(0, 255, 135, 0.15)', color: '#00FF87', padding: '0.2rem 0.6rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: '800' }}>
                        {gym.region}
                      </span>
                    </div>

                    <p style={{ margin: '0 0 0.5rem 0', color: '#94A3B8', fontSize: '0.85rem' }}>
                      📍 {gym.direccion}
                    </p>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.8rem', paddingTop: '0.6rem', borderTop: '1px solid #1E293B' }}>
                      <span style={{ color: '#38BDF8', fontSize: '0.8rem', fontWeight: '600' }}>
                        🏷️ {gym.marca} • {gym.tipo}
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

          {/* VISUALIZADOR DE MAPA Y FICHA TECNICA */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            <div style={{ backgroundColor: '#1E293B', borderRadius: '16px', overflow: 'hidden', border: '1px solid #334155', boxShadow: '0 10px 30px rgba(0,0,0,0.3)', height: '420px' }}>
              <iframe
                key={selectedGym?.id || searchQuery}
                title="Mapa de Gimnasios de Chile"
                src={obtenerUrlMapa()}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
              />
            </div>

            {selectedGym && (
              <div style={{ backgroundColor: '#1E293B', borderRadius: '16px', padding: '1.8rem', border: '1px solid #00FF87', boxShadow: '0 0 25px rgba(0,255,135,0.15)' }}>
                <span style={{ color: '#00FF87', fontSize: '0.8rem', fontWeight: '800' }}>SEDE SELECCIONADA</span>
                <h3 style={{ margin: '0.3rem 0 0.4rem 0', color: '#FFFFFF', fontSize: '1.4rem', fontWeight: '900' }}>
                  {selectedGym.nombre}
                </h3>
                <p style={{ margin: '0 0 1.2rem 0', color: '#94A3B8', fontSize: '0.9rem' }}>
                  📍 {selectedGym.direccion} ({selectedGym.comuna}, Región {selectedGym.region})
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', backgroundColor: '#0F172A', padding: '1.2rem', borderRadius: '12px', border: '1px solid #334155', fontSize: '0.88rem' }}>
                  <div>
                    <span style={{ color: '#64748B', display: 'block' }}>Apertura:</span>
                    <strong style={{ color: '#F8FAFC' }}>{selectedGym.fechaApertura}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748B', display: 'block' }}>Administración:</span>
                    <strong style={{ color: '#F8FAFC' }}>{selectedGym.arrendador}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748B', display: 'block' }}>Horarios:</span>
                    <strong style={{ color: '#00FF87' }}>{selectedGym.horarioApertura}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748B', display: 'block' }}>Matrícula aprox:</span>
                    <strong style={{ color: '#38BDF8' }}>{selectedGym.costoMatricula}</strong>
                  </div>
                </div>
              </div>
            )}

          </div>

        </div>

      </main>

      {/* FOOTER INTERACTIVO */}
      <footer className="footer">
        <div className="footer-brand-col">
          <div className="logo-brand" onClick={() => onNavigate && onNavigate('app')} style={{ cursor: 'pointer' }}>
            <BiometraLogoIcon />
            <span className="brand-name">BIOMETRA</span>
          </div>
          <p className="footer-desc">Ciencia y tecnología aplicada a la técnica de levantamiento.</p>
        </div>

        <div className="footer-links">
          <div>
            <h4 className="footer-col-title green">Plataforma</h4>
            <p className="footer-link" onClick={() => onNavigate && onNavigate('ejercicios')}>Entrenamiento y Análisis</p>
            <p className="footer-link" onClick={() => onNavigate && onNavigate('gps')}>Gimnasios Adheridos</p>
          </div>
          <div>
            <h4 className="footer-col-title blue">Soporte & Legal</h4>
            <p className="footer-link" onClick={() => setActiveModal('soporte')}>Contacto / Soporte</p>
            <p className="footer-link" onClick={() => setActiveModal('terminos')}>Términos del Servicio</p>
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