# 🔧 Implementación Técnica - Cierre de Caja

## Paso 1: Actualizar Schema de Prisma

Edita `backend/prisma/schema.prisma` y agrega los siguientes modelos:

```prisma
// Modelo para Cierre de Caja
model CierreCaja {
  id                      Int                     @id @default(autoincrement())
  
  // Información básica
  fecha_cierre            DateTime                @default(now())
  fecha_apertura          DateTime?
  usuario_id              Int
  usuario                 Usuario                 @relation("CierreCajaUsuario", fields: [usuario_id], references: [id])
  
  // Estado del cierre
  estado                  String                  @default("ABIERTO") // ABIERTO, CERRADO, ANULADO
  
  // Dinero esperado (calculado automáticamente)
  total_ventas            Decimal                 @db.Decimal(10, 2) @default(0)
  total_efectivo_esperado Decimal                 @db.Decimal(10, 2) @default(0)
  total_tarjeta           Decimal                 @db.Decimal(10, 2) @default(0)
  total_yape              Decimal                 @db.Decimal(10, 2) @default(0)
  
  // Dinero real (ingresado por vendedor)
  dinero_real_efectivo    Decimal?                @db.Decimal(10, 2)
  
  // Diferencia calculada
  diferencia              Decimal?                @db.Decimal(10, 2)
  
  // Observaciones
  notas                   String?                 @db.Text
  
  // Aprobación
  aprobado_por            Int?
  supervisor              Usuario?                @relation("CierreCajaSupervisor", fields: [aprobado_por], references: [id])
  fecha_aprobacion        DateTime?
  
  // Relaciones
  ventas                  Venta[]
  detalles                DetalleCierreCaja[]
  
  // Índices para optimización
  @@index([usuario_id])
  @@index([fecha_cierre])
  @@index([estado])
  @@index([fecha_cierre, usuario_id])
  @@map("cierres_caja")
}

// Modelo para detalles del cierre por método de pago
model DetalleCierreCaja {
  id                  Int                 @id @default(autoincrement())
  cierre_caja_id      Int
  cierre_caja         CierreCaja          @relation(fields: [cierre_caja_id], references: [id], onDelete: Cascade)
  
  // Detalles por método de pago
  metodo_pago         String              // Efectivo, Tarjeta, Yape
  cantidad_transacciones Int              @default(0)
  monto_total         Decimal             @db.Decimal(10, 2) @default(0)
  
  @@index([cierre_caja_id])
  @@map("detalle_cierre_caja")
}

// Actualizar modelo Usuario para relaciones
model Usuario {
  id                    Int                     @id @default(autoincrement())
  nombre                String
  username              String                  @unique
  password              String
  rol                   String
  ventas                Venta[]
  movimientos_inventario MovimientoInventario[]
  
  // Relaciones para Cierre de Caja
  cierres_caja          CierreCaja[]            @relation("CierreCajaUsuario")
  cierres_aprobados     CierreCaja[]            @relation("CierreCajaSupervisor")

  @@map("usuarios")
}

// Actualizar modelo Venta para vincular con CierreCaja
model Venta {
  id           Int            @id @default(autoincrement())
  cliente      String
  cliente_id   Int?
  productos    String         @db.Text
  precio_total Decimal        @db.Decimal(10, 2)
  metodo_pago  String
  fecha_venta  DateTime       @default(now())
  usuario_id   Int?
  
  // Nuevo campo para vincular con cierre de caja
  cierre_caja_id Int?
  cierre_caja    CierreCaja?   @relation(fields: [cierre_caja_id], references: [id])
  
  clienteRel   Cliente?       @relation(fields: [cliente_id], references: [id])
  usuarioRel   Usuario?       @relation(fields: [usuario_id], references: [id])
  detalles     DetalleVenta[]

  @@index([fecha_venta])
  @@index([metodo_pago])
  @@index([cliente])
  @@index([fecha_venta, metodo_pago])
  @@index([fecha_venta, precio_total])
  @@index([cierre_caja_id])
  @@map("ventas")
}
```

