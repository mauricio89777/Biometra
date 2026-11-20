
const prisma = require('../utils/prisma');


exports.listarPorUsuario = async (req, res) => {
  try {
    const usuarioId = Number(req.params.id);
    const usuarioAutenticadoId = Number(req.usuario.id);

    if (!Number.isInteger(usuarioId) || usuarioId <= 0) {
      return res.status(400).json({
        error: 'ID de usuario inválido'
      });
    }

    if (usuarioId !== usuarioAutenticadoId) {
      return res.status(403).json({
        error: 'No tienes permiso para consultar estas sesiones'
      });
    }

    const sesiones = await prisma.sesion.findMany({
      where: {
        usuario_id: usuarioId
      },
      include: {
        registros: {
          include: {
            ejercicio: true,

            series: {
              orderBy: {
                numero_serie: 'asc'
              }
            },

            videos: {
              select: {
                id: true,
                fecha_carga: true,
                estado: true,

                analisis: {
                  select: {
                    id: true,
                    fecha_analisis: true,
                    puntuacion: true,
                    estado: true,
                    metricas: true,
                    feedbacks: true,  
                    repeticiones: true
                  }
                }
              },
              orderBy: {
                fecha_carga: 'desc'
              }
            }
          }
        }
      },
      orderBy: {
        fecha: 'desc'
      }
    });

    return res.json(sesiones);

  } catch (error) {
    console.error('Error al listar sesiones:', error);

    return res.status(500).json({
      error: 'Error al obtener las sesiones del usuario'
    });
  }
};

// Crear una sesión con sus ejercicios y series
exports.crear = async (req, res) => {
  try {
    const usuarioId = Number(req.usuario.id);
    const { notas, duracion_min, registros } = req.body;

    // Validar usuario autenticado
    if (!Number.isInteger(usuarioId) || usuarioId <= 0) {
      return res.status(401).json({
        error: 'Usuario no autenticado correctamente'
      });
    }

    // Validar registros
    if (!Array.isArray(registros) || registros.length === 0) {
      return res.status(400).json({
        error: 'Debes registrar al menos un ejercicio'
      });
    }

    // Validar duración general de la sesión
    if (
      duracion_min !== undefined &&
      duracion_min !== null &&
      (!Number.isInteger(Number(duracion_min)) || Number(duracion_min) < 0)
    ) {
      return res.status(400).json({
        error: 'La duración debe ser un número entero igual o mayor a cero'
      });
    }

    // Validar IDs y existencia de series
    for (const registro of registros) {
      if (
        !Number.isInteger(Number(registro.ejercicio_id)) ||
        Number(registro.ejercicio_id) <= 0
      ) {
        return res.status(400).json({
          error: 'Uno de los ejercicios tiene un ID inválido'
        });
      }

      if (!Array.isArray(registro.series) || registro.series.length === 0) {
        return res.status(400).json({
          error: 'Cada ejercicio debe tener al menos una serie'
        });
      }
    }

    // Obtener ejercicios activos y su tipo
    const ejercicioIds = [...new Set(
      registros.map(registro => Number(registro.ejercicio_id))
    )];

    const ejerciciosExistentes = await prisma.ejercicio.findMany({
      where: {
        id: { in: ejercicioIds },
        activo: true
      },
      select: {
        id: true,
        tipo: true
      }
    });

    if (ejerciciosExistentes.length !== ejercicioIds.length) {
      return res.status(400).json({
        error: 'Uno o más ejercicios no existen o están inactivos'
      });
    }

    // Crear un mapa para consultar el tipo de cada ejercicio
    const ejerciciosPorId = new Map(
      ejerciciosExistentes.map(ejercicio => [
        ejercicio.id,
        ejercicio.tipo?.toLowerCase().trim()
      ])
    );

    // Validar y preparar las series
    const registrosPreparados = [];

    for (const registro of registros) {
      const ejercicioId = Number(registro.ejercicio_id);
      const tipo = ejerciciosPorId.get(ejercicioId);

      if (!['repeticiones', 'isometrico'].includes(tipo)) {
        return res.status(400).json({
          error: `El ejercicio ${ejercicioId} tiene un tipo no válido`
        });
      }

      const seriesPreparadas = [];

      for (const serie of registro.series) {
        const numero = Number(serie.numero_serie);

        const peso = serie.peso == null
          ? 0
          : Number(serie.peso);

        const tieneRepeticiones =
          serie.repeticiones !== undefined &&
          serie.repeticiones !== null;

        const tieneDuracion =
          serie.duracion_segundos !== undefined &&
          serie.duracion_segundos !== null;

        if (
          !Number.isInteger(numero) ||
          numero < 1 ||
          !Number.isFinite(peso) ||
          peso < 0
        ) {
          return res.status(400).json({
            error: 'Los datos generales de una serie no son válidos'
          });
        }

        // Ejercicios dinámicos: requieren repeticiones
        if (tipo === 'repeticiones') {
          const repeticiones = Number(serie.repeticiones);

          if (
            !tieneRepeticiones ||
            tieneDuracion ||
            !Number.isInteger(repeticiones) ||
            repeticiones < 1
          ) {
            return res.status(400).json({
              error: 'Este ejercicio requiere repeticiones y no duración'
            });
          }

          seriesPreparadas.push({
            numero_serie: numero,
            repeticiones,
            duracion_segundos: null,
            peso
          });
        }

        // Ejercicios isométricos: requieren duración
        if (tipo === 'isometrico') {
          const duracion = Number(serie.duracion_segundos);

          if (
            !tieneDuracion ||
            tieneRepeticiones ||
            !Number.isInteger(duracion) ||
            duracion < 1
          ) {
            return res.status(400).json({
              error: 'Este ejercicio requiere duración en segundos y no repeticiones'
            });
          }

          seriesPreparadas.push({
            numero_serie: numero,
            repeticiones: null,
            duracion_segundos: duracion,
            peso
          });
        }
      }

      registrosPreparados.push({
        ejercicio_id: ejercicioId,
        notas: registro.notas || null,
        series: seriesPreparadas
      });
    }

    // Crear sesión, registros y series en una sola operación
    const nuevaSesion = await prisma.sesion.create({
      data: {
        usuario_id: usuarioId,
        notas: notas || null,
        duracion_min: duracion_min == null
          ? null
          : Number(duracion_min),

        registros: {
          create: registrosPreparados.map(registro => ({
            ejercicio_id: registro.ejercicio_id,
            notas: registro.notas,

            series: {
              create: registro.series
            }
          }))
        }
      },

      include: {
        registros: {
          include: {
            ejercicio: true,
            series: true
          }
        }
      }
    });

    return res.status(201).json({
      mensaje: 'Entrenamiento registrado correctamente',
      sesion: nuevaSesion
    });

  } catch (error) {
    console.error('Error al crear sesión:', error);

    return res.status(500).json({
      error: 'Error al registrar el entrenamiento'
    });
  }
};
