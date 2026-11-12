const bcrypt = require('bcrypt');
const prisma = require('../utils/prisma');
const { ah, manejarError } = require('../utils/errores');

// Campos de usuario que se pueden mostrar (nunca password_hash)
const USUARIO_PUBLICO = {
  id: true,
  nombre: true,
  email: true,
  rol: true,
  peso: true,
  altura: true,
  genero: true,
  foto_perfil: true,
  fecha_registro: true
};

const esAdmin = (req) => {
  return req.usuario?.rol?.toUpperCase() === 'ADMIN';
};

const esPropietarioOAdmin = (req, id) => {
  return esAdmin(req) || Number(req.usuario?.id) === Number(id);
};

// Registro (público). Acepta "password" o "password_hash" como campo de contraseña.
exports.crear = async (req, res) => {
  try {
    if (!esAdmin(req)){
      return res.status(403).json({
        error: 'No tienes permiso para crear usuarios'
      });
    }
    const { password, password_hash, peso, altura, ...resto } = req.body;
    const passwordPlano = password || password_hash;

    if (!passwordPlano) {
      return res.status(400).json({ error: 'La contraseña es requerida' });
    }

    const hash = await bcrypt.hash(passwordPlano, 10);
    
    const usuario = await prisma.usuario.create({
      data: {
      ...resto,
      email: resto.email?.trim().toLowerCase(),
      rol: resto.rol?.toUpperCase() || 'USUARIO',
      password_hash: hash,
      peso: peso ? parseFloat(peso) : null,
      altura: altura ? parseFloat(altura) : null
      }
    });

    const { password_hash: _, ...usuarioSinPassword } = usuario;
    res.status(201).json(usuarioSinPassword);
  } catch (error) {
    manejarError(res, error);
  }
};




exports.listar = ah(async (req, res) => {
  if (!esAdmin(req)) {
    return res.status(403).json({
      error: 'No tienes permiso para listar usuarios'
    });
  }
  const usuarios = await prisma.usuario.findMany({ select: USUARIO_PUBLICO });
  res.json(usuarios);
});

exports.obtener = ah(async (req, res) => {
  const id = Number(req.params.id);

  if (!esPropietarioOAdmin(req, id)) {
    return res.status(403).json({
      error: 'No tienes permisos para consultar este usuario'
    });
  }

  const usuario = await prisma.usuario.findUnique({
    where: { id },
    select: USUARIO_PUBLICO
  });

  if (!usuario) {
    return res.status(404).json({ error: 'No encontrado' });
  }

  res.json(usuario);
});

// Solo puedes editar tu propio usuario
exports.actualizar = async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!esPropietarioOAdmin(req, id)) {
      return res.status(403).json({
        error: 'No tienes permisos para modificar este usuario'
      });
    }

    const { nombre, email, peso, altura, genero, rol, password, password_hash } = req.body;
    const datos = {};
    
    if (nombre !== undefined) datos.nombre = nombre;
    if (email !== undefined) {
      datos.email = email.trim().toLowerCase();
    }

    if (peso !== undefined) { 
      datos.peso = peso ? parseFloat(peso) : null;
    }
   
    if (altura !== undefined) { 
      datos.altura = altura ? parseFloat(altura) : null;
    }
    if (genero !== undefined) datos.genero = genero;
    
    if (rol !== undefined) {
    const rolNormalizado =
      typeof rol === 'string' ? rol.trim().toUpperCase() : '';

    if (!['USUARIO', 'ADMIN'].includes(rolNormalizado)) {
      return res.status(400).json({ error: 'Rol no válido' });
    }

    const esMiPropiaCuenta = Number(req.usuario.id) === id;
    const rolActual = req.usuario.rol?.toUpperCase();

    // Nadie puede cambiar su propio rol.
    if (esMiPropiaCuenta && rolNormalizado !== rolActual) {
      return res.status(403).json({
        error: 'No puedes modificar tu propio Rol'
      });
    }

    // Solo un administrador puede cambiar el rol de otro usuario.
    if (!esMiPropiaCuenta && !esAdmin(req)) {
      return res.status(403).json({
        error: 'No tienes permisos para modificar el Rol'
      });
    }

    // Si es la propia cuenta y el rol no cambia, no hace falta actualizarlo.
    if (!esMiPropiaCuenta) {
      datos.rol = rolNormalizado;
    }
    }

    const passwordNueva = password || password_hash;
    if (passwordNueva) {
      datos.password_hash = await bcrypt.hash(passwordNueva, 10);
    }

    const usuario = await prisma.usuario.update({
      where: { id },
      data: datos
    });

    const { password_hash: _, ...usuarioSinPassword } = usuario;
    res.json(usuarioSinPassword);
  } catch (error) {
    manejarError(res, error);
  }
};

exports.eliminar = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!esPropietarioOAdmin(req, id)){
      return res.status(403).json({
        error: 'No tienes los permisos para elminar este usuario'
      });
    }
    

    await prisma.usuario.delete({ where: {id} });
    res.json({ mensaje: 'Eliminado correctamente' });
  } catch (error) {
    manejarError(res, error);
  }
};