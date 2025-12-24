# 📋 Guía de Facturación Electrónica SUNAT - Bazar Abem

## 🎯 Descripción General

Este documento describe la implementación del sistema de Facturación Electrónica de SUNAT en la plataforma Bazar Abem. El sistema permite generar, firmar y enviar comprobantes electrónicos (facturas) a los servidores de SUNAT en ambiente BETA (pruebas).

## 🚀 Características Implementadas

### ✅ Funcionalidades Principales

1. **Generación de XML UBL 2.1**
   - Genera comprobantes en formato XML según estándar UBL 2.1
   - Incluye todos los nodos obligatorios según SUNAT
   - Soporta catálogos SUNAT correctos
   - Cálculo automático de IGV (18%)

2. **Firma Digital (Simulada en BETA)**
   - En ambiente BETA no requiere certificado digital real
   - Simula la firma con hash SHA-256
   - En producción se integraría con certificado digital real

3. **Envío a SUNAT BETA**
   - Conecta con servidores de prueba de SUNAT
   - URL WSDL: `https://e-beta.sunat.gob.pe/ol-ti-itcpfegem-beta/billService?wsdl`
   - Usuario demo: `MODDATOS`
   - Password demo: `MODDATOS`

4. **Gestión de Respuestas (CDR)**
   - Recibe y almacena Comprobante de Recepción (CDR)
   - Registra códigos de respuesta SUNAT
   - Permite descargar CDR en XML

5. **Seguimiento de Estado**
   - Estados: PENDIENTE → FIRMADO → ENVIADO → ACEPTADO/RECHAZADO
   - Reintento automático en caso de fallo
   - Máximo 3 intentos de envío

## 📦 Instalación

### 1. Instalar Dependencias

```bash
# Backend
cd backend
npm install

# Las siguientes librerías se agregaron automáticamente:
# - xmlbuilder2: Generación de XML
# - soap: Web Services SUNAT
# - node-forge: Firma digital simulada
# - date-fns: Manejo de fechas
```

### 2. Actualizar Base de Datos

```bash
# Ejecutar migration de Prisma
npx prisma migrate dev

# O ejecutar el SQL directamente
mysql -u root -p bazar_abem < database-init.sql
```

### 3. Configurar Variables de Entorno

```bash
# .env (Backend)
DATABASE_URL="mysql://user:password@localhost:3306/bazar_abem"
PORT=3000
NODE_ENV=development
```

## 🔧 Estructura de Archivos

### Backend

```
backend/src/
├── controllers/
│   └── facturacionElectronicaController.ts    # Controlador principal
├── services/
│   └── sunatService.ts                        # Lógica de SUNAT
├── routes/
│   └── facturacion.ts                         # Rutas de API
└── server.ts                                  # Servidor actualizado
```

### Frontend

```
frontend/src/
├── services/
│   └── facturacionService.ts                  # Cliente API
├── components/modals/
│   └── SunatModal.tsx                         # Modal de facturación
├── pages/
│   └── Reports.tsx                            # Página actualizada
└── types/
    └── index.ts                               # Tipos TypeScript
```

### Base de Datos

```sql
-- Nueva tabla
CREATE TABLE comprobantes_electronicos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  venta_id INT NOT NULL UNIQUE,
  tipo VARCHAR(50) NOT NULL,
  serie VARCHAR(10) NOT NULL,
  numero INT NOT NULL,
  xmlSinFirma LONGTEXT NOT NULL,
  xmlFirmado LONGTEXT NULL,
  cdrXml LONGTEXT NULL,
  hashCpe VARCHAR(255) NULL,
  estado VARCHAR(50) NOT NULL DEFAULT 'PENDIENTE',
  codigoSunat VARCHAR(50) NULL,
  mensajeSunat TEXT NULL,
  fechaEnvio DATETIME NULL,
  fechaRespuesta DATETIME NULL,
  intentosEnvio INT NOT NULL DEFAULT 0,
  ultimoError TEXT NULL,
  fecha_creacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (venta_id) REFERENCES ventas(id) ON DELETE CASCADE,
  INDEX idx_venta_id (venta_id),
  INDEX idx_estado (estado),
  INDEX idx_fecha_creacion (fecha_creacion),
  INDEX idx_serie_numero (serie, numero)
);
```

## 🎮 Cómo Usar

