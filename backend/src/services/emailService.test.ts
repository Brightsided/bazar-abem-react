import { afterEach, describe, expect, it } from 'vitest';
import { sendComprobanteEmail, verifyEmailConfig } from './emailService.js';

const ORIGINAL_ENV = { ...process.env };

describe('verifyEmailConfig', () => {
  afterEach(() => {
    process.env = { ...ORIGINAL_ENV };
  });

  it('retorna true con Resend correctamente configurado', async () => {
    process.env.EMAIL_PROVIDER = 'resend';
    process.env.RESEND_API_KEY = 're_test_key';

    await expect(verifyEmailConfig()).resolves.toBe(true);
  });

  it('retorna false con Resend sin API key', async () => {
    process.env.EMAIL_PROVIDER = 'resend';
    delete process.env.RESEND_API_KEY;

    await expect(verifyEmailConfig()).resolves.toBe(false);
  });

  it('retorna true con SMTP configurado', async () => {
    process.env.EMAIL_PROVIDER = 'smtp';
    process.env.SMTP_HOST = 'smtp-relay.brevo.com';
    process.env.SMTP_USERNAME = 'user@example.com';
    process.env.SMTP_PASSWORD = 'password';

    await expect(verifyEmailConfig()).resolves.toBe(true);
  });

  it('retorna false con SMTP incompleto', async () => {
    process.env.EMAIL_PROVIDER = 'smtp';
    process.env.SMTP_HOST = 'smtp-relay.brevo.com';
    delete process.env.SMTP_USERNAME;
    delete process.env.SMTP_PASSWORD;

    await expect(verifyEmailConfig()).resolves.toBe(false);
  });
});

describe('sendComprobanteEmail', () => {
  it('falla cuando el destinatario es inválido', async () => {
    const ventaMock = {
      id: 12,
      cliente: 'Cliente Test',
      fecha_venta: new Date('2026-04-25T18:30:00.000Z'),
      metodo_pago: 'efectivo',
      precio_total: 120,
      detalles: [],
    } as any;

    await expect(
      sendComprobanteEmail('correo-invalido', ventaMock, Buffer.from('pdf'), 'boleta')
    ).rejects.toThrow('Error al enviar el correo electrónico');
  });
});
