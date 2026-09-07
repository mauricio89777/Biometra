import React, { useState } from 'react';

export default function Login({ onLoginSuccess }) {
  // Estado para la pestaña activa: 'login' | 'register'
  const [mode, setMode] = useState('login'); 

  // Campos del formulario
  const [role, setRole] = useState('atleta'); // 'atleta' | 'gimnasio'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // "Base de Datos" temporal guardada en el estado local de React
  const [registeredUsers, setRegisteredUsers] = useState([
    // Usuario de prueba por defecto para probar de inmediato:
    { name: 'Usuario Demo', email: 'atleta@ejemplo.com', password: '123', role: 'atleta' }
  ]);

  // Mensajes para el usuario
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Limpiar mensajes y campos al cambiar de pestaña
  const handleTabChange = (newMode) => {
    setMode(newMode);
    setErrorMessage('');
    setSuccessMessage('');
    setEmail('');
    setPassword('');
    setName('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (mode === 'register') {
      // 1. VALIDACIÓN AL CREAR CUENTA
      const userExists = registeredUsers.some(u => u.email.toLowerCase() === email.trim().toLowerCase());
      
      if (userExists) {
        setErrorMessage('El correo electrónico ya se encuentra registrado.');
        return;
      }

      // Crear el nuevo registro
      const newUser = { 
        name: name.trim() || (role === 'atleta' ? 'Atleta Biometra' : 'Gimnasio Biometra'), 
        email: email.trim().toLowerCase(), 
        password: password, 
        role 
      };

      setRegisteredUsers([...registeredUsers, newUser]);
      setSuccessMessage('¡Cuenta creada con éxito! Por favor, inicia sesión con tus credenciales.');

      // Limpiar campos y enviar al usuario a iniciar sesión tras 1.5 segundos
      setTimeout(() => {
        setMode('login');
        setSuccessMessage('¡Cuenta creada! Inicia sesión ahora.');
        setEmail(newUser.email);
        setPassword('');
      }, 1500);

    } else {
      // 2. VALIDACIÓN ESTRICTA AL INICIAR SESIÓN
      const cleanEmail = email.trim().toLowerCase();
      
      // Buscar si el correo existe en la base de datos
      const userFoundByEmail = registeredUsers.find(u => u.email.toLowerCase() === cleanEmail);

      if (!userFoundByEmail) {
        // Caso A: El correo no existe
        setErrorMessage('El correo electrónico no está registrado.');
        return;
      }

      if (userFoundByEmail.password !== password) {
        // Caso B: El correo existe pero la contraseña no coincide
        setErrorMessage('Contraseña incorrecta. Por favor, verifica tus datos.');
        return;
      }

      // Caso C: Credenciales correctas -> Acceso concedido a App.jsx
      onLoginSuccess({
        email: userFoundByEmail.email,
        role: userFoundByEmail.role,
        name: userFoundByEmail.name
      });
    }
  };

  return (
    <div style={{
      width: '100vw',
      minHeight: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundImage: 'linear-gradient(rgba(15, 23, 42, 0.9), rgba(15, 23, 42, 0.95)), url("https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1920&auto=format&fit=crop")',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      fontFamily: 'system-ui, sans-serif'
    }}>
      <div style={{
        backgroundColor: '#1e293b',
        width: '90%',
        maxWidth: '440px',
        padding: '2.5rem 2rem',
        borderRadius: '16px',
        border: '1px solid #38bdf8',
        boxShadow: '0 10px 30px rgba(56, 189, 248, 0.25)',
        color: '#fff'
      }}>
        {/* Logo e Identidad */}
        <div style={{ textAlign: 'center', marginBottom: '1.8rem' }}>
          <div className="logo-container" style={{ justifyContent: 'center', marginBottom: '0.8rem' }}>
            <div className="logo-icon">B</div>
            <h1 style={{ margin: 0, fontSize: '2.2rem', fontWeight: '800' }}>
              {"Biometra".split("").map((letter, index) => (
                <span key={index} className="logo-letter">{letter}</span>
              ))}
            </h1>
          </div>
          
          <p style={{ color: '#38bdf8', fontSize: '0.95rem', fontWeight: '700', letterSpacing: '0.5px', margin: 0, textTransform: 'uppercase' }}>
            ⚡ Domina tu técnica, supera tus límites
          </p>
        </div>

        {/* Pestañas: Iniciar Sesión / Crear Cuenta */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', backgroundColor: '#0f172a', padding: '0.3rem', borderRadius: '8px' }}>
          <button 
            type="button"
            onClick={() => handleTabChange('login')}
            style={{ flex: 1, padding: '0.65rem', border: 'none', borderRadius: '6px', backgroundColor: mode === 'login' ? '#38bdf8' : 'transparent', color: mode === 'login' ? '#0f172a' : '#cbd5e1', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s' }}>
            Iniciar Sesión
          </button>
          <button 
            type="button"
            onClick={() => handleTabChange('register')}
            style={{ flex: 1, padding: '0.65rem', border: 'none', borderRadius: '6px', backgroundColor: mode === 'register' ? '#38bdf8' : 'transparent', color: mode === 'register' ? '#0f172a' : '#cbd5e1', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s' }}>
            Crear Cuenta
          </button>
        </div>

        {/* Notificación de Error */}
        {errorMessage && (
          <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.2)', border: '1px solid #ef4444', color: '#fca5a5', padding: '0.7rem 1rem', borderRadius: '8px', fontSize: '0.88rem', marginBottom: '1.2rem', textAlign: 'center', fontWeight: '500' }}>
            ⚠️ {errorMessage}
          </div>
        )}

        {/* Notificación de Éxito */}
        {successMessage && (
          <div style={{ backgroundColor: 'rgba(34, 197, 94, 0.2)', border: '1px solid #22c55e', color: '#86efac', padding: '0.7rem 1rem', borderRadius: '8px', fontSize: '0.88rem', marginBottom: '1.2rem', textAlign: 'center', fontWeight: 'bold' }}>
            ✅ {successMessage}
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
          
          {/* CAMPOS ÚNICOS DE "CREAR CUENTA" */}
          {mode === 'register' && (
            <>
              <div>
                <label style={{ display: 'block', marginBottom: '0.4rem', color: '#cbd5e1', fontSize: '0.9rem', fontWeight: '600' }}>
                  Nombre Completo
                </label>
                <input 
                  type="text" 
                  required
                  placeholder="Ej. Alex Rivera"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{ width: '100%', padding: '0.85rem 1rem', borderRadius: '8px', border: '1px solid #334155', backgroundColor: '#0f172a', color: '#fff', fontSize: '0.95rem', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.4rem', color: '#cbd5e1', fontSize: '0.9rem', fontWeight: '600' }}>
                  Tipo de Perfil
                </label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button 
                    type="button"
                    onClick={() => setRole('atleta')}
                    style={{ flex: 1, padding: '0.5rem', border: '1px solid #334155', borderRadius: '6px', backgroundColor: role === 'atleta' ? 'rgba(56, 189, 248, 0.2)' : '#0f172a', color: role === 'atleta' ? '#38bdf8' : '#cbd5e1', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem' }}>
                    🏋️‍♂️ Atleta
                  </button>
                  <button 
                    type="button"
                    onClick={() => setRole('gimnasio')}
                    style={{ flex: 1, padding: '0.5rem', border: '1px solid #334155', borderRadius: '6px', backgroundColor: role === 'gimnasio' ? 'rgba(56, 189, 248, 0.2)' : '#0f172a', color: role === 'gimnasio' ? '#38bdf8' : '#cbd5e1', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem' }}>
                    🏢 Gimnasio
                  </button>
                </div>
              </div>
            </>
          )}

          {/* CAMPOS OBLIGATORIOS AMBAS PESTAÑAS */}
          <div>
            <label style={{ display: 'block', marginBottom: '0.4rem', color: '#cbd5e1', fontSize: '0.9rem', fontWeight: '600' }}>
              Correo Electrónico
            </label>
            <input 
              type="email" 
              required
              placeholder="atleta@ejemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ width: '100%', padding: '0.85rem 1rem', borderRadius: '8px', border: '1px solid #334155', backgroundColor: '#0f172a', color: '#fff', fontSize: '0.95rem', outline: 'none' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.4rem', color: '#cbd5e1', fontSize: '0.9rem', fontWeight: '600' }}>
              Contraseña
            </label>
            <input 
              type="password" 
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ width: '100%', padding: '0.85rem 1rem', borderRadius: '8px', border: '1px solid #334155', backgroundColor: '#0f172a', color: '#fff', fontSize: '0.95rem', outline: 'none' }}
            />
          </div>

          <button 
            type="submit"
            style={{ marginTop: '0.8rem', backgroundColor: '#38bdf8', color: '#0f172a', border: 'none', padding: '0.9rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem', boxShadow: '0 0 12px rgba(56, 189, 248, 0.4)', transition: 'all 0.2s' }}>
            {mode === 'login' ? 'Ingresar a la Plataforma' : 'Registrar Cuenta'}
          </button>
        </form>

        {/* Nota para pruebas rápidas */}
        {mode === 'login' && (
          <p style={{ textAlign: 'center', color: '#64748b', fontSize: '0.78rem', marginTop: '1.2rem', marginBottom: 0 }}>
            💡 Usuario de prueba activa: <strong>atleta@ejemplo.com</strong> / clave: <strong>123</strong>
          </p>
        )}
      </div>
    </div>
  );
}