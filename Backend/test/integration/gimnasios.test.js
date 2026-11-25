process.env.JWT_SECRET = 'secreto_de_prueba';

const request = require('supertest');
const jwt = require('jsonwebtoken');

jest.mock('../../utils/prisma', () => ({
  gimnasio: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
}));

const prisma = require('../../utils/prisma');
const app = require('../../app');

// JWT real, igual al que devuelve el login
const token = jwt.sign({ id: 1, email: 'felipe@test.com' }, process.env.JWT_SECRET, {
  expiresIn: '1h',
});

// Simula un error de Prisma con su código (P2025, P2002, P2003...)
const errorPrisma = (code) => Object.assign(new Error('error de prisma'), { code });

describe('API Biometra - integración de gimnasios', () => {
  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  describe('GET /gimnasios (pública)', () => {
    test('24. responde 200 con la lista, sin necesidad de token', async () => {
      const lista = [
        { id: 1, nombre: 'Gym Central' },
        { id: 2, nombre: 'Gym Norte' },
      ];
      prisma.gimnasio.findMany.mockResolvedValue(lista);

      const res = await request(app).get('/gimnasios');

      expect(res.status).toBe(200);
      expect(res.body).toEqual(lista);
    });

    test('25. si la base de datos falla, responde con error controlado (no tira el servidor)', async () => {
      prisma.gimnasio.findMany.mockRejectedValue(new Error('DB caída'));

      const res = await request(app).get('/gimnasios');

      expect(res.status).toBeGreaterThanOrEqual(400);
    });
  });

  describe('GET /gimnasios/:id (pública)', () => {
    test('26. responde 200 con el gimnasio', async () => {
      const gimnasio = { id: 3, nombre: 'Gym Sur' };
      prisma.gimnasio.findUnique.mockResolvedValue(gimnasio);

      const res = await request(app).get('/gimnasios/3');

      expect(res.status).toBe(200);
      expect(res.body).toEqual(gimnasio);
      expect(prisma.gimnasio.findUnique).toHaveBeenCalledWith({ where: { id: 3 } });
    });

    test('27. responde 404 si no existe', async () => {
      prisma.gimnasio.findUnique.mockResolvedValue(null);

      const res = await request(app).get('/gimnasios/999');

      expect(res.status).toBe(404);
      expect(res.body).toEqual({ error: 'No encontrado' });
    });
  });

  describe('POST /gimnasios (protegida)', () => {
    test('28. sin token responde 401', async () => {
      const res = await request(app).post('/gimnasios').send({ nombre: 'Gym Nuevo' });

      expect(res.status).toBe(401);
      expect(res.body).toEqual({ error: 'Token requerido' });
      expect(prisma.gimnasio.create).not.toHaveBeenCalled();
    });

    test('29. con token crea el gimnasio y responde 201', async () => {
      const datos = { nombre: 'Gym Nuevo', direccion: 'Av. Principal 123' };
      prisma.gimnasio.create.mockResolvedValue({ id: 10, ...datos });

      const res = await request(app)
        .post('/gimnasios')
        .set('Authorization', `Bearer ${token}`)
        .send(datos);

      expect(res.status).toBe(201);
      expect(res.body).toEqual({ id: 10, ...datos });
      expect(prisma.gimnasio.create).toHaveBeenCalledWith({ data: datos });
    });

    test('30. referencia inválida (P2003) responde 400', async () => {
      prisma.gimnasio.create.mockRejectedValue(errorPrisma('P2003'));

      const res = await request(app)
        .post('/gimnasios')
        .set('Authorization', `Bearer ${token}`)
        .send({ nombre: 'Gym Nuevo' });

      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        error: 'Referencia inválida: el registro relacionado no existe',
      });
    });
  });

  describe('PUT /gimnasios/:id (protegida)', () => {
    test('31. sin token responde 401', async () => {
      const res = await request(app).put('/gimnasios/1').send({ nombre: 'X' });

      expect(res.status).toBe(401);
      expect(res.body).toEqual({ error: 'Token requerido' });
      expect(prisma.gimnasio.update).not.toHaveBeenCalled();
    });

    test('32. con token actualiza y responde 200', async () => {
      prisma.gimnasio.update.mockResolvedValue({ id: 3, nombre: 'Gym Renovado' });

      const res = await request(app)
        .put('/gimnasios/3')
        .set('Authorization', `Bearer ${token}`)
        .send({ nombre: 'Gym Renovado' });

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ id: 3, nombre: 'Gym Renovado' });
      expect(prisma.gimnasio.update).toHaveBeenCalledWith({
        where: { id: 3 },
        data: { nombre: 'Gym Renovado' },
      });
    });

    test('33. si el gimnasio no existe (P2025) responde 404', async () => {
      prisma.gimnasio.update.mockRejectedValue(errorPrisma('P2025'));

      const res = await request(app)
        .put('/gimnasios/999')
        .set('Authorization', `Bearer ${token}`)
        .send({ nombre: 'X' });

      expect(res.status).toBe(404);
      expect(res.body).toEqual({ error: 'No encontrado' });
    });
  });

  describe('DELETE /gimnasios/:id (protegida)', () => {
    test('34. sin token responde 401', async () => {
      const res = await request(app).delete('/gimnasios/1');

      expect(res.status).toBe(401);
      expect(res.body).toEqual({ error: 'Token requerido' });
      expect(prisma.gimnasio.delete).not.toHaveBeenCalled();
    });

    test('35. con token elimina y responde 200', async () => {
      prisma.gimnasio.delete.mockResolvedValue({ id: 3 });

      const res = await request(app)
        .delete('/gimnasios/3')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ mensaje: 'Eliminado correctamente' });
      expect(prisma.gimnasio.delete).toHaveBeenCalledWith({ where: { id: 3 } });
    });

    test('36. si el gimnasio no existe (P2025) responde 404', async () => {
      prisma.gimnasio.delete.mockRejectedValue(errorPrisma('P2025'));

      const res = await request(app)
        .delete('/gimnasios/999')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(404);
      expect(res.body).toEqual({ error: 'No encontrado' });
    });
  });
});