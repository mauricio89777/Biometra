function adminMiddleware(req, res, next) {
  if (!req.usuario || req.usuario.rol !== 'ADMIN') {
    return res.status(403).json({
      error: 'No tienes permisos para realizar esta operación'
    });
  }

  next();
}

module.exports = adminMiddleware;

// este segundo middleware se asegura que el usuario sea ADMIN