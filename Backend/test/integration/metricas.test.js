process.env.JWT_SECRET = 'secreto_de_prueba';

const request = require('supertest');
const jwt = require('jsonwebtoken');

jest.mock('../../utils/prisma', () => ({
  metrica: {
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

describe('API Biometra - integración de metricas', () => {
  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  describe('GET /metricas (pública)', () => {
    test('67. GET /metricas sin token (ruta pública) responde 200 con la lista', async () => {
      const lista = [{ id: 1 }, { id: 2 }];
      prisma.metrica.findMany.mockResolvedValue(lista);

      const res = await request(app).get('/metricas');

      expect(res.status).toBe(200);
      expect(res.body).toEqual(lista);
    });

    test('68. GET /metricas con filtro en la URL consulta con ese filtro', async () => {
      prisma.metrica.findMany.mockResolvedValue([]);

      const res = await request(app).get('/metricas').query({ analisis_id: 7 });

      expect(res.status).toBe(200);
      expect(prisma.metrica.findMany.mock.calls[0][0].where).toEqual({ analisis_id: 7 });
    });

    test('69. GET /metricas sin filtros consulta sin condiciones', async () => {
      prisma.metrica.findMany.mockResolvedValue([]);

      const res = await request(app).get('/metricas');

      expect(res.status).toBe(200);
      expect(prisma.metrica.findMany.mock.calls[0][0].where).toEqual({});
    });
  });

  describe('POST /metricas (protegida)', () => {
    test('70. POST /metricas sin token responde 401', async () => {
      const res = await request(app).post('/metricas').send({ analisis_id: 7, nombre: 'angulo_rodilla', valor: 92.5 });

      expect(res.status).toBe(401);
      expect(res.body).toEqual({ error: 'Token requerido' });
      expect(prisma.metrica.create).not.toHaveBeenCalled();
    });

    test('71. POST /metricas con token crea el métrica y responde 201', async () => {
      prisma.metrica.create.mockResolvedValue({ id: 10, ...{ analisis_id: 7, nombre: 'angulo_rodilla', valor: 92.5 } });

      const res = await request(app)
        .post('/metricas')
        .set('Authorization', `Bearer ${token}`)
        .send({ analisis_id: 7, nombre: 'angulo_rodilla', valor: 92.5 });

      expect(res.status).toBe(201);
      expect(res.body).toEqual({ id: 10, ...{ analisis_id: 7, nombre: 'angulo_rodilla', valor: 92.5 } });
      expect(prisma.metrica.create).toHaveBeenCalledWith({ data: { analisis_id: 7, nombre: 'angulo_rodilla', valor: 92.5 } });
    });

    test('72. POST /metricas con referencia inválida (error P2003 de Prisma) responde 400', async () => {
      prisma.metrica.create.mockRejectedValue(errorPrisma('P2003'));

      const res = await request(app)
        .post('/metricas')
        .set('Authorization', `Bearer ${token}`)
        .send({ analisis_id: 7, nombre: 'angulo_rodilla', valor: 92.5 });

      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        error: 'Referencia inválida: el registro relacionado no existe',
      });
    });
  });

  describe('PUT /metricas/:id (protegida)', () => {
    test('73. PUT /metricas/1 sin token responde 401', async () => {
      const res = await request(app).put('/metricas/1').send({ valor: 95 });

      expect(res.status).toBe(401);
      expect(res.body).toEqual({ error: 'Token requerido' });
      expect(prisma.metrica.update).not.toHaveBeenCalled();
    });

    test('74. PUT /metricas/3 con token actualiza y responde 200', async () => {
      prisma.metrica.update.mockResolvedValue({ id: 3, ...{ valor: 95 } });

      const res = await request(app)
        .put('/metricas/3')
        .set('Authorization', `Bearer ${token}`)
        .send({ valor: 95 });

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ id: 3, ...{ valor: 95 } });
      expect(prisma.metrica.update).toHaveBeenCalledWith({
        where: { id: 3 },
        data: { valor: 95 },
      });
    });

    test('75. PUT /metricas/999 si no existe (error P2025) responde 404', async () => {
      prisma.metrica.update.mockRejectedValue(errorPrisma('P2025'));

      const res = await request(app)
        .put('/metricas/999')
        .set('Authorization', `Bearer ${token}`)
        .send({ valor: 95 });

      expect(res.status).toBe(404);
      expect(res.body).toEqual({ error: 'No encontrado' });
    });
  });

  describe('DELETE /metricas/:id (protegida)', () => {
    test('76. DELETE /metricas/1 sin token responde 401', async () => {
      const res = await request(app).delete('/metricas/1');

      expect(res.status).toBe(401);
      expect(res.body).toEqual({ error: 'Token requerido' });
      expect(prisma.metrica.delete).not.toHaveBeenCalled();
    });

    test('77. DELETE /metricas/3 con token elimina y responde 200', async () => {
      prisma.metrica.delete.mockResolvedValue({ id: 3 });

      const res = await request(app)
        .delete('/metricas/3')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ mensaje: 'Eliminado correctamente' });
      expect(prisma.metrica.delete).toHaveBeenCalledWith({ where: { id: 3 } });
    });

    test('78. DELETE /metricas/999 si no existe (error P2025) responde 404', async () => {
      prisma.metrica.delete.mockRejectedValue(errorPrisma('P2025'));

      const res = await request(app)
        .delete('/metricas/999')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(404);
      expect(res.body).toEqual({ error: 'No encontrado' });
    });
  });
});
