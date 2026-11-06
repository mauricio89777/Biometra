-- CreateTable
CREATE TABLE `USUARIO` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(100) NOT NULL,
    `email` VARCHAR(150) NOT NULL,
    `password_hash` VARCHAR(255) NOT NULL,
    `rol` ENUM('USUARIO', 'ADMIN') NOT NULL DEFAULT 'USUARIO',
    `foto_perfil` VARCHAR(255) NULL,
    `foto_portada` VARCHAR(255) NULL,
    `fecha_nacimiento` DATETIME(3) NULL,
    `peso` DOUBLE NULL,
    `altura` DOUBLE NULL,
    `genero` VARCHAR(20) NULL,
    `total_sesiones` INTEGER NOT NULL DEFAULT 0,
    `fecha_registro` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `USUARIO_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `EJERCICIO` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(100) NOT NULL,
    `grupo_muscular` VARCHAR(50) NULL,
    `tipo` VARCHAR(50) NULL,
    `descripcion` TEXT NULL,
    `video_ayuda` VARCHAR(255) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `METRICA_EJERCICIO` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `ejercicio_id` INTEGER NOT NULL,
    `nombre` VARCHAR(50) NOT NULL,
    `unidad` VARCHAR(20) NULL,

    UNIQUE INDEX `METRICA_EJERCICIO_ejercicio_id_nombre_key`(`ejercicio_id`, `nombre`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `VIDEO` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `usuario_id` INTEGER NOT NULL,
    `ejercicio_id` INTEGER NOT NULL,
    `url_archivo` VARCHAR(255) NOT NULL,
    `url_video_procesado` VARCHAR(255) NULL,
    `url_landmarks` VARCHAR(255) NULL,
    `url_informe` VARCHAR(255) NULL,
    `fecha_carga` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `estado` ENUM('PENDIENTE', 'PROCESANDO', 'PROCESADO', 'ERROR') NOT NULL DEFAULT 'PENDIENTE',

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ANALISIS` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `video_id` INTEGER NOT NULL,
    `fecha_analisis` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `puntuacion` DOUBLE NULL,
    `estado` ENUM('PENDIENTE', 'EN_PROCESO', 'COMPLETADO', 'ERROR') NOT NULL DEFAULT 'PENDIENTE',

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `METRICA` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `analisis_id` INTEGER NOT NULL,
    `tipo_metrica` VARCHAR(50) NOT NULL,
    `valor` DOUBLE NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `FEEDBACK` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `analisis_id` INTEGER NOT NULL,
    `observacion` VARCHAR(500) NULL,
    `recomendacion` VARCHAR(500) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `REPETICION` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `analisis_id` INTEGER NOT NULL,
    `numero_rep` INTEGER NOT NULL,
    `tiempo_inicio` DOUBLE NULL,
    `tiempo_fin` DOUBLE NULL,
    `calificacion` DOUBLE NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SESION` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `usuario_id` INTEGER NOT NULL,
    `fecha` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `notas` TEXT NULL,
    `duracion_min` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `REGISTRO_EJERCICIO` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `sesion_id` INTEGER NOT NULL,
    `ejercicio_id` INTEGER NOT NULL,
    `notas` VARCHAR(255) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SERIE` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `registro_ejercicio_id` INTEGER NOT NULL,
    `numero_serie` INTEGER NOT NULL,
    `repeticiones` INTEGER NOT NULL,
    `peso` DOUBLE NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `GIMNASIO` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `google_place_id` VARCHAR(150) NOT NULL,
    `nombre` VARCHAR(100) NOT NULL,
    `direccion` VARCHAR(200) NULL,
    `latitud` DOUBLE NULL,
    `longitud` DOUBLE NULL,
    `telefono` VARCHAR(20) NULL,
    `horario` VARCHAR(100) NULL,
    `rating` DOUBLE NULL,
    `foto_url` VARCHAR(255) NULL,
    `fecha_sync` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `GIMNASIO_google_place_id_key`(`google_place_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `GIMNASIO_FAVORITO` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `usuario_id` INTEGER NOT NULL,
    `gimnasio_id` INTEGER NOT NULL,
    `fecha_add` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `GIMNASIO_FAVORITO_usuario_id_gimnasio_id_key`(`usuario_id`, `gimnasio_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `METRICA_EJERCICIO` ADD CONSTRAINT `fk_metrica_ejercicio` FOREIGN KEY (`ejercicio_id`) REFERENCES `EJERCICIO`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `VIDEO` ADD CONSTRAINT `fk_video_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `USUARIO`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `VIDEO` ADD CONSTRAINT `fk_video_ejercicio` FOREIGN KEY (`ejercicio_id`) REFERENCES `EJERCICIO`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ANALISIS` ADD CONSTRAINT `fk_analisis_video` FOREIGN KEY (`video_id`) REFERENCES `VIDEO`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `METRICA` ADD CONSTRAINT `fk_metrica_analisis` FOREIGN KEY (`analisis_id`) REFERENCES `ANALISIS`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FEEDBACK` ADD CONSTRAINT `fk_feedback_analisis` FOREIGN KEY (`analisis_id`) REFERENCES `ANALISIS`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `REPETICION` ADD CONSTRAINT `fk_repeticion_analisis` FOREIGN KEY (`analisis_id`) REFERENCES `ANALISIS`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SESION` ADD CONSTRAINT `fk_sesion_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `USUARIO`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `REGISTRO_EJERCICIO` ADD CONSTRAINT `fk_registro_sesion` FOREIGN KEY (`sesion_id`) REFERENCES `SESION`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `REGISTRO_EJERCICIO` ADD CONSTRAINT `fk_registro_ejercicio` FOREIGN KEY (`ejercicio_id`) REFERENCES `EJERCICIO`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SERIE` ADD CONSTRAINT `fk_serie_registro` FOREIGN KEY (`registro_ejercicio_id`) REFERENCES `REGISTRO_EJERCICIO`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `GIMNASIO_FAVORITO` ADD CONSTRAINT `fk_fav_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `USUARIO`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `GIMNASIO_FAVORITO` ADD CONSTRAINT `fk_fav_gimnasio` FOREIGN KEY (`gimnasio_id`) REFERENCES `GIMNASIO`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
