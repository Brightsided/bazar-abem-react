import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../config/database.js';
import { AuthRequest } from '../middleware/auth.js';

export const login = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Usuario y contraseña son requeridos',
      });
    }

    const user = await prisma.usuario.findUnique({
      where: { username },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas',
      });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas',
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        rol: user.rol,
      },
      process.env.JWT_SECRET!,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        nombre: user.nombre,
        username: user.username,
        rol: user.rol,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Error al iniciar sesión',
    });
  }
};

export const logout = async (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Sesión cerrada exitosamente',
  });
};

export const getMe = async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.usuario.findUnique({
      where: { id: req.user!.id },
      select: {
        id: true,
        nombre: true,
        username: true,
        rol: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado',
      });
    }

    res.json(user);
  } catch (error) {
    console.error('GetMe error:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener información del usuario',
    });
  }
};
