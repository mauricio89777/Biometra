const bcrypt = require('bcrypt');
const prisma = require('../utils/prisma');
const { ah, manejarError } = require('../utils/errores');

// Campos de usuario que se pueden mostrar (nunca password_hash)
const USUARIO_PUBLICO = {
  id: true,
  nombre: true,
  email: true,
  fecha_registro: true,
  peso: true,
  altura: true,
  genero: true
};

// Registro (público). Acepta "password" o "password_hash" como campo de contraseña.
exports.crear = async (req, res) => {
  try {
    const { password, password_hash, ...resto } = req.body;
    const passwordPlano = password || password_hash;

    if (!passwordPlano) {
      return res.status(400).json({ error: 'La contraseña es requerida' });
    }

    const hash = await bcrypt.hash(passwordPlano, 10);
    const usuario = await prisma.usuario.create({
      data: { ...resto, password_hash: hash }
    });

    const { password_hash: _, ...usuarioSinPassword } = usuario;
    res.status(201).json(usuarioSinPassword);
  } catch (error) {
    manejarError(res, error);
  }
};

exports.listar = ah(async (req, res) => {
  const usuarios = await prisma.usuario.findMany({ select: USUARIO_PUBLICO });
  res.json(usuarios);
});

exports.obtener = ah(async (req, res) => {
  const usuario = await prisma.usuario.findUnique({
    where: { id: Number(req.params.id) },
    select: USUARIO_PUBLICO
  });
  if (!usuario) return res.status(404).json({ error: 'No encontrado' });
  res.json(usuario);
});

// Solo puedes editar tu propio usuario
exports.actualizar = async (req, res) => {
  try {
    if (req.usuario.id !== Number(req.params.id)) {
      return res.status(403).json({ error: 'No puedes modificar a otro usuario' });
    }

    const { nombre, email, peso, altura, genero, password, password_hash } = req.body;
    const datos = {};
    if (nombre !== undefined) datos.nombre = nombre;
    if (email !== undefined) datos.email = email;
    if (peso !== undefined) datos.peso = peso;
    if (altura !== undefined) datos.altura = altura;
    if (genero !== undefined) datos.genero = genero;

    const passwordNueva = password || password_hash;
    if (passwordNueva) datos.password_hash = await bcrypt.hash(passwordNueva, 10);

    const usuario = await prisma.usuario.update({
      where: { id: Number(req.params.id) },
      data: datos
    });

    const { password_hash: _, ...usuarioSinPassword } = usuario;
    res.json(usuarioSinPassword);
  } catch (error) {
    manejarError(res, error);
  }
};

// Solo puedes borrar tu propio usuario
exports.eliminar = async (req, res) => {
  try {
    if (req.usuario.id !== Number(req.params.id)) {
      return res.status(403).json({ error: 'No puedes eliminar a otro usuario' });
    }
    await prisma.usuario.delete({ where: { id: Number(req.params.id) } });
    res.json({ mensaje: 'Eliminado correctamente' });
  } catch (error) {
    manejarError(res, error);
  }
};