process.env.JWT_SECRET = 'secreto_de_prueba';

const request = require('supertest');
const bcrypt = require('bcrypt');
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

// Genera un JWT real, igual al que devuelve el login
const tokenDe = (id, email = 'felipe@test.com') =>
  jwt.sign({ id, email }, process.env.JWT_SECRET, { expiresIn: '1h' });

describe('API Biometra - integración de usuarios', () => {
  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  describe('Flujo completo: login + token real', () => {
    test('12. login y luego GET /usuarios con el token devuelto responde 200', async () => {
      const hash = await bcrypt.hash('123456', 4);
      prisma.usuario.findUnique.mockResolvedValue({
        id: 1,
        email: 'felipe@test.com',
        nombre: 'Felipe',
        password_hash: hash,
      });

      const login = await request(app)
        .post('/login')
        .send({ email: 'felipe@test.com', password: '123456' });

      expect(login.status).toBe(200);
      const token = login.body.token;

      const lista = [{ id: 1, nombre: 'Felipe', email: 'felipe@test.com' }];
      prisma.usuario.findMany.mockResolvedValue(lista);

      const res = await request(app)
        .get('/usuarios')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body).toEqual(lista);
    });
  });

  describe('POST /usuarios (registro, público)', () => {
    test('13. registra un usuario, responde 201 y no devuelve password_hash', async () => {
      prisma.usuario.create.mockImplementation(async ({ data }) => ({ id: 5, ...data }));

      const res = await request(app).post('/usuarios').send({
        nombre: 'Ana',
        email: 'ana@test.com',
        password: 'abc12345',
        peso: 60,
        altura: 165,
        genero: 'F',
      });

      expect(res.status).toBe(201);
      expect(res.body).toEqual({
        id: 5,
        nombre: 'Ana',
        email: 'ana@test.com',
        peso: 60,
        altura: 165,
        genero: 'F',
      });
      expect(res.body.password_hash).toBeUndefined();

      // La contraseña se guardó hasheada con bcrypt real, no en texto plano
      const datosGuardados = prisma.usuario.create.mock.calls[0][0].data;
      expect(datosGuardados.password).toBeUndefined();
      expect(datosGuardados.password_hash).not.toBe('abc12345');
      expect(await bcrypt.compare('abc12345', datosGuardados.password_hash)).toBe(true);
    });

    test('14. responde 400 si falta la contraseña', async () => {
      const res = await request(app)
        .post('/usuarios')
        .send({ nombre: 'Ana', email: 'ana@test.com' });

      expect(res.status).toBe(400);
      expect(res.body).toEqual({ error: 'La contraseña es requerida' });
      expect(prisma.usuario.create).not.toHaveBeenCalled();
    });

    test('15. acepta password_hash como nombre alternativo del campo', async () => {
      prisma.usuario.create.mockImplementation(async ({ data }) => ({ id: 6, ...data }));

      const res = await request(app)
        .post('/usuarios')
        .send({ nombre: 'Luis', email: 'luis@test.com', password_hash: 'clave123' });

      expect(res.status).toBe(201);
      expect(res.body.password_hash).toBeUndefined();
    });
  });

  describe('GET /usuarios (protegida)', () => {
    test('16. con token válido responde 200 y pide solo campos públicos', async () => {
      prisma.usuario.findMany.mockResolvedValue([]);

      const res = await request(app)
        .get('/usuarios')
        .set('Authorization', `Bearer ${tokenDe(1)}`);

      expect(res.status).toBe(200);
      const args = prisma.usuario.findMany.mock.calls[0][0];
      expect(args.select.password_hash).toBeUndefined();
      expect(args.select.email).toBe(true);
    });
  });

  describe('GET /usuarios/:id (pública)', () => {
    test('17. responde 200 con el usuario, sin necesidad de token', async () => {
      const usuario = { id: 1, nombre: 'Felipe', email: 'felipe@test.com' };
      prisma.usuario.findUnique.mockResolvedValue(usuario);

      const res = await request(app).get('/usuarios/1');

      expect(res.status).toBe(200);
      expect(res.body).toEqual(usuario);
      expect(prisma.usuario.findUnique.mock.calls[0][0].where).toEqual({ id: 1 });
    });

    test('18. responde 404 si el usuario no existe', async () => {
      prisma.usuario.findUnique.mockResolvedValue(null);

      const res = await request(app).get('/usuarios/999');

      expect(res.status).toBe(404);
      expect(res.body).toEqual({ error: 'No encontrado' });
    });
  });

  describe('PUT /usuarios/:id (protegida)', () => {
    test('19. el dueño actualiza su usuario y responde 200 sin password_hash', async () => {
      prisma.usuario.update.mockResolvedValue({
        id: 1,
        email: 'felipe@test.com',
        nombre: 'Nuevo',
        password_hash: 'hash_interno',
      });

      const res = await request(app)
        .put('/usuarios/1')
        .set('Authorization', `Bearer ${tokenDe(1)}`)
        .send({ nombre: 'Nuevo' });

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ id: 1, email: 'felipe@test.com', nombre: 'Nuevo' });
      expect(prisma.usuario.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { nombre: 'Nuevo' },
      });
    });

    test('20. si envía password nueva, se guarda hasheada', async () => {
      prisma.usuario.update.mockImplementation(async ({ where, data }) => ({
        id: where.id,
        ...data,
      }));

      const res = await request(app)
        .put('/usuarios/1')
        .set('Authorization', `Bearer ${tokenDe(1)}`)
        .send({ password: 'nueva123' });

      expect(res.status).toBe(200);
      expect(res.body.password_hash).toBeUndefined();

      const datos = prisma.usuario.update.mock.calls[0][0].data;
      expect(datos.password_hash).not.toBe('nueva123');
      expect(await bcrypt.compare('nueva123', datos.password_hash)).toBe(true);
    });

    test('21. responde 403 si intenta modificar a otro usuario', async () => {
      const res = await request(app)
        .put('/usuarios/2')
        .set('Authorization', `Bearer ${tokenDe(1)}`)
        .send({ nombre: 'Intruso' });

      expect(res.status).toBe(403);
      expect(res.body).toEqual({ error: 'No puedes modificar a otro usuario' });
      expect(prisma.usuario.update).not.toHaveBeenCalled();
    });

    test('107. PUT /usuarios/1 con todos los campos opcionales los envía a la base de datos', async () => {
      prisma.usuario.update.mockImplementation(async ({ where, data }) => ({
        id: where.id,
        ...data,
      }));
      const cuerpo = {
        nombre: 'Felipe',
        email: 'nuevo@test.com',
        peso: 72,
        altura: 178,
        genero: 'M',
      };

      const res = await request(app)
        .put('/usuarios/1')
        .set('Authorization', `Bearer ${tokenDe(1)}`)
        .send(cuerpo);

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ id: 1, ...cuerpo });
      expect(prisma.usuario.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: cuerpo,
      });
    });
  });

  describe('DELETE /usuarios/:id (protegida)', () => {
    test('22. el dueño elimina su usuario y responde 200', async () => {
      prisma.usuario.delete.mockResolvedValue({ id: 1 });

      const res = await request(app)
        .delete('/usuarios/1')
        .set('Authorization', `Bearer ${tokenDe(1)}`);

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ mensaje: 'Eliminado correctamente' });
      expect(prisma.usuario.delete).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    test('23. responde 403 si intenta eliminar a otro usuario', async () => {
      const res = await request(app)
        .delete('/usuarios/2')
        .set('Authorization', `Bearer ${tokenDe(1)}`);

      expect(res.status).toBe(403);
      expect(res.body).toEqual({ error: 'No puedes eliminar a otro usuario' });
      expect(prisma.usuario.delete).not.toHaveBeenCalled();
    });
  });
});
