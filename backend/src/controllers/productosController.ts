import { Response } from 'express';
import prisma from '../config/database.js';
import { AuthRequest } from '../middleware/auth.js';

export const getProductos = async (req: AuthRequest, res: Response) => {
  try {
    const productos = await prisma.producto.findMany({
      orderBy: {
        nombre: 'asc',
      },
    });

    res.json(productos);
  } catch (error) {
    console.error('GetProductos error:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener productos',
    });
  }
};

export const searchProductos = async (req: AuthRequest, res: Response) => {
  try {
    const { q } = req.query;

    if (!q || typeof q !== 'string') {
      return res.json([]);
    }

    const productos = await prisma.producto.findMany({
      where: {
        nombre: {
          contains: q,
        },
      },
      take: 10,
      orderBy: {
        nombre: 'asc',
      },
    });

    res.json(productos);
  } catch (error) {
    console.error('SearchProductos error:', error);
    res.status(500).json({
      success: false,
      message: 'Error al buscar productos',
    });
  }
};

export const createProducto = async (req: AuthRequest, res: Response) => {
  try {
    const { nombre } = req.body;

    if (!nombre) {
      return res.status(400).json({
        success: false,
        message: 'El nombre del producto es requerido',
      });
    }

    const producto = await prisma.producto.create({
      data: { nombre },
    });

    res.status(201).json(producto);
  } catch (error: any) {
    if (error.code === 'P2002') {
      return res.status(400).json({
        success: false,
        message: 'El producto ya existe',
      });
    }
    console.error('CreateProducto error:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear producto',
    });
  }
};
