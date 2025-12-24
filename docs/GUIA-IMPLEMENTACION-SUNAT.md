# Guía Paso a Paso: Implementación de Facturación SUNAT

## 🎯 Objetivo Final

Agregar una columna "Estado" en la tabla de reportes que muestre el estado de cada factura en SUNAT (Pendiente, Aceptada, Rechazada) y un botón con logo SUNAT que permita enviar facturas directamente.

---

## 📋 Paso 1: Preparación Inicial

### 1.1 Elegir Proveedor API

**Recomendación: Visioner7 APIs**

1. Ir a https://visioner7-api.com/
2. Hacer clic en "Comienza con Nuestras APIs"
3. Completar formulario con:
   - Nombre/Empresa
   - Email
   - Caso de uso: "Facturación Electrónica para Sistema POS"
4. Recibirás credenciales en <2 horas

### 1.2 Obtener Credenciales

Después de registrarse, tendrás:
- **API URL:** `https://api.visioner7.com/v1`
- **API Token:** `tu_token_aqui`
- **Sandbox URL:** Para testing

---

## 🗄️ Paso 2: Actualizar Base de Datos

### 2.1 Crear Migración Prisma

```bash
cd backend
npx prisma migrate create add_sunat_fields
```

### 2.2 Editar archivo de migración

Archivo: `backend/prisma/migrations/[timestamp]_add_sunat_fields/migration.sql`

```sql
-- AddColumn estado_sunat
ALTER TABLE `ventas` ADD COLUMN `estado_sunat` VARCHAR(50) NOT NULL DEFAULT 'PENDIENTE';

-- AddColumn respuesta_sunat
ALTER TABLE `ventas` ADD COLUMN `respuesta_sunat` JSON;

-- AddColumn numero_factura
ALTER TABLE `ventas` ADD COLUMN `numero_factura` VARCHAR(50);

-- AddColumn fecha_emision_sunat
ALTER TABLE `ventas` ADD COLUMN `fecha_emision_sunat` DATETIME;

-- AddColumn tipo_comprobante
ALTER TABLE `ventas` ADD COLUMN `tipo_comprobante` VARCHAR(20);

-- AddIndex para estado_sunat
ALTER TABLE `ventas` ADD INDEX `idx_estado_sunat` (`estado_sunat`);

-- AddIndex para numero_factura
ALTER TABLE `ventas` ADD UNIQUE INDEX `idx_numero_factura` (`numero_factura`);
```

### 2.3 Ejecutar migración

```bash
npx prisma migrate deploy
```

### 2.4 Actualizar schema.prisma

Editar: `backend/prisma/schema.prisma`

```prisma
model Venta {
  id                    Int            @id @default(autoincrement())
  cliente               String
  cliente_id            Int?
  productos             String         @db.Text
  precio_total          Decimal        @db.Decimal(10, 2)
  metodo_pago           String
  fecha_venta           DateTime       @default(now())
  usuario_id            Int?
  
  // ✅ NUEVOS CAMPOS PARA SUNAT
  estado_sunat          String         @default("PENDIENTE")
  respuesta_sunat       Json?
  numero_factura        String?        @unique
  fecha_emision_sunat   DateTime?
  tipo_comprobante      String?
  
  clienteRel            Cliente?       @relation(fields: [cliente_id], references: [id])
  usuarioRel            Usuario?       @relation(fields: [usuario_id], references: [id])
  detalles              DetalleVenta[]

  @@index([fecha_venta])
  @@index([metodo_pago])
  @@index([cliente])
  @@index([estado_sunat])
  @@index([numero_factura])
  @@map("ventas")
}
```

### 2.5 Regenerar cliente Prisma

```bash
npx prisma generate
```

---

## 🔧 Paso 3: Crear Servicio SUNAT en Backend

### 3.1 Crear archivo de servicio

Crear: `backend/src/services/sunatService.ts`

