# Implementación de Acciones en Reportes

## Descripción General

Se ha implementado una columna de **Acciones** en la tabla de "Detalle de Ventas" en la página de reportes (`http://localhost:5173/reportes`). Esta columna contiene 3 botones que permiten:

1. **Gmail (Envelope)** - Enviar boleta y factura por email
2. **Boleta (Receipt)** - Ver e imprimir boleta
3. **WhatsApp (WhatsApp Icon)** - Enviar detalles de venta por WhatsApp

---

## Características Implementadas

### 1. **Botón Gmail - Enviar por Email**

**Funcionalidad:**
- Abre un modal para ingresar el email del cliente
- Envía automáticamente la boleta y factura en PDF al email especificado
- Incluye un mensaje profesional con los detalles de la venta

**Componente:** `EmailModal.tsx`
- Ubicación: `frontend/src/components/modals/EmailModal.tsx`
- Validación de email
- Interfaz intuitiva con detalles de la venta
- Indicador de carga durante el envío

**Backend:**
- Endpoint: `POST /comprobantes/:id/enviar-boleta-factura`
- Genera automáticamente boleta y factura en PDF
- Envía ambos documentos en un solo email
- Incluye HTML profesional con información de la venta

---

### 2. **Botón Boleta - Ver e Imprimir**

**Funcionalidad:**
- Abre un modal con vista previa de la boleta
- Permite imprimir directamente desde el navegador
- Formato profesional de boleta de venta

**Componente:** `BolletaPrintModal.tsx`
- Ubicación: `frontend/src/components/modals/BolletaPrintModal.tsx`
- Vista previa en tiempo real
- Botón de impresión integrado
- Diseño responsive

**Características de la Boleta:**
- Encabezado con datos de la empresa (BAZAR ABEM)
- Número de boleta
- Datos del cliente
- Tabla de productos con cantidades y precios
- Total de la venta
- Método de pago
- Código QR con información de la venta
- Pie de página profesional

---

### 3. **Botón WhatsApp - Enviar por WhatsApp**

**Funcionalidad:**
- Abre un modal para ingresar número de teléfono
- Valida que el número comience con +51 (Perú)
- Abre WhatsApp Web con mensaje pre-formateado
- Incluye todos los detalles de la venta

**Componente:** `WhatsAppModal.tsx`
- Ubicación: `frontend/src/components/modals/WhatsAppModal.tsx`
- Validación de formato de teléfono
- Mensaje formateado con detalles de venta
- Abre automáticamente WhatsApp Web

**Formato del Mensaje:**
```
*DETALLE DE VENTA*

*Cliente:* [Nombre del cliente]
*ID Venta:* #[ID]
*Fecha:* [Fecha formateada]
*Método de Pago:* [Método]

*Productos:*
[Lista de productos]

*Total:* S/ [Monto]

Gracias por su compra 🙏
```

---

## Archivos Creados/Modificados

### Frontend

#### Nuevos Archivos:
1. **`frontend/src/components/modals/EmailModal.tsx`**
   - Modal para envío de email
   - Validación de email
   - Integración con servicio de reportes

2. **`frontend/src/components/modals/WhatsAppModal.tsx`**
   - Modal para envío por WhatsApp
   - Validación de teléfono
   - Generación de URL de WhatsApp

3. **`frontend/src/components/modals/BolletaPrintModal.tsx`**
   - Modal con vista previa de boleta
   - Funcionalidad de impresión
   - Diseño profesional de boleta

#### Archivos Modificados:
1. **`frontend/src/pages/Reports.tsx`**
   - Agregada columna "Acciones" en tabla
   - Estados para gestionar modales
   - Botones con iconos para cada acción
   - Integración de los 3 modales

2. **`frontend/src/services/reportesService.ts`**
   - Nuevo método: `enviarEmailConBoleta()`
   - Integración con endpoint de backend

### Backend

#### Archivos Modificados:
1. **`backend/src/controllers/comprobantesController.ts`**
   - Nuevo controlador: `enviarBoletaYFactura()`
   - Genera boleta y factura
   - Envía ambas por email

2. **`backend/src/routes/comprobantes.ts`**
   - Nueva ruta: `POST /:id/enviar-boleta-factura`
   - Autenticación requerida

---

## Flujo de Funcionamiento

### Email (Gmail)
```
Usuario hace click en botón Email
    ↓
Se abre EmailModal
    ↓
Usuario ingresa email y hace click en "Enviar"
    ↓
Frontend valida email
    ↓
Se envía POST a /comprobantes/:id/enviar-boleta-factura
    ↓
Backend genera boleta PDF
    ↓
Backend genera factura PDF
    ↓
Backend envía ambos PDFs por email
    ↓
Se muestra mensaje de éxito
```

