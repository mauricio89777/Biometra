process.env.JWT_SECRET = 'secreto_de_prueba';

const request = require('supertest');
const jwt = require('jsonwebtoken');

jest.mock('../../utils/prisma', () => ({
  video: {
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

describe('API Biometra - integración de videos', () => {
  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  describe('GET /videos (pública)', () => {
    test('79. GET /videos sin token (ruta pública) responde 200 con la lista', async () => {
      const lista = [{ id: 1 }, { id: 2 }];
      prisma.video.findMany.mockResolvedValue(lista);

      const res = await request(app).get('/videos');

      expect(res.status).toBe(200);
      expect(res.body).toEqual(lista);
    });

    test('80. GET /videos con filtro en la URL consulta con ese filtro', async () => {
      prisma.video.findMany.mockResolvedValue([]);

      const res = await request(app).get('/videos').query({ usuario_id: 3 });

      expect(res.status).toBe(200);
      expect(prisma.video.findMany.mock.calls[0][0].where).toEqual({ usuario_id: 3 });
    });

    test('81. GET /videos sin filtros consulta sin condiciones', async () => {
      prisma.video.findMany.mockResolvedValue([]);

      const res = await request(app).get('/videos');

      expect(res.status).toBe(200);
      expect(prisma.video.findMany.mock.calls[0][0].where).toEqual({});
      expect(prisma.video.findMany.mock.calls[0][0].include).toEqual({ ejercicio: true });
    });
  });

  describe('GET /videos/:id (pública)', () => {
    test('82. GET /videos/2 responde 200 con el video', async () => {
      const item = { id: 2 };
      prisma.video.findUnique.mockResolvedValue(item);

      const res = await request(app).get('/videos/2');

      expect(res.status).toBe(200);
      expect(res.body).toEqual(item);
      expect(prisma.video.findUnique.mock.calls[0][0].where).toEqual({ id: 2 });
      expect(prisma.video.findUnique.mock.calls[0][0].include).toEqual({
        ejercicio: true,
        analisis: true,
      });
    });

    test('83. GET /videos/999 responde 404 si no existe', async () => {
      prisma.video.findUnique.mockResolvedValue(null);

      const res = await request(app).get('/videos/999');

      expect(res.status).toBe(404);
      expect(res.body).toEqual({ error: 'No encontrado' });
    });
  });

  describe('POST /videos (protegida)', () => {
    test('84. POST /videos sin token responde 401', async () => {
      const res = await request(app).post('/videos').send({ usuario_id: 3, ejercicio_id: 2, url: 'https://ejemplo.com/video.mp4' });

      expect(res.status).toBe(401);
      expect(res.body).toEqual({ error: 'Token requerido' });
      expect(prisma.video.create).not.toHaveBeenCalled();
    });

    test('85. POST /videos con token crea el video y responde 201', async () => {
      prisma.video.create.mockResolvedValue({ id: 10, ...{ usuario_id: 3, ejercicio_id: 2, url: 'https://ejemplo.com/video.mp4' } });

      const res = await request(app)
        .post('/videos')
        .set('Authorization', `Bearer ${token}`)
        .send({ usuario_id: 3, ejercicio_id: 2, url: 'https://ejemplo.com/video.mp4' });

      expect(res.status).toBe(201);
      expect(res.body).toEqual({ id: 10, ...{ usuario_id: 3, ejercicio_id: 2, url: 'https://ejemplo.com/video.mp4' } });
      expect(prisma.video.create).toHaveBeenCalledWith({ data: { usuario_id: 3, ejercicio_id: 2, url: 'https://ejemplo.com/video.mp4' } });
    });

    test('86. POST /videos con referencia inválida (error P2003 de Prisma) responde 400', async () => {
      prisma.video.create.mockRejectedValue(errorPrisma('P2003'));

      const res = await request(app)
        .post('/videos')
        .set('Authorization', `Bearer ${token}`)
        .send({ usuario_id: 3, ejercicio_id: 2, url: 'https://ejemplo.com/video.mp4' });

      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        error: 'Referencia inválida: el registro relacionado no existe',
      });
    });
  });

  describe('PUT /videos/:id (protegida)', () => {
    test('87. PUT /videos/1 sin token responde 401', async () => {
      const res = await request(app).put('/videos/1').send({ url: 'https://ejemplo.com/otro.mp4' });

      expect(res.status).toBe(401);
      expect(res.body).toEqual({ error: 'Token requerido' });
      expect(prisma.video.update).not.toHaveBeenCalled();
    });

    test('88. PUT /videos/3 con token actualiza y responde 200', async () => {
      prisma.video.update.mockResolvedValue({ id: 3, ...{ url: 'https://ejemplo.com/otro.mp4' } });

      const res = await request(app)
        .put('/videos/3')
        .set('Authorization', `Bearer ${token}`)
        .send({ url: 'https://ejemplo.com/otro.mp4' });

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ id: 3, ...{ url: 'https://ejemplo.com/otro.mp4' } });
      expect(prisma.video.update).toHaveBeenCalledWith({
        where: { id: 3 },
        data: { url: 'https://ejemplo.com/otro.mp4' },
      });
    });

    test('89. PUT /videos/999 si no existe (error P2025) responde 404', async () => {
      prisma.video.update.mockRejectedValue(errorPrisma('P2025'));

      const res = await request(app)
        .put('/videos/999')
        .set('Authorization', `Bearer ${token}`)
        .send({ url: 'https://ejemplo.com/otro.mp4' });

      expect(res.status).toBe(404);
      expect(res.body).toEqual({ error: 'No encontrado' });
    });
  });

  describe('DELETE /videos/:id (protegida)', () => {
    test('90. DELETE /videos/1 sin token responde 401', async () => {
      const res = await request(app).delete('/videos/1');

      expect(res.status).toBe(401);
      expect(res.body).toEqual({ error: 'Token requerido' });
      expect(prisma.video.delete).not.toHaveBeenCalled();
    });

    test('91. DELETE /videos/3 con token elimina y responde 200', async () => {
      prisma.video.delete.mockResolvedValue({ id: 3 });

      const res = await request(app)
        .delete('/videos/3')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ mensaje: 'Eliminado correctamente' });
      expect(prisma.video.delete).toHaveBeenCalledWith({ where: { id: 3 } });
    });

    test('92. DELETE /videos/999 si no existe (error P2025) responde 404', async () => {
      prisma.video.delete.mockRejectedValue(errorPrisma('P2025'));

      const res = await request(app)
        .delete('/videos/999')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(404);
      expect(res.body).toEqual({ error: 'No encontrado' });
    });
  });
});
