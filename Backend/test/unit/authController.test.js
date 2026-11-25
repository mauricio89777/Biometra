const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const prisma = require('../../utils/prisma');
const { login } = require('../../controllers/authController');

jest.mock('bcrypt');
jest.mock('jsonwebtoken');
jest.mock('../../utils/prisma', () => ({
  usuario: { findUnique: jest.fn() },
}));

describe('authController - login', () => {
  let req, res;

  beforeEach(() => {
    req = { body: { email: 'felipe@test.com', password: '123456' } };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    process.env.JWT_SECRET = 'secreto_de_prueba';
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  test('responde 400 si falta el email', async () => {
    req.body = { password: '123456' };

    await login(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Email y password son requeridos' });
    expect(prisma.usuario.findUnique).not.toHaveBeenCalled();
  });

  test('responde 400 si falta el password', async () => {
    req.body = { email: 'felipe@test.com' };

    await login(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Email y password son requeridos' });
  });

  test('responde 401 si el usuario no existe', async () => {
    prisma.usuario.findUnique.mockResolvedValue(null);

    await login(req, res);

    expect(prisma.usuario.findUnique).toHaveBeenCalledWith({
      where: { email: 'felipe@test.com' },
    });
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Credenciales inválidas' });
  });

  test('responde 401 si la contraseña es incorrecta', async () => {
    prisma.usuario.findUnique.mockResolvedValue({
      id: 1,
      email: 'felipe@test.com',
      password_hash: 'hash',
    });
    bcrypt.compare.mockResolvedValue(false);

    await login(req, res);

    expect(bcrypt.compare).toHaveBeenCalledWith('123456', 'hash');
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Credenciales inválidas' });
    expect(jwt.sign).not.toHaveBeenCalled();
  });

  test('login exitoso devuelve token y usuario sin password_hash', async () => {
    prisma.usuario.findUnique.mockResolvedValue({
      id: 1,
      email: 'felipe@test.com',
      nombre: 'Felipe',
      password_hash: 'hash',
    });
    bcrypt.compare.mockResolvedValue(true);
    jwt.sign.mockReturnValue('token_falso');

    await login(req, res);

    expect(jwt.sign).toHaveBeenCalledWith(
      { id: 1, email: 'felipe@test.com' },
      'secreto_de_prueba',
      { expiresIn: '24h' }
    );
    expect(res.json).toHaveBeenCalledWith({
      token: 'token_falso',
      usuario: { id: 1, email: 'felipe@test.com', nombre: 'Felipe' },
    });
    expect(res.status).not.toHaveBeenCalled();
  });

  test('responde 500 si la base de datos falla', async () => {
    prisma.usuario.findUnique.mockRejectedValue(new Error('DB caída'));

    await login(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Error interno del servidor' });
  });
});