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
    const {
      nombre,
      email,
      password,
      fecha_nacimiento,
      genero,
      altura,
      rol,
      clave_admin
    } = req.body;

    // Validar campos obligatorios
    if (!nombre?.trim() || !email?.trim() || !password) {
      return res.status(400).json({
        error: 'Nombre, email y contraseña son obligatorios'
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        error: 'La contraseña debe tener al menos 8 caracteres'
      });
    }

    // Determinar el rol solicitado
    const esAdmin = rol === 'ADMIN';

    // Verificar autorización para crear administradores
    if (esAdmin) {
      if (!process.env.ADMIN_SECRET) {
        console.error('ADMIN_SECRET no está configurada');
        return res.status(500).json({
          error: 'La creación de administradores no está configurada'
        });
      }

      if (
        typeof clave_admin !== 'string' ||
        !clave_admin ||
        clave_admin !== process.env.ADMIN_SECRET
      ) {
        return res.status(403).json({
          error: 'Clave de autorización de administrador incorrecta'
        });
      }
    }

    // Validar género
    const generosPermitidos = [
      'Hombre',
      'Mujer',
      'Otro',
      'Prefiero no indicar'
    ];

    if (genero && !generosPermitidos.includes(genero)) {
      return res.status(400).json({
        error: 'El género seleccionado no es válido'
      });
    }

    // Validar fecha de nacimiento
    let fechaNacimiento = null;

    if (fecha_nacimiento) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha_nacimiento)) {
        return res.status(400).json({
          error: 'La fecha debe tener el formato YYYY-MM-DD'
        });
      }

      const fecha = new Date(`${fecha_nacimiento}T00:00:00.000Z`);

      if (
        Number.isNaN(fecha.getTime()) ||
        fecha.toISOString().slice(0, 10) !== fecha_nacimiento ||
        fecha > new Date()
      ) {
        return res.status(400).json({
          error: 'La fecha de nacimiento no es válida'
        });
      }

      fechaNacimiento = fecha;
    }

    // Validar estatura
    let alturaUsuario = null;

    if (altura !== undefined && altura !== null && altura !== '') {
      const alturaTexto = String(altura).trim();

      if (!/^\d+(\.\d{1,2})?$/.test(alturaTexto)) {
        return res.status(400).json({
          error: 'La estatura debe tener como máximo dos decimales'
        });
      }

      alturaUsuario = Number(alturaTexto);

      if (
        !Number.isFinite(alturaUsuario) ||
        alturaUsuario < 0.5 ||
        alturaUsuario > 2.5
      ) {
        return res.status(400).json({
          error: 'La estatura debe estar entre 0.50 y 2.50 metros'
        });
      }
    }

    const correo = email.trim().toLowerCase();

    // Verificar si el correo ya existe
    const existe = await prisma.usuario.findUnique({
      where: { email: correo }
    });

    if (existe) {
      return res.status(400).json({
        error: 'El correo electrónico ya se encuentra registrado'
      });
    }

    // Encriptar contraseña
    const hash = await bcrypt.hash(password, 10);

    // Crear usuario con el rol autorizado
    const nuevoUsuario = await prisma.usuario.create({
      data: {
        nombre: nombre.trim(),
        email: correo,
        password_hash: hash,
        rol: esAdmin ? 'ADMIN' : 'USUARIO',
        fecha_nacimiento: fechaNacimiento,
        genero: genero || null,
        altura: alturaUsuario
      }
    });

    const { password_hash: _, ...usuarioSinPassword } = nuevoUsuario;

    return res.status(201).json(usuarioSinPassword);

  } catch (error) {
    manejarError(res, error);
  }
};
;