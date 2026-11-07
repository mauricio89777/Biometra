process.env.JWT_SECRET = 'secreto_de_prueba';

const request = require('supertest');
const bcrypt = require('bcrypt');

jest.mock('../../utils/prisma', () => ({
  usuario: { findUnique: jest.fn() },
}));

const prisma = require('../../utils/prisma');
const app = require('../../app');

describe('API Biometra - integración', () => {
  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  describe('Rutas generales', () => {
    test('GET / responde 200 con el mensaje de la API', async () => {
      const res = await request(app).get('/');

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ mensaje: 'API Biometra funcionando' });
    });

    test('una ruta inexistente responde 404', async () => {
      const res = await request(app).get('/ruta-que-no-existe');

      expect(res.status).toBe(404);
      expect(res.body).toEqual({ error: 'Ruta no encontrada' });
    });

    test('un JSON mal formado responde 400', async () => {
      const res = await request(app)
        .post('/login')
        .set('Content-Type', 'application/json')
        .send('{malo');

      expect(res.status).toBe(400);
      expect(res.body).toEqual({ error: 'Solicitud inválida' });
    });
  });

  describe('POST /login', () => {
    test('responde 400 si faltan datos', async () => {
      const res = await request(app).post('/login').send({});

      expect(res.status).toBe(400);
      expect(res.body).toEqual({ error: 'Email y password son requeridos' });
    });

    test('responde 401 si el usuario no existe', async () => {
      prisma.usuario.findUnique.mockResolvedValue(null);

      const res = await request(app)
        .post('/login')
        .send({ email: 'nadie@test.com', password: '123456' });

      expect(res.status).toBe(401);
      expect(res.body).toEqual({ error: 'Credenciales inválidas' });
    });

    test('responde 401 si la contraseña es incorrecta', async () => {
      const hash = await bcrypt.hash('otra_clave', 4);
      prisma.usuario.findUnique.mockResolvedValue({
        id: 1,
        email: 'felipe@test.com',
        password_hash: hash,
      });

      const res = await request(app)
        .post('/login')
        .send({ email: 'felipe@test.com', password: '123456' });

      expect(res.status).toBe(401);
      expect(res.body).toEqual({ error: 'Credenciales inválidas' });
    });

    test('responde 200 con token real y sin password_hash', async () => {
      const hash = await bcrypt.hash('123456', 4);
      prisma.usuario.findUnique.mockResolvedValue({
        id: 1,
        email: 'felipe@test.com',
        nombre: 'Felipe',
        password_hash: hash,
      });

      const res = await request(app)
        .post('/login')
        .send({ email: 'felipe@test.com', password: '123456' });

      expect(res.status).toBe(200);
      expect(typeof res.body.token).toBe('string');
      expect(res.body.usuario).toEqual({
        id: 1,
        email: 'felipe@test.com',
        nombre: 'Felipe',
      });
      expect(res.body.usuario.password_hash).toBeUndefined();
    });
  });

  describe('Rutas protegidas de /usuarios', () => {
    test('GET /usuarios sin token responde 401', async () => {
      const res = await request(app).get('/usuarios');

      expect(res.status).toBe(401);
      expect(res.body).toEqual({ error: 'Token requerido' });
    });

    test('PUT /usuarios/1 sin token responde 401', async () => {
      const res = await request(app).put('/usuarios/1').send({ nombre: 'X' });

      expect(res.status).toBe(401);
      expect(res.body).toEqual({ error: 'Token requerido' });
    });

    test('DELETE /usuarios/1 sin token responde 401', async () => {
      const res = await request(app).delete('/usuarios/1');

      expect(res.status).toBe(401);
      expect(res.body).toEqual({ error: 'Token requerido' });
    });

    test('GET /usuarios con token inválido responde 401', async () => {
      const res = await request(app)
        .get('/usuarios')
        .set('Authorization', 'Bearer token_falso');

      expect(res.status).toBe(401);
      expect(res.body).toEqual({ error: 'Token inválido o expirado' });
    });
  });
});