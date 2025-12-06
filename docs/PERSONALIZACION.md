# 🎨 Guía de Personalización - Bazar Abem

Esta guía te ayudará a personalizar el sistema según las necesidades de tu negocio.

## 🏢 Información de la Empresa

### 1. Nombre y Logo

**Frontend - Título de la aplicación:**
```env
# frontend/.env
VITE_APP_NAME=Tu Nombre de Empresa
```

**Frontend - Sidebar y Header:**
```typescript
// frontend/src/components/layout/Sidebar.tsx
// Buscar y reemplazar "Bazar Abem" por tu nombre

// frontend/src/components/layout/Header.tsx
// Buscar y reemplazar "Bazar Abem" por tu nombre
```

**Backend - Nombre en PDFs:**
```typescript
// backend/src/services/pdfService.ts
// Línea ~20 y ~120
doc.fontSize(20).font('Helvetica-Bold').text('TU NOMBRE DE EMPRESA', { align: 'center' });
```

### 2. Datos de Contacto

**En PDFs (Boletas y Facturas):**
```typescript
// backend/src/services/pdfService.ts
// Modificar estas líneas:
doc.text('RUC: 10123456789', { align: 'center' });
doc.text('Av. Principal 123, Lima, Perú', { align: 'center' });
doc.text('Tel: (01) 234-5678', { align: 'center' });
```

**En Emails:**
```typescript
// backend/src/services/emailService.ts
// Buscar el footer del HTML y modificar:
<p>TU EMPRESA - RUC: XXXXXXXXXX</p>
<p>Tu Dirección</p>
<p>Tel: Tu Teléfono</p>
```

### 3. Logo de la Empresa

**Agregar logo en PDFs:**
```typescript
// backend/src/services/pdfService.ts
// Después de la línea del nombre de empresa, agregar:
doc.image('ruta/a/tu/logo.png', 50, 50, { width: 100 });
```

**Agregar logo en Frontend:**
```typescript
// frontend/src/components/layout/Sidebar.tsx
// Reemplazar el ícono por una imagen:
<img src="/logo.png" alt="Logo" className="h-8 w-8" />
```

## 🎨 Colores y Tema

### Paleta de Colores

**Tailwind CSS:**
```javascript
// frontend/tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: '#6366f1',    // Cambiar por tu color principal
        secondary: '#8b5cf6',  // Cambiar por tu color secundario
        accent: '#ec4899',     // Cambiar por tu color de acento
        // ... más colores
      },
    },
  },
}
```

**CSS Variables:**
```css
/* frontend/src/index.css */
:root {
  --primary: #6366f1;
  --secondary: #8b5cf6;
  --accent: #ec4899;
  /* Cambiar estos valores */
}
```

## 💰 Moneda y Formato

### Cambiar Moneda

**Frontend - Formatters:**
```typescript
// frontend/src/utils/formatters.ts
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN', // Cambiar a 'USD', 'EUR', etc.
  }).format(amount);
};
```

**Backend - PDFs:**
```typescript
// backend/src/services/pdfService.ts
// Buscar todas las instancias de "S/" y reemplazar por tu símbolo
// Ejemplo: "S/" -> "$" o "€"
```

### Cambiar Formato de Fecha

**Frontend:**
```typescript
// frontend/src/utils/formatters.ts
export const formatDate = (date: string | Date): string => {
  return new Date(date).toLocaleDateString('es-PE', {
    // Cambiar 'es-PE' por tu locale
    // 'en-US', 'es-ES', 'pt-BR', etc.
    timeZone: 'America/Lima', // Cambiar zona horaria
    dateStyle: 'short',
  });
};
```

**Backend:**
```env
# backend/.env
TZ=America/Lima  # Cambiar por tu zona horaria
# America/New_York, Europe/Madrid, etc.
```

## 📊 Cálculo de RUC/Impuestos

### Personalizar Categorías

