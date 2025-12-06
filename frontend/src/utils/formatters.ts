import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

export const formatCurrency = (amount: number): string => {
  return `S/ ${amount.toFixed(2)}`;
};

export const formatDate = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, 'dd/MM/yyyy HH:mm', { locale: es });
};

export const formatDateShort = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, 'dd/MM/yyyy', { locale: es });
};

export const formatDateForInput = (date: Date): string => {
  return format(date, 'yyyy-MM-dd');
};
