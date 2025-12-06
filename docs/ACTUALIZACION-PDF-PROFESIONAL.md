# Actualización - PDFs Profesionales con @react-pdf/renderer

## 📦 Librerías Instaladas

Se han instalado las siguientes librerías para generar PDFs profesionales:

```bash
npm install @react-pdf/renderer html2canvas
```

### Librerías:
- **@react-pdf/renderer** - Generación de PDFs con componentes React
- **html2canvas** - Conversión de HTML a canvas (soporte adicional)

---

## 🎨 Componentes PDF Creados

### 1. **BoletaPDF.tsx**
Ubicación: `frontend/src/components/pdf/BoletaPDF.tsx`

Características:
- ✅ Diseño profesional de boleta de venta
- ✅ Encabezado con datos de la empresa
- ✅ Número de boleta formateado
- ✅ Tabla de productos con cantidad, precio y total
- ✅ Cálculo automático de totales
- ✅ Método de pago
- ✅ Pie de página profesional
- ✅ Estilos consistentes y legibles

### 2. **FacturaPDF.tsx**
Ubicación: `frontend/src/components/pdf/FacturaPDF.tsx`

Características:
- ✅ Diseño profesional de factura electrónica
- ✅ Encabezado con logo y datos de la empresa
- ✅ Sección de título con número de factura
- ✅ Datos del cliente y de la factura
- ✅ Tabla de productos con detalles completos
- ✅ Cálculo de subtotal, IGV (18%) y total
- ✅ Sección de notas sobre factura electrónica
- ✅ Pie de página profesional
- ✅ Colores corporativos (gris oscuro #1f2937)

---

## 🔄 Componentes Modales Actualizados

### 1. **BolletaPrintModal.tsx**
Cambios:
- ✅ Usa `PDFViewer` de @react-pdf/renderer
- ✅ Botón de descarga de PDF
- ✅ Botón de impresión mejorado
- ✅ Vista previa en tiempo real
- ✅ Interfaz más profesional

### 2. **FacturaPrintModal.tsx** (NUEVO)
Ubicación: `frontend/src/components/modals/FacturaPrintModal.tsx`

Características:
- ✅ Modal similar a boleta pero para facturas
- ✅ Descarga de factura en PDF
- ✅ Impresión de factura
- ✅ Vista previa profesional

### 3. **EmailModal.tsx**
Cambios:
- ✅ Checkboxes para seleccionar boleta/factura
- ✅ Validación mejorada
- ✅ Interfaz más clara

---

## 📋 Características de los PDFs

### Boleta:
```
┌─────────────────────────────┐
│      BAZAR ABEM             │
│  RUC: 20123456789           │
│  Av. Principal 123, Lima    │
│  Tel: (01) 1234567          │
├─────────────────────────────┤
│   BOLETA DE VENTA           │
│   Nº 00000001               │
├─────────────────────────────┤
│ Cliente: Juan Pérez         │
│ Fecha: 01/12/2025           │
├─────────────────────────────┤
│ Descripción | Cant | Precio │
│ Producto 1  |  2   | S/ 50  │
├─────────────────────────────┤
│ TOTAL:              S/ 100  │
├─────────────────────────────┤
│ Método de Pago: Efectivo    │
├─────────────────────────────┤
│ Gracias por su compra       │
└─────────────────────────────┘
```

### Factura:
```
��──────────────────────────────────────┐
│  BAZAR ABEM                          │
│  RUC: 20123456789                    │
│  Av. Principal 123, Lima, Perú       │
│  Tel: (01) 1234567                   │
│  Email: info@bazarabem.com           │
├──────────────────────���───────────────┤
│  FACTURA ELECTRÓNICA                 │
│  F001-00000001                       │
│  Representación Impresa              │
├──────────────────────────────────────┤
│ DATOS DEL CLIENTE                    │
│ Razón Social: Juan Pérez             │
│ RUC/DNI: -                           │
│ Dirección: -                         │
├──────────────────────────────────────┤
│ Descripción | Cant | Precio | Total  │
│ Producto 1  |  2   | S/ 50  | S/ 100 │
├──────────────────────────────────────┤
│ Subtotal:           S/ 84.75         │
│ IGV (18%):          S/ 15.25         │
│ TOTAL A PAGAR:      S/ 100.00        │
├──────────────────────────────────────┤
│ NOTAS:                               │
│ Esta es una representación impresa   │
│ de la Factura Electrónica...         │
└──────────────────────────────────────┘
```

---

## 🎯 Ventajas de @react-pdf/renderer

1. **React-First Approach** - Usa componentes React para crear PDFs
2. **Estilos Consistentes** - StyleSheet similar a React Native
3. **Flexbox Layout** - Layouts complejos y responsivos
4. **Multipage Support** - Soporte para múltiples páginas
5. **Imágenes y Gráficos** - Soporte para imágenes vectoriales
6. **Sin Dependencias Externas** - Generación pura en JavaScript
7. **Descarga Directa** - PDFDownloadLink para descargas
8. **Vista Previa** - PDFViewer para previsualización

---

## 📱 Funcionalidades en los Modales

### Botón Boleta:
1. Abre modal con vista previa de boleta
2. Opción de descargar PDF
3. Opción de imprimir
4. Diseño profesional y limpio

### Botón Factura (Próximamente):
1. Abre modal con vista previa de factura
2. Opción de descargar PDF
3. Opción de imprimir
4. Diseño profesional con colores corporativos

### Botón Email:
1. Envía boleta y factura por email
2. Selección de documentos a enviar
3. Validación de email
4. Confirmación de envío

---

## 🔧 Configuración de Estilos

### Colores Corporativos:
- **Primario**: #1f2937 (Gris oscuro)
- **Secundario**: #6366f1 (Índigo)
- **Éxito**: #22c55e (Verde)
- **Advertencia**: #f59e0b (Ámbar)
- **Error**: #ef4444 (Rojo)

### Tipografía:
- **Fuente Principal**: Helvetica
- **Tamaño Base**: 10px
- **Títulos**: 18-24px
- **Subtítulos**: 9-12px

---

## 📝 Próximas Mejoras

1. **Logo Personalizado** - Agregar logo de la empresa en facturas
2. **Firma Digital** - Soporte para firmas digitales
3. **Código QR** - Incluir código QR en facturas
4. **Múltiples Idiomas** - Soporte para español/inglés
5. **Temas Personalizables** - Colores y estilos configurables
6. **Historial de PDFs** - Guardar PDFs generados
7. **Plantillas Personalizadas** - Crear plantillas propias

---

## 🚀 Uso

### Generar Boleta:
```tsx
import { BoletaPDF } from '@/components/pdf/BoletaPDF';
import { PDFDownloadLink } from '@react-pdf/renderer';

<PDFDownloadLink
  document={<BoletaPDF venta={venta} />}
  fileName={`boleta_${venta.id}.pdf`}
>
  Descargar Boleta
</PDFDownloadLink>
```

### Generar Factura:
```tsx
import { FacturaPDF } from '@/components/pdf/FacturaPDF';
import { PDFDownloadLink } from '@react-pdf/renderer';

<PDFDownloadLink
  document={<FacturaPDF venta={venta} />}
  fileName={`factura_${venta.id}.pdf`}
>
  Descargar Factura
</PDFDownloadLink>
```

---

## ✅ Checklist de Implementación

- [x] Instalar @react-pdf/renderer
- [x] Crear componente BoletaPDF
- [x] Crear componente FacturaPDF
- [x] Actualizar BolletaPrintModal
- [x] Crear FacturaPrintModal
- [x] Actualizar EmailModal
- [x] Estilos profesionales
- [x] Documentación completa
- [ ] Agregar logo personalizado
- [ ] Integrar código QR
- [ ] Soporte para múltiples idiomas

---

## 📞 Soporte

Si tienes problemas con los PDFs:
1. Verifica que @react-pdf/renderer esté instalado
2. Revisa la consola del navegador para errores
3. Asegúrate de que los datos de venta sean válidos
4. Intenta con un navegador diferente

---

## 🎉 Conclusión

Los PDFs ahora se generan de forma profesional usando @react-pdf/renderer, lo que garantiza:
- ✅ Diseño consistente
- ✅ Mejor rendimiento
- ✅ Fácil mantenimiento
- ✅ Escalabilidad
- ✅ Experiencia de usuario mejorada