### 1. Acceder a Reportes

1. Ir a `http://localhost:5173/reportes`
2. Ver la tabla "Detalle de Ventas"

### 2. Enviar Comprobante a SUNAT

1. Hacer clic en el botón **SUNAT** (icono de factura roja) en la fila de la venta
2. Se abre el modal "Facturación Electrónica SUNAT"
3. Revisar información de la venta
4. Hacer clic en "Enviar a SUNAT"
5. Esperar a que se procese (genera XML, firma y envía)

### 3. Ver Estado

El modal muestra:
- ✓ **ACEPTADO**: Comprobante aceptado por SUNAT
- ✕ **RECHAZADO**: Comprobante rechazado (puede reenviar)
- ⏳ **PENDIENTE**: Aún no se ha procesado
- 📤 **ENVIADO**: Enviado pero sin respuesta

### 4. Descargar Documentos

- **Descargar XML**: Archivo XML del comprobante
- **Descargar CDR**: Comprobante de Recepción de SUNAT

## 📡 Endpoints API

### Generar Comprobante
```
POST /api/facturacion/generar
Body: { ventaId: number, tipo: 'FACTURA' | 'BOLETA' }
```

### Firmar Comprobante
```
POST /api/facturacion/firmar/:ventaId
```

### Enviar a SUNAT
```
POST /api/facturacion/enviar/:ventaId
```

### Procesar Completo (Generar + Firmar + Enviar)
```
POST /api/facturacion/procesar/:ventaId
Body: { tipo: 'FACTURA' | 'BOLETA' }
```

### Obtener Estado
```
GET /api/facturacion/estado/:ventaId
```

### Reenviar Comprobante
```
POST /api/facturacion/reenviar/:ventaId
```

### Listar Comprobantes
```
GET /api/facturacion/listar?estado=ACEPTADO&ventaId=1
```

### Descargar XML
```
GET /api/facturacion/xml/:ventaId
```

### Descargar CDR
```
GET /api/facturacion/cdr/:ventaId
```

### Obtener Detalles
```
GET /api/facturacion/detalles/:ventaId
```

## 🧪 Pruebas en BETA

### Credenciales de Prueba
- **Usuario**: MODDATOS
- **Password**: MODDATOS
- **RUC Emisor**: 20000000001 (de prueba)
- **RUC Cliente**: 20000000002 (de prueba)

### Pasos para Probar

1. **Crear una venta** en la sección "Registrar Venta"
2. **Ir a Reportes** y buscar la venta
3. **Hacer clic en botón SUNAT**
4. **Enviar a SUNAT BETA**
5. **Verificar respuesta** en el modal

### Respuestas Esperadas

En ambiente BETA, las respuestas son simuladas:
- Código SUNAT: `0` (Aceptado)
- Mensaje: "Comprobante recibido correctamente"
- CDR: Se genera automáticamente

## 🔐 Seguridad

### En Ambiente BETA
- ✅ No requiere certificado digital real
- ✅ Firma simulada con hash SHA-256
- ✅ Conexión a servidores de prueba

### En Producción (Próximas Fases)
- 🔒 Requerirá certificado digital real (.pfx)
- 🔒 Firma digital con certificado
- 🔒 Conexión a servidores de producción
- 🔒 Validaciones adicionales de SUNAT

## 📊 Estructura del XML Generado