```typescript
// backend/src/controllers/rucController.ts
// Modificar las categorías según tu país/régimen:

if (total_ventas < 5000) {
  categoria = 1;
  monto = 20;
} else if (total_ventas >= 5000 && total_ventas <= 8000) {
  categoria = 2;
  monto = 50;
} else {
  categoria = 'Excede RUS';
  monto = 'Debe cambiar de régimen';
}
```

### Cambiar Nombre de "RUC"

Si en tu país se llama diferente (RFC, NIT, CUIT, etc.):

```typescript
// frontend/src/pages/RUC.tsx
// Cambiar todos los textos de "RUC" por tu término

// backend/src/routes/ruc.ts
// Cambiar la ruta si lo deseas: /api/rfc, /api/nit, etc.
```

## 🧾 Comprobantes

### Tipos de Comprobantes

**Agregar nuevo tipo:**

1. Backend:
```typescript
// backend/src/services/pdfService.ts
export const generateTicketPDF = async (venta: VentaConDetalles): Promise<Buffer> => {
  // Implementar lógica para ticket
};
```

2. Frontend:
```typescript
// frontend/src/pages/Reports.tsx
// Agregar botón para nuevo tipo de comprobante
```

### Numeración de Comprobantes

```typescript
// backend/src/services/pdfService.ts
// Boleta:
doc.text(`N° ${String(venta.id).padStart(8, '0')}`, { align: 'center' });

// Factura:
doc.text(`N° F001-${String(venta.id).padStart(8, '0')}`, { align: 'center' });

// Personalizar el formato según necesites
```

## 💳 Métodos de Pago

### Agregar Nuevos Métodos

**Backend - Schema:**
```prisma
// backend/prisma/schema.prisma
model Venta {
  // ...
  metodo_pago String // Agregar validación si lo deseas
}
```

**Frontend - Formulario:**
```typescript
// frontend/src/pages/RegisterSale.tsx
<select name="metodo_pago">
  <option value="Efectivo">Efectivo</option>
  <option value="Tarjeta De Credito/Debito">Tarjeta</option>
  <option value="Yape">Yape</option>
  <option value="Plin">Plin</option> {/* Nuevo */}
  <option value="Transferencia">Transferencia</option> {/* Nuevo */}
</select>
```

## 📧 Configuración de Email

### Cambiar Plantilla de Email

```typescript
// backend/src/services/emailService.ts
// Modificar la variable htmlContent con tu diseño
const htmlContent = `
  <!DOCTYPE html>
  <html>
  <head>
    <style>
      /* Tu CSS personalizado */
    </style>
  </head>
  <body>
    <!-- Tu HTML personalizado -->
  </body>
  </html>
`;
```

### Usar Otro Proveedor SMTP

