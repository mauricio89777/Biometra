import React, { useState } from 'react';

// NUEVO ICONO BIOMETRA: Símbolo de pivote cinemático, vectores y visión por computadora
const LogoBiometraIcon = () => (
  <svg 
    width="42" 
    height="42" 
    viewBox="0 0 100 100" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg" 
    style={{ verticalAlign: 'middle' }}
  >
    <defs>
      <linearGradient id="kineticGradientLogin" x1="0%" y1="0%" x2="100%" y2="0%">
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
      stroke="url(#kineticGradientLogin)" 
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

export default function Login({ onLoginSuccess }) {
  const [mode, setMode] = useState('login'); 
  const [role, setRole] = useState('cliente');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

  const [registeredUsers, setRegisteredUsers] = useState([
    { id: 1, name: 'Carlos Pérez', email: 'cliente@ejemplo.com', password: '123', role: 'cliente', estado: 'Activo' },
    { id: 2, name: 'Ana Gómez', email: 'ana.gomez@ejemplo.com', password: '123', role: 'cliente', estado: 'Activo' },
    { id: 3, name: 'Entrenador Marco', email: 'entrenador@ejemplo.com', password: '123', role: 'entrenador', especialidad: 'Fuerza / Hipertrofia' },
    { id: 4, name: 'Administrador General', email: 'admin@ejemplo.com', password: '123', role: 'administrador' }
  ]);

  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleTabChange = (newMode) => {
    setMode(newMode);
    setErrorMessage('');
    setSuccessMessage('');
    setEmail('');
    setPassword('');
    setName('');
    setAcceptedTerms(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (mode === 'register') {
      if (!acceptedTerms) {
        setErrorMessage('Debes aceptar los Términos y Condiciones Legales para continuar.');
        return;
      }

      const userExists = registeredUsers.some(u => u.email.toLowerCase() === email.trim().toLowerCase());
      
      if (userExists) {
        setErrorMessage('El correo electrónico ya se encuentra registrado.');
        return;
      }

      const newUser = { 
        id: Date.now(),
        name: name.trim() || `${role.charAt(0).toUpperCase() + role.slice(1)} Biometra`, 
        email: email.trim().toLowerCase(), 
        password, 
        role,
        estado: 'Activo'
      };

      setRegisteredUsers([...registeredUsers, newUser]);
      setSuccessMessage('¡Cuenta creada exitosamente! Procede a iniciar sesión.');

      setTimeout(() => {
        setMode('login');
        setEmail(newUser.email);
        setPassword('');
        setAcceptedTerms(false);
      }, 1500);

    } else {
      const cleanEmail = email.trim().toLowerCase();
      const userFound = registeredUsers.find(u => u.email.toLowerCase() === cleanEmail && u.password === password);

      if (!userFound) {
        setErrorMessage('Correo electrónico o contraseña incorrectos.');
        return;
      }

      if (onLoginSuccess) {
        onLoginSuccess({
          email: userFound.email,
          role: userFound.role,
          name: userFound.name
        });
      }
    }
  };

  return (
    <div style={{ width: '100vw', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#0B1120', fontFamily: "'Inter', system-ui, sans-serif", padding: '1rem', boxSizing: 'border-box' }}>
      <div style={{ backgroundColor: '#0F172A', width: '100%', maxWidth: '440px', padding: '2.5rem 2rem', borderRadius: '20px', border: '1px solid #38BDF8', boxShadow: '0 10px 30px rgba(56, 189, 248, 0.2)', color: '#fff' }}>
        
        {/* BRAND CON NUEVO LOGO BIOMECÁNICO */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.8rem', marginBottom: '0.5rem' }}>
            <LogoBiometraIcon />
            <span style={{ fontSize: '1.8rem', fontWeight: '900', letterSpacing: '1px', background: 'linear-gradient(90deg, #00FF87, #38BDF8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              BIOMETRA
            </span>
          </div>
          <p style={{ color: '#94A3B8', fontSize: '0.85rem', margin: 0, fontWeight: '600' }}>
            Plataforma de Análisis Cinemático y Rendimiento
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', backgroundColor: '#1E293B', padding: '0.3rem', borderRadius: '10px' }}>
          <button type="button" onClick={() => handleTabChange('login')} style={{ flex: 1, padding: '0.65rem', border: 'none', borderRadius: '8px', backgroundColor: mode === 'login' ? '#38BDF8' : 'transparent', color: mode === 'login' ? '#0F172A' : '#CBD5E1', fontWeight: 'bold', cursor: 'pointer' }}>
            Iniciar Sesión
          </button>
          <button type="button" onClick={() => handleTabChange('register')} style={{ flex: 1, padding: '0.65rem', border: 'none', borderRadius: '8px', backgroundColor: mode === 'register' ? '#38BDF8' : 'transparent', color: mode === 'register' ? '#0F172A' : '#CBD5E1', fontWeight: 'bold', cursor: 'pointer' }}>
            Crear Cuenta
          </button>
        </div>

        {errorMessage && (
          <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.15)', border: '1px solid #EF4444', color: '#FCA5A5', padding: '0.8rem', borderRadius: '10px', fontSize: '0.85rem', marginBottom: '1rem', textAlign: 'center' }}>
            ⚠️ {errorMessage}
          </div>
        )}

        {successMessage && (
          <div style={{ backgroundColor: 'rgba(0, 255, 135, 0.15)', border: '1px solid #00FF87', color: '#86EFAC', padding: '0.8rem', borderRadius: '10px', fontSize: '0.85rem', marginBottom: '1rem', textAlign: 'center' }}>
            ✅ {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
          {mode === 'register' && (
            <>
              <div>
                <label style={{ display: 'block', marginBottom: '0.4rem', color: '#CBD5E1', fontSize: '0.85rem', fontWeight: '600' }}>Nombre Completo</label>
                <input type="text" required placeholder="Ej. Alex Rivera" value={name} onChange={(e) => setName(e.target.value)} style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #334155', backgroundColor: '#1E293B', color: '#fff', boxSizing: 'border-box' }} />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.4rem', color: '#CBD5E1', fontSize: '0.85rem', fontWeight: '600' }}>Tipo de Perfil</label>
                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  <button type="button" onClick={() => setRole('cliente')} style={{ flex: 1, padding: '0.55rem', border: '1px solid #334155', borderRadius: '6px', backgroundColor: role === 'cliente' ? 'rgba(56, 189, 248, 0.2)' : '#1E293B', color: role === 'cliente' ? '#38BDF8' : '#CBD5E1', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.8rem' }}>
                    👤 Cliente
                  </button>
                  <button type="button" onClick={() => setRole('entrenador')} style={{ flex: 1, padding: '0.55rem', border: '1px solid #334155', borderRadius: '6px', backgroundColor: role === 'entrenador' ? 'rgba(56, 189, 248, 0.2)' : '#1E293B', color: role === 'entrenador' ? '#38BDF8' : '#CBD5E1', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.8rem' }}>
                    📋 Entrenador
                  </button>
                  <button type="button" onClick={() => setRole('administrador')} style={{ flex: 1, padding: '0.55rem', border: '1px solid #334155', borderRadius: '6px', backgroundColor: role === 'administrador' ? 'rgba(56, 189, 248, 0.2)' : '#1E293B', color: role === 'administrador' ? '#38BDF8' : '#CBD5E1', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.8rem' }}>
                    ⚙️ Admin
                  </button>
                </div>
              </div>
            </>
          )}

          <div>
            <label style={{ display: 'block', marginBottom: '0.4rem', color: '#CBD5E1', fontSize: '0.85rem', fontWeight: '600' }}>Correo Electrónico</label>
            <input type="email" required placeholder="cliente@ejemplo.com" value={email} onChange={(e) => setEmail(e.target.value)} style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #334155', backgroundColor: '#1E293B', color: '#fff', boxSizing: 'border-box' }} />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.4rem', color: '#CBD5E1', fontSize: '0.85rem', fontWeight: '600' }}>Contraseña</label>
            <input type="password" required placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #334155', backgroundColor: '#1E293B', color: '#fff', boxSizing: 'border-box' }} />
          </div>

          {mode === 'register' && (
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', marginTop: '0.3rem' }}>
              <input type="checkbox" id="terms" required checked={acceptedTerms} onChange={(e) => setAcceptedTerms(e.target.checked)} style={{ marginTop: '0.2rem', cursor: 'pointer', width: '18px', height: '18px', accentColor: '#38BDF8' }} />
              <label htmlFor="terms" style={{ color: '#CBD5E1', fontSize: '0.8rem', lineHeight: '1.4', cursor: 'pointer' }}>
                He leído y acepto los{' '}
                <button type="button" onClick={() => setShowTermsModal(true)} style={{ background: 'none', border: 'none', color: '#38BDF8', textDecoration: 'underline', padding: 0, fontSize: '0.8rem', cursor: 'pointer', fontWeight: 'bold' }}>
                  Términos y Condiciones Legales Completo
                </button>
              </label>
            </div>
          )}

          <button type="submit" disabled={mode === 'register' && !acceptedTerms} style={{ marginTop: '0.8rem', backgroundColor: mode === 'register' && !acceptedTerms ? '#334155' : '#00FF87', color: mode === 'register' && !acceptedTerms ? '#94A3B8' : '#0F172A', border: 'none', padding: '0.85rem', borderRadius: '8px', cursor: mode === 'register' && !acceptedTerms ? 'not-allowed' : 'pointer', fontWeight: '900', fontSize: '0.95rem' }}>
            {mode === 'login' ? 'Ingresar a la Plataforma' : 'Aceptar Términos y Registrar Cuenta'}
          </button>
        </form>

        {mode === 'login' && (
          <div style={{ textAlign: 'center', color: '#64748B', fontSize: '0.75rem', marginTop: '1.2rem' }}>
            <p style={{ margin: '0.2rem 0' }}>💡 Cliente: <strong>cliente@ejemplo.com</strong> / <strong>123</strong></p>
            <p style={{ margin: '0.2rem 0' }}>💡 Entrenador: <strong>entrenador@ejemplo.com</strong> / <strong>123</strong></p>
            <p style={{ margin: '0.2rem 0' }}>💡 Admin: <strong>admin@ejemplo.com</strong> / <strong>123</strong></p>
          </div>
        )}
      </div>

      {/* MODAL DE TÉRMINOS Y CONDICIONES */}
      {showTermsModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(11, 17, 32, 0.92)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '1.5rem', boxSizing: 'border-box', backdropFilter: 'blur(6px)' }}>
          <div style={{ backgroundColor: '#0F172A', border: '1px solid #38BDF8', borderRadius: '20px', maxWidth: '700px', width: '100%', maxHeight: '88vh', display: 'flex', flexDirection: 'column', padding: '2rem', color: '#fff', boxShadow: '0 25px 50px rgba(0,0,0,0.7)' }}>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1rem', borderBottom: '1px solid #1E293B', paddingBottom: '0.8rem' }}>
              <LogoBiometraIcon />
              <h2 style={{ margin: 0, color: '#38BDF8', fontSize: '1.35rem', fontWeight: '800' }}>
                Marco Legal, Términos de Servicio y Privacidad Biomécnica
              </h2>
            </div>
            
            <div style={{ overflowY: 'auto', flex: 1, paddingRight: '0.8rem', color: '#CBD5E1', fontSize: '0.85rem', lineHeight: '1.65' }}>
              <p><em>Última actualización: Edición Oficial Biometra Chile SpA.</em></p>

              <h4 style={{ color: '#00FF87', margin: '1.2rem 0 0.3rem 0' }}>1. Aceptación Binding de Condiciones de Uso</h4>
              <p>Al hacer clic en "Aceptar", registrar una cuenta de usuario o hacer uso interactivo de los módulos analíticos de Biometra, usted declara expresamente ser mayor de edad o contar con la patria potestad correspondiente, aceptando en su totalidad este Contrato Marco de Adhesión para el uso de Software como Servicio (SaaS).</p>

              <h4 style={{ color: '#00FF87', margin: '1.2rem 0 0.3rem 0' }}>2. Objeto del Software y Deslinde Kinésico/Médico</h4>
              <p>Biometra constituye una plataforma informática de visión por computadora destinada al cálculo de vectores angulares y estimación postural para la actividad física general. Bajo ningún precepto los resultados numéricos o diagnósticos cinemáticos emitidos reemplazarán una prescripción kinésica, evaluación médica presencial o diagnóstico fisioterapéutico profesional.</p>

              <h4 style={{ color: '#00FF87', margin: '1.2rem 0 0.3rem 0' }}>3. Tratamiento de Datos Biométricos y Archivos Audiovisuales</h4>
              <p>En conformidad con las normativas internacionales de protección de datos personales y la Ley N° 19.628 sobre Protección de la Vida Privada, usted consiente expresamente el procesamiento automatizado de los videos subidos a la plataforma. Dichas grabaciones son segmentadas únicamente en mapas de puntos de articulación (pose estimation), estando encriptadas en tránsito y reposo mediante algoritmos AES-256.</p>

              <h4 style={{ color: '#00FF87', margin: '1.2rem 0 0.3rem 0' }}>4. Exención de Responsabilidad por Accidentes o Lesiones Físicas</h4>
              <p>El usuario reconoce de forma explícita que la realización de levantamientos de pesas, ejercicios gimnásticos y sobrecargas biomecánicas conlleva riesgos inherentes de desgarro, luxación o fracturas. Biometra SpA, sus directores y desarrolladores no asumen responsabilidad civil, penal o extracontractual derivada de la imitación defectuosa o sobreesfuerzo físico realizado durante el uso de la aplicación.</p>

              <h4 style={{ color: '#00FF87', margin: '1.2rem 0 0.3rem 0' }}>5. Propiedad Intelectual e Industrial</h4>
              <p>Queda estrictamente prohibida la ingeniería inversa, descompilación, extracción de modelos de aprendizaje profundo o redistribución no autorizada del código fuente, interfaces visuales, iso-logotipos o algoritmos propios de la plataforma Biometra. Todos los derechos quedan reservados.</p>

              <h4 style={{ color: '#00FF87', margin: '1.2rem 0 0.3rem 0' }}>6. Vínculo Entrenador - Cliente</h4>
              <p>Al vincularse con un perfil con rol de "Entrenador", el cliente otorga permiso expreso para que dicho profesional acceda a su historial de grabaciones, métricas de carga y reportes de riesgo postureo a través del panel centralizado.</p>

              <h4 style={{ color: '#00FF87', margin: '1.2rem 0 0.3rem 0' }}>7. Jurisdicción y Legislación Aplicable</h4>
              <p>El presente acuerdo se rige en su totalidad por las leyes de la República de Chile. Cualquier controversia sobre el cumplimiento o interpretación de este instrumento será sometida a la jurisdicción de los Tribunales Ordinarios de Justicia de Santiago.</p>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #1E293B' }}>
              <button onClick={() => { setAcceptedTerms(true); setShowTermsModal(false); }} style={{ flex: 1, backgroundColor: '#00FF87', color: '#0F172A', border: 'none', padding: '0.8rem', borderRadius: '8px', fontWeight: '900', cursor: 'pointer', fontSize: '0.95rem' }}>
                Entendido, Aceptar Términos Legales
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}