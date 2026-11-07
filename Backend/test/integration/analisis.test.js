process.env.JWT_SECRET = 'secreto_de_prueba';

const request = require('supertest');
const jwt = require('jsonwebtoken');

jest.mock('../../utils/prisma', () => ({
  analisis: {
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

describe('API Biometra - integración de analisis', () => {
  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  describe('GET /analisis (pública)', () => {
    test('93. GET /analisis sin token (ruta pública) responde 200 con la lista', async () => {
      const lista = [{ id: 1 }, { id: 2 }];
      prisma.analisis.findMany.mockResolvedValue(lista);

      const res = await request(app).get('/analisis');

      expect(res.status).toBe(200);
      expect(res.body).toEqual(lista);
    });

    test('94. GET /analisis con filtro en la URL consulta con ese filtro', async () => {
      prisma.analisis.findMany.mockResolvedValue([]);

      const res = await request(app).get('/analisis').query({ video_id: 5 });

      expect(res.status).toBe(200);
      expect(prisma.analisis.findMany.mock.calls[0][0].where).toEqual({ video_id: 5 });
    });

    test('95. GET /analisis sin filtros consulta sin condiciones', async () => {
      prisma.analisis.findMany.mockResolvedValue([]);

      const res = await request(app).get('/analisis');

      expect(res.status).toBe(200);
      expect(prisma.analisis.findMany.mock.calls[0][0].where).toEqual({});
    });
  });

  describe('GET /analisis/:id (pública)', () => {
    test('96. GET /analisis/2 responde 200 con el análisis', async () => {
      const item = { id: 2 };
      prisma.analisis.findUnique.mockResolvedValue(item);

      const res = await request(app).get('/analisis/2');

      expect(res.status).toBe(200);
      expect(res.body).toEqual(item);
      expect(prisma.analisis.findUnique.mock.calls[0][0].where).toEqual({ id: 2 });
      expect(prisma.analisis.findUnique.mock.calls[0][0].include).toEqual({
        metricas: true,
        feedbacks: true,
      });
    });

    test('97. GET /analisis/999 responde 404 si no existe', async () => {
      prisma.analisis.findUnique.mockResolvedValue(null);

      const res = await request(app).get('/analisis/999');

      expect(res.status).toBe(404);
      expect(res.body).toEqual({ error: 'No encontrado' });
    });
  });

  describe('POST /analisis (protegida)', () => {
    test('98. POST /analisis sin token responde 401', async () => {
      const res = await request(app).post('/analisis').send({ video_id: 5, resultado: 'Sentadilla correcta', puntaje: 87 });

      expect(res.status).toBe(401);
      expect(res.body).toEqual({ error: 'Token requerido' });
      expect(prisma.analisis.create).not.toHaveBeenCalled();
    });

    test('99. POST /analisis con token crea el análisis y responde 201', async () => {
      prisma.analisis.create.mockResolvedValue({ id: 10, ...{ video_id: 5, resultado: 'Sentadilla correcta', puntaje: 87 } });

      const res = await request(app)
        .post('/analisis')
        .set('Authorization', `Bearer ${token}`)
        .send({ video_id: 5, resultado: 'Sentadilla correcta', puntaje: 87 });

      expect(res.status).toBe(201);
      expect(res.body).toEqual({ id: 10, ...{ video_id: 5, resultado: 'Sentadilla correcta', puntaje: 87 } });
      expect(prisma.analisis.create).toHaveBeenCalledWith({ data: { video_id: 5, resultado: 'Sentadilla correcta', puntaje: 87 } });
    });

    test('100. POST /analisis con referencia inválida (error P2003 de Prisma) responde 400', async () => {
      prisma.analisis.create.mockRejectedValue(errorPrisma('P2003'));

      const res = await request(app)
        .post('/analisis')
        .set('Authorization', `Bearer ${token}`)
        .send({ video_id: 5, resultado: 'Sentadilla correcta', puntaje: 87 });

      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        error: 'Referencia inválida: el registro relacionado no existe',
      });
    });
  });

  describe('PUT /analisis/:id (protegida)', () => {
    test('101. PUT /analisis/1 sin token responde 401', async () => {
      const res = await request(app).put('/analisis/1').send({ puntaje: 90 });

      expect(res.status).toBe(401);
      expect(res.body).toEqual({ error: 'Token requerido' });
      expect(prisma.analisis.update).not.toHaveBeenCalled();
    });

    test('102. PUT /analisis/3 con token actualiza y responde 200', async () => {
      prisma.analisis.update.mockResolvedValue({ id: 3, ...{ puntaje: 90 } });

      const res = await request(app)
        .put('/analisis/3')
        .set('Authorization', `Bearer ${token}`)
        .send({ puntaje: 90 });

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ id: 3, ...{ puntaje: 90 } });
      expect(prisma.analisis.update).toHaveBeenCalledWith({
        where: { id: 3 },
        data: { puntaje: 90 },
      });
    });

    test('103. PUT /analisis/999 si no existe (error P2025) responde 404', async () => {
      prisma.analisis.update.mockRejectedValue(errorPrisma('P2025'));

      const res = await request(app)
        .put('/analisis/999')
        .set('Authorization', `Bearer ${token}`)
        .send({ puntaje: 90 });

      expect(res.status).toBe(404);
      expect(res.body).toEqual({ error: 'No encontrado' });
    });
  });

  describe('DELETE /analisis/:id (protegida)', () => {
    test('104. DELETE /analisis/1 sin token responde 401', async () => {
      const res = await request(app).delete('/analisis/1');

      expect(res.status).toBe(401);
      expect(res.body).toEqual({ error: 'Token requerido' });
      expect(prisma.analisis.delete).not.toHaveBeenCalled();
    });

    test('105. DELETE /analisis/3 con token elimina y responde 200', async () => {
      prisma.analisis.delete.mockResolvedValue({ id: 3 });

      const res = await request(app)
        .delete('/analisis/3')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ mensaje: 'Eliminado correctamente' });
      expect(prisma.analisis.delete).toHaveBeenCalledWith({ where: { id: 3 } });
    });

    test('106. DELETE /analisis/999 si no existe (error P2025) responde 404', async () => {
      prisma.analisis.delete.mockRejectedValue(errorPrisma('P2025'));

      const res = await request(app)
        .delete('/analisis/999')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(404);
      expect(res.body).toEqual({ error: 'No encontrado' });
    });
  });
});
