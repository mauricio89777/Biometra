process.env.JWT_SECRET = 'secreto_de_prueba';

const request = require('supertest');
const jwt = require('jsonwebtoken');

jest.mock('../../utils/prisma', () => ({
  usuario: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
}));

const prisma = require('../../utils/prisma');
const app = require('../../app');

const token = jwt.sign({ id: 1, email: 'felipe@test.com' }, process.env.JWT_SECRET, {
  expiresIn: '1h',
});

// Simula un error de Prisma con su código
const errorPrisma = (code) => Object.assign(new Error('error de prisma'), { code });

describe('API Biometra - errores de base de datos en /usuarios', () => {
  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  test('37. POST /usuarios con email repetido (P2002) responde 409', async () => {
    prisma.usuario.create.mockRejectedValue(errorPrisma('P2002'));

    const res = await request(app)
      .post('/usuarios')
      .send({ nombre: 'Ana', email: 'repetido@test.com', password: 'abc12345' });

    expect(res.status).toBe(409);
    expect(res.body).toEqual({
      error: 'Ya existe un registro con ese valor único (por ejemplo, el email)',
    });
  });

  test('38. PUT /usuarios/1 si el usuario ya no existe (P2025) responde 404', async () => {
    prisma.usuario.update.mockRejectedValue(errorPrisma('P2025'));

    const res = await request(app)
      .put('/usuarios/1')
      .set('Authorization', `Bearer ${token}`)
      .send({ nombre: 'Nuevo' });

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: 'No encontrado' });
  });

  test('39. DELETE /usuarios/1 si el usuario ya no existe (P2025) responde 404', async () => {
    prisma.usuario.delete.mockRejectedValue(errorPrisma('P2025'));

    const res = await request(app)
      .delete('/usuarios/1')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: 'No encontrado' });
  });

  test('40. un error desconocido de la base de datos responde 400 con su mensaje', async () => {
    prisma.usuario.create.mockRejectedValue(new Error('campo inválido'));

    const res = await request(app)
      .post('/usuarios')
      .send({ nombre: 'Ana', email: 'ana@test.com', password: 'abc12345' });

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: 'campo inválido' });
  });
});