```typescript
import axios, { AxiosInstance } from 'axios';

export interface SunatConfig {
  apiUrl: string;
  token: string;
  environment: 'sandbox' | 'production';
}

export interface FacturaPayload {
  tipoOperacion: string;
  serie: string;
  correlativo: string;
  fechaEmision: string;
  horaEmision: string;
  moneda: string;
  emisor: {
    codigoTipoDocumento: string;
    numDocumento: string;
    razonSocial: string;
    nombreComercial: string;
    direccion: string;
  };
  cliente: {
    codigoTipoDocumento: string;
    numDocumento: string;
    razonSocial: string;
  };
  productos: Array<{
    unidades: number;
    codigoUnidad: string;
    nombre: string;
    precioUnitario: number;
    montoSinImpuesto: number;
    montoImpuestos: number;
    montoTotal: number;
  }>;
  totales: {
    totalOpGravadas: number;
    totalImpuestos: number;
    totalSinImpuestos: number;
    totalConImpuestos: number;
    totalPagar: number;
  };
}

export class SunatService {
  private client: AxiosInstance;
  private config: SunatConfig;

  constructor(config: SunatConfig) {
    this.config = config;
    this.client = axios.create({
      baseURL: config.apiUrl,
      headers: {
        'Authorization': `Bearer ${config.token}`,
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    });
  }

  /**
   * Emitir factura a SUNAT
   */
  async emitirFactura(facturaData: FacturaPayload) {
    try {
      console.log('📤 Enviando factura a SUNAT...');
      
      const response = await this.client.post('/documents/emit', facturaData);

      console.log('✅ Factura emitida exitosamente');
      
      return {
        success: true,
        estado: 'ACEPTADA',
        numeroFactura: response.data.numeroFactura || `${facturaData.serie}-${facturaData.correlativo}`,
        respuesta: response.data,
      };
    } catch (error: any) {
      console.error('❌ Error emitiendo factura:', error.response?.data || error.message);
      
      return {
        success: false,
        estado: 'RECHAZADA',
        error: error.response?.data?.message || error.message,
        respuesta: error.response?.data,
      };
    }
  }

  /**
   * Consultar estado de factura
   */
  async consultarEstado(numeroFactura: string) {
    try {
      const response = await this.client.get(`/documents/${numeroFactura}/status`);
      return response.data;
    } catch (error: any) {
      throw new Error(`Error consultando estado: ${error.message}`);
    }
  }

  /**
   * Descargar XML de factura
   */
  async descargarXML(numeroFactura: string) {
    try {
      const response = await this.client.get(`/documents/${numeroFactura}/xml`, {
        responseType: 'arraybuffer',
      });
      return response.data;
    } catch (error: any) {
      throw new Error(`Error descargando XML: ${error.message}`);
    }
  }

  /**
   * Descargar PDF de factura
   */
  async descargarPDF(numeroFactura: string) {
    try {
      const response = await this.client.get(`/documents/${numeroFactura}/pdf`, {
        responseType: 'arraybuffer',
      });
      return response.data;
    } catch (error: any) {
      throw new Error(`Error descargando PDF: ${error.message}`);
    }
  }
}

// Exportar instancia singleton
export const sunatService = new SunatService({
  apiUrl: process.env.SUNAT_API_URL || 'https://api.visioner7.com/v1',
  token: process.env.SUNAT_API_TOKEN || '',
  environment: (process.env.SUNAT_ENV as 'sandbox' | 'production') || 'sandbox',
});
```

### 3.2 Instalar axios

```bash
cd backend
npm install axios
```

---

## 🎮 Paso 4: Crear Controlador SUNAT

### 4.1 Crear archivo de controlador

Crear: `backend/src/controllers/sunatController.ts`

