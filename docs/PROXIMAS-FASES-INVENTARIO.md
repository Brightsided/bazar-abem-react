# PRÓXIMAS FASES - SISTEMA DE INVENTARIO

## Fase 2: Integración Completa de Inventario en Ventas

### Objetivo
Asegurar que al registrar una venta, se capture correctamente el `producto_id`, se valide el stock máximo y se actualice automáticamente el inventario.

### Tareas

#### 2.1 Capturar producto_id en RegisterSale
**Archivo:** `frontend/src/pages/RegisterSale.tsx`

**Cambios necesarios:**
```typescript
// En ProductSearch onChange handler
const handleProductSelect = (producto: Almacenamiento) => {
  setValue(`productos.${index}.producto_id`, producto.producto.id);
  setValue(`productos.${index}.stock_disponible`, producto.stock);
  setValue(`productos.${index}.nombre`, producto.producto.nombre);
  setValue(`productos.${index}.precio`, Number(producto.producto.precio));
};
```

#### 2.2 Validar cantidad máxima en frontend
**Archivo:** `frontend/src/pages/RegisterSale.tsx`

**Cambios necesarios:**
```typescript
// En el input de cantidad
<input
  type="number"
  {...register(`productos.${index}.cantidad`, { valueAsNumber: true })}
  max={stockDisponible[index] || 999}
  className="..."
/>
```

#### 2.3 Mostrar advertencia de stock
**Archivo:** `frontend/src/pages/RegisterSale.tsx`

**Cambios necesarios:**
```typescript
// Mostrar si cantidad > stock disponible
{productos[index]?.cantidad > (stockDisponible[index] || 0) && (
  <p className="text-yellow-500 text-xs mt-1">
    ⚠️ Cantidad excede stock disponible ({stockDisponible[index]})
  </p>
)}
```

#### 2.4 Validar en backend
**Archivo:** `backend/src/controllers/ventasController.ts`

**Cambios necesarios:**
```typescript
// Ya está implementado, solo verificar que funcione
for (const prod of productos) {
  const almacenamiento = await prisma.almacenamiento.findUnique({
    where: { producto_id: prod.producto_id },
  });

  if (!almacenamiento || almacenamiento.stock < prod.cantidad) {
    return res.status(400).json({
      success: false,
      message: `Stock insuficiente para ${prod.nombre}`,
    });
  }
}
```

---

## Fase 3: Envío Digital de Comprobantes

### Objetivo
Implementar envío real de facturas y boletas por Gmail y WhatsApp.

### 3.1 Servicio de Gmail

**Archivo a crear:** `backend/src/services/gmailService.ts`

