const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const prisma = require('../utils/prisma');
const { manejarError } = require('../utils/errores')

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email y password son requeridos' });
    }

    const usuario = await prisma.usuario.findUnique({ where: { email } });

    if (!usuario) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const passwordValida = await bcrypt.compare(password, usuario.password_hash);
    if (!passwordValida) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const token = jwt.sign(
      { id: usuario.id, rol: usuario.rol, email: usuario.email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    const { password_hash, ...usuarioSinPassword } = usuario;
    res.json({ token, usuario: usuarioSinPassword });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// registro nuevo usuario

exports.registrar = async (req, res) => {
  try {
    const { nombre, email, password, rol, peso, altura, genero } = req.body;

    if (!email || !password || !nombre) {
      return res.status(400).json({ error: 'Nombre, email y contraseña son obligatorios' });
    }

    // Verificar si el usuario ya existe
    const existe = await prisma.usuario.findUnique({ where: { email: email.toLowerCase() } });
    if (existe) {
      return res.status(400).json({ error: 'El correo electrónico ya se encuentra registrado' });
    }

    const hash = await bcrypt.hash(password, 10);

    const nuevoUsuario = await prisma.usuario.create({
      data: {
        nombre,
        email: email.toLowerCase(),
        password_hash: hash,
        rol: rol ? rol.toUpperCase() : 'USUARIO', // Mapea a tu enum de Prisma
        peso: peso ? parseFloat(peso) : null,
        altura: altura ? parseFloat(altura) : null,
        genero: genero || null
      }
    });

    const { password_hash: _, ...usuarioSinPassword } = nuevoUsuario;
    res.status(201).json(usuarioSinPassword);
  } catch (error) {
    manejarError(res, error);
  }
};

