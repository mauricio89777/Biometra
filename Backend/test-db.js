// test-db.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const count = await prisma.usuario.count();
  console.log('Usuarios en BD:', count);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());