**SendGrid:**
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USERNAME=apikey
SMTP_PASSWORD=tu_api_key_de_sendgrid
```

**Mailgun:**
```env
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USERNAME=tu_usuario_mailgun
SMTP_PASSWORD=tu_password_mailgun
```

## 🛒 Productos y Categorías

### Agregar Categorías de Productos

1. **Modificar Schema:**
```prisma
// backend/prisma/schema.prisma
model Producto {
  id            Int            @id @default(autoincrement())
  nombre        String         @unique
  categoria     String?        // Nuevo campo
  precio        Decimal?       @db.Decimal(10, 2) // Nuevo campo
  stock         Int?           // Nuevo campo
  detalleVentas DetalleVenta[]
}
```

2. **Crear Migración:**
```bash
cd backend
npx prisma migrate dev --name add_producto_fields
```

3. **Actualizar Frontend:**
```typescript
// frontend/src/types/index.ts
export interface Producto {
  id: number;
  nombre: string;
  categoria?: string;
  precio?: number;
  stock?: number;
}
```

## 📊 Reportes Personalizados

### Agregar Nuevo Reporte

1. **Backend - Controller:**
```typescript
// backend/src/controllers/reportesController.ts
export const getReportePersonalizado = async (req: AuthRequest, res: Response) => {
  // Tu lógica de reporte
};
```

2. **Backend - Route:**
```typescript
// backend/src/routes/reportes.ts
router.get('/personalizado', auth, getReportePersonalizado);
```

3. **Frontend - Service:**
```typescript
// frontend/src/services/reportesService.ts
export const getReportePersonalizado = async () => {
  const response = await api.get('/reportes/personalizado');
  return response.data;
};
```

4. **Frontend - Página:**
```typescript
// frontend/src/pages/Reports.tsx
// Agregar sección para tu reporte personalizado
```

## 🔐 Roles y Permisos

### Agregar Nuevo Rol

1. **Backend - Schema:**
```prisma
// backend/prisma/schema.prisma
model Usuario {
  // ...
  rol String // 'Administrador', 'Vendedor', 'Supervisor', etc.
}
```

2. **Backend - Middleware:**
```typescript
// backend/src/middleware/auth.ts
export const requireRole = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!roles.includes(req.user!.rol)) {
      return res.status(403).json({ message: 'No autorizado' });
    }
    next();
  };
};
```

3. **Usar en Rutas:**
```typescript
// backend/src/routes/ventas.ts
router.delete('/:id', auth, requireRole(['Administrador']), deleteVenta);
```

## 🌍 Internacionalización (i18n)

### Agregar Múltiples Idiomas

1. **Instalar i18next:**
```bash
cd frontend
npm install react-i18next i18next
```

2. **Configurar:**
```typescript
// frontend/src/i18n.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

i18n.use(initReactI18next).init({
  resources: {
    es: {
      translation: {
        "welcome": "Bienvenido",
        // ... más traducciones
      }
    },
    en: {
      translation: {
        "welcome": "Welcome",
        // ... más traducciones
      }
    }
  },
  lng: "es",
  fallbackLng: "es",
});

export default i18n;
```

3. **Usar en Componentes:**
```typescript
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t } = useTranslation();
  return <h1>{t('welcome')}</h1>;
}
```

## 📱 Agregar Logo/Favicon

1. **Favicon:**
```html
<!-- frontend/index.html -->
<link rel="icon" type="image/png" href="/favicon.png" />
```

2. **Logo en Sidebar:**
```typescript
// frontend/src/components/layout/Sidebar.tsx
<img src="/logo.png" alt="Logo" className="h-10 w-10" />
```

3. **Agregar archivos:**
```
frontend/public/
  ├── logo.png
  └── favicon.png
```

## 🎯 Personalización Avanzada

### Cambiar Puerto del Backend

```env
# backend/.env
PORT=4000  # Cambiar de 3000 a 4000
```

```env
# frontend/.env
VITE_API_URL=http://localhost:4000/api  # Actualizar también aquí
```

### Cambiar Puerto del Frontend

```typescript
// frontend/vite.config.ts
export default defineConfig({
  server: {
    port: 3000,  // Cambiar de 5173 a 3000
  },
});
```

### Agregar Más Estadísticas al Dashboard

```typescript
// backend/src/controllers/reportesController.ts
export const getDashboardStats = async (req: AuthRequest, res: Response) => {
  // Agregar más queries y cálculos
  const nuevaEstadistica = await prisma.venta.count({
    // Tu lógica
  });
  
  res.json({
    // ... estadísticas existentes
    nuevaEstadistica,
  });
};
```

---

## 💡 Consejos Finales

1. **Siempre haz backup** antes de hacer cambios importantes
2. **Prueba en desarrollo** antes de aplicar en producción
3. **Documenta tus cambios** para futuras referencias
4. **Usa Git** para control de versiones
5. **Mantén las dependencias actualizadas** regularmente

---

**¿Necesitas ayuda?** Revisa la documentación oficial de cada tecnología:
- [React](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Prisma](https://www.prisma.io/)
- [Tailwind CSS](https://tailwindcss.com/)
