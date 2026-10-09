-- CreateTable
CREATE TABLE `USUARIO` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(100) NOT NULL,
    `email` VARCHAR(150) NOT NULL,
    `password_hash` VARCHAR(255) NOT NULL,
    `fecha_registro` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `peso` DOUBLE NULL,
    `altura` DOUBLE NULL,
    `genero` VARCHAR(20) NULL,

    UNIQUE INDEX `USUARIO_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `EJERCICIO` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(100) NOT NULL,
    `grupo_muscular` VARCHAR(50) NULL,
    `tipo` VARCHAR(50) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `VIDEO` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `usuario_id` INTEGER NOT NULL,
    `ejercicio_id` INTEGER NOT NULL,
    `url_archivo` VARCHAR(255) NOT NULL,
    `fecha_carga` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `estado` VARCHAR(30) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ANALISIS` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `video_id` INTEGER NOT NULL,
    `fecha_analisis` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `puntuacion` DOUBLE NULL,
    `estado` VARCHAR(30) NULL,

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
CREATE TABLE `GIMNASIO` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(100) NOT NULL,
    `direccion` VARCHAR(200) NULL,
    `latitud` DOUBLE NULL,
    `longitud` DOUBLE NULL,
    `telefono` VARCHAR(20) NULL,
    `horario` VARCHAR(100) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `VIDEO` ADD CONSTRAINT `VIDEO_usuario_id_fkey` FOREIGN KEY (`usuario_id`) REFERENCES `USUARIO`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `VIDEO` ADD CONSTRAINT `VIDEO_ejercicio_id_fkey` FOREIGN KEY (`ejercicio_id`) REFERENCES `EJERCICIO`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ANALISIS` ADD CONSTRAINT `ANALISIS_video_id_fkey` FOREIGN KEY (`video_id`) REFERENCES `VIDEO`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `METRICA` ADD CONSTRAINT `METRICA_analisis_id_fkey` FOREIGN KEY (`analisis_id`) REFERENCES `ANALISIS`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FEEDBACK` ADD CONSTRAINT `FEEDBACK_analisis_id_fkey` FOREIGN KEY (`analisis_id`) REFERENCES `ANALISIS`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