```typescript
import { Response } from 'express';
import prisma from '../config/database.js';
import { AuthRequest } from '../middleware/auth.js';
import { sunatService, FacturaPayload } from '../services/sunatService.js';

/**
 * Enviar factura a SUNAT
 */
export const enviarFacturaSunat = async (req: AuthRequest, res: Response) => {
  try {
    const { ventaId } = req.params;

    // Obtener venta de la BD
    const venta = await prisma.venta.findUnique({
      where: { id: parseInt(ventaId) },
      include: { detalles: true },
    });

    if (!venta) {
      return res.status(404).json({
        success: false,
        message: 'Venta no encontrada',
      });
    }

    // Validar que no esté ya enviada
    if (venta.estado_sunat === 'ACEPTADA') {
      return res.status(400).json({
        success: false,
        message: 'Esta factura ya fue aceptada por SUNAT',
      });
    }

    // Construir payload de factura
    const ahora = new Date();
    const fecha = ahora.toISOString().split('T')[0];
    const hora = ahora.toTimeString().split(' ')[0];

    const facturaPayload: FacturaPayload = {
      tipoOperacion: '010',
      serie: 'F001',
      correlativo: String(venta.id).padStart(8, '0'),
      fechaEmision: fecha,
      horaEmision: hora,
      moneda: 'PEN',
      emisor: {
        codigoTipoDocumento: '6', // RUC
        numDocumento: process.env.SUNAT_RUC || '20123456721',
        razonSocial: process.env.SUNAT_RAZON_SOCIAL || 'BAZAR ABEM SAC',
        nombreComercial: process.env.SUNAT_NOMBRE_COMERCIAL || 'BAZAR ABEM',
        direccion: process.env.SUNAT_DIRECCION || 'AV. PRINCIPAL 123, LIMA',
      },
      cliente: {
        codigoTipoDocumento: '1', // DNI
        numDocumento: '12345678', // TODO: Obtener del cliente
        razonSocial: venta.cliente,
      },
      productos: venta.detalles.map(d => {
        const precioUnitario = Number(d.precio);
        const cantidad = d.cantidad;
        const montoSinImpuesto = precioUnitario * cantidad;
        const montoImpuestos = montoSinImpuesto * 0.18; // IGV 18%
        const montoTotal = montoSinImpuesto + montoImpuestos;

        return {
          unidades: cantidad,
          codigoUnidad: 'NIU', // Unidad
          nombre: d.producto,
          precioUnitario,
          montoSinImpuesto,
          montoImpuestos,
          montoTotal,
        };
      }),
      totales: {
        totalOpGravadas: Number(venta.precio_total),
        totalImpuestos: Number(venta.precio_total) * 0.18,
        totalSinImpuestos: Number(venta.precio_total),
        totalConImpuestos: Number(venta.precio_total) * 1.18,
        totalPagar: Number(venta.precio_total) * 1.18,
      },
    };

    // Enviar a SUNAT
    const resultado = await sunatService.emitirFactura(facturaPayload);

    // Actualizar estado en BD
    const ventaActualizada = await prisma.venta.update({
      where: { id: venta.id },
      data: {
        estado_sunat: resultado.estado,
        respuesta_sunat: resultado.respuesta,
        numero_factura: resultado.numeroFactura,
        fecha_emision_sunat: new Date(),
        tipo_comprobante: 'FACTURA',
      },
    });

    res.json({
      success: true,
      message: `Factura ${resultado.estado}`,
      data: {
        ventaId: ventaActualizada.id,
        estado: ventaActualizada.estado_sunat,
        numeroFactura: ventaActualizada.numero_factura,
        respuesta: resultado.respuesta,
      },
    });
  } catch (error: any) {
    console.error('Error enviando factura a SUNAT:', error);
    res.status(500).json({
      success: false,
      message: 'Error al enviar factura a SUNAT',
      error: error.message,
    });
  }
};

/**
 * Consultar estado de factura en SUNAT
 */
export const consultarEstadoSunat = async (req: AuthRequest, res: Response) => {
  try {
    const { ventaId } = req.params;

    const venta = await prisma.venta.findUnique({
      where: { id: parseInt(ventaId) },
    });

    if (!venta || !venta.numero_factura) {
      return res.status(404).json({
        success: false,
        message: 'Factura no encontrada',
      });
    }

    const estado = await sunatService.consultarEstado(venta.numero_factura);

    // Actualizar estado en BD si cambió
    if (estado.estado !== venta.estado_sunat) {
      await prisma.venta.update({
        where: { id: venta.id },
        data: {
          estado_sunat: estado.estado,
          respuesta_sunat: estado,
        },
      });
    }

    res.json({
      success: true,
      estado: estado,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error consultando estado',
      error: error.message,
    });
  }
};

/**
 * Obtener todas las ventas con estado SUNAT
 */
export const obtenerVentasConEstadoSunat = async (req: AuthRequest, res: Response) => {
  try {
    const ventas = await prisma.venta.findMany({
      select: {
        id: true,
        cliente: true,
        precio_total: true,
        fecha_venta: true,
        estado_sunat: true,
        numero_factura: true,
      },
      orderBy: {
        fecha_venta: 'desc',
      },
    });

    res.json({
      success: true,
      data: ventas,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error obteniendo ventas',
      error: error.message,
    });
  }
};
```

