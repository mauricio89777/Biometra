const prisma = require('../utils/prisma');
const { ah, manejarError } = require('../utils/errores');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');


//ruta de python
const obtenerPythonPath = () => {
  const rutaVenv = path.join(__dirname, '../../analisis/venv');
  const ejecutable = process.platform === 'win32'
    ? path.join(rutaVenv, 'Scripts', 'python.exe')
    : path.join(rutaVenv, 'bin', 'python');
  if (!fs.existsSync(ejecutable)) throw new Error('No se encontró Python');
  return ejecutable;
};
const scriptPath = path.resolve(__dirname, '../../analisis/main.py');


// 1. SINCRONIZAR: Pregunta a Python qué 15 ejercicios existen y los registra si faltan
exports.sincronizarEjerciciosPython = async (req, res) => {
  try {
    const pythonPath = obtenerPythonPath();
    const proceso = spawn(pythonPath, [scriptPath, '--listar']);

    let salida = '';
    proceso.stdout.on('data', (data) => { salida += data.toString(); });

    proceso.on('close', async (codigo) => {
      if (codigo !== 0) return res.status(500).json({ error: 'Error al listar ejercicios en Python' });

      try {
        const dataPython = JSON.parse(salida); 
        
        // --- AQUÍ ESTÁ EL CAMBIO CLAVE ---
        // Extraemos el array desde la propiedad "ejercicios" que devuelve tu script
        const listaEjercicios = dataPython.ejercicios || [];

        for (const item of listaEjercicios) {
          // Mapeamos los campos reales que devuelve tu Python: 'clave' y 'titulo'
          const scriptKey = item.clave; 
          const nombreLegible = item.titulo;

          // Upsert usando script_key como identificador único
          await prisma.ejercicio.upsert({
            where: { script_key: scriptKey },
            update: {
              // Si ya existe, podemos actualizar opcionalmente el nombre o tipo si cambió
              nombre: nombreLegible,
              tipo: item.tipo || null,
              descripcion: item.advertencias && item.advertencias.length > 0 
                ? `Advertencias: ${item.advertencias.join(' | ')}` 
                : null
            }, 
            create: {
              script_key: scriptKey,
              nombre: nombreLegible,
              tipo: item.tipo || null,
              descripcion: item.advertencias && item.advertencias.length > 0 
                ? `Advertencias: ${item.advertencias.join(' | ')}` 
                : null,
              activo: true
            }
          });
        }

        const ejerciciosBD = await prisma.ejercicio.findMany();
        return res.json({ estado: 'success', total: ejerciciosBD.length, ejercicios: ejerciciosBD });
      } catch (e) {
        return res.status(500).json({ error: 'Error parseando JSON de Python', detalle: e.message, salida });
      }
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// 2. LISTAR PARA EL PANEL ADMIN (Ve todos, activos e inactivos)
exports.listarEjerciciosAdmin = async (req, res) => {
  try {
    const ejercicios = await prisma.ejercicio.findMany();
    res.json(ejercicios);
  } catch (error) {
    res.status(500).json({ error: 'Error al listar ejercicios' });
  }
};

// 3. ACTUALIZAR / OCULTAR (Permite al admin cambiar nombre, descripción o activar/ocultar)
exports.actualizarEjercicioAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion, grupo_muscular, activo } = req.body;

    const ejercicioActualizado = await prisma.ejercicio.update({
      where: { id: Number(id) },
      data: {
        ...(nombre && { nombre }),
        ...(descripcion !== undefined && { descripcion }),
        ...(grupo_muscular && { grupo_muscular }),
        ...(activo !== undefined && { activo })
      }
    });

    res.json(ejercicioActualizado);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar el ejercicio' });
  }
};