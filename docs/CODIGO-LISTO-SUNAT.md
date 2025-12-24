# Código Listo para Copiar y Pegar - Integración SUNAT

Este documento contiene todo el código necesario para implementar la facturación SUNAT. Solo copia y pega en los archivos correspondientes.

---

## 📁 Archivo 1: backend/src/services/sunatService.ts

**Crear nuevo archivo con este contenido:**

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

  async consultarEstado(numeroFactura: string) {
    try {
      const response = await this.client.get(`/documents/${numeroFactura}/status`);
      return response.data;
    } catch (error: any) {
      throw new Error(`Error consultando estado: ${error.message}`);
    }
  }

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

export const sunatService = new SunatService({
  apiUrl: process.env.SUNAT_API_URL || 'https://api.visioner7.com/v1',
  token: process.env.SUNAT_API_TOKEN || '',
  environment: (process.env.SUNAT_ENV as 'sandbox' | 'production') || 'sandbox',
});
```

---

## 📁 Archivo 2: backend/src/controllers/sunatController.ts

**Crear nuevo archivo con este contenido:**

```typescript
import { Response } from 'express';
import prisma from '../config/database.js';
import { AuthRequest } from '../middleware/auth.js';
import { sunatService, FacturaPayload } from '../services/sunatService.js';

export const enviarFacturaSunat = async (req: AuthRequest, res: Response) => {
  try {
    const { ventaId } = req.params;

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

    if (venta.estado_sunat === 'ACEPTADA') {
      return res.status(400).json({
        success: false,
        message: 'Esta factura ya fue aceptada por SUNAT',
      });
    }

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
        codigoTipoDocumento: '6',
        numDocumento: process.env.SUNAT_RUC || '20123456721',
        razonSocial: process.env.SUNAT_RAZON_SOCIAL || 'BAZAR ABEM SAC',
        nombreComercial: process.env.SUNAT_NOMBRE_COMERCIAL || 'BAZAR ABEM',
        direccion: process.env.SUNAT_DIRECCION || 'AV. PRINCIPAL 123, LIMA',
      },
      cliente: {
        codigoTipoDocumento: '1',
        numDocumento: '12345678',
        razonSocial: venta.cliente,
      },
      productos: venta.detalles.map(d => {
        const precioUnitario = Number(d.precio);
        const cantidad = d.cantidad;
        const montoSinImpuesto = precioUnitario * cantidad;
        const montoImpuestos = montoSinImpuesto * 0.18;
        const montoTotal = montoSinImpuesto + montoImpuestos;

        return {
          unidades: cantidad,
          codigoUnidad: 'NIU',
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

    const resultado = await sunatService.emitirFactura(facturaPayload);

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

## 📁 Archivo 3: backend/src/routes/sunat.ts

**Crear nuevo archivo con este contenido:**

```typescript
import { Router } from 'express';
import { auth } from '../middleware/auth.js';
import {
  enviarFacturaSunat,
  consultarEstadoSunat,
  obtenerVentasConEstadoSunat,
} from '../controllers/sunatController.js';

const router = Router();

router.use(auth);

router.post('/emit/:ventaId', enviarFacturaSunat);
router.get('/status/:ventaId', consultarEstadoSunat);
router.get('/ventas', obtenerVentasConEstadoSunat);

export default router;
```

---

## 📁 Archivo 4: frontend/src/components/SunatStatusBadge.tsx

**Crear nuevo archivo con este contenido:**

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

## 📁 Archivo 5: frontend/src/components/modals/SunatModal.tsx

**Crear nuevo archivo con este contenido:**

```typescript
import React, { useState } from 'react';
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

      const token = localStorage.getItem('token');
      const response = await fetch(`/api/sunat/emit/${venta.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al enviar factura');
      }

      const data = await response.json();
      setSuccess(true);

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

---

## 📝 Cambios en Archivos Existentes

### Cambio 1: backend/src/server.ts

**Busca esta línea:**
```typescript
import ventasRoutes from './routes/ventas.js';
```

**Agrega después:**
```typescript
import sunatRoutes from './routes/sunat.js';
```

**Busca esta línea:**
```typescript
app.use('/api/ventas', ventasRoutes);
```

**Agrega después:**
```typescript
app.use('/api/sunat', sunatRoutes);
```

---

### Cambio 2: backend/.env

**Agrega al final:**
```env
# SUNAT Configuration
SUNAT_API_URL=https://api.visioner7.com/v1
SUNAT_API_TOKEN=tu_token_aqui
SUNAT_ENV=sandbox
SUNAT_RUC=20123456721
SUNAT_RAZON_SOCIAL=BAZAR ABEM SAC
SUNAT_NOMBRE_COMERCIAL=BAZAR ABEM
SUNAT_DIRECCION=AV. PRINCIPAL 123, LIMA
```

---

### Cambio 3: backend/package.json

**Busca la sección "dependencies":**
```json
"dependencies": {
  "bcrypt": "^5.1.1",
  ...
}
```

**Agrega axios:**
```json
"dependencies": {
  "axios": "^1.6.0",
  "bcrypt": "^5.1.1",
  ...
}
```

**Luego ejecuta:**
```bash
cd backend
npm install
```

---

### Cambio 4: frontend/src/pages/Reports.tsx

**Busca el import de componentes:**
```typescript
import { BolletaPrintModal } from '@/components/modals/BolletaPrintModal';
```

**Agrega después:**
```typescript
import { SunatStatusBadge } from '@/components/SunatStatusBadge';
import { SunatModal } from '@/components/modals/SunatModal';
```

**Busca los estados del componente:**
```typescript
const [bolletaModalOpen, setBolletaModalOpen] = useState(false);
```

**Agrega después:**
```typescript
const [sunatModalOpen, setSunatModalOpen] = useState(false);
const [sunatLoading, setSunatLoading] = useState(false);
```

**Busca el `<thead>` de la tabla y reemplaza `<th>Acciones</th>` por:**
```typescript
<th className="text-left py-4 px-4 text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
  <i className="fas fa-file-invoice mr-2"></i>Estado SUNAT
</th>
<th className="text-left py-4 px-4 text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
  <i className="fas fa-cog mr-2"></i>Acciones
</th>
```

**Busca el `<tbody>` y en la fila de cada venta, antes de `<td>` con acciones, agrega:**
```typescript
<td className="py-4 px-4 text-sm">
  <SunatStatusBadge 
    estado={venta.estado_sunat || 'PENDIENTE'}
    numeroFactura={venta.numero_factura}
  />
</td>
```

**En la sección de acciones (botones), agrega antes del cierre de `</div>`:**
```typescript
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
```

**Al final del componente, antes del cierre, agrega:**
```typescript
<SunatModal
  isOpen={sunatModalOpen}
  onClose={() => {
    setSunatModalOpen(false);
    setSelectedVenta(null);
  }}
  venta={selectedVenta}
  onSuccess={() => {
    window.location.reload();
  }}
/>
```

**Cambia el `colSpan` de la fila vacía de 7 a 8:**
```typescript
<td colSpan={8} className="py-12 text-center">
```

---

## 🚀 Instalación de Dependencias

```bash
# Backend
cd backend
npm install axios

# Frontend (axios ya debería estar instalado)
cd frontend
npm install
```

---

## ✅ Verificación Final

1. Todos los archivos creados
2. Todos los cambios realizados
3. Variables de entorno configuradas
4. Dependencias instaladas
5. Servidor backend reiniciado
6. Servidor frontend reiniciado

**¡Listo para usar!**
