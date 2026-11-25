process.env.JWT_SECRET = 'secreto_de_prueba';

const request = require('supertest');
const jwt = require('jsonwebtoken');

jest.mock('../../utils/prisma', () => ({
  feedback: {
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

describe('API Biometra - integración de feedbacks', () => {
  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  describe('GET /feedbacks (pública)', () => {
    test('55. GET /feedbacks sin token (ruta pública) responde 200 con la lista', async () => {
      const lista = [{ id: 1 }, { id: 2 }];
      prisma.feedback.findMany.mockResolvedValue(lista);

      const res = await request(app).get('/feedbacks');

      expect(res.status).toBe(200);
      expect(res.body).toEqual(lista);
    });

    test('56. GET /feedbacks con filtro en la URL consulta con ese filtro', async () => {
      prisma.feedback.findMany.mockResolvedValue([]);

      const res = await request(app).get('/feedbacks').query({ analisis_id: 7 });

      expect(res.status).toBe(200);
      expect(prisma.feedback.findMany.mock.calls[0][0].where).toEqual({ analisis_id: 7 });
    });

    test('57. GET /feedbacks sin filtros consulta sin condiciones', async () => {
      prisma.feedback.findMany.mockResolvedValue([]);

      const res = await request(app).get('/feedbacks');

      expect(res.status).toBe(200);
      expect(prisma.feedback.findMany.mock.calls[0][0].where).toEqual({});
    });
  });

  describe('POST /feedbacks (protegida)', () => {
    test('58. POST /feedbacks sin token responde 401', async () => {
      const res = await request(app).post('/feedbacks').send({ analisis_id: 7, mensaje: 'Mantén la espalda recta' });

      expect(res.status).toBe(401);
      expect(res.body).toEqual({ error: 'Token requerido' });
      expect(prisma.feedback.create).not.toHaveBeenCalled();
    });

    test('59. POST /feedbacks con token crea el feedback y responde 201', async () => {
      prisma.feedback.create.mockResolvedValue({ id: 10, ...{ analisis_id: 7, mensaje: 'Mantén la espalda recta' } });

      const res = await request(app)
        .post('/feedbacks')
        .set('Authorization', `Bearer ${token}`)
        .send({ analisis_id: 7, mensaje: 'Mantén la espalda recta' });

      expect(res.status).toBe(201);
      expect(res.body).toEqual({ id: 10, ...{ analisis_id: 7, mensaje: 'Mantén la espalda recta' } });
      expect(prisma.feedback.create).toHaveBeenCalledWith({ data: { analisis_id: 7, mensaje: 'Mantén la espalda recta' } });
    });

    test('60. POST /feedbacks con referencia inválida (error P2003 de Prisma) responde 400', async () => {
      prisma.feedback.create.mockRejectedValue(errorPrisma('P2003'));

      const res = await request(app)
        .post('/feedbacks')
        .set('Authorization', `Bearer ${token}`)
        .send({ analisis_id: 7, mensaje: 'Mantén la espalda recta' });

      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        error: 'Referencia inválida: el registro relacionado no existe',
      });
    });
  });

  describe('PUT /feedbacks/:id (protegida)', () => {
    test('61. PUT /feedbacks/1 sin token responde 401', async () => {
      const res = await request(app).put('/feedbacks/1').send({ mensaje: 'Baja más lento' });

      expect(res.status).toBe(401);
      expect(res.body).toEqual({ error: 'Token requerido' });
      expect(prisma.feedback.update).not.toHaveBeenCalled();
    });

    test('62. PUT /feedbacks/3 con token actualiza y responde 200', async () => {
      prisma.feedback.update.mockResolvedValue({ id: 3, ...{ mensaje: 'Baja más lento' } });

      const res = await request(app)
        .put('/feedbacks/3')
        .set('Authorization', `Bearer ${token}`)
        .send({ mensaje: 'Baja más lento' });

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ id: 3, ...{ mensaje: 'Baja más lento' } });
      expect(prisma.feedback.update).toHaveBeenCalledWith({
        where: { id: 3 },
        data: { mensaje: 'Baja más lento' },
      });
    });

    test('63. PUT /feedbacks/999 si no existe (error P2025) responde 404', async () => {
      prisma.feedback.update.mockRejectedValue(errorPrisma('P2025'));

      const res = await request(app)
        .put('/feedbacks/999')
        .set('Authorization', `Bearer ${token}`)
        .send({ mensaje: 'Baja más lento' });

      expect(res.status).toBe(404);
      expect(res.body).toEqual({ error: 'No encontrado' });
    });
  });

  describe('DELETE /feedbacks/:id (protegida)', () => {
    test('64. DELETE /feedbacks/1 sin token responde 401', async () => {
      const res = await request(app).delete('/feedbacks/1');

      expect(res.status).toBe(401);
      expect(res.body).toEqual({ error: 'Token requerido' });
      expect(prisma.feedback.delete).not.toHaveBeenCalled();
    });

    test('65. DELETE /feedbacks/3 con token elimina y responde 200', async () => {
      prisma.feedback.delete.mockResolvedValue({ id: 3 });

      const res = await request(app)
        .delete('/feedbacks/3')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ mensaje: 'Eliminado correctamente' });
      expect(prisma.feedback.delete).toHaveBeenCalledWith({ where: { id: 3 } });
    });

    test('66. DELETE /feedbacks/999 si no existe (error P2025) responde 404', async () => {
      prisma.feedback.delete.mockRejectedValue(errorPrisma('P2025'));

      const res = await request(app)
        .delete('/feedbacks/999')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(404);
      expect(res.body).toEqual({ error: 'No encontrado' });
    });
  });
});
