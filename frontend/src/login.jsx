import React, { useState } from 'react';

export default function Login({ onLoginSuccess }) {
  const [mode, setMode] = useState('login'); 
  const [role, setRole] = useState('cliente');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

  // Datos globales gestionados por el Administrador
  const [registeredUsers, setRegisteredUsers] = useState([
    { id: 1, name: 'Carlos Pérez', email: 'cliente@ejemplo.com', password: '123', role: 'cliente', estado: 'Activo' },
    { id: 2, name: 'Ana Gómez', email: 'ana.gomez@ejemplo.com', password: '123', role: 'cliente', estado: 'Activo' },
    { id: 3, name: 'Entrenador Marco', email: 'entrenador@ejemplo.com', password: '123', role: 'entrenador', especialidad: 'Musculación' },
    { id: 4, name: 'Entrenadora Laura', email: 'laura.coach@ejemplo.com', password: '123', role: 'entrenador', especialidad: 'Rehabilitación' },
    { id: 5, name: 'Administrador General', email: 'admin@ejemplo.com', password: '123', role: 'administrador' }
  ]);

  const [sedesGimnasio, setSedesGimnasio] = useState([
    { id: 1, nombre: 'Smart Fit - Plaza Victoria', ciudad: 'Valparaíso', direccion: 'Av. Brasil 1650' },
    { id: 2, nombre: 'Pacific Fitness - Merced', ciudad: 'Santiago', direccion: 'Merced 838' },
    { id: 3, nombre: 'Sportlife - Vitacura', ciudad: 'Santiago', direccion: 'Av. Vitacura 2640' }
  ]);

  const [tabAdmin, setTabAdmin] = useState('clientes');
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
        setErrorMessage('Correo electrónico o contraseña incorrectos.');
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
      setSuccessMessage('¡Cuenta creada con éxito! Inicia sesión ahora.');

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

      setCurrentUser(userFound);

      if (onLoginSuccess) {
        onLoginSuccess({
          email: userFound.email,
          role: userFound.role,
          name: userFound.name
        });
      }
    }
  };

  const eliminarSede = (id) => {
    setSedesGimnasio(sedesGimnasio.filter(s => s.id !== id));
  };

  const eliminarUsuario = (id) => {
    setRegisteredUsers(registeredUsers.filter(u => u.id !== id));
  };

  // VISTA PANEL ADMINISTRADOR EXCLUSIVO
  if (currentUser && currentUser.role === 'administrador') {
    const clientes = registeredUsers.filter(u => u.role === 'cliente');
    const entrenadores = registeredUsers.filter(u => u.role === 'entrenador');

    return (
      <div style={{ width: '100vw', minHeight: '100vh', backgroundColor: '#0f172a', color: '#fff', fontFamily: 'system-ui, sans-serif', padding: '2rem', boxSizing: 'border-box' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', borderBottom: '1px solid #334155', paddingBottom: '1rem' }}>
            <div>
              <h1 style={{ margin: 0, fontSize: '1.8rem', color: '#38bdf8' }}>⚙️ Panel Exclusivo de Administración</h1>
              <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.9rem' }}>Bienvenido/a, {currentUser.name}</p>
            </div>
            <button onClick={() => setCurrentUser(null)} style={{ backgroundColor: '#ef4444', color: '#fff', border: 'none', padding: '0.6rem 1.2rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
              Cerrar Sesión
            </button>
          </header>

          {/* NAU DE PESTAÑAS DEL ADMIN */}
          <div style={{ display: 'flex', gap: '0.8rem', marginBottom: '1.5rem' }}>
            <button onClick={() => setTabAdmin('clientes')} style={{ flex: 1, padding: '0.8rem', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer', backgroundColor: tabAdmin === 'clientes' ? '#38bdf8' : '#1e293b', color: tabAdmin === 'clientes' ? '#0f172a' : '#fff' }}>
              👤 Clientes ({clientes.length})
            </button>
            <button onClick={() => setTabAdmin('entrenadores')} style={{ flex: 1, padding: '0.8rem', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer', backgroundColor: tabAdmin === 'entrenadores' ? '#38bdf8' : '#1e293b', color: tabAdmin === 'entrenadores' ? '#0f172a' : '#fff' }}>
              📋 Entrenadores ({entrenadores.length})
            </button>
            <button onClick={() => setTabAdmin('sedes')} style={{ flex: 1, padding: '0.8rem', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer', backgroundColor: tabAdmin === 'sedes' ? '#38bdf8' : '#1e293b', color: tabAdmin === 'sedes' ? '#0f172a' : '#fff' }}>
              🏢 Sedes de Entrenamiento ({sedesGimnasio.length})
            </button>
          </div>

          {/* TAB CLIENTES */}
          {tabAdmin === 'clientes' && (
            <div style={{ backgroundColor: '#1e293b', padding: '1.5rem', borderRadius: '12px', border: '1px solid #334155' }}>
              <h3 style={{ margin: '0 0 1rem 0', color: '#00FF87' }}>Lista de Clientes Registrados</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                {clientes.map(c => (
                  <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#0f172a', padding: '1rem', borderRadius: '8px' }}>
                    <div>
                      <strong>{c.name}</strong>
                      <span style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8' }}>{c.email}</span>
                    </div>
                    <button onClick={() => eliminarUsuario(c.id)} style={{ backgroundColor: '#ef4444', color: '#fff', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold' }}>
                      Eliminar
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB ENTRENADORES */}
          {tabAdmin === 'entrenadores' && (
            <div style={{ backgroundColor: '#1e293b', padding: '1.5rem', borderRadius: '12px', border: '1px solid #334155' }}>
              <h3 style={{ margin: '0 0 1rem 0', color: '#38bdf8' }}>Lista de Entrenadores Registrados</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                {entrenadores.map(e => (
                  <div key={e.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#0f172a', padding: '1rem', borderRadius: '8px' }}>
                    <div>
                      <strong>{e.name}</strong>
                      <span style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8' }}>{e.email}</span>
                    </div>
                    <button onClick={() => eliminarUsuario(e.id)} style={{ backgroundColor: '#ef4444', color: '#fff', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold' }}>
                      Eliminar
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB SEDES DE ENTRENAMIENTO */}
          {tabAdmin === 'sedes' && (
            <div style={{ backgroundColor: '#1e293b', padding: '1.5rem', borderRadius: '12px', border: '1px solid #334155' }}>
              <h3 style={{ margin: '0 0 1rem 0', color: '#818cf8' }}>Sedes de Entrenamiento Registradas</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                {sedesGimnasio.map(s => (
                  <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#0f172a', padding: '1rem', borderRadius: '8px' }}>
                    <div>
                      <strong>{s.nombre}</strong>
                      <span style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8' }}>📍 {s.direccion} ({s.ciudad})</span>
                    </div>
                    <button onClick={() => eliminarSede(s.id)} style={{ backgroundColor: '#ef4444', color: '#fff', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold' }}>
                      🗑️ Eliminar Sede
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // FORMULARIO PRINCIPAL
  return (
    <div style={{ width: '100vw', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#0f172a', fontFamily: 'system-ui, sans-serif', boxSizing: 'border-box' }}>
      <div style={{ backgroundColor: '#1e293b', width: '90%', maxWidth: '420px', padding: '2.5rem 2rem', borderRadius: '16px', border: '1px solid #38bdf8', boxShadow: '0 10px 30px rgba(56, 189, 248, 0.25)', color: '#fff' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.8rem' }}>
          <h1 style={{ margin: 0, fontSize: '2.2rem', fontWeight: '800' }}>🏋️‍♂️ Biometra</h1>
          <p style={{ color: '#38bdf8', fontSize: '0.85rem', fontWeight: '700', letterSpacing: '0.5px', margin: '0.5rem 0 0 0', textTransform: 'uppercase' }}>
            ⚡ Domina tu técnica, supera tus límites
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', backgroundColor: '#0f172a', padding: '0.3rem', borderRadius: '8px' }}>
          <button type="button" onClick={() => handleTabChange('login')} style={{ flex: 1, padding: '0.65rem', border: 'none', borderRadius: '6px', backgroundColor: mode === 'login' ? '#38bdf8' : 'transparent', color: mode === 'login' ? '#0f172a' : '#cbd5e1', fontWeight: 'bold', cursor: 'pointer' }}>
            Iniciar Sesión
          </button>
          <button type="button" onClick={() => handleTabChange('register')} style={{ flex: 1, padding: '0.65rem', border: 'none', borderRadius: '6px', backgroundColor: mode === 'register' ? '#38bdf8' : 'transparent', color: mode === 'register' ? '#0f172a' : '#cbd5e1', fontWeight: 'bold', cursor: 'pointer' }}>
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
                <input type="text" required placeholder="Ej. Alex Rivera" value={name} onChange={(e) => setName(e.target.value)} style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #334155', backgroundColor: '#0f172a', color: '#fff', boxSizing: 'border-box' }} />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.4rem', color: '#cbd5e1', fontSize: '0.85rem', fontWeight: '600' }}>Tipo de Perfil</label>
                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  <button type="button" onClick={() => setRole('cliente')} style={{ flex: 1, padding: '0.5rem', border: '1px solid #334155', borderRadius: '6px', backgroundColor: role === 'cliente' ? 'rgba(56, 189, 248, 0.2)' : '#0f172a', color: role === 'cliente' ? '#38bdf8' : '#cbd5e1', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.78rem' }}>
                    👤 Cliente
                  </button>
                  <button type="button" onClick={() => setRole('entrenador')} style={{ flex: 1, padding: '0.5rem', border: '1px solid #334155', borderRadius: '6px', backgroundColor: role === 'entrenador' ? 'rgba(56, 189, 248, 0.2)' : '#0f172a', color: role === 'entrenador' ? '#38bdf8' : '#cbd5e1', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.78rem' }}>
                    📋 Entrenador
                  </button>
                  <button type="button" onClick={() => setRole('administrador')} style={{ flex: 1, padding: '0.5rem', border: '1px solid #334155', borderRadius: '6px', backgroundColor: role === 'administrador' ? 'rgba(56, 189, 248, 0.2)' : '#0f172a', color: role === 'administrador' ? '#38bdf8' : '#cbd5e1', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.78rem' }}>
                    ⚙️ Admin
                  </button>
                </div>
              </div>
            </>
          )}

          <div>
            <label style={{ display: 'block', marginBottom: '0.4rem', color: '#cbd5e1', fontSize: '0.85rem', fontWeight: '600' }}>Correo Electrónico</label>
            <input type="email" required placeholder="cliente@ejemplo.com" value={email} onChange={(e) => setEmail(e.target.value)} style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #334155', backgroundColor: '#0f172a', color: '#fff', boxSizing: 'border-box' }} />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.4rem', color: '#cbd5e1', fontSize: '0.85rem', fontWeight: '600' }}>Contraseña</label>
            <input type="password" required placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #334155', backgroundColor: '#0f172a', color: '#fff', boxSizing: 'border-box' }} />
          </div>

          {mode === 'register' && (
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', marginTop: '0.2rem' }}>
              <input type="checkbox" id="terms" required checked={acceptedTerms} onChange={(e) => setAcceptedTerms(e.target.checked)} style={{ marginTop: '0.2rem', cursor: 'pointer', width: '18px', height: '18px', accentColor: '#38bdf8' }} />
              <label htmlFor="terms" style={{ color: '#cbd5e1', fontSize: '0.8rem', lineHeight: '1.3', cursor: 'pointer' }}>
                Acepto los{' '}
                <button type="button" onClick={() => setShowTermsModal(true)} style={{ background: 'none', border: 'none', color: '#38bdf8', textDecoration: 'underline', padding: 0, fontSize: '0.8rem', cursor: 'pointer', fontWeight: 'bold' }}>
                  Términos y Condiciones
                </button>
              </label>
            </div>
          )}

          <button type="submit" disabled={mode === 'register' && !acceptedTerms} style={{ marginTop: '0.8rem', backgroundColor: mode === 'register' && !acceptedTerms ? '#475569' : '#38bdf8', color: mode === 'register' && !acceptedTerms ? '#94a3b8' : '#0f172a', border: 'none', padding: '0.85rem', borderRadius: '8px', cursor: mode === 'register' && !acceptedTerms ? 'not-allowed' : 'pointer', fontWeight: 'bold', fontSize: '0.95rem' }}>
            {mode === 'login' ? 'Ingresar a la Plataforma' : 'Registrar Cuenta'}
          </button>
        </form>

        {mode === 'login' && (
          <div style={{ textAlign: 'center', color: '#64748b', fontSize: '0.75rem', marginTop: '1.2rem' }}>
            <p style={{ margin: '0.2rem 0' }}>💡 Cliente: <strong>cliente@ejemplo.com</strong> / <strong>123</strong></p>
            <p style={{ margin: '0.2rem 0' }}>💡 Entrenador: <strong>entrenador@ejemplo.com</strong> / <strong>123</strong></p>
            <p style={{ margin: '0.2rem 0' }}>💡 Admin: <strong>admin@ejemplo.com</strong> / <strong>123</strong></p>
          </div>
        )}
      </div>

      {showTermsModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(15, 23, 42, 0.85)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '1rem', boxSizing: 'border-box' }}>
          <div style={{ backgroundColor: '#1e293b', border: '1px solid #38bdf8', borderRadius: '16px', maxWidth: '550px', width: '100%', maxHeight: '80vh', display: 'flex', flexDirection: 'column', padding: '1.8rem', color: '#fff' }}>
            <h2 style={{ margin: '0 0 1rem 0', color: '#38bdf8', fontSize: '1.4rem' }}>📜 Términos y Condiciones</h2>
            <div style={{ overflowY: 'auto', flex: 1, paddingRight: '0.5rem', color: '#cbd5e1', fontSize: '0.85rem', lineHeight: '1.6' }}>
              <p>Biometra es una herramienta tecnológica para monitorear métricas biomecánicas en entrenamientos. Los datos recopilados son de carácter privado y protegidos conforme a las normativas de privacidad vigentes.</p>
            </div>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #334155' }}>
              <button onClick={() => { setAcceptedTerms(true); setShowTermsModal(false); }} style={{ flex: 1, backgroundColor: '#38bdf8', color: '#0f172a', border: 'none', padding: '0.7rem', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
                Entendido y Aceptar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}