```typescript
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASSWORD,
  },
});

export const enviarFactura = async (
  email: string,
  venta: any,
  pdfBuffer: Buffer
) => {
  try {
    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: email,
      subject: `Factura #${venta.id}`,
      html: `
        <h2>Factura de Venta</h2>
        <p>Cliente: ${venta.cliente}</p>
        <p>Total: S/. ${venta.precio_total}</p>
      `,
      attachments: [
        {
          filename: `factura-${venta.id}.pdf`,
          content: pdfBuffer,
        },
      ],
    });
    return { success: true };
  } catch (error) {
    console.error('Error enviando email:', error);
    throw error;
  }
};
```

**Variables de entorno necesarias:**
```
GMAIL_USER=tu-email@gmail.com
GMAIL_PASSWORD=tu-contraseña-app
```

### 3.2 Servicio de WhatsApp

**Archivo a crear:** `backend/src/services/whatsappService.ts`

```typescript
import twilio from 'twilio';

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export const enviarWhatsApp = async (
  telefono: string,
  venta: any,
  pdfUrl: string
) => {
  try {
    await client.messages.create({
      from: `whatsapp:${process.env.TWILIO_PHONE}`,
      to: `whatsapp:${telefono}`,
      body: `Hola ${venta.cliente}, tu compra por S/. ${venta.precio_total} ha sido registrada.`,
      mediaUrl: pdfUrl,
    });
    return { success: true };
  } catch (error) {
    console.error('Error enviando WhatsApp:', error);
    throw error;
  }
};
```

**Variables de entorno necesarias:**
```
TWILIO_ACCOUNT_SID=tu-account-sid
TWILIO_AUTH_TOKEN=tu-auth-token
TWILIO_PHONE=+1234567890
```

### 3.3 Endpoints en Backend

**Archivo:** `backend/src/routes/reportes.ts`

```typescript
router.post('/enviar-email', auth, async (req, res) => {
  try {
    const { venta_id, email } = req.body;
    
    const venta = await prisma.venta.findUnique({
      where: { id: venta_id },
      include: { detalles: true },
    });

    // Generar PDF
    const pdfBuffer = await generarPDF(venta);

    // Enviar email
    await enviarFactura(email, venta, pdfBuffer);

    res.json({ success: true, message: 'Email enviado' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al enviar email' });
  }
});

router.post('/enviar-whatsapp', auth, async (req, res) => {
  try {
    const { venta_id, telefono } = req.body;
    
    const venta = await prisma.venta.findUnique({
      where: { id: venta_id },
      include: { detalles: true },
    });

    // Generar PDF y subirlo
    const pdfUrl = await subirPDF(venta);

    // Enviar WhatsApp
    await enviarWhatsApp(telefono, venta, pdfUrl);

    res.json({ success: true, message: 'WhatsApp enviado' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al enviar WhatsApp' });
  }
});
```

### 3.4 Actualizar Modales

**Archivo:** `frontend/src/components/modals/EmailModal.tsx`

```typescript
const handleSendEmail = async () => {
  try {
    const response = await api.post('/reportes/enviar-email', {
      venta_id: venta?.id,
      email: emailValue,
    });
    
    if (response.data.success) {
      showSuccess('Email enviado correctamente');
      onClose();
    }
  } catch (error) {
    showError('Error al enviar email');
  }
};
```

---

## Fase 4: Registro de Ganancias

### Objetivo
Registrar y analizar ganancias por venta y por producto.

### 4.1 Crear Tabla de Ganancias

**Archivo:** `backend/prisma/schema.prisma`

```prisma
model Ganancia {
  id                    Int                     @id @default(autoincrement())
  venta_id              Int
  producto_id           Int
  cantidad              Int
  precio_venta          Decimal                 @db.Decimal(10, 2)
  precio_costo          Decimal                 @db.Decimal(10, 2)
  ganancia_unitaria     Decimal                 @db.Decimal(10, 2)
  ganancia_total        Decimal                 @db.Decimal(10, 2)
  porcentaje_ganancia   Decimal                 @db.Decimal(5, 2)
  fecha_venta           DateTime                @default(now())
  venta                 Venta                   @relation(fields: [venta_id], references: [id], onDelete: Cascade)
  producto              Producto                @relation(fields: [producto_id], references: [id], onDelete: Cascade)

  @@index([venta_id])
  @@index([producto_id])
  @@index([fecha_venta])
  @@map("ganancias")
}
```

### 4.2 Calcular Ganancias en Ventas

**Archivo:** `backend/src/controllers/ventasController.ts`

```typescript
// En createVenta, después de crear la venta
for (const prod of productos) {
  const ganancia_unitaria = prod.precio - (prod.precio_costo || 0);
  const ganancia_total = ganancia_unitaria * prod.cantidad;
  const porcentaje_ganancia = ((ganancia_unitaria / prod.precio) * 100);

  await prisma.ganancia.create({
    data: {
      venta_id: venta.id,
      producto_id: prod.producto_id,
      cantidad: prod.cantidad,
      precio_venta: prod.precio,
      precio_costo: prod.precio_costo || 0,
      ganancia_unitaria,
      ganancia_total,
      porcentaje_ganancia,
    },
  });
}
```

### 4.3 Crear Reportes de Ganancias

**Archivo:** `backend/src/controllers/reportesController.ts`

```typescript
export const getReporteGanancias = async (req: AuthRequest, res: Response) => {
  try {
    const { fecha_inicio, fecha_fin } = req.query;

    const ganancias = await prisma.ganancia.findMany({
      where: {
        fecha_venta: {
          gte: new Date(fecha_inicio as string),
          lte: new Date(fecha_fin as string),
        },
      },
      include: {
        producto: true,
      },
    });

    const totalGanancia = ganancias.reduce(
      (sum, g) => sum + Number(g.ganancia_total),
      0
    );

    const gananciaPorProducto = ganancias.reduce((acc: any, g) => {
      if (!acc[g.producto_id]) {
        acc[g.producto_id] = {
          producto: g.producto.nombre,
          cantidad: 0,
          ganancia: 0,
        };
      }
      acc[g.producto_id].cantidad += g.cantidad;
      acc[g.producto_id].ganancia += Number(g.ganancia_total);
      return acc;
    }, {});

    res.json({
      totalGanancia,
      gananciaPorProducto,
      detalles: ganancias,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al obtener ganancias' });
  }
};
```

### 4.4 Mostrar en Reportes

**Archivo:** `frontend/src/pages/Reports.tsx`

```typescript
// Agregar nueva sección en Reports
<div className="relative overflow-hidden rounded-xl backdrop-blur-xl bg-white/50 dark:bg-white/5 border border-white/20 dark:border-white/10 p-6">
  <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6">
    <i className="fas fa-chart-pie mr-3 text-green-500"></i>
    Análisis de Ganancias
  </h2>
  
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
    <div className="bg-green-100 dark:bg-green-900/30 p-4 rounded-lg">
      <p className="text-sm text-gray-600 dark:text-gray-400">Ganancia Total</p>
      <p className="text-2xl font-bold text-green-600 dark:text-green-400">
        {formatCurrency(reporte?.totalGanancia || 0)}
      </p>
    </div>
    
    {/* Más tarjetas de ganancias */}
  </div>
</div>
```

---

## Fase 5: Mejoras Adicionales

### 5.1 Importación de Inventario desde CSV
- Crear endpoint para subir CSV
- Parsear y validar datos
- Crear productos y almacenamiento

### 5.2 Ajustes de Inventario
- Crear tabla de ajustes
- Registrar pérdidas/daños
- Auditoría de cambios

### 5.3 Transferencias entre Ubicaciones
- Crear tabla de ubicaciones
- Registrar transferencias
- Historial de movimientos

### 5.4 Integración de Scanner de Códigos
- Agregar input para escaneo
- Buscar producto por código
- Agregar a venta automáticamente

---

## CRONOGRAMA RECOMENDADO

| Fase | Tarea | Duración | Prioridad |
|------|-------|----------|-----------|
| 2 | Integración de inventario en ventas | 1-2 días | CRÍTICA |
| 3 | Envío digital de comprobantes | 2-3 días | ALTA |
| 4 | Registro de ganancias | 1-2 días | ALTA |
| 5 | Mejoras adicionales | 3-5 días | MEDIA |

---

## CHECKLIST DE IMPLEMENTACIÓN

### Fase 2
- [ ] Capturar producto_id en RegisterSale
- [ ] Validar cantidad máxima en frontend
- [ ] Mostrar advertencia de stock
- [ ] Validar en backend
- [ ] Pruebas funcionales

### Fase 3
- [ ] Crear servicio de Gmail
- [ ] Crear servicio de WhatsApp
- [ ] Crear endpoints en backend
- [ ] Actualizar modales
- [ ] Pruebas de envío

### Fase 4
- [ ] Crear tabla de ganancias
- [ ] Calcular ganancias en ventas
- [ ] Crear reportes
- [ ] Mostrar en frontend
- [ ] Pruebas de cálculo

### Fase 5
- [ ] Importación de CSV
- [ ] Ajustes de inventario
- [ ] Transferencias
- [ ] Scanner de códigos

---

## NOTAS IMPORTANTES

### Sobre Gmail
- Usar contraseña de aplicación, no la contraseña de cuenta
- Habilitar "Acceso de aplicaciones menos seguras"
- Guardar credenciales en variables de entorno

### Sobre WhatsApp
- Usar Twilio o similar
- Validar formato de teléfono
- Guardar credenciales en variables de entorno

### Sobre Ganancias
- Considerar precio de costo en cálculos
- Registrar en cada venta
- Permitir análisis por período

---

## CONCLUSIÓN

El sistema de inventario tiene una base sólida. Las próximas fases mejorarán significativamente la funcionalidad y permitirán:

✅ Integración completa con ventas
✅ Envío digital de comprobantes
✅ Análisis de ganancias
✅ Mejoras adicionales

Se recomienda implementar en el orden propuesto para asegurar que cada fase funcione correctamente.
