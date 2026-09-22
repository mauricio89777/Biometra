import React, { useState } from 'react';

export default function Login({ onLoginSuccess }) {
  const [mode, setMode] = useState('login'); 
  const [role, setRole] = useState('atleta');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [registeredUsers, setRegisteredUsers] = useState([
    { name: 'Usuario Demo', email: 'atleta@ejemplo.com', password: '123', role: 'atleta' }
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
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (mode === 'register') {
      const userExists = registeredUsers.some(u => u.email.toLowerCase() === email.trim().toLowerCase());
      
      if (userExists) {
        setErrorMessage('El correo electrónico ya se encuentra registrado.');
        return;
      }

      const newUser = { 
        name: name.trim() || (role === 'atleta' ? 'Atleta Biometra' : 'Gimnasio Biometra'), 
        email: email.trim().toLowerCase(), 
        password, 
        role 
      };

      setRegisteredUsers([...registeredUsers, newUser]);
      setSuccessMessage('¡Cuenta creada con éxito! Inicia sesión ahora.');

      setTimeout(() => {
        setMode('login');
        setEmail(newUser.email);
        setPassword('');
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
      backgroundColor: '#0f172a',
      fontFamily: 'system-ui, sans-serif'
    }}>
      <div style={{
        backgroundColor: '#1e293b',
        width: '90%',
        maxWidth: '420px',
        padding: '2.5rem 2rem',
        borderRadius: '16px',
        border: '1px solid #38bdf8',
        boxShadow: '0 10px 30px rgba(56, 189, 248, 0.25)',
        color: '#fff'
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
                    onClick={() => setRole('atleta')}
                    style={{ flex: 1, padding: '0.5rem', border: '1px solid #334155', borderRadius: '6px', backgroundColor: role === 'atleta' ? 'rgba(56, 189, 248, 0.2)' : '#0f172a', color: role === 'atleta' ? '#38bdf8' : '#cbd5e1', cursor: 'pointer' }}>
                    🏋️‍♂️ Atleta
                  </button>
                  <button 
                    type="button"
                    onClick={() => setRole('gimnasio')}
                    style={{ flex: 1, padding: '0.5rem', border: '1px solid #334155', borderRadius: '6px', backgroundColor: role === 'gimnasio' ? 'rgba(56, 189, 248, 0.2)' : '#0f172a', color: role === 'gimnasio' ? '#38bdf8' : '#cbd5e1', cursor: 'pointer' }}>
                    🏢 Gimnasio
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
              placeholder="atleta@ejemplo.com"
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

          <button 
            type="submit"
            style={{ marginTop: '0.8rem', backgroundColor: '#38bdf8', color: '#0f172a', border: 'none', padding: '0.85rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.95rem' }}>
            {mode === 'login' ? 'Ingresar a la Plataforma' : 'Registrar Cuenta'}
          </button>
        </form>

        {mode === 'login' && (
          <p style={{ textAlign: 'center', color: '#64748b', fontSize: '0.78rem', marginTop: '1.2rem', marginBottom: 0 }}>
            💡 Demo: <strong>atleta@ejemplo.com</strong> / clave: <strong>123</strong>
          </p>
        )}
      </div>
    </div>
  );
}