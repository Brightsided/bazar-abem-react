import api from './api';
import { Producto } from '@/types';

export const productosService = {
  async getProductos(): Promise<Producto[]> {
    const response = await api.get<Producto[]>('/productos');
    return response.data;
  },

  async searchProductos(query: string): Promise<Producto[]> {
    const response = await api.get<Producto[]>('/productos/search', {
      params: { q: query },
    });
    return response.data;
  },

  async createProducto(nombre: string): Promise<Producto> {
    const response = await api.post<Producto>('/productos', { nombre });
    return response.data;
  },
};