## Paso 2: Crear Migración

```bash
cd backend

# Crear migración
npm run prisma:migrate dev --name add_cierre_caja

# Esto generará automáticamente los archivos SQL necesarios
```

## Paso 3: Crear Controlador

Crea el archivo `backend/src/controllers/cierreCajaController.ts`:

```typescript
import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.js';

const prisma = new PrismaClient();

// Abrir caja (inicio del turno)
export const abrirCaja = async (req: AuthRequest, res: Response) => {
  try {
    const usuario_id = req.user?.id;

    if (!usuario_id) {
      return res.status(401).json({ error: 'Usuario no autenticado' });
    }

    // Verificar si ya hay una caja abierta hoy
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    
    const cierreCajaAbierto = await prisma.cierreCaja.findFirst({
      where: {
        usuario_id,
        estado: 'ABIERTO',
        fecha_cierre: {
          gte: hoy,
        },
      },
    });

    if (cierreCajaAbierto) {
      return res.status(400).json({
        error: 'Ya tienes una caja abierta hoy',
        cierre_caja_id: cierreCajaAbierto.id,
      });
    }

    // Crear nuevo cierre de caja
    const cierreCaja = await prisma.cierreCaja.create({
      data: {
        usuario_id,
        estado: 'ABIERTO',
        fecha_apertura: new Date(),
      },
    });

    res.json({
      message: 'Caja abierta exitosamente',
      cierre_caja: cierreCaja,
    });
  } catch (error) {
    console.error('Error al abrir caja:', error);
    res.status(500).json({ error: 'Error al abrir caja' });
  }
};

// Obtener resumen del día
export const obtenerResumenDia = async (req: AuthRequest, res: Response) => {
  try {
    const usuario_id = req.user?.id;
    const cierre_caja_id = req.query.cierre_caja_id as string;

    if (!usuario_id) {
      return res.status(401).json({ error: 'Usuario no autenticado' });
    }

    // Obtener caja abierta del usuario
    let cierreCaja;
    
    if (cierre_caja_id) {
      cierreCaja = await prisma.cierreCaja.findUnique({
        where: { id: parseInt(cierre_caja_id) },
      });
    } else {
      cierreCaja = await prisma.cierreCaja.findFirst({
        where: {
          usuario_id,
          estado: 'ABIERTO',
        },
      });
    }

    if (!cierreCaja) {
      return res.status(404).json({ error: 'No hay caja abierta' });
    }

    // Obtener ventas del día para esta caja
    const ventas = await prisma.venta.findMany({
      where: {
        usuario_id,
        cierre_caja_id: cierreCaja.id,
      },
    });

    // Calcular totales por método de pago
    const totalesPorMetodo = {
      Efectivo: 0,
      'Tarjeta De Credito/Debito': 0,
      Yape: 0,
    };

    let totalVentas = 0;

    ventas.forEach((venta) => {
      totalVentas += Number(venta.precio_total);
      if (venta.metodo_pago in totalesPorMetodo) {
        totalesPorMetodo[venta.metodo_pago as keyof typeof totalesPorMetodo] +=
          Number(venta.precio_total);
      }
    });

    // Actualizar cierre de caja con totales
    const cierreCajaActualizado = await prisma.cierreCaja.update({
      where: { id: cierreCaja.id },
      data: {
        total_ventas: totalVentas,
        total_efectivo_esperado: totalesPorMetodo.Efectivo,
        total_tarjeta: totalesPorMetodo['Tarjeta De Credito/Debito'],
        total_yape: totalesPorMetodo.Yape,
      },
    });

    res.json({
      cierre_caja: cierreCajaActualizado,
      ventas: ventas.length,
      totales: {
        total_ventas: totalVentas,
        efectivo: totalesPorMetodo.Efectivo,
        tarjeta: totalesPorMetodo['Tarjeta De Credito/Debito'],
        yape: totalesPorMetodo.Yape,
      },
    });
  } catch (error) {
    console.error('Error al obtener resumen:', error);
    res.status(500).json({ error: 'Error al obtener resumen' });
  }
};

// Cerrar caja (registrar dinero real)
export const cerrarCaja = async (req: AuthRequest, res: Response) => {
  try {
    const { cierre_caja_id, dinero_real_efectivo, notas } = req.body;
    const usuario_id = req.user?.id;

    if (!usuario_id) {
      return res.status(401).json({ error: 'Usuario no autenticado' });
    }

    if (!cierre_caja_id || dinero_real_efectivo === undefined) {
      return res.status(400).json({
        error: 'Faltan datos requeridos: cierre_caja_id, dinero_real_efectivo',
      });
    }

    // Obtener cierre de caja
    const cierreCaja = await prisma.cierreCaja.findUnique({
      where: { id: parseInt(cierre_caja_id) },
    });

    if (!cierreCaja) {
      return res.status(404).json({ error: 'Cierre de caja no encontrado' });
    }

    if (cierreCaja.usuario_id !== usuario_id) {
      return res.status(403).json({
        error: 'No tienes permiso para cerrar esta caja',
      });
    }

    // Calcular diferencia
    const diferencia =
      Number(dinero_real_efectivo) - Number(cierreCaja.total_efectivo_esperado);

    // Actualizar cierre de caja
    const cierreCajaActualizado = await prisma.cierreCaja.update({
      where: { id: parseInt(cierre_caja_id) },
      data: {
        dinero_real_efectivo: Number(dinero_real_efectivo),
        diferencia,
        notas,
        estado: 'CERRADO',
      },
    });

    // Crear detalles del cierre
    await prisma.detalleCierreCaja.createMany({
      data: [
        {
          cierre_caja_id: parseInt(cierre_caja_id),
          metodo_pago: 'Efectivo',
          cantidad_transacciones: await prisma.venta.count({
            where: {
              cierre_caja_id: parseInt(cierre_caja_id),
              metodo_pago: 'Efectivo',
            },
          }),
          monto_total: cierreCaja.total_efectivo_esperado,
        },
        {
          cierre_caja_id: parseInt(cierre_caja_id),
          metodo_pago: 'Tarjeta De Credito/Debito',
          cantidad_transacciones: await prisma.venta.count({
            where: {
              cierre_caja_id: parseInt(cierre_caja_id),
              metodo_pago: 'Tarjeta De Credito/Debito',
            },
          }),
          monto_total: cierreCaja.total_tarjeta,
        },
        {
          cierre_caja_id: parseInt(cierre_caja_id),
          metodo_pago: 'Yape',
          cantidad_transacciones: await prisma.venta.count({
            where: {
              cierre_caja_id: parseInt(cierre_caja_id),
              metodo_pago: 'Yape',
            },
          }),
          monto_total: cierreCaja.total_yape,
        },
      ],
    });

    res.json({
      message: 'Caja cerrada exitosamente',
      cierre_caja: cierreCajaActualizado,
      diferencia,
      estado: diferencia === 0 ? 'PERFECTO' : diferencia > 0 ? 'SOBRANTE' : 'FALTANTE',
    });
  } catch (error) {
    console.error('Error al cerrar caja:', error);
    res.status(500).json({ error: 'Error al cerrar caja' });
  }
};

// Aprobar cierre (solo supervisor/admin)
export const aprobarCierre = async (req: AuthRequest, res: Response) => {
  try {
    const { cierre_caja_id } = req.params;
    const { aprobado } = req.body;
    const usuario_id = req.user?.id;

    if (!usuario_id) {
      return res.status(401).json({ error: 'Usuario no autenticado' });
    }

    // Verificar que sea supervisor/admin
    const usuario = await prisma.usuario.findUnique({
      where: { id: usuario_id },
    });

    if (usuario?.rol !== 'Administrador') {
      return res.status(403).json({
        error: 'Solo administradores pueden aprobar cierres',
      });
    }

    // Obtener cierre
    const cierreCaja = await prisma.cierreCaja.findUnique({
      where: { id: parseInt(cierre_caja_id) },
    });

    if (!cierreCaja) {
      return res.status(404).json({ error: 'Cierre de caja no encontrado' });
    }

    // Actualizar estado
    const cierreCajaActualizado = await prisma.cierreCaja.update({
      where: { id: parseInt(cierre_caja_id) },
      data: {
        estado: aprobado ? 'APROBADO' : 'RECHAZADO',
        aprobado_por: usuario_id,
        fecha_aprobacion: new Date(),
      },
    });

    res.json({
      message: `Cierre ${aprobado ? 'aprobado' : 'rechazado'} exitosamente`,
      cierre_caja: cierreCajaActualizado,
    });
  } catch (error) {
    console.error('Error al aprobar cierre:', error);
    res.status(500).json({ error: 'Error al aprobar cierre' });
  }
};

// Obtener cierres (con filtros)
export const obtenerCierres = async (req: AuthRequest, res: Response) => {
  try {
    const { fecha_inicio, fecha_fin, usuario_id, estado } = req.query;
    const usuarioActual = req.user?.id;

    if (!usuarioActual) {
      return res.status(401).json({ error: 'Usuario no autenticado' });
    }

    // Construir filtro
    const where: any = {};

    if (fecha_inicio && fecha_fin) {
      where.fecha_cierre = {
        gte: new Date(fecha_inicio as string),
        lte: new Date(fecha_fin as string),
      };
    }

    if (usuario_id) {
      where.usuario_id = parseInt(usuario_id as string);
    }

    if (estado) {
      where.estado = estado;
    }

    // Obtener cierres
    const cierres = await prisma.cierreCaja.findMany({
      where,
      include: {
        usuario: true,
        supervisor: true,
        detalles: true,
      },
      orderBy: {
        fecha_cierre: 'desc',
      },
    });

    res.json({
      total: cierres.length,
      cierres,
    });
  } catch (error) {
    console.error('Error al obtener cierres:', error);
    res.status(500).json({ error: 'Error al obtener cierres' });
  }
};

// Obtener cierre específico
export const obtenerCierre = async (req: AuthRequest, res: Response) => {
  try {
    const { cierre_caja_id } = req.params;

    const cierre = await prisma.cierreCaja.findUnique({
      where: { id: parseInt(cierre_caja_id) },
      include: {
        usuario: true,
        supervisor: true,
        detalles: true,
        ventas: true,
      },
    });

    if (!cierre) {
      return res.status(404).json({ error: 'Cierre de caja no encontrado' });
    }

    res.json(cierre);
  } catch (error) {
    console.error('Error al obtener cierre:', error);
    res.status(500).json({ error: 'Error al obtener cierre' });
  }
};

// Anular cierre (solo admin)
export const anularCierre = async (req: AuthRequest, res: Response) => {
  try {
    const { cierre_caja_id } = req.params;
    const usuario_id = req.user?.id;

    if (!usuario_id) {
      return res.status(401).json({ error: 'Usuario no autenticado' });
    }

    // Verificar que sea admin
    const usuario = await prisma.usuario.findUnique({
      where: { id: usuario_id },
    });

    if (usuario?.rol !== 'Administrador') {
      return res.status(403).json({
        error: 'Solo administradores pueden anular cierres',
      });
    }

    // Actualizar estado
    const cierreCaja = await prisma.cierreCaja.update({
      where: { id: parseInt(cierre_caja_id) },
      data: {
        estado: 'ANULADO',
      },
    });

    res.json({
      message: 'Cierre anulado exitosamente',
      cierre_caja: cierreCaja,
    });
  } catch (error) {
    console.error('Error al anular cierre:', error);
    res.status(500).json({ error: 'Error al anular cierre' });
  }
};
```

