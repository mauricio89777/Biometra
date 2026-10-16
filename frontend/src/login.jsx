import React, { useState } from 'react';

export default function Login({ onLoginSuccess }) {
  const [mode, setMode] = useState('login'); 
  const [role, setRole] = useState('cliente');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Estado para la casilla de Términos y Condiciones
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

  // Base de usuarios iniciales
  const [registeredUsers, setRegisteredUsers] = useState([
    { 
      name: 'Carlos Pérez', 
      email: 'cliente@ejemplo.com', 
      password: '123', 
      role: 'cliente' 
    },
    { 
      name: 'Entrenador Marco', 
      email: 'entrenador@ejemplo.com', 
      password: '123', 
      role: 'entrenador',
      clientesAsignados: [
        { id: 1, nombre: 'Ana Gómez', plan: 'Hipertrofia', nivel: 'Intermedio', ultimaSesion: 'Ayer', progreso: '85%' },
        { id: 2, nombre: 'Carlos Pérez', plan: 'Fuerza Máxima', nivel: 'Avanzado', ultimaSesion: 'Hoy', progreso: '92%' },
        { id: 3, nombre: 'Lucía Fernández', plan: 'Rehabilitación', nivel: 'Principiante', ultimaSesion: 'Hace 3 días', progreso: '60%' }
      ]
    }
  ]);

  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [currentUser, setCurrentUser] = useState(null);

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
        setErrorMessage('Debes aceptar los Términos y Condiciones para continuar.');
        return;
      }

      const userExists = registeredUsers.some(u => u.email.toLowerCase() === email.trim().toLowerCase());
      
      if (userExists) {
        setErrorMessage('El correo electrónico ya se encuentra registrado.');
        return;
      }

      const newUser = { 
        name: name.trim() || (role === 'cliente' ? 'Cliente Biometra' : 'Entrenador Biometra'), 
        email: email.trim().toLowerCase(), 
        password, 
        role,
        ...(role === 'entrenador' ? { clientesAsignados: [] } : {})
      };

      setRegisteredUsers([...registeredUsers, newUser]);
      setSuccessMessage('¡Cuenta creada con éxito! Inicia sesión ahora.');

      setTimeout(() => {
        setMode('login');
        setEmail(newUser.email);
        setPassword('');
        setAcceptedTerms(false);
      }, 1500);

    } else {
      const cleanEmail = email.trim().toLowerCase();
      const userFoundByEmail = registeredUsers.find(u => u.email.toLowerCase() === cleanEmail);

      if (!userFoundByEmail) {
        setErrorMessage('El correo electrónico no está registrado.');
        return;
      }

      if (userFoundByEmail.password !== password) {
        setErrorMessage('Contraseña incorrecta. Por favor, verifica tus datos.');
        return;
      }

      setCurrentUser(userFoundByEmail);

      if (onLoginSuccess) {
        onLoginSuccess({
          email: userFoundByEmail.email,
          role: userFoundByEmail.role,
          name: userFoundByEmail.name
        });
      }
    }
  };

  // PANEL DEL ENTRENADOR
  if (currentUser && currentUser.role === 'entrenador') {
    return (
      <div style={{
        width: '100vw',
        minHeight: '100vh',
        backgroundColor: '#0f172a',
        color: '#fff',
        fontFamily: 'system-ui, sans-serif',
        padding: '2rem',
        boxSizing: 'border-box'
      }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', borderBottom: '1px solid #334155', paddingBottom: '1rem' }}>
            <div>
              <h1 style={{ margin: 0, fontSize: '1.8rem', color: '#38bdf8' }}>🏋️‍♂️ Panel de Entrenador</h1>
              <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.9rem' }}>Bienvenido/a, {currentUser.name}</p>
            </div>
            <button 
              onClick={() => setCurrentUser(null)}
              style={{ backgroundColor: '#ef4444', color: '#fff', border: 'none', padding: '0.6rem 1.2rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
              Cerrar Sesión
            </button>
          </header>

          <h2 style={{ fontSize: '1.3rem', marginBottom: '1rem', color: '#f8fafc' }}>📋 Clientes Registrados y Estado de Entrenamiento</h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
            {currentUser.clientesAsignados && currentUser.clientesAsignados.length > 0 ? (
              currentUser.clientesAsignados.map((cliente) => (
                <div key={cliente.id} style={{
                  backgroundColor: '#1e293b',
                  borderRadius: '12px',
                  padding: '1.5rem',
                  border: '1px solid #38bdf8',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
                    <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#fff' }}>👤 {cliente.nombre}</h3>
                    <span style={{ backgroundColor: 'rgba(56, 189, 248, 0.2)', color: '#38bdf8', padding: '0.2rem 0.6rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                      {cliente.nivel}
                    </span>
                  </div>

                  <p style={{ margin: '0.4rem 0', color: '#cbd5e1', fontSize: '0.85rem' }}>🎯 <strong>Plan:</strong> {cliente.plan}</p>
                  <p style={{ margin: '0.4rem 0', color: '#cbd5e1', fontSize: '0.85rem' }}>🕒 <strong>Última Sesión:</strong> {cliente.ultimaSesion}</p>
                  <p style={{ margin: '0.4rem 0', color: '#cbd5e1', fontSize: '0.85rem' }}>📈 <strong>Cumplimiento:</strong> {cliente.progreso}</p>

                  <button style={{ width: '100%', marginTop: '1rem', backgroundColor: '#38bdf8', color: '#0f172a', border: 'none', padding: '0.5rem', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
                    Ver Detalles y Asignar Rutina
                  </button>
                </div>
              ))
            ) : (
              <p style={{ color: '#94a3b8' }}>Aún no tienes clientes asignados a tu cuenta.</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // FORMULARIO PRINCIPAL
  return (
    <div style={{
      width: '100vw',
      minHeight: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#0f172a',
      fontFamily: 'system-ui, sans-serif',
      boxSizing: 'border-box'
    }}>
      <div style={{
        backgroundColor: '#1e293b',
        width: '90%',
        maxWidth: '420px',
        padding: '2.5rem 2rem',
        borderRadius: '16px',
        border: '1px solid #38bdf8',
        boxShadow: '0 10px 30px rgba(56, 189, 248, 0.25)',
        color: '#fff',
        position: 'relative'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '1.8rem' }}>
          <h1 style={{ margin: 0, fontSize: '2.2rem', fontWeight: '800' }}>🏋️‍♂️ Biometra</h1>
          <p style={{ color: '#38bdf8', fontSize: '0.85rem', fontWeight: '700', letterSpacing: '0.5px', margin: '0.5rem 0 0 0', textTransform: 'uppercase' }}>
            ⚡ Domina tu técnica, supera tus límites
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', backgroundColor: '#0f172a', padding: '0.3rem', borderRadius: '8px' }}>
          <button 
            type="button"
            onClick={() => handleTabChange('login')}
            style={{ flex: 1, padding: '0.65rem', border: 'none', borderRadius: '6px', backgroundColor: mode === 'login' ? '#38bdf8' : 'transparent', color: mode === 'login' ? '#0f172a' : '#cbd5e1', fontWeight: 'bold', cursor: 'pointer' }}>
            Iniciar Sesión
          </button>
          <button 
            type="button"
            onClick={() => handleTabChange('register')}
            style={{ flex: 1, padding: '0.65rem', border: 'none', borderRadius: '6px', backgroundColor: mode === 'register' ? '#38bdf8' : 'transparent', color: mode === 'register' ? '#0f172a' : '#cbd5e1', fontWeight: 'bold', cursor: 'pointer' }}>
            Crear Cuenta
          </button>
        </div>

        {errorMessage && (
          <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.2)', border: '1px solid #ef4444', color: '#fca5a5', padding: '0.7rem', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '1rem', textAlign: 'center' }}>
            ⚠️ {errorMessage}
          </div>
        )}

        {successMessage && (
          <div style={{ backgroundColor: 'rgba(34, 197, 94, 0.2)', border: '1px solid #22c55e', color: '#86efac', padding: '0.7rem', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '1rem', textAlign: 'center' }}>
            ✅ {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
          {mode === 'register' && (
            <>
              <div>
                <label style={{ display: 'block', marginBottom: '0.4rem', color: '#cbd5e1', fontSize: '0.85rem', fontWeight: '600' }}>Nombre Completo</label>
                <input 
                  type="text" 
                  required
                  placeholder="Ej. Alex Rivera"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #334155', backgroundColor: '#0f172a', color: '#fff', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.4rem', color: '#cbd5e1', fontSize: '0.85rem', fontWeight: '600' }}>Tipo de Perfil</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button 
                    type="button"
                    onClick={() => setRole('cliente')}
                    style={{ flex: 1, padding: '0.5rem', border: '1px solid #334155', borderRadius: '6px', backgroundColor: role === 'cliente' ? 'rgba(56, 189, 248, 0.2)' : '#0f172a', color: role === 'cliente' ? '#38bdf8' : '#cbd5e1', cursor: 'pointer', fontWeight: 'bold' }}>
                    👤 Cliente
                  </button>
                  <button 
                    type="button"
                    onClick={() => setRole('entrenador')}
                    style={{ flex: 1, padding: '0.5rem', border: '1px solid #334155', borderRadius: '6px', backgroundColor: role === 'entrenador' ? 'rgba(56, 189, 248, 0.2)' : '#0f172a', color: role === 'entrenador' ? '#38bdf8' : '#cbd5e1', cursor: 'pointer', fontWeight: 'bold' }}>
                    📋 Entrenador
                  </button>
                </div>
              </div>
            </>
          )}

          <div>
            <label style={{ display: 'block', marginBottom: '0.4rem', color: '#cbd5e1', fontSize: '0.85rem', fontWeight: '600' }}>Correo Electrónico</label>
            <input 
              type="email" 
              required
              placeholder="cliente@ejemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #334155', backgroundColor: '#0f172a', color: '#fff', boxSizing: 'border-box' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.4rem', color: '#cbd5e1', fontSize: '0.85rem', fontWeight: '600' }}>Contraseña</label>
            <input 
              type="password" 
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #334155', backgroundColor: '#0f172a', color: '#fff', boxSizing: 'border-box' }}
            />
          </div>

          {/* CASILLA DE TÉRMINOS Y CONDICIONES (SOLO EN REGISTRO) */}
          {mode === 'register' && (
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', marginTop: '0.2rem' }}>
              <input 
                type="checkbox"
                id="terms"
                required
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                style={{ marginTop: '0.2rem', cursor: 'pointer', width: '18px', height: '18px', accentColor: '#38bdf8' }}
              />
              <label htmlFor="terms" style={{ color: '#cbd5e1', fontSize: '0.8rem', lineHeight: '1.3', cursor: 'pointer' }}>
                Acepto los{' '}
                <button 
                  type="button" 
                  onClick={() => setShowTermsModal(true)}
                  style={{ background: 'none', border: 'none', color: '#38bdf8', textDecoration: 'underline', padding: 0, fontSize: '0.8rem', cursor: 'pointer', fontWeight: 'bold' }}>
                  Términos y Condiciones
                </button>
                {' '}para el uso del servicio y análisis biomecánico.
              </label>
            </div>
          )}

          <button 
            type="submit"
            disabled={mode === 'register' && !acceptedTerms}
            style={{ 
              marginTop: '0.8rem', 
              backgroundColor: mode === 'register' && !acceptedTerms ? '#475569' : '#38bdf8', 
              color: mode === 'register' && !acceptedTerms ? '#94a3b8' : '#0f172a', 
              border: 'none', 
              padding: '0.85rem', 
              borderRadius: '8px', 
              cursor: mode === 'register' && !acceptedTerms ? 'not-allowed' : 'pointer', 
              fontWeight: 'bold', 
              fontSize: '0.95rem',
              transition: 'all 0.2s ease'
            }}>
            {mode === 'login' ? 'Ingresar a la Plataforma' : 'Registrar Cuenta'}
          </button>
        </form>

        {mode === 'login' && (
          <div style={{ textAlign: 'center', color: '#64748b', fontSize: '0.78rem', marginTop: '1.2rem' }}>
            <p style={{ margin: '0.2rem 0' }}>💡 Demo Cliente: <strong>cliente@ejemplo.com</strong> / <strong>123</strong></p>
            <p style={{ margin: '0.2rem 0' }}>💡 Demo Entrenador: <strong>entrenador@ejemplo.com</strong> / <strong>123</strong></p>
          </div>
        )}
      </div>

      {/* VENTANA MODAL TÉRMINOS Y CONDICIONES */}
      {showTermsModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(15, 23, 42, 0.85)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          padding: '1rem',
          boxSizing: 'border-box'
        }}>
          <div style={{
            backgroundColor: '#1e293b',
            border: '1px solid #38bdf8',
            borderRadius: '16px',
            maxWidth: '550px',
            width: '100%',
            maxHeight: '80vh',
            display: 'flex',
            flexDirection: 'column',
            padding: '1.8rem',
            boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
            color: '#fff'
          }}>
            <h2 style={{ margin: '0 0 1rem 0', color: '#38bdf8', fontSize: '1.4rem' }}>📜 Términos y Condiciones de Biometra</h2>
            
            <div style={{ overflowY: 'auto', flex: 1, paddingRight: '0.5rem', color: '#cbd5e1', fontSize: '0.85rem', lineHeight: '1.6' }}>
              <p><strong>1. Uso de la Plataforma:</strong> Biometra es una herramienta tecnológica destinada a asistir y monitorear la ejecución física, postura y métricas biomecánicas en entrenamientos deportivos.</p>
              
              <p><strong>2. Descargo de Responsabilidad Médica:</strong> La plataforma no sustituye la asesoría médica profesional ni el criterio de un especialista en rehabilitación física o traumatología. Realiza tus actividades físicas bajo tu propia supervisión y responsabilidad.</p>
              
              <p><strong>3. Protección de Datos y Captura Biomecánica:</strong> Todos los datos de movimiento, registros de rutinas y métricas ingresadas son procesadas de manera privada para adaptar tu plan de entrenamiento y no serán compartidas con terceros sin autorización previa.</p>
              
              <p><strong>4. Cuentas de Entrenador y Cliente:</strong> Los usuarios son responsables de mantener la confidencialidad de sus credenciales de acceso. Biometra no se hace responsable por accesos no autorizados resultantes del descuido del usuario.</p>
              
              <p><strong>5. Modificaciones del Servicio:</strong> Biometra se reserva el derecho de actualizar o ajustar las funciones de software para optimizar la precisión de los análisis.</p>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #334155' }}>
              <button 
                onClick={() => {
                  setAcceptedTerms(true);
                  setShowTermsModal(false);
                }}
                style={{ flex: 1, backgroundColor: '#38bdf8', color: '#0f172a', border: 'none', padding: '0.7rem', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
                Entendido y Aceptar
              </button>
              <button 
                onClick={() => setShowTermsModal(false)}
                style={{ backgroundColor: '#334155', color: '#fff', border: 'none', padding: '0.7rem 1.2rem', borderRadius: '8px', cursor: 'pointer' }}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}