
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

// Carpeta donde se almacenarán las imágenes
const carpetaPerfiles = path.join(__dirname, '../uploads/perfiles');

// Crear la carpeta automáticamente si no existe
fs.mkdirSync(carpetaPerfiles, { recursive: true });

// Configuración del almacenamiento
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, carpetaPerfiles);
  },

  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase();
    const identificador = crypto.randomBytes(8).toString('hex');

    cb(
      null,
      `${file.fieldname}-${req.params.id}-${identificador}${extension}`
    );
  }
});

// Validar formatos permitidos
const fileFilter = (req, file, cb) => {
  const formatosPermitidos = [
    'image/jpeg',
    'image/png',
    'image/webp'
  ];

  if (!formatosPermitidos.includes(file.mimetype)) {
    return cb(
      new Error('Formato no permitido. Utiliza JPG, PNG o WEBP')
    );
  }

  cb(null, true);
};

const uploadPerfil = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB por imagen
    files: 2
  }
});

module.exports = uploadPerfil;
