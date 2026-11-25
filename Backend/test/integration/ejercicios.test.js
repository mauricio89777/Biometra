process.env.JWT_SECRET = 'secreto_de_prueba';

const request = require('supertest');
const jwt = require('jsonwebtoken');

jest.mock('../../utils/prisma', () => ({
  ejercicio: {
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

describe('API Biometra - integración de ejercicios', () => {
  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  describe('GET /ejercicios (pública)', () => {
    test('41. GET /ejercicios sin token (ruta pública) responde 200 con la lista', async () => {
      const lista = [{ id: 1 }, { id: 2 }];
      prisma.ejercicio.findMany.mockResolvedValue(lista);

      const res = await request(app).get('/ejercicios');

      expect(res.status).toBe(200);
      expect(res.body).toEqual(lista);
    });

    test('42. GET /ejercicios con filtro en la URL consulta con ese filtro', async () => {
      prisma.ejercicio.findMany.mockResolvedValue([]);

      const res = await request(app).get('/ejercicios').query({ grupo_muscular: 'pecho', tipo: 'fuerza' });

      expect(res.status).toBe(200);
      expect(prisma.ejercicio.findMany.mock.calls[0][0].where).toEqual({ grupo_muscular: 'pecho', tipo: 'fuerza' });
    });

    test('43. GET /ejercicios sin filtros consulta sin condiciones', async () => {
      prisma.ejercicio.findMany.mockResolvedValue([]);

      const res = await request(app).get('/ejercicios');

      expect(res.status).toBe(200);
      expect(prisma.ejercicio.findMany.mock.calls[0][0].where).toEqual({});
    });
  });

  describe('GET /ejercicios/:id (pública)', () => {
    test('44. GET /ejercicios/2 responde 200 con el ejercicio', async () => {
      const item = { id: 2 };
      prisma.ejercicio.findUnique.mockResolvedValue(item);

      const res = await request(app).get('/ejercicios/2');

      expect(res.status).toBe(200);
      expect(res.body).toEqual(item);
      expect(prisma.ejercicio.findUnique.mock.calls[0][0].where).toEqual({ id: 2 });
    });

    test('45. GET /ejercicios/999 responde 404 si no existe', async () => {
      prisma.ejercicio.findUnique.mockResolvedValue(null);

      const res = await request(app).get('/ejercicios/999');

      expect(res.status).toBe(404);
      expect(res.body).toEqual({ error: 'No encontrado' });
    });
  });

  describe('POST /ejercicios (protegida)', () => {
    test('46. POST /ejercicios sin token responde 401', async () => {
      const res = await request(app).post('/ejercicios').send({ nombre: 'Press de banca', grupo_muscular: 'pecho', tipo: 'fuerza' });

      expect(res.status).toBe(401);
      expect(res.body).toEqual({ error: 'Token requerido' });
      expect(prisma.ejercicio.create).not.toHaveBeenCalled();
    });

    test('47. POST /ejercicios con token crea el ejercicio y responde 201', async () => {
      prisma.ejercicio.create.mockResolvedValue({ id: 10, ...{ nombre: 'Press de banca', grupo_muscular: 'pecho', tipo: 'fuerza' } });

      const res = await request(app)
        .post('/ejercicios')
        .set('Authorization', `Bearer ${token}`)
        .send({ nombre: 'Press de banca', grupo_muscular: 'pecho', tipo: 'fuerza' });

      expect(res.status).toBe(201);
      expect(res.body).toEqual({ id: 10, ...{ nombre: 'Press de banca', grupo_muscular: 'pecho', tipo: 'fuerza' } });
      expect(prisma.ejercicio.create).toHaveBeenCalledWith({ data: { nombre: 'Press de banca', grupo_muscular: 'pecho', tipo: 'fuerza' } });
    });

    test('48. POST /ejercicios con un error desconocido de la base de datos responde 400', async () => {
      prisma.ejercicio.create.mockRejectedValue(new Error('campo inválido'));

      const res = await request(app)
        .post('/ejercicios')
        .set('Authorization', `Bearer ${token}`)
        .send({ nombre: 'Press de banca', grupo_muscular: 'pecho', tipo: 'fuerza' });

      expect(res.status).toBe(400);
      expect(res.body).toEqual({ error: 'campo inválido' });
    });
  });

  describe('PUT /ejercicios/:id (protegida)', () => {
    test('49. PUT /ejercicios/1 sin token responde 401', async () => {
      const res = await request(app).put('/ejercicios/1').send({ nombre: 'Press inclinado' });

      expect(res.status).toBe(401);
      expect(res.body).toEqual({ error: 'Token requerido' });
      expect(prisma.ejercicio.update).not.toHaveBeenCalled();
    });

    test('50. PUT /ejercicios/3 con token actualiza y responde 200', async () => {
      prisma.ejercicio.update.mockResolvedValue({ id: 3, ...{ nombre: 'Press inclinado' } });

      const res = await request(app)
        .put('/ejercicios/3')
        .set('Authorization', `Bearer ${token}`)
        .send({ nombre: 'Press inclinado' });

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ id: 3, ...{ nombre: 'Press inclinado' } });
      expect(prisma.ejercicio.update).toHaveBeenCalledWith({
        where: { id: 3 },
        data: { nombre: 'Press inclinado' },
      });
    });

    test('51. PUT /ejercicios/999 si no existe (error P2025) responde 404', async () => {
      prisma.ejercicio.update.mockRejectedValue(errorPrisma('P2025'));

      const res = await request(app)
        .put('/ejercicios/999')
        .set('Authorization', `Bearer ${token}`)
        .send({ nombre: 'Press inclinado' });

      expect(res.status).toBe(404);
      expect(res.body).toEqual({ error: 'No encontrado' });
    });
  });

  describe('DELETE /ejercicios/:id (protegida)', () => {
    test('52. DELETE /ejercicios/1 sin token responde 401', async () => {
      const res = await request(app).delete('/ejercicios/1');

      expect(res.status).toBe(401);
      expect(res.body).toEqual({ error: 'Token requerido' });
      expect(prisma.ejercicio.delete).not.toHaveBeenCalled();
    });

    test('53. DELETE /ejercicios/3 con token elimina y responde 200', async () => {
      prisma.ejercicio.delete.mockResolvedValue({ id: 3 });

      const res = await request(app)
        .delete('/ejercicios/3')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ mensaje: 'Eliminado correctamente' });
      expect(prisma.ejercicio.delete).toHaveBeenCalledWith({ where: { id: 3 } });
    });

    test('54. DELETE /ejercicios/999 si no existe (error P2025) responde 404', async () => {
      prisma.ejercicio.delete.mockRejectedValue(errorPrisma('P2025'));

      const res = await request(app)
        .delete('/ejercicios/999')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(404);
      expect(res.body).toEqual({ error: 'No encontrado' });
    });
  });
});
