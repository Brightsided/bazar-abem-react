import { describe, expect, it } from 'vitest';
import { formatCurrency, formatDateForInput, formatDateShort } from './formatters';

describe('formatters', () => {
  it('formatea moneda con dos decimales', () => {
    expect(formatCurrency(150)).toBe('S/ 150.00');
    expect(formatCurrency(150.5)).toBe('S/ 150.50');
  });

  it('formatea fecha corta para UI', () => {
    const result = formatDateShort('2026-04-20T18:30:00.000Z');
    expect(result).toMatch(/^\d{2}\/\d{2}\/\d{4}$/);
  });

  it('formatea fecha para input date', () => {
    const result = formatDateForInput(new Date('2026-04-20T18:30:00.000Z'));
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
