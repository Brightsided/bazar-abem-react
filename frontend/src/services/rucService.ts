import api from './api';

export interface CalculoRUC {
  categoria: number | string;
  monto: number | string;
  total_ventas: number;
  mes: number;
  ano: number;
}

export const calcularRUC = async (mes: number, ano: number): Promise<CalculoRUC> => {
  const response = await api.post('/ruc/calcular', { mes, ano });
  return response.data;
};