---

## 🛣️ Paso 5: Crear Rutas

### 5.1 Crear archivo de rutas

Crear: `backend/src/routes/sunat.ts`

```typescript
import { Router } from 'express';
import { auth } from '../middleware/auth.js';
import {
  enviarFacturaSunat,
  consultarEstadoSunat,
  obtenerVentasConEstadoSunat,
} from '../controllers/sunatController.js';

const router = Router();

// Proteger todas las rutas con autenticación
router.use(auth);

/**
 * POST /api/sunat/emit/:ventaId
 * Enviar factura a SUNAT
 */
router.post('/emit/:ventaId', enviarFacturaSunat);

/**
 * GET /api/sunat/status/:ventaId
 * Consultar estado de factura
 */
router.get('/status/:ventaId', consultarEstadoSunat);

/**
 * GET /api/sunat/ventas
 * Obtener todas las ventas con estado SUNAT
 */
router.get('/ventas', obtenerVentasConEstadoSunat);

export default router;
```

### 5.2 Registrar rutas en server.ts

Editar: `backend/src/server.ts`

```typescript
// Agregar al inicio con los otros imports
import sunatRoutes from './routes/sunat.js';

// Agregar con las otras rutas (después de las rutas existentes)
app.use('/api/sunat', sunatRoutes);
```

---

## 🎨 Paso 6: Actualizar Frontend - Componente Badge

### 6.1 Crear componente SunatStatusBadge

Crear: `frontend/src/components/SunatStatusBadge.tsx`

```typescript
import React from 'react';

interface SunatStatusBadgeProps {
  estado: 'PENDIENTE' | 'ACEPTADA' | 'RECHAZADA';
  numeroFactura?: string;
}

export const SunatStatusBadge: React.FC<SunatStatusBadgeProps> = ({ 
  estado, 
  numeroFactura 
}) => {
  const getStyles = () => {
    switch (estado) {
      case 'ACEPTADA':
        return {
          bg: 'bg-green-500/20',
          text: 'text-green-600 dark:text-green-400',
          icon: '✅',
          label: 'Aceptada',
        };
      case 'RECHAZADA':
        return {
          bg: 'bg-red-500/20',
          text: 'text-red-600 dark:text-red-400',
          icon: '❌',
          label: 'Rechazada',
        };
      case 'PENDIENTE':
      default:
        return {
          bg: 'bg-yellow-500/20',
          text: 'text-yellow-600 dark:text-yellow-400',
          icon: '⏳',
          label: 'Pendiente',
        };
    }
  };

  const styles = getStyles();

  return (
    <div className="flex flex-col gap-1">
      <span className={`px-2 py-1 rounded-md ${styles.bg} ${styles.text} text-xs font-semibold flex items-center gap-1 w-fit`}>
        {styles.icon} {styles.label}
      </span>
      {numeroFactura && (
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {numeroFactura}
        </span>
      )}
    </div>
  );
};
```

---

## 📊 Paso 7: Actualizar Tabla de Reportes

### 7.1 Editar Reports.tsx

Editar: `frontend/src/pages/Reports.tsx`

Agregar import:
```typescript
import { SunatStatusBadge } from '@/components/SunatStatusBadge';
```

Agregar estado para modal SUNAT:
```typescript
const [sunatModalOpen, setSunatModalOpen] = useState(false);
const [sunatLoading, setSunatLoading] = useState(false);
```

