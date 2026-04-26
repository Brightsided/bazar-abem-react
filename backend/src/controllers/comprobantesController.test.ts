import { beforeEach, describe, expect, it, vi } from 'vitest';

const {
  mockPrisma,
  mockGenerateBoletaPDF,
  mockGenerateFacturaPDF,
  mockSendComprobanteEmail,
  mockSendBoletaAndFacturaEmail,
} = vi.hoisted(() => ({
  mockPrisma: {
    venta: {
      findUnique: vi.fn(),
    },
  },
  mockGenerateBoletaPDF: vi.fn(),
  mockGenerateFacturaPDF: vi.fn(),
  mockSendComprobanteEmail: vi.fn(),
  mockSendBoletaAndFacturaEmail: vi.fn(),
}));

vi.mock('../config/database.js', () => ({
  default: mockPrisma,
}));

vi.mock('../services/pdfService.js', () => ({
  generateBoletaPDF: mockGenerateBoletaPDF,
  generateFacturaPDF: mockGenerateFacturaPDF,
}));

vi.mock('../services/emailService.js', () => ({
  sendComprobanteEmail: mockSendComprobanteEmail,
  sendBoletaAndFacturaEmail: mockSendBoletaAndFacturaEmail,
}));

import { enviarBoletaYFactura, enviarEmail, generarPDF } from './comprobantesController.js';

const createRes = () => {
  const res: any = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  res.send = vi.fn().mockReturnValue(res);
  res.setHeader = vi.fn();
  return res;
};

describe('comprobantesController', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('generarPDF devuelve 400 para tipo inválido', async () => {
    const req: any = { params: { id: '1' }, query: { tipo: 'ticket' } };
    const res = createRes();

    await generarPDF(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('enviarEmail devuelve 400 cuando falta email', async () => {
    const req: any = { params: { id: '1' }, body: { tipo: 'boleta' } };
    const res = createRes();

    await enviarEmail(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('enviarBoletaYFactura genera PDFs y envía correo', async () => {
    mockPrisma.venta.findUnique.mockResolvedValue({
      id: 1,
      cliente: 'Cliente Test',
      fecha_venta: new Date(),
      metodo_pago: 'efectivo',
      precio_total: 120,
      detalles: [],
      usuarioRel: null,
    });
    mockGenerateBoletaPDF.mockResolvedValue(Buffer.from('boleta'));
    mockGenerateFacturaPDF.mockResolvedValue(Buffer.from('factura'));

    const req: any = { params: { id: '1' }, body: { email: 'cliente@test.com' } };
    const res = createRes();

    await enviarBoletaYFactura(req, res);

    expect(mockGenerateBoletaPDF).toHaveBeenCalled();
    expect(mockGenerateFacturaPDF).toHaveBeenCalled();
    expect(mockSendBoletaAndFacturaEmail).toHaveBeenCalledWith(
      'cliente@test.com',
      expect.any(Object),
      expect.any(Buffer),
      expect.any(Buffer)
    );
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
  });
});
