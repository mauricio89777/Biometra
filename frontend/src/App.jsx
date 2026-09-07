import React, { useState, useEffect } from 'react';
import Login from './login';

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState('gyms');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Slides de Bienvenida y Tips (Carrusel de 5 segundos)
  const slides = [
    {
      title: "Plataforma de Análisis Biomecánico y Entrenamiento",
      subtitle: "Encuentra centros de entrenamiento especializados y consulta nuestro catálogo de ejecución técnica."
    },
    {
      title: "Tip Biomecánico: Control del Tiempo bajo Tensión (TUT)",
      subtitle: "Mantén una fase excéntrica de 2 a 3 segundos en tus levantamientos para maximizar la hipertrofia y reducir lesiones."
    },
    {
      title: "Optimiza tu Recuperación Muscular",
      subtitle: "Asegura entre 7 y 9 horas de sueño nocturno y consume 1.6g a 2.2g de proteína por kg de peso corporal al día."
    },
    {
      title: "Principio de Sobrecarga Progresiva",
      subtitle: "Para seguir registrando ganancias de fuerza, incrementa gradualmente el peso, las repeticiones o la calidad técnica semana a semana."
    }
  ];

  useEffect(() => {
    if (!currentUser) return;
    const timer = setInterval(() => {
      setCurrentSlide((prevSlide) => (prevSlide + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [currentUser, slides.length]);

  // Si NO hay sesión iniciada, muestra exclusivamente el Login
  if (!currentUser) {
    return <Login onLoginSuccess={(user) => setCurrentUser(user)} />;
  }

  const gyms = [
    {
      id: 1,
      name: 'PowerGym San Joaquín',
      location: 'Av. Vicuña Mackenna 4686, San Joaquín',
      schedule: 'Lunes a Viernes: 07:00 - 22:00 | Sábados: 09:00 - 18:00',
      services: 'Zona de Pesas, Cardio, Entrenamiento Guiado, Evaluación Física',
      contact: '+56 9 1234 5678 - contacto@powergym.cl',
      description: 'Centro de alto rendimiento enfocado en musculación y acondicionamiento físico con acompañamiento técnico.'
    },
    {
      id: 2,
      name: 'Biometra Fitness Center',
      location: 'Alameda 1340, Santiago Centro',
      schedule: 'Lunes a Domingo: 06:00 - 23:00',
      services: 'Visión Computacional, Análisis Biomecánico, Zona Funcional, Calistenia',
      contact: '+56 9 8765 4321 - soporte@biometra.cl',
      description: 'Gimnasio inteligente equipado con sensores y análisis biomecánico en tiempo real para corrección postural.'
    },
    {
      id: 3,
      name: 'CrossFit Performance Hub',
      location: 'Av. Italia 1120, Providencia',
      schedule: 'Lunes a Sábado: 07:00 - 21:00',
      services: 'CrossFit, Halterofilia, Gimnasia Deportiva, Coaching Personalizado',
      contact: '+56 9 5555 4444 - providencia@crossfithub.cl',
      description: 'Especialistas en fuerza, resistencia física y preparación de atletas de alto desempeño.'
    }
  ];

  const exercises = [
    {
      id: 1,
      name: 'Sentadilla Libre (Barbell Squat)',
      muscle: 'Cuádriceps, Glúteos e Isquiotibiales',
      difficulty: 'Intermedio',
      type: 'Fuerza / Biomecánico',
      instructions: '1. Coloca la barra sobre los trapecios.\n2. Mantén la espalda recta y baja flexionando rodillas y cadera.\n3. Asegúrate de que las rodillas no colapsen hacia adentro.\n4. Desciende hasta romper el paralelo de 90° y sube empujando con los talones.'
    },
    {
      id: 2,
      name: 'Press de Banca Plano',
      muscle: 'Pectoral Mayor, Tríceps y Deltoides Anterior',
      difficulty: 'Avanzado',
      type: 'Fuerza',
      instructions: '1. Acuéstate en el banco manteniendo 5 puntos de apoyo.\n2. Sujeta la barra ligeramente más ancho que los hombros.\n3. Baja la barra de forma controlada al esternón.\n4. Empuja explosivamente hacia arriba sin despegar la cadera.'
    },
    {
      id: 3,
      name: 'Dominadas Pronadas (Pull-ups)',
      muscle: 'Dorsal Ancho, Biceps y Core',
      difficulty: 'Intermedio',
      type: 'Calistenia',
      instructions: '1. Sujétate de la barra con las palmas mirando hacia adelante.\n2. Eleva el cuerpo llevando el pecho hacia la barra.\n3. Evita el balanceo del cuerpo.\n4. Desciende lentamente hasta extender completamente los brazos.'
    },
    {
      id: 4,
      name: 'Peso Muerto Rumano',
      muscle: 'Isquiotibiales, Glúteo Mayor y Lumbar',
      difficulty: 'Avanzado',
      type: 'Fuerza / Corrección Postural',
      instructions: '1. Sostén la barra al ancho de caderas.\n2. Lleva la cadera hacia atrás manteniendo una leve flexión de rodilla.\n3. Baja la barra bordeando las piernas hasta la espinilla.\n4. Regresa contrayendo glúteos sin hiperextender la espalda.'
    }
  ];

  const filteredGyms = gyms.filter(g =>
    g.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    g.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredExercises = exercises.filter(e =>
    e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.muscle.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ 
      width: '100vw', 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      backgroundImage: 'linear-gradient(rgba(15, 23, 42, 0.88), rgba(15, 23, 42, 0.94)), url("https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1920&auto=format&fit=crop")',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed'
    }}>
      {/* Navegación */}
      <nav style={{ width: '100%', backgroundColor: 'rgba(30, 41, 59, 0.9)', backdropFilter: 'blur(8px)', padding: '1.2rem 3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(51, 65, 85, 0.6)', position: 'sticky', top: 0, zIndex: 10 }}>
        <div className="logo-container">
          <div className="logo-icon">B</div>
          <h1 style={{ margin: 0, fontSize: '2rem', fontWeight: '800', letterSpacing: '1px' }}>
            {"Biometra".split("").map((letter, index) => (
              <span key={index} className="logo-letter">{letter}</span>
            ))}
          </h1>
        </div>

        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <button onClick={() => setActiveTab('gyms')} className={`nav-btn ${activeTab === 'gyms' ? 'active' : ''}`}>
            Gimnasios
          </button>
          <button onClick={() => setActiveTab('exercises')} className={`nav-btn ${activeTab === 'exercises' ? 'active' : ''}`}>
            Ejercicios
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginLeft: '1rem', borderLeft: '1px solid #334155', paddingLeft: '1rem' }}>
            <span style={{ color: '#38bdf8', fontSize: '0.9rem', fontWeight: 'bold' }}>
              {currentUser.role === 'atleta' ? '🏋️‍♂️' : '🏢'} {currentUser.name}
            </span>
            <button 
              onClick={() => setCurrentUser(null)}
              style={{ backgroundColor: '#ef4444', color: '#fff', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 'bold' }}>
              Cerrar Sesión
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Banner con Carrusel de 5 Segundos */}
      <header style={{ width: '100%', padding: '4rem 2rem 2.5rem 2rem', textAlign: 'center' }}>
        <div style={{ minHeight: '140px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
          <h2 style={{ fontSize: '2.3rem', marginBottom: '0.8rem', color: '#f8fafc', fontWeight: '700', maxWidth: '850px' }}>
            {slides[currentSlide].title}
          </h2>
          <p style={{ color: '#cbd5e1', fontSize: '1.1rem', maxWidth: '750px', margin: '0 auto', lineHeight: '1.5' }}>
            {slides[currentSlide].subtitle}
          </p>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '1.2rem', marginBottom: '1.5rem' }}>
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              style={{
                width: currentSlide === index ? '24px' : '10px',
                height: '10px',
                borderRadius: '5px',
                backgroundColor: currentSlide === index ? '#38bdf8' : 'rgba(255, 255, 255, 0.3)',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
            />
          ))}
        </div>

        <div>
          <input 
            type="text" 
            placeholder={`Buscar por nombre, ubicación o músculo en ${activeTab === 'gyms' ? 'gimnasios' : 'ejercicios'}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '90%', maxWidth: '650px', padding: '1rem 1.4rem', borderRadius: '10px', border: '1px solid #38bdf8', backgroundColor: 'rgba(30, 41, 59, 0.85)', color: '#fff', fontSize: '1rem', outline: 'none', backdropFilter: 'blur(4px)', boxShadow: '0 4px 15px rgba(0, 0, 0, 0.4)' }}
          />
        </div>
      </header>

      {/* Contenido Principal */}
      <main style={{ flex: 1, width: '100%', padding: '2rem 3rem', boxSizing: 'border-box' }}>
        {activeTab === 'gyms' ? (
          <section>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ color: '#38bdf8', fontSize: '1.6rem', margin: 0, fontWeight: '700' }}>Catálogo de Gimnasios</h3>
              <span style={{ color: '#94a3b8', fontSize: '0.95rem' }}>{filteredGyms.length} gimnasios disponibles</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.8rem', width: '100%' }}>
              {filteredGyms.map(gym => (
                <div key={gym.id} style={{ backgroundColor: 'rgba(30, 41, 59, 0.85)', backdropFilter: 'blur(6px)', padding: '1.8rem', borderRadius: '12px', border: '1px solid rgba(51, 65, 85, 0.8)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 4px 6px rgba(0,0,0,0.3)' }}>
                  <div>
                    <h4 style={{ margin: '0 0 0.8rem 0', color: '#38bdf8', fontSize: '1.3rem' }}>{gym.name}</h4>
                    <p style={{ margin: '0.4rem 0', color: '#cbd5e1', fontSize: '0.95rem' }}><strong>Ubicación:</strong> {gym.location}</p>
                    <p style={{ margin: '0.4rem 0', color: '#cbd5e1', fontSize: '0.95rem' }}><strong>Horarios:</strong> {gym.schedule}</p>
                    <p style={{ margin: '0.4rem 0', color: '#cbd5e1', fontSize: '0.95rem' }}><strong>Servicios:</strong> {gym.services}</p>
                  </div>
                  <button onClick={() => setSelectedItem(gym)} style={{ marginTop: '1.2rem', backgroundColor: '#0284c7', color: '#fff', border: 'none', padding: '0.75rem', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
                    Ver Detalle Completo
                  </button>
                </div>
              ))}
            </div>
          </section>
        ) : (
          <section>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ color: '#38bdf8', fontSize: '1.6rem', margin: 0, fontWeight: '700' }}>Catálogo de Ejercicios Técnicos</h3>
              <span style={{ color: '#94a3b8', fontSize: '0.95rem' }}>{filteredExercises.length} ejercicios registrados</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.8rem', width: '100%' }}>
              {filteredExercises.map(ex => (
                <div key={ex.id} style={{ backgroundColor: 'rgba(30, 41, 59, 0.85)', backdropFilter: 'blur(6px)', padding: '1.8rem', borderRadius: '12px', border: '1px solid rgba(51, 65, 85, 0.8)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 4px 6px rgba(0,0,0,0.3)' }}>
                  <div>
                    <h4 style={{ margin: '0 0 0.8rem 0', color: '#38bdf8', fontSize: '1.3rem' }}>{ex.name}</h4>
                    <p style={{ margin: '0.4rem 0', color: '#cbd5e1', fontSize: '0.95rem' }}><strong>Músculo:</strong> {ex.muscle}</p>
                    <p style={{ margin: '0.4rem 0', color: '#cbd5e1', fontSize: '0.95rem' }}><strong>Dificultad:</strong> {ex.difficulty}</p>
                    <p style={{ margin: '0.4rem 0', color: '#cbd5e1', fontSize: '0.95rem' }}><strong>Categoría:</strong> {ex.type}</p>
                  </div>
                  <button onClick={() => setSelectedItem(ex)} style={{ marginTop: '1.2rem', backgroundColor: '#0284c7', color: '#fff', border: 'none', padding: '0.75rem', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
                    Ver Instrucciones Técnicas
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Modal para Detalles */}
      {selectedItem && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.85)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100 }}>
          <div style={{ backgroundColor: '#1e293b', width: '90%', maxWidth: '550px', padding: '2rem', borderRadius: '12px', border: '1px solid #38bdf8', color: '#fff', boxShadow: '0 10px 25px rgba(0,0,0,0.5)' }}>
            <h3 style={{ color: '#38bdf8', fontSize: '1.5rem', marginTop: 0 }}>{selectedItem.name}</h3>
            {selectedItem.instructions ? (
              <div>
                <p style={{ margin: '0.5rem 0' }}><strong>Grupo Muscular:</strong> {selectedItem.muscle}</p>
                <p style={{ margin: '0.5rem 0' }}><strong>Dificultad:</strong> {selectedItem.difficulty}</p>
                <h4 style={{ color: '#f8fafc', marginTop: '1.2rem', marginBottom: '0.5rem' }}>Guía de Ejecución:</h4>
                <p style={{ whiteSpace: 'pre-line', color: '#cbd5e1', lineHeight: '1.5' }}>{selectedItem.instructions}</p>
              </div>
            ) : (
              <div>
                <p style={{ margin: '0.5rem 0' }}><strong>Ubicación:</strong> {selectedItem.location}</p>
                <p style={{ margin: '0.5rem 0' }}><strong>Horarios:</strong> {selectedItem.schedule}</p>
                <p style={{ margin: '0.5rem 0' }}><strong>Contacto:</strong> {selectedItem.contact}</p>
                <p style={{ marginTop: '1rem', color: '#cbd5e1', lineHeight: '1.4' }}>{selectedItem.description}</p>
              </div>
            )}
            <button onClick={() => setSelectedItem(null)} style={{ marginTop: '1.5rem', width: '100%', backgroundColor: '#ef4444', color: '#fff', border: 'none', padding: '0.8rem', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* Pie de Página */}
      <footer style={{ width: '100%', textAlign: 'center', padding: '1.8rem', backgroundColor: 'rgba(30, 41, 59, 0.9)', borderTop: '1px solid rgba(51, 65, 85, 0.6)', color: '#94a3b8', fontSize: '0.9rem' }}>
        Biometra © - Plataforma para Análisis Biomecánico y Entrenamiento Deportivo
      </footer>
    </div>
  );
}