### Boleta (Impresión)
```
Usuario hace click en botón Boleta
    ↓
Se abre BolletaPrintModal
    ↓
Se muestra vista previa de boleta
    ↓
Usuario hace click en "Imprimir"
    ↓
Se abre diálogo de impresión del navegador
    ↓
Usuario imprime o guarda como PDF
```

### WhatsApp
```
Usuario hace click en botón WhatsApp
    ↓
Se abre WhatsAppModal
    ↓
Usuario ingresa número de teléfono
    ↓
Frontend valida formato (+51XXXXXXXXX)
    ↓
Se genera URL de WhatsApp con mensaje
    ↓
Se abre WhatsApp Web en nueva ventana
    ↓
Usuario envía el mensaje
```

---

## Requisitos de Configuración

### Backend - Variables de Entorno

Para que el envío de emails funcione, asegúrate de tener configuradas las siguientes variables en `.env`:

```env
# SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_ENCRYPTION=tls
SMTP_USERNAME=tu-email@gmail.com
SMTP_PASSWORD=tu-contraseña-app
SMTP_FROM_EMAIL=tu-email@gmail.com
SMTP_FROM_NAME=Bazar Abem
```

### Librerías Utilizadas

**Frontend:**
- `lucide-react` - Iconos (ya instalado)
- `sweetalert2` - Alertas (ya instalado)
- `react-hook-form` - Formularios (ya instalado)

**Backend:**
- `nodemailer` - Envío de emails (ya instalado)
- `pdfkit` - Generación de PDFs (ya instalado)
- `qrcode` - Generación de códigos QR (ya instalado)

---

## Estilos y Diseño

### Colores Utilizados:
- **Email**: Azul (`from-blue-600 to-purple-600`)
- **Boleta**: Naranja (`from-orange-600 to-red-600`)
- **WhatsApp**: Verde (`from-green-600 to-emerald-600`)

### Componentes Reutilizables:
- Modales con header, contenido y footer
- Botones con iconos de Font Awesome
- Validación de formularios
- Indicadores de carga

---

## Instrucciones de Uso

### Para el Usuario Final:

1. **Enviar por Email:**
   - Haz click en el botón de sobre (envelope)
   - Ingresa el email del cliente
   - Haz click en "Enviar"
   - Se enviarán boleta y factura automáticamente

2. **Ver Boleta:**
   - Haz click en el botón de recibo (receipt)
   - Se abrirá una vista previa de la boleta
   - Haz click en "Imprimir" para imprimir o guardar como PDF

3. **Enviar por WhatsApp:**
   - Haz click en el botón de WhatsApp
   - Ingresa el número de teléfono (con +51)
   - Haz click en "Enviar"
   - Se abrirá WhatsApp Web con el mensaje preparado
   - Revisa y envía el mensaje

---

## Validaciones Implementadas

### Email:
- ✅ No puede estar vacío
- ✅ Debe ser un email válido

### Teléfono (WhatsApp):
- ✅ Debe comenzar con +51
- ✅ Debe tener al menos 13 caracteres (+51 + 9 dígitos)
- ✅ Solo acepta números después del +51

### Venta:
- ✅ Debe existir en la base de datos
- ✅ Debe tener detalles de productos

---

## Manejo de Errores

Todos los modales incluyen:
- Validación de entrada
- Mensajes de error claros
- Indicadores de carga
- Manejo de excepciones
- Alertas SweetAlert2 para feedback del usuario

---

## Próximas Mejoras Sugeridas

1. **Historial de Envíos**: Guardar registro de emails y WhatsApp enviados
2. **Plantillas Personalizables**: Permitir personalizar mensajes de email
3. **Envío Masivo**: Enviar a múltiples clientes a la vez
4. **Confirmación de Entrega**: Verificar si el email fue entregado
5. **Integración con CRM**: Guardar información de contacto del cliente
6. **Descarga de Boleta**: Permitir descargar boleta sin imprimir
7. **Factura Electrónica**: Integración con SUNAT para facturas electrónicas

---

## Soporte y Troubleshooting

### El email no se envía:
1. Verifica que las variables de entorno SMTP estén configuradas
2. Verifica que la contraseña de la app sea correcta
3. Revisa los logs del backend para más detalles

### WhatsApp no abre:
1. Asegúrate de tener WhatsApp Web abierto en otra pestaña
2. Verifica que el número de teléfono sea válido
3. Intenta con un número diferente

### La boleta no se ve bien:
1. Intenta con un navegador diferente
2. Verifica que los datos de la venta estén completos
3. Revisa la consola del navegador para errores

---

## Conclusión

La implementación de acciones en reportes proporciona una forma rápida y eficiente de:
- Comunicarse con clientes por email
- Imprimir boletas profesionales
- Compartir información de ventas por WhatsApp

Todo esto desde una interfaz intuitiva y fácil de usar.
