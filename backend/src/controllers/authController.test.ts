import { beforeEach, describe, expect, it, vi } from 'vitest';

const { mockPrisma, mockCompare, mockSign } = vi.hoisted(() => ({
  mockPrisma: {
    usuario: {
      findUnique: vi.fn(),
    },
  },
  mockCompare: vi.fn(),
  mockSign: vi.fn(),
}));

vi.mock('../config/database.js', () => ({
  default: mockPrisma,
}));

vi.mock('bcrypt', () => ({
  default: {
    compare: mockCompare,
  },
}));

vi.mock('jsonwebtoken', () => ({
  default: {
    sign: mockSign,
  },
}));

import { getMe, login } from './authController.js';

const createRes = () => {
  const res: any = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
};

describe('authController', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('login devuelve 400 cuando faltan credenciales', async () => {
    const req: any = { body: { username: '', password: '' } };
    const res = createRes();

    await login(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false })
    );
  });

  it('login devuelve 401 cuando el usuario no existe', async () => {
    mockPrisma.usuario.findUnique.mockResolvedValue(null);
    const req: any = { body: { username: 'admin', password: '123' } };
    const res = createRes();

    await login(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('login devuelve token cuando las credenciales son válidas', async () => {
    mockPrisma.usuario.findUnique.mockResolvedValue({
      id: 1,
      nombre: 'Admin',
      username: 'admin',
      password: 'hashed',
      rol: 'ADMIN',
    });
    mockCompare.mockResolvedValue(true);
    mockSign.mockReturnValue('token_test');

    const req: any = { body: { username: 'admin', password: '123456' } };
    const res = createRes();

    await login(req, res);

    expect(mockSign).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        token: 'token_test',
      })
    );
  });

  it('getMe devuelve 404 si el usuario autenticado no existe', async () => {
    mockPrisma.usuario.findUnique.mockResolvedValue(null);
    const req: any = { user: { id: 99 } };
    const res = createRes();

    await getMe(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });
});
