// Envuelve handlers async para que cualquier error llegue al manejador global
// (evita que un error de base de datos tire el servidor)
const ah = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

// Traduce errores comunes de Prisma a respuestas HTTP claras
function manejarError(res, error) {
  if (error.code === 'P2025') {
    return res.status(404).json({ error: 'No encontrado' });
  }
  if (error.code === 'P2002') {
    return res.status(409).json({ error: 'Ya existe un registro con ese valor único (por ejemplo, el email)' });
  }
  if (error.code === 'P2003') {
    return res.status(400).json({ error: 'Referencia inválida: el registro relacionado no existe' });
  }
  return res.status(400).json({ error: error.message });
}

module.exports = { ah, manejarError };