## Paso 4: Crear Rutas

Crea el archivo `backend/src/routes/cierreCaja.ts`:

```typescript
import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import {
  abrirCaja,
  obtenerResumenDia,
  cerrarCaja,
  aprobarCierre,
  obtenerCierres,
  obtenerCierre,
  anularCierre,
} from '../controllers/cierreCajaController.js';

const router = Router();

// Rutas públicas (requieren autenticación)
router.post('/abrir', authMiddleware, abrirCaja);
router.get('/resumen', authMiddleware, obtenerResumenDia);
router.post('/cerrar', authMiddleware, cerrarCaja);
router.get('/', authMiddleware, obtenerCierres);
router.get('/:cierre_caja_id', authMiddleware, obtenerCierre);

// Rutas de administrador
router.put('/:cierre_caja_id/aprobar', authMiddleware, aprobarCierre);
router.put('/:cierre_caja_id/anular', authMiddleware, anularCierre);

export default router;
```

## Paso 5: Registrar Rutas en Server

Edita `backend/src/server.ts`:

```typescript
import cierreCajaRoutes from './routes/cierreCaja.js';

// ... otros imports ...

// Agregar esta línea con las otras rutas
app.use('/api/cierre-caja', cierreCajaRoutes);
```

## Paso 6: Crear Servicio en Frontend