Actualizar encabezados de tabla (buscar `<thead>`):
```typescript
<thead>
  <tr className="border-b border-white/10 dark:border-white/5">
    <th className="text-left py-4 px-4 text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
      <i className="fas fa-hashtag mr-2"></i>ID
    </th>
    <th className="text-left py-4 px-4 text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
      <i className="fas fa-user mr-2"></i>Cliente
    </th>
    <th className="text-left py-4 px-4 text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
      <i className="fas fa-box mr-2"></i>Productos
    </th>
    <th className="text-left py-4 px-4 text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
      <i className="fas fa-credit-card mr-2"></i>Método
    </th>
    <th className="text-left py-4 px-4 text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
      <i className="fas fa-dollar-sign mr-2"></i>Total
    </th>
    <th className="text-left py-4 px-4 text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
      <i className="fas fa-calendar mr-2"></i>Fecha
    </th>
    {/* ✅ NUEVA COLUMNA: ESTADO SUNAT */}
    <th className="text-left py-4 px-4 text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
      <i className="fas fa-file-invoice mr-2"></i>Estado SUNAT
    </th>
    <th className="text-left py-4 px-4 text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
      <i className="fas fa-cog mr-2"></i>Acciones
    </th>
  </tr>
</thead>
```

Actualizar filas de tabla (buscar `<tbody>`):
```typescript
<tbody>
  {reporte?.ventas && reporte.ventas.length > 0 ? (
    reporte.ventas
      .filter((venta) => {
        const searchLower = searchTerm.toLowerCase();
        return (
          venta.id.toString().includes(searchLower) ||
          venta.cliente.toLowerCase().includes(searchLower) ||
          venta.productos.toLowerCase().includes(searchLower) ||
          venta.metodo_pago.toLowerCase().includes(searchLower) ||
          formatDate(venta.fecha_venta).toLowerCase().includes(searchLower)
        );
      })
      .map((venta) => {
        let metodoBgColor = 'bg-blue-500/20';
        let metodoTextColor = 'text-blue-600 dark:text-blue-400';
        
        if (venta.metodo_pago === 'Yape') {
          metodoBgColor = 'bg-purple-500/20';
          metodoTextColor = 'text-purple-600 dark:text-purple-400';
        } else if (venta.metodo_pago === 'Efectivo') {
          metodoBgColor = 'bg-green-500/20';
          metodoTextColor = 'text-green-600 dark:text-green-400';
        }
        
        return (
          <tr
            key={venta.id}
            className="border-b border-white/5 dark:border-white/5 hover:bg-white/10 dark:hover:bg-white/5 transition-colors duration-200 group"
          >
            <td className="py-4 px-4 text-sm text-gray-900 dark:text-white font-medium">
              <span className="flex items-center">
                <span className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 mr-3"></span>
                #{venta.id}
              </span>
            </td>
            <td className="py-4 px-4 text-sm text-gray-900 dark:text-white">{venta.cliente}</td>
            <td className="py-4 px-4 text-sm text-gray-600 dark:text-gray-400">{venta.productos}</td>
            <td className="py-4 px-4 text-sm">
              <span className={`px-2 py-1 rounded-md ${metodoBgColor} ${metodoTextColor} text-xs font-semibold`}>
                {venta.metodo_pago}
              </span>
            </td>
            <td className="py-4 px-4 text-sm font-bold text-green-600 dark:text-green-400">
              {formatCurrency(Number(venta.precio_total))}
            </td>
            <td className="py-4 px-4 text-sm text-gray-600 dark:text-gray-400">
              <span className="px-2 py-1 rounded-md bg-gray-100 dark:bg-white/10 text-xs">
                {formatDate(venta.fecha_venta)}
              </span>
            </td>
            {/* ✅ NUEVA COLUMNA: ESTADO SUNAT */}
            <td className="py-4 px-4 text-sm">
              <SunatStatusBadge 
                estado={venta.estado_sunat || 'PENDIENTE'}
                numeroFactura={venta.numero_factura}
              />
            </td>
            <td className="py-4 px-4 text-sm">
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setSelectedVenta(venta);
                    setEmailModalOpen(true);
                  }}
                  className="p-2 rounded-lg bg-blue-500/20 text-blue-600 dark:text-blue-400 hover:bg-blue-500/30 transition"
                  title="Enviar por Email"
                >
                  <i className="fas fa-envelope text-sm"></i>
                </button>
                <button
                  onClick={() => {
                    setSelectedVenta(venta);
                    setBolletaModalOpen(true);
                  }}
                  className="p-2 rounded-lg bg-orange-500/20 text-orange-600 dark:text-orange-400 hover:bg-orange-500/30 transition"
                  title="Ver Boleta"
                >
                  <i className="fas fa-receipt text-sm"></i>
                </button>
                <button
                  onClick={() => {
                    setSelectedVenta(venta);
                    setWhatsappModalOpen(true);
                  }}
                  className="p-2 rounded-lg bg-green-500/20 text-green-600 dark:text-green-400 hover:bg-green-500/30 transition"
                  title="Enviar por WhatsApp"
                >
                  <i className="fab fa-whatsapp text-sm"></i>
                </button>
                {/* ✅ NUEVO BOTÓN: SUNAT */}
                <button
                  onClick={() => {
                    setSelectedVenta(venta);
                    setSunatModalOpen(true);
                  }}
                  disabled={venta.estado_sunat === 'ACEPTADA' || sunatLoading}
                  className={`p-2 rounded-lg transition ${
                    venta.estado_sunat === 'ACEPTADA'
                      ? 'bg-gray-500/20 text-gray-600 dark:text-gray-400 cursor-not-allowed'
                      : 'bg-red-500/20 text-red-600 dark:text-red-400 hover:bg-red-500/30'
                  }`}
                  title={venta.estado_sunat === 'ACEPTADA' ? 'Ya enviada a SUNAT' : 'Enviar a SUNAT'}
                >
                  <i className="fas fa-file-invoice text-sm"></i>
                </button>
              </div>
            </td>
          </tr>
        );
      })
  ) : (
    <tr>
      <td colSpan={8} className="py-12 text-center">
        <div className="flex flex-col items-center justify-center">
          <i className="fas fa-inbox text-4xl text-gray-300 dark:text-gray-600 mb-3"></i>
          <p className="text-gray-500 dark:text-gray-400">No hay ventas en este período</p>
        </div>
      </td>
    </tr>
  )}
</tbody>
```

