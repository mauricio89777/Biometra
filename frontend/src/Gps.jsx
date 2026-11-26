import React, { useState, useEffect } from 'react';
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
  const [filterComuna, setFilterComuna] = useState('todas');
  const [filterMarca, setFilterMarca] = useState('todas');
  const [activeModal, setActiveModal] = useState(null);

  const [gimnasiosChile, setGimnasiosChile] = useState([]);
  const [selectedGym, setSelectedGym] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorCarga, setErrorCarga] = useState('');

  // Consultar gimnasios reales al cargar la página
  useEffect(() => {
    const cargarGimnasios = async () => {
      try {
        setLoading(true);
        setErrorCarga('');

        const respuesta = await fetch(
          'http://localhost:3000/gimnasios/buscar?region=metropolitana'
        );

        if (!respuesta.ok) {
          throw new Error(`Error del servidor: ${respuesta.status}`);
        }

        const datos = await respuesta.json();

        const resultados = datos.resultados.map(gym => ({
          ...gym,
          region: 'Región Metropolitana'
        }));

        setGimnasiosChile(resultados);
        setSelectedGym(resultados[0] || null);

      } catch (error) {
        console.error('Error cargando gimnasios:', error);
        setErrorCarga('No fue posible cargar los gimnasios. Intenta nuevamente.');
      } finally {
        setLoading(false);
      }
    };

    cargarGimnasios();
  }, []);


  
