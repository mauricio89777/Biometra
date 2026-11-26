const prisma = require('../utils/prisma');
const { ah, manejarError } = require('../utils/errores');

// Caché temporal de OpenStreetMap para evitar duplicados de react
let cacheGimnasios = {
  datos: null,
  timestamp: 0
};

let consultaOverpassEnCurso = null;

const TIEMPO_CACHE = 5 * 60 * 1000; // 5 minutos

exports.crear = async (req, res) => {
  try {
    const gimnasio = await prisma.gimnasio.create({ data: req.body });
    res.status(201).json(gimnasio);
  } catch (error) {
    manejarError(res, error);
  }
};

exports.listar = ah(async (req, res) => {
  const gimnasios = await prisma.gimnasio.findMany();
  res.json(gimnasios);
});

exports.obtener = ah(async (req, res) => {
  const gimnasio = await prisma.gimnasio.findUnique({ where: { id: Number(req.params.id) } });
  if (!gimnasio) return res.status(404).json({ error: 'No encontrado' });
  res.json(gimnasio);
});

exports.actualizar = async (req, res) => {
  try {
    const gimnasio = await prisma.gimnasio.update({
      where: { id: Number(req.params.id) },
      data: req.body
    });
    res.json(gimnasio);
  } catch (error) {
    manejarError(res, error);
  }
};

exports.eliminar = async (req, res) => {
  try {
    await prisma.gimnasio.delete({ where: { id: Number(req.params.id) } });
    res.json({ mensaje: 'Eliminado correctamente' });
  } catch (error) {
    manejarError(res, error);
  }
};