---

## 🔔 Paso 8: Crear Modal SUNAT

### 8.1 Crear componente SunatModal

Crear: `frontend/src/components/modals/SunatModal.tsx`

```typescript
import React, { useState } from 'react';
import { reportesService } from '@/services/reportesService';
import { VentaDetallada } from '@/types';
import { formatCurrency } from '@/utils/formatters';

interface SunatModalProps {
  isOpen: boolean;
  onClose: () => void;
  venta: VentaDetallada | null;
  onSuccess?: () => void;
}

export const SunatModal: React.FC<SunatModalProps> = ({
  isOpen,
  onClose,
  venta,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!isOpen || !venta) return null;

  const handleEnviarSunat = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(false);

      // Llamar al endpoint del backend
      const response = await fetch(`/api/sunat/emit/${venta.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al enviar factura');
      }

      const data = await response.json();
      setSuccess(true);

      // Recargar datos después de 2 segundos
      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-red-700 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <i className="fas fa-file-invoice"></i>
            Enviar a SUNAT
          </h2>
          <button
            onClick={onClose}
            className="text-white hover:bg-red-700 p-1 rounded transition"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {success ? (
            <div className="text-center">
              <div className="mb-4">
                <i className="fas fa-check-circle text-4xl text-green-500"></i>
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                ¡Factura Enviada!
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                La factura ha sido enviada exitosamente a SUNAT
              </p>
            </div>
          ) : (
            <>
              <div className="mb-6 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                  Detalles de la Factura
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">ID Venta:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      #{venta.id}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Cliente:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {venta.cliente}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Total:</span>
                    <span className="font-semibold text-green-600 dark:text-green-400">
                      {formatCurrency(Number(venta.precio_total))}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Método:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {venta.metodo_pago}
                    </span>
                  </div>
                </div>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg">
                  <p className="text-sm text-red-700 dark:text-red-400">
                    <i className="fas fa-exclamation-circle mr-2"></i>
                    {error}
                  </p>
                </div>
              )}

              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                ¿Deseas enviar esta factura a SUNAT? Se validará y procesará automáticamente.
              </p>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-100 dark:bg-gray-700 px-6 py-4 flex gap-3 justify-end">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-gray-300 dark:bg-gray-600 text-gray-900 dark:text-white hover:bg-gray-400 dark:hover:bg-gray-500 transition disabled:opacity-50"
          >
            {success ? 'Cerrar' : 'Cancelar'}
          </button>
          {!success && (
            <button
              onClick={handleEnviarSunat}
              disabled={loading}
              className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <i className="fas fa-spinner animate-spin"></i>
                  Enviando...
                </>
              ) : (
                <>
                  <i className="fas fa-paper-plane"></i>
                  Enviar a SUNAT
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
```

### 8.2 Agregar modal a Reports.tsx

Agregar import:
```typescript
import { SunatModal } from '@/components/modals/SunatModal';
```

Agregar al final del componente (antes del cierre):
```typescript
<SunatModal
  isOpen={sunatModalOpen}
  onClose={() => {
    setSunatModalOpen(false);
    setSelectedVenta(null);
  }}
  venta={selectedVenta}
  onSuccess={() => {
    // Recargar datos
    window.location.reload();
  }}
/>
```

---

## 🔐 Paso 9: Configurar Variables de Entorno

### 9.1 Actualizar .env del backend

Editar: `backend/.env`

```env
# Existentes
DATABASE_URL=mysql://user:password@localhost:3306/bazar_abem
JWT_SECRET=tu_secret_aqui

# ✅ NUEVAS VARIABLES SUNAT
SUNAT_API_URL=https://api.visioner7.com/v1
SUNAT_API_TOKEN=tu_token_de_visioner7_aqui
SUNAT_ENV=sandbox
SUNAT_RUC=20123456721
SUNAT_RAZON_SOCIAL=BAZAR ABEM SAC
SUNAT_NOMBRE_COMERCIAL=BAZAR ABEM
SUNAT_DIRECCION=AV. PRINCIPAL 123, LIMA
```

---

## ✅ Paso 10: Testing

### 10.1 Iniciar servidor backend

```bash
cd backend
npm run dev
```

### 10.2 Iniciar servidor frontend

```bash
cd frontend
npm run dev
```

### 10.3 Probar flujo completo

1. Ir a http://localhost:5173/reportes
2. Buscar una venta en la tabla
3. Verificar que aparezca la columna "Estado SUNAT" con "Pendiente"
4. Hacer clic en el botón SUNAT (icono de factura)
5. Confirmar envío en el modal
6. Verificar que el estado cambie a "Aceptada" o "Rechazada"

---

## 🐛 Troubleshooting

### Error: "Token inválido"
- Verificar que `SUNAT_API_TOKEN` sea correcto en `.env`
- Regenerar token en https://visioner7-api.com/

### Error: "Factura ya enviada"
- Es normal, significa que ya fue procesada
- El estado debe estar en "ACEPTADA"

### Error: "Conexión rechazada"
- Verificar que `SUNAT_API_URL` sea correcto
- Verificar conexión a internet
- Verificar que no haya firewall bloqueando

### Error: "Datos inválidos"
- Verificar que el RUC sea válido
- Verificar que los productos tengan datos completos
- Revisar logs del backend

---

## 📝 Checklist Final

- [ ] Base de datos actualizada con nuevos campos
- [ ] Servicio SUNAT creado
- [ ] Controlador SUNAT creado
- [ ] Rutas SUNAT registradas
- [ ] Componente SunatStatusBadge creado
- [ ] Modal SUNAT creado
- [ ] Tabla de reportes actualizada
- [ ] Variables de entorno configuradas
- [ ] Testing completado
- [ ] Documentación actualizada

---

**¡Listo! Tu sistema de facturación SUNAT está implementado.**

Para más información, consulta el documento `ANALISIS-INTEGRACION-SUNAT-API.md`