// Marcas registradas en OpenStreetMap
const marcasDisponibles = [
  'todas',
  ...Array.from(
    new Set(gimnasiosChile.map(g => g.marca).filter(Boolean))
  ).sort((a, b) => a.localeCompare(b, 'es'))
];

  // Comunas realmente registradas
  const comunasDisponibles = [
    'todas',
    ...Array.from(
      new Set(gimnasiosChile.map(g => g.comuna).filter(Boolean))
    ).sort((a, b) => a.localeCompare(b, 'es'))
  ];

  // Búsqueda y filtros
  const gimnasiosFiltrados = gimnasiosChile.filter(gym => {
    const texto = searchQuery.trim().toLowerCase();

    const coincideTexto =
      (gym.nombre || '').toLowerCase().includes(texto) ||
      (gym.direccion || '').toLowerCase().includes(texto) ||
      (gym.comuna || '').toLowerCase().includes(texto) ||
      (gym.marca || '').toLowerCase().includes(texto);

    const coincideMarca =
      filterMarca === 'todas' || gym.marca === filterMarca;

    const coincideComuna =
      filterComuna === 'todas' || gym.comuna === filterComuna;

    return coincideTexto && coincideMarca && coincideComuna;
  });


  useEffect(() => {
  const sigueVisible = gimnasiosFiltrados.some(
    gym => gym.id === selectedGym?.id
  );

  if (!sigueVisible) {
    setSelectedGym(gimnasiosFiltrados[0] || null);
    }
  }, [gimnasiosFiltrados, selectedGym]);

  
  // Centrar el mapa en el gimnasio seleccionado
  const obtenerUrlMapa = () => {
    const latitud = selectedGym?.latitud ?? -33.4489;
    const longitud = selectedGym?.longitud ?? -70.6693;

    const margen = 0.008;

    const bbox = [
      longitud - margen,
      latitud - margen,
      longitud + margen,
      latitud + margen
    ].join(',');

    return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${latitud},${longitud}`;
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

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'default' }}>
              <BiometraLogoIcon />
              <span className="brand-name">BIOMETRA</span>
            </div>
          </div>

          <nav style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
            <button 
              onClick={() => onNavigate && onNavigate('ejercicios')} 
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(0, 255, 135, 0.28)';
                e.currentTarget.style.boxShadow = '0 0 15px rgba(0, 255, 135, 0.35)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(0, 255, 135, 0.14)';
                e.currentTarget.style.boxShadow = '0 0 10px rgba(0, 255, 135, 0.15)';
              }}
              style={{ 
                backgroundColor: 'rgba(0, 255, 135, 0.14)', 
                color: '#00FF87', 
                border: '1px solid #00FF87', 
                padding: '0.55rem 1.2rem', 
                borderRadius: '20px', 
                fontSize: '0.9rem', 
                cursor: 'pointer', 
                fontWeight: '700',
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                boxShadow: '0 0 10px rgba(0, 255, 135, 0.15)',
                transition: 'all 0.2s ease'
              }}
            >
              🏋️ Ejercicios
            </button>
            <button 
              onClick={() => onNavigate && onNavigate('perfil')} 
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

      {/* CONTENIDO PRINCIPAL Y MAPA */}
      <main style={{ maxWidth: '1280px', margin: '0 auto', width: '100%', padding: '2.5rem 2rem', boxSizing: 'border-box', flex: 1 }}>
        
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '2.2rem', fontWeight: '900', color: '#FFFFFF', margin: '0 0 0.4rem 0' }}>
            Gimnasios de la Región Metropolitana
          </h2>
          <p style={{ color: '#94A3B8', fontSize: '1rem', margin: 0 }}>
            Consulta gimnasios registrados en OpenStreetMap. Busca por nombre, comuna o marca y explora sus ubicaciones.
          </p>
        </div>

        {/* ESTRUCTURA BÚSQUEDA + MAPA */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '2rem', alignItems: 'start' }}>
          
          {/* BÚSQUEDA Y LISTA DE RESULTADOS */}
          <div style={{ backgroundColor: '#1E293B', borderRadius: '16px', padding: '2rem', border: '1px solid #334155', boxShadow: '0 10px 30px rgba(0,0,0,0.3)' }}>
              
            
            {/* BARRA DE BÚSQUEDA */}
            <div style={{ marginBottom: '1.2rem' }}>
              <label style={{
                fontSize: '0.75rem',
                color: '#94A3B8',
                display: 'block',
                marginBottom: '0.5rem',
                fontWeight: '700'
              }}>
                BUSCAR GIMNASIO:
              </label>

              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Nombre, dirección o comuna..."
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: '0.85rem',
                  borderRadius: '8px',
                  backgroundColor: '#0F172A',
                  color: '#FFFFFF',
                  border: '1px solid #334155',
                  outline: 'none'
                }}
              />
            </div>

            {/* FILTROS */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '1rem',
              marginBottom: '1.5rem'
            }}>
              <div>
                <label style={{
                  fontSize: '0.75rem',
                  color: '#94A3B8',
                  display: 'block',
                  marginBottom: '0.4rem',
                  fontWeight: '700'
                }}>
                  COMUNA:
                </label>

                <select
                  value={filterComuna}
                  onChange={(e) => setFilterComuna(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.6rem',
                    borderRadius: '8px',
                    backgroundColor: '#0F172A',
                    color: '#FFFFFF',
                    border: '1px solid #334155',
                    fontWeight: '600',
                    outline: 'none'
                  }}
                >
                  <option value="todas">Todas las comunas</option>

                  {comunasDisponibles
                    .filter(c => c !== 'todas')
                    .map(comuna => (
                      <option key={comuna} value={comuna}>
                        {comuna}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label style={{
                  fontSize: '0.75rem',
                  color: '#94A3B8',
                  display: 'block',
                  marginBottom: '0.4rem',
                  fontWeight: '700'
                }}>
                  CADENA / MARCA:
                </label>

                <select
                  value={filterMarca}
                  onChange={(e) => setFilterMarca(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.6rem',
                    borderRadius: '8px',
                    backgroundColor: '#0F172A',
                    color: '#FFFFFF',
                    border: '1px solid #334155',
                    fontWeight: '600',
                    outline: 'none'
                  }}
                >
                  <option value="todas">Todas las marcas</option>

                  {marcasDisponibles
                    .filter(m => m !== 'todas')
                    .map(marca => (
                      <option key={marca} value={marca}>
                        {marca}
                      </option>
                    ))}
                </select>
              </div>
            </div>

            <div style={{
              fontSize: '0.85rem',
              color: '#94A3B8',
              marginBottom: '1rem',
              fontWeight: '600'
            }}>
              {loading
                ? 'Buscando gimnasios...'
                : `Sedes encontradas: ${gimnasiosFiltrados.length}`}
            </div>

            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              maxHeight: '480px',
              overflowY: 'auto'
            }}>
              {loading ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#38BDF8' }}>
                  Consultando OpenStreetMap...
                </div>
              ) : errorCarga ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#F87171' }}>
                  {errorCarga}
                </div>
              ) : gimnasiosFiltrados.length === 0 ? (
                <div style={{
                  textAlign: 'center',
                  padding: '2rem',
                  backgroundColor: '#0F172A',
                  borderRadius: '12px',
                  border: '1px dashed #334155'
                }}>
                  <p style={{ color: '#00FF87', fontWeight: '800' }}>
                    No se encontraron gimnasios
                  </p>
                  <p style={{ color: '#94A3B8', fontSize: '0.85rem' }}>
                    Prueba con otro nombre, marca o comuna.
                  </p>
                </div>
              ) : (
                gimnasiosFiltrados.map(gym => (
                  <div
                    key={gym.id}
                    onClick={() => setSelectedGym(gym)}
                    style={{
                      backgroundColor: selectedGym?.id === gym.id ? '#0F172A' : '#182234',
                      border: selectedGym?.id === gym.id
                        ? '1px solid #00FF87'
                        : '1px solid #334155',
                      borderRadius: '12px',
                      padding: '1.2rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '0.4rem'
                    }}>
                      <h4 style={{
                        margin: 0,
                        fontSize: '1rem',
                        color: '#FFFFFF',
                        fontWeight: '800'
                      }}>
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
                        {gym.region}
                      </span>
                    </div>

                    <p style={{
                      margin: '0 0 0.5rem 0',
                      color: '#94A3B8',
                      fontSize: '0.85rem'
                    }}>
                      {gym.direccion || 'Dirección no registrada'}
                    </p>

                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginTop: '0.8rem',
                      paddingTop: '0.6rem',
                      borderTop: '1px solid #1E293B'
                    }}>
                      <span style={{ color: '#38BDF8', fontSize: '0.8rem' }}>
                        {gym.marca || 'Marca no registrada'}
                      </span>

                      <span style={{ color: '#94A3B8', fontSize: '0.8rem' }}>
                        {gym.comuna || 'Comuna no registrada'}
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
              <div style={{
                backgroundColor: '#1E293B',
                borderRadius: '16px',
                padding: '1.8rem',
                border: '1px solid #00FF87',
                boxShadow: '0 0 25px rgba(0,255,135,0.15)'
              }}>

                <span style={{
                  color: '#00FF87',
                  fontSize: '0.8rem',
                  fontWeight: '800'
                }}>
                  SEDE SELECCIONADA
                </span>

                <h3 style={{
                  margin: '0.5rem 0',
                  color: '#FFFFFF',
                  fontSize: '1.4rem',
                  fontWeight: '900'
                }}>
                  {selectedGym.nombre}
                </h3>

                {(selectedGym.direccion || selectedGym.comuna) && (
                  <p style={{
                    margin: '0 0 1.2rem 0',
                    color: '#94A3B8',
                    fontSize: '0.9rem'
                  }}>
                    {[
                      selectedGym.direccion,
                      selectedGym.comuna
                    ].filter(Boolean).join(' · ')}
                  </p>
                )}

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

                  {selectedGym.marca && (
                    <div>
                      <span style={{
                        color: '#64748B',
                        display: 'block'
                      }}>
                        Marca:
                      </span>
                      <strong>{selectedGym.marca}</strong>
                    </div>
                  )}

                  {selectedGym.comuna && (
                    <div>
                      <span style={{
                        color: '#64748B',
                        display: 'block'
                      }}>
                        Comuna:
                      </span>
                      <strong>{selectedGym.comuna}</strong>
                    </div>
                  )}

                  {selectedGym.direccion && (
                    <div style={{ gridColumn: '1 / -1' }}>
                      <span style={{
                        color: '#64748B',
                        display: 'block'
                      }}>
                        Dirección:
                      </span>
                      <strong>{selectedGym.direccion}</strong>
                    </div>
                  )}

                </div>

               {selectedGym.website && (
                  <p style={{ marginTop: '1rem' }}>
                    <a
                      href={
                        selectedGym.website.startsWith('http')
                          ? selectedGym.website
                          : `https://${selectedGym.website}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: '#38BDF8' }}
                    >
                      Visitar sitio web
                    </a>
                  </p>
                )}

                <p style={{
                  marginTop: '1rem',
                  fontSize: '0.8rem',
                  color: '#94A3B8'
                }}>
                  Fuente: OpenStreetMap. Los datos dependen de la
                  información registrada por sus colaboradores.
                </p>

                <a
                  href={selectedGym.urlMapa}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    color: '#00FF87',
                    fontSize: '0.85rem'
                  }}
                >
                  Ver registro en OpenStreetMap
                </a>

              </div>
            )}


          </div>

        </div>

      </main>

      {/* FOOTER INTERACTIVO */}
      <footer className="footer">
        <div className="footer-brand-col">
          <div className="logo-brand" style={{ cursor: 'default' }}>
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