```xml
<?xml version="1.0" encoding="UTF-8"?>
<Invoice xmlns="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2">
  <cbc:UBLVersionID>2.1</cbc:UBLVersionID>
  <cbc:CustomizationID>1.1</cbc:CustomizationID>
  <cbc:ID>F001-00000001</cbc:ID>
  <cbc:IssueDate>2024-01-15</cbc:IssueDate>
  <cbc:IssueTime>14:30:00</cbc:IssueTime>
  <cbc:InvoiceTypeCode>01</cbc:InvoiceTypeCode>
  <cbc:DocumentCurrencyCode>PEN</cbc:DocumentCurrencyCode>
  
  <!-- Emisor (Bazar Abem) -->
  <cac:AccountingSupplierParty>
    <cbc:CustomerAssignedAccountID>20000000001</cbc:CustomerAssignedAccountID>
    <cac:Party>
      <cac:PartyName>
        <cbc:Name>BAZAR ABEM S.A.C.</cbc:Name>
      </cac:PartyName>
      <cac:PostalAddress>
        <cbc:StreetName>Av. Principal 123, Lima, Perú</cbc:StreetName>
        <cbc:CityName>Lima</cbc:CityName>
      </cac:PostalAddress>
    </cac:Party>
  </cac:AccountingSupplierParty>
  
  <!-- Cliente -->
  <cac:AccountingCustomerParty>
    <cbc:CustomerAssignedAccountID>20000000002</cbc:CustomerAssignedAccountID>
    <cac:Party>
      <cac:PartyName>
        <cbc:Name>Nombre del Cliente</cbc:Name>
      </cac:PartyName>
    </cac:Party>
  </cac:AccountingCustomerParty>
  
  <!-- Detalles de líneas -->
  <cac:InvoiceLine>
    <cbc:ID>1</cbc:ID>
    <cbc:InvoicedQuantity unitCode="NIU">2</cbc:InvoicedQuantity>
    <cbc:LineExtensionAmount currencyID="PEN">10.00</cbc:LineExtensionAmount>
    <cac:Item>
      <cbc:Description>Producto 1</cbc:Description>
    </cac:Item>
    <cac:Price>
      <cbc:PriceAmount currencyID="PEN">5.00</cbc:PriceAmount>
    </cac:Price>
  </cac:InvoiceLine>
  
  <!-- Totales -->
  <cac:TaxTotal>
    <cbc:TaxAmount currencyID="PEN">1.80</cbc:TaxAmount>
  </cac:TaxTotal>
  
  <cac:LegalMonetaryTotal>
    <cbc:LineExtensionAmount currencyID="PEN">10.00</cbc:LineExtensionAmount>
    <cbc:TaxInclusiveAmount currencyID="PEN">11.80</cbc:TaxInclusiveAmount>
    <cbc:PayableAmount currencyID="PEN">11.80</cbc:PayableAmount>
  </cac:LegalMonetaryTotal>
</Invoice>
```

## 🐛 Troubleshooting

### Problema: "Error al conectar con SUNAT"
**Solución**: 
- Verificar conexión a internet
- Verificar que la URL WSDL sea correcta
- En BETA, la respuesta es simulada

### Problema: "Comprobante no encontrado"
**Solución**:
- Verificar que la venta existe
- Verificar que el ID de venta es correcto

### Problema: "XML inválido"
**Solución**:
- Verificar que todos los campos requeridos estén completos
- Verificar formato de fechas (YYYY-MM-DD)
- Verificar montos sean números válidos

### Problema: "Máximo número de intentos alcanzado"
**Solución**:
- Revisar el error en el campo "ultimoError"
- Corregir los datos de la venta
- Crear una nueva venta

## 📚 Referencias

- [Estándar UBL 2.1](https://docs.oasis-open.org/ubl/os-UBL-2.1/)
- [SUNAT - Facturación Electrónica](https://www.sunat.gob.pe/orientacionaduanera/ruc/facturacionelectronica.html)
- [Catálogos SUNAT](https://www.sunat.gob.pe/orientacionaduanera/ruc/catalogos.html)
- [Documentación Greenter](https://fe-primer.greenter.dev/)

## 🔄 Próximas Fases

### Fase 2: Homologación
- [ ] Obtener certificado digital real
- [ ] Integrar con certificado en backend
- [ ] Cambiar a ambiente de producción
- [ ] Realizar pruebas de homologación con SUNAT

### Fase 3: Mejoras
- [ ] Soporte para Boletas
- [ ] Notas de Crédito/Débito
- [ ] Retenciones
- [ ] Percepciones
- [ ] Guías de Remisión

### Fase 4: Integraciones
- [ ] Integración con contabilidad
- [ ] Reportes de comprobantes
- [ ] Auditoría de cambios
- [ ] Sincronización con SUNAT

## 📞 Soporte

Para reportar problemas o sugerencias:
1. Revisar la sección "Troubleshooting"
2. Consultar los logs en la consola del servidor
3. Verificar la base de datos (tabla `comprobantes_electronicos`)

## 📄 Licencia

Este módulo es parte de Bazar Abem y sigue la misma licencia del proyecto.

---

**Última actualización**: Enero 2024
**Versión**: 1.0.0 (BETA)
**Estado**: ✅ Funcional en ambiente de pruebas
