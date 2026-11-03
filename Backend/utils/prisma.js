// Una sola instancia de Prisma compartida por todo el proyecto
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

module.exports = prisma;