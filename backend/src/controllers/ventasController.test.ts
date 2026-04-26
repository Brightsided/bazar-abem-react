import { beforeEach, describe, expect, it, vi } from 'vitest';

const { mockPrisma } = vi.hoisted(() => ({
  mockPrisma: {
    almacenamiento: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    venta: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
    cliente: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
    movimientoInventario: {
      create: vi.fn(),
    },
    alertaStock: {
      findFirst: vi.fn(),
      create: vi.fn(),
    },
  },
}));

vi.mock('../config/database.js', () => ({
  default: mockPrisma,
}));

import { createVenta, getVenta } from './ventasController.js';

const createRes = () => {
  const res: any = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
};

describe('ventasController', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getVenta devuelve 404 cuando no existe la venta', async () => {
    mockPrisma.venta.findUnique.mockResolvedValue(null);
    const req: any = { params: { id: '55' } };
    const res = createRes();

    await getVenta(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('createVenta devuelve 400 con stock insuficiente', async () => {
    mockPrisma.almacenamiento.findUnique.mockResolvedValue({ stock: 1 });
    const req: any = {
      user: { id: 1 },
      body: {
        cliente: 'Cliente Test',
        productos: [{ producto_id: 10, nombre: 'Mouse', cantidad: 3, precio: 50 }],
        metodo_pago: 'efectivo',
      },
    };
    const res = createRes();

    await createVenta(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(mockPrisma.venta.create).not.toHaveBeenCalled();
  });

  it('createVenta registra venta cuando el stock es suficiente', async () => {
    mockPrisma.almacenamiento.findUnique.mockResolvedValue({
      id: 100,
      stock: 20,
      stock_minimo: 5,
    });
    mockPrisma.cliente.findUnique.mockResolvedValue({ id: 8, nombre: 'Cliente Test' });
    mockPrisma.venta.create.mockResolvedValue({ id: 777, detalles: [] });
    mockPrisma.alertaStock.findFirst.mockResolvedValue(null);

    const req: any = {
      user: { id: 1 },
      body: {
        cliente: 'Cliente Test',
        productos: [{ producto_id: 10, nombre: 'Mouse', cantidad: 2, precio: 50 }],
        metodo_pago: 'efectivo',
      },
    };
    const res = createRes();

    await createVenta(req, res);

    expect(mockPrisma.venta.create).toHaveBeenCalled();
    expect(mockPrisma.almacenamiento.update).toHaveBeenCalled();
    expect(mockPrisma.movimientoInventario.create).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(201);
  });
});
