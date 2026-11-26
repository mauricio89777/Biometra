const bcrypt = require('bcrypt');
const prisma = require('../utils/prisma');
const { ah, manejarError } = require('../utils/errores');
const fs = require('fs');
const path = require('path');

const USUARIO_PUBLICO = {
  id: true,
  nombre: true,
  email: true,
  rol: true,
  peso: true,
  altura: true,
  genero: true,
  foto_perfil: true,
  foto_portada: true,
  fecha_nacimiento: true,
  fecha_registro: true
};

const esAdmin = (req) => {
  return req.usuario?.rol?.toUpperCase() === 'ADMIN';
};

const esPropietarioOAdmin = (req, id) => {
  return esAdmin(req) || Number(req.usuario?.id) === Number(id);
};


const validarAltura = (altura) => {
  // Si no se envía el campo, no se modifica
  if (altura === undefined) {
    return { valor: undefined };
  }

  // Permitir dejar el campo vacío
  if (altura === null || String(altura).trim() === '') {
    return { valor: null };
  }

  const texto = String(altura).trim();

  // Permitir hasta dos decimales
  if (!/^\d+(\.\d{1,2})?$/.test(texto)) {
    return {
      error: 'La estatura debe tener como máximo dos decimales'
    };
  }

  const valor = Number(texto);

  // Rango permitido: 0.50 a 2.50 metros
  if (!Number.isFinite(valor) || valor < 0.5 || valor > 2.5) {
    return {
      error: 'La estatura debe estar entre 0.50 y 2.50 metros'
    };
  }

  return { valor };
};

// Directorio de almacenamiento de imágenes de perfil
const carpetaPerfiles = path.join(__dirname, '../uploads/perfiles');

// Obtener la ruta física de una imagen guardada por Biometra.
// Solo permite eliminar archivos dentro de uploads/perfiles.
const obtenerRutaImagen = (rutaGuardada) => {
  if (
    typeof rutaGuardada !== 'string' ||
    !rutaGuardada.startsWith('/uploads/perfiles/')
  ) {
    return null;
  }

  const nombreArchivo = path.basename(rutaGuardada);
  return path.join(carpetaPerfiles, nombreArchivo);
};

// Eliminar un archivo sin interrumpir la operación si ya no existe
const eliminarArchivo = async (ruta) => {
  if (!ruta) return;

  try {
    await fs.promises.unlink(ruta);
  } catch (error) {
    if (error.code !== 'ENOENT') {
      console.error('No se pudo eliminar el archivo:', error.message);
    }
  }
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
    const resultadoAltura = validarAltura(altura);

    if (resultadoAltura.error) {
      return res.status(400).json({
        error: resultadoAltura.error
      });
    }  

    const hash = await bcrypt.hash(passwordPlano, 10);
    
    const usuario = await prisma.usuario.create({
      data: {
      ...resto,
      email: resto.email?.trim().toLowerCase(),
      rol: resto.rol?.toUpperCase() || 'USUARIO',
      password_hash: hash,
      peso: peso ? parseFloat(peso) : null,
      altura: resultadoAltura.valor ?? null
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

    const { nombre, email, peso, altura,genero, fecha_nacimiento, rol, password, password_hash } = req.body;
    const datos = {};
    
    if (nombre !== undefined) datos.nombre = nombre;
    if (email !== undefined) {
      datos.email = email.trim().toLowerCase();
    }

    if (peso !== undefined) { 
      datos.peso = peso ? parseFloat(peso) : null;
    }
   
    if (altura !== undefined) {
      const resultadoAltura = validarAltura(altura);
  
      if (resultadoAltura.error) {
        return res.status(400).json({
          error: resultadoAltura.error
        });
      }

      datos.altura = resultadoAltura.valor;
    }
    if (genero !== undefined) datos.genero = genero;

    if (fecha_nacimiento !== undefined) {
      if (fecha_nacimiento === null || fecha_nacimiento === '') {
        datos.fecha_nacimiento = null;
      } else {
        // El frontend debe enviar YYYY-MM-DD
        if (
          typeof fecha_nacimiento !== 'string' ||
          !/^\d{4}-\d{2}-\d{2}$/.test(fecha_nacimiento)
        ) {
          return res.status(400).json({
            error: 'La fecha de nacimiento debe tener el formato YYYY-MM-DD'
          });
        }

        const fecha = new Date(`${fecha_nacimiento}T00:00:00.000Z`);

        // Evita fechas inexistentes, como 2026-02-31
        if (
          Number.isNaN(fecha.getTime()) ||
          fecha.toISOString().slice(0, 10) !== fecha_nacimiento
        ) {
          return res.status(400).json({
            error: 'La fecha de nacimiento no es válida'
          });
        }

        if (fecha > new Date()) {
          return res.status(400).json({
            error: 'La fecha de nacimiento no puede ser futura'
          });
        }

        datos.fecha_nacimiento = fecha;
      }
    }
    
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


// Subir o reemplazar foto de perfil y/o portada
exports.subirFotos = async (req, res) => {
  const id = Number(req.params.id);

  // Archivos recibidos por Multer
  const archivos = req.files || {};
  const archivosNuevos = Object.values(archivos).flat();

  try {
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        error: 'ID de usuario inválido'
      });
    }

    // Verificar permisos
    if (!esPropietarioOAdmin(req, id)) {
      return res.status(403).json({
        error: 'No tienes permisos para modificar las imágenes de este usuario'
      });
    }

    // Comprobar que se haya enviado al menos una imagen
    if (archivosNuevos.length === 0) {
      return res.status(400).json({
        error: 'Debes seleccionar al menos una imagen'
      });
    }

    // Preparar las rutas que se guardarán en MariaDB
    const datos = {};

    if (archivos.foto_perfil?.[0]) {
      datos.foto_perfil =
        `/uploads/perfiles/${archivos.foto_perfil[0].filename}`;
    }

    if (archivos.foto_portada?.[0]) {
      datos.foto_portada =
        `/uploads/perfiles/${archivos.foto_portada[0].filename}`;
    }

    // Consultar las imágenes anteriores
    const usuarioAnterior = await prisma.usuario.findUnique({
      where: { id },
      select: {
        foto_perfil: true,
        foto_portada: true
      }
    });

    if (!usuarioAnterior) {
      await Promise.all(
        archivosNuevos.map((archivo) => eliminarArchivo(archivo.path))
      );

      return res.status(404).json({
        error: 'Usuario no encontrado'
      });
    }

    // Actualizar las rutas en la base de datos
    const usuarioActualizado = await prisma.usuario.update({
      where: { id },
      data: datos,
      select: USUARIO_PUBLICO
    });

    // Eliminar las imágenes anteriores que fueron reemplazadas
    const archivosAnteriores = [];

    if (datos.foto_perfil && usuarioAnterior.foto_perfil) {
      archivosAnteriores.push(
        obtenerRutaImagen(usuarioAnterior.foto_perfil)
      );
    }

    if (datos.foto_portada && usuarioAnterior.foto_portada) {
      archivosAnteriores.push(
        obtenerRutaImagen(usuarioAnterior.foto_portada)
      );
    }

    await Promise.all(
      archivosAnteriores.map((ruta) => eliminarArchivo(ruta))
    );

    res.json({
      mensaje: 'Imágenes actualizadas correctamente',
      usuario: usuarioActualizado
    });

  } catch (error) {
    // Si falla la operación, eliminar los archivos recién subidos
    await Promise.all(
      archivosNuevos.map((archivo) => eliminarArchivo(archivo.path))
    );

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