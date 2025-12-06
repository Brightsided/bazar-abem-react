import { Response } from 'express';
import prisma from '../config/database.js';
import { AuthRequest } from '../middleware/auth.js';

export const getClientes = async (req: AuthRequest, res: Response) => {
  try {
    const clientes = await prisma.cliente.findMany({
      orderBy: {
        nombre: 'asc',
      },
    });

    res.json(clientes);
  } catch (error) {
    console.error('GetClientes error:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener clientes',
    });
  }
};

export const createCliente = async (req: AuthRequest, res: Response) => {
  try {
    const { nombre } = req.body;

    if (!nombre) {
      return res.status(400).json({
        success: false,
        message: 'El nombre del cliente es requerido',
      });
    }

    const cliente = await prisma.cliente.create({
      data: { nombre },
    });

    res.status(201).json(cliente);
  } catch (error: any) {
    if (error.code === 'P2002') {
      return res.status(400).json({
        success: false,
        message: 'El cliente ya existe',
      });
    }
    console.error('CreateCliente error:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear cliente',
    });
  }
};
