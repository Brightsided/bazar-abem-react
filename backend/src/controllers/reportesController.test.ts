import { beforeEach, describe, expect, it, vi } from 'vitest';

const { mockPrisma } = vi.hoisted(() => ({
  mockPrisma: {
    venta: {
      count: vi.fn(),
      aggregate: vi.fn(),
      findMany: vi.fn(),
    },
  },
}));

vi.mock('../config/database.js', () => ({
  default: mockPrisma,
}));

import { getDashboardStats, getReporteVentas } from './reportesController.js';

const createRes = () => {
  const res: any = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
};

describe('reportesController', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getReporteVentas personalizado requiere fechas', async () => {
    const req: any = { body: { filtro: 'personalizado' } };
    const res = createRes();

    await getReporteVentas(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('getDashboardStats responde estructura esperada', async () => {
    mockPrisma.venta.count.mockResolvedValueOnce(3).mockResolvedValueOnce(10);
    mockPrisma.venta.aggregate
      .mockResolvedValueOnce({ _sum: { precio_total: 150 } })
      .mockResolvedValueOnce({ _sum: { precio_total: 800 } })
      .mockResolvedValueOnce({ _avg: { precio_total: 80 } });
    mockPrisma.venta.findMany.mockResolvedValue([{ id: 1 }, { id: 2 }]);

    const req: any = {};
    const res = createRes();

    await getDashboardStats(req, res);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        ventasHoy: 3,
        ventasSemana: 10,
        totalHoy: 150,
        totalSemana: 800,
        promedioVenta: 80,
      })
    );
  });
});
