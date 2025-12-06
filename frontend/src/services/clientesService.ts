import api from './api';
import { Cliente } from '@/types';

export const clientesService = {
  async getClientes(): Promise<Cliente[]> {
    const response = await api.get<Cliente[]>('/clientes');
    return response.data;
  },

  async createCliente(nombre: string): Promise<Cliente> {
    const response = await api.post<Cliente>('/clientes', { nombre });
    return response.data;
  },
};