Crea `frontend/src/services/cierreCajaService.ts`:

```typescript
import api from './api';

export interface CierreCaja {
  id: number;
  fecha_cierre: string;
  usuario_id: number;
  estado: string;
  total_ventas: number;
  total_efectivo_esperado: number;
  total_tarjeta: number;
  total_yape: number;
  dinero_real_efectivo?: number;
  diferencia?: number;
  notas?: string;
}

export const cierreCajaService = {
  abrirCaja: async () => {
    const response = await api.post('/cierre-caja/abrir');
    return response.data;
  },

  obtenerResumen: async (cierre_caja_id?: number) => {
    const params = cierre_caja_id ? { cierre_caja_id } : {};
    const response = await api.get('/cierre-caja/resumen', { params });
    return response.data;
  },

  cerrarCaja: async (
    cierre_caja_id: number,
    dinero_real_efectivo: number,
    notas?: string
  ) => {
    const response = await api.post('/cierre-caja/cerrar', {
      cierre_caja_id,
      dinero_real_efectivo,
      notas,
    });
    return response.data;
  },

  obtenerCierres: async (filtros?: {
    fecha_inicio?: string;
    fecha_fin?: string;
    usuario_id?: number;
    estado?: string;
  }) => {
    const response = await api.get('/cierre-caja', { params: filtros });
    return response.data;
  },

  obtenerCierre: async (cierre_caja_id: number) => {
    const response = await api.get(`/cierre-caja/${cierre_caja_id}`);
    return response.data;
  },

  aprobarCierre: async (cierre_caja_id: number, aprobado: boolean) => {
    const response = await api.put(`/cierre-caja/${cierre_caja_id}/aprobar`, {
      aprobado,
    });
    return response.data;
  },

  anularCierre: async (cierre_caja_id: number) => {
    const response = await api.put(`/cierre-caja/${cierre_caja_id}/anular`);
    return response.data;
  },
};
```

## Paso 7: Crear Página React

Crea `frontend/src/pages/CierreCaja.tsx` (ver archivo separado)

## Paso 8: Actualizar Rutas en App.tsx

```typescript
import CierreCaja from './pages/CierreCaja';

// En el componente App, agregar:
<Route path="cierre-caja" element={<CierreCaja />} />
```

## Paso 9: Actualizar Sidebar

Agregar enlace a Cierre de Caja en el menú lateral.

## Verificación

```bash
# 1. Ejecutar migraciones
cd backend
npm run prisma:migrate dev

# 2. Iniciar backend
npm run dev

# 3. En otra terminal, iniciar frontend
cd ../frontend
npm run dev

# 4. Probar endpoints con Postman o similar
```

---

**Próximo paso**: Crear la interfaz React para Cierre de Caja
