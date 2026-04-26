import { beforeEach, describe, expect, it, vi } from 'vitest';

const { mockApi } = vi.hoisted(() => ({
  mockApi: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

vi.mock('./api', () => ({
  default: mockApi,
}));

import { reportesService } from './reportesService';

describe('reportesService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('enviarEmail usa endpoint de comprobantes con tipo', async () => {
    mockApi.post.mockResolvedValue({ data: {} });

    await reportesService.enviarEmail(25, 'cliente@test.com', 'boleta');

    expect(mockApi.post).toHaveBeenCalledWith('/comprobantes/25/email', {
      email: 'cliente@test.com',
      tipo: 'boleta',
    });
  });

  it('enviarEmailConBoleta usa endpoint combinado', async () => {
    mockApi.post.mockResolvedValue({ data: {} });

    await reportesService.enviarEmailConBoleta(30, 'cliente@test.com');

    expect(mockApi.post).toHaveBeenCalledWith('/comprobantes/30/enviar-boleta-factura', {
      email: 'cliente@test.com',
    });
  });
});
