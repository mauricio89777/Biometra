const jwt = require('jsonwebtoken');
const authMiddleware = require('../../middlewares/authMiddleware');

jest.mock('jsonwebtoken');

describe('authMiddleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = { headers: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
    process.env.JWT_SECRET = 'secreto_de_prueba';
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('responde 401 si no hay header Authorization', () => {
    authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Token requerido' });
    expect(next).not.toHaveBeenCalled();
  });

  test('responde 401 si el header no empieza con "Bearer "', () => {
    req.headers.authorization = 'Token abc123';

    authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Token requerido' });
    expect(next).not.toHaveBeenCalled();
  });

  test('responde 401 si el token es inválido o expirado', () => {
    req.headers.authorization = 'Bearer tokenMalo';
    jwt.verify.mockImplementation(() => {
      throw new Error('jwt malformed');
    });

    authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Token inválido o expirado' });
    expect(next).not.toHaveBeenCalled();
  });

  test('llama a next() y guarda el usuario si el token es válido', () => {
    req.headers.authorization = 'Bearer tokenBueno';
    jwt.verify.mockReturnValue({ id: 1, email: 'felipe@test.com' });

    authMiddleware(req, res, next);

    expect(jwt.verify).toHaveBeenCalledWith('tokenBueno', 'secreto_de_prueba');
    expect(req.usuario).toEqual({ id: 1, email: 'felipe@test.com' });
    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });
});