exports.buscarOpenStreetMap = async (req, res) => {
  try {
    const { region } = req.query;

    // Por ahora únicamente está habilitada la Región Metropolitana
    if (region !== 'metropolitana') {
      return res.status(400).json({
        error: 'Por ahora solo está habilitada la Región Metropolitana'
      });
    }

    // Consulta a OpenStreetMap
    const consulta = `
      [out:json][timeout:60];

      area["boundary"="administrative"]
        ["admin_level"="4"]
        ["name"="Región Metropolitana de Santiago"]->.region;

      (
        nwr["leisure"="fitness_centre"](area.region);
        nwr["leisure"="sports_centre"]
           ["sport"~"fitness|gym"](area.region);
        nwr["amenity"="gym"](area.region);
      );

      out center tags;
    `;

    let datos;

    // Comprobar si existe una caché vigente
    const cacheVigente =
      cacheGimnasios.datos &&
      Date.now() - cacheGimnasios.timestamp < TIEMPO_CACHE;

    if (cacheVigente) {
      // Reutilizar resultados recientes
      console.log('OpenStreetMap: utilizando caché');

      datos = cacheGimnasios.datos;

    } else {

      // Si ya existe una consulta, reutilizarla
      if (!consultaOverpassEnCurso) {

        console.log('OpenStreetMap: realizando nueva consulta');

        consultaOverpassEnCurso = (async () => {

          const respuesta = await fetch(
            process.env.OVERPASS_URL ||
            'https://ovp.dresel.systems/api-sa/interpreter',
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
              },
              body: new URLSearchParams({
                data: consulta
              }),
              signal: AbortSignal.timeout(70000)
            }
          );

          const contenido = await respuesta.text();

          console.log('Overpass HTTP:', respuesta.status);
          console.log(
            'Overpass Content-Type:',
            respuesta.headers.get('content-type')
          );

          if (!respuesta.ok) {
            throw new Error(
              `Overpass respondió con estado ${respuesta.status}: ${contenido.slice(0, 300)}`
            );
          }

          let resultado;

          try {
            resultado = JSON.parse(contenido);
          } catch {
            throw new Error(
              `Overpass no devolvió JSON: ${contenido.slice(0, 300)}`
            );
          }

          if (!Array.isArray(resultado.elements)) {
            throw new Error('La respuesta de Overpass no contiene elementos válidos');
          }

          // Guardar únicamente respuestas correctas
          cacheGimnasios = {
            datos: resultado,
            timestamp: Date.now()
          };

          return resultado;

        })().finally(() => {
          // Liberar la consulta cuando termine, incluso si falla
          consultaOverpassEnCurso = null;
        });
      }

      // Esperar la consulta existente o recibir su resultado
      datos = await consultaOverpassEnCurso;
    }

    // Solo conservar elementos identificables y con coordenadas
    const gimnasios = datos.elements
      .filter(elemento => {
        const nombre = elemento.tags?.name;
        const latitud = elemento.lat ?? elemento.center?.lat;
        const longitud = elemento.lon ?? elemento.center?.lon;

        return (
          nombre &&
          nombre.trim() &&
          Number.isFinite(latitud) &&
          Number.isFinite(longitud)
        );
      })
      .map(elemento => {
        const tags = elemento.tags;

        const latitud = elemento.lat ?? elemento.center.lat;
        const longitud = elemento.lon ?? elemento.center.lon;

        const calle = tags['addr:street'] || null;
        const numero = tags['addr:housenumber'] || null;

        const comuna =
          tags['addr:city'] ||
          tags['addr:town'] ||
          tags['addr:village'] ||
          tags['addr:municipality'] ||
          null;

        const direccion = [
          calle,
          numero,
          comuna
        ].filter(Boolean).join(', ');

        return {
          id: `${elemento.type}-${elemento.id}`,
          nombre: tags.name,
          marca: tags.brand || null,
          direccion: direccion || null,
          comuna,
          telefono: tags.phone || tags['contact:phone'] || null,
          website: tags.website || tags['contact:website'] || null,
          horarios: tags.opening_hours || null,
          latitud,
          longitud,
          fuente: 'OpenStreetMap',
          urlMapa: `https://www.openstreetmap.org/${elemento.type}/${elemento.id}`
        };
      });

    // Eliminar posibles duplicados:
    // mismo nombre y ubicación casi idéntica (menos de 30 metros)
    const resultados = [];

    for (const gimnasio of gimnasios) {
      const nombreNormalizado = gimnasio.nombre
        .trim()
        .toLowerCase()
        .replace(/\s+/g, ' ');

      const duplicado = resultados.some(existente => {
        const mismoNombre = existente.nombre
          .trim()
          .toLowerCase()
          .replace(/\s+/g, ' ') === nombreNormalizado;

        const distanciaMetros = Math.hypot(
          (existente.latitud - gimnasio.latitud) * 111320,
          (existente.longitud - gimnasio.longitud) *
            111320 *
            Math.cos(gimnasio.latitud * Math.PI / 180)
        );

        return mismoNombre && distanciaMetros < 30;
      });

      if (!duplicado) {
        resultados.push(gimnasio);
      }
    }




    // Diagnóstico de disponibilidad de información
    const total = resultados.length;

    const campos = {
      comuna: resultados.filter(g => g.comuna).length,
      direccion: resultados.filter(g => g.direccion).length,
      horarios: resultados.filter(g => g.horarios).length,
      telefono: resultados.filter(g => g.telefono).length,
      website: resultados.filter(g => g.website).length,
      marca: resultados.filter(g => g.marca).length
    };

    console.log('\n===== DIAGNÓSTICO OPENSTREETMAP =====');
    console.log('Total de gimnasios:', total);

    for (const [campo, cantidad] of Object.entries(campos)) {
      const porcentaje = total > 0
        ? ((cantidad / total) * 100).toFixed(1)
        : '0.0';

      console.log(
        `${campo}: ${cantidad}/${total} (${porcentaje}%)`
      );
    }

    console.log('====================================\n');


    // Respuesta al frontend
    return res.json({
      region: 'Región Metropolitana',
      cantidad: resultados.length,
      fuente: 'OpenStreetMap',
      resultados
    });

  } catch (error) {
    console.error(
      'Error buscando gimnasios en OpenStreetMap:',
      error.message
    );

    return res.status(502).json({
      error: 'No fue posible consultar OpenStreetMap en este momento'
    });
  }
};
