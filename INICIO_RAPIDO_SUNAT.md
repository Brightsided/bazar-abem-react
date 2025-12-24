# ⚡ Inicio Rápido - Facturación SUNAT

## 🎯 En 5 Minutos

### 1. Instalar Dependencias
```bash
cd backend
npm install
```

### 2. Actualizar Base de Datos
```bash
npx prisma migrate dev
```

### 3. Iniciar Servidor
```bash
npm run dev
```

### 4. Acceder a la Aplicación
```
Frontend: http://localhost:5173
Backend: http://localhost:3000
```

## 📝 Crear Primera Factura

### Paso 1: Registrar una Venta
1. Ir a "Registrar Venta"
2. Llenar datos:
   - Cliente: "Juan Pérez"
   - Productos: Seleccionar 2-3 productos
   - Método de Pago: Efectivo
3. Hacer clic en "Registrar Venta"

### Paso 2: Enviar a SUNAT
1. Ir a "Reportes"
2. Buscar la venta recién creada
3. Hacer clic en botón **SUNAT** (icono rojo de factura)
4. En el modal, hacer clic en "Enviar a SUNAT"
5. Esperar a que se procese

### Paso 3: Ver Resultado
- ✓ Si es **ACEPTADO**: Comprobante enviado correctamente
- ✕ Si es **RECHAZADO**: Revisar el mensaje de error
- Descargar XML y CDR si lo desea

## 🔑 Credenciales BETA

```
Usuario: MODDATOS
Password: MODDATOS
RUC Emisor: 20000000001
RUC Cliente: 20000000002
```

## 📊 Estructura de Datos

### Tabla: comprobantes_electronicos
```
id                  → ID único
venta_id            → Referencia a venta
tipo                → FACTURA o BOLETA
serie               → F001, B001, etc
numero              → Número correlativo
xmlSinFirma         → XML sin firmar
xmlFirmado          → XML con firma
cdrXml              → Respuesta de SUNAT
estado              → PENDIENTE, FIRMADO, ENVIADO, ACEPTADO, RECHAZADO
codigoSunat         → Código de respuesta
mensajeSunat        → Mensaje de SUNAT
fechaEnvio          → Cuándo se envió
intentosEnvio       → Número de intentos
```

## 🔗 Endpoints Principales

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/facturacion/procesar/:ventaId` | Generar, firmar y enviar |
| GET | `/api/facturacion/estado/:ventaId` | Ver estado |
| POST | `/api/facturacion/reenviar/:ventaId` | Reenviar si falló |
| GET | `/api/facturacion/xml/:ventaId` | Descargar XML |
| GET | `/api/facturacion/cdr/:ventaId` | Descargar CDR |
| GET | `/api/facturacion/listar` | Listar comprobantes |

## 🧪 Pruebas Rápidas

### Con cURL
```bash
# Procesar comprobante
curl -X POST http://localhost:3000/api/facturacion/procesar/1 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"tipo":"FACTURA"}'

# Ver estado
curl http://localhost:3000/api/facturacion/estado/1 \
  -H "Authorization: Bearer YOUR_TOKEN"

# Descargar XML
curl http://localhost:3000/api/facturacion/xml/1 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -o factura.xml
```

### Con Postman
1. Importar colección (próximamente)
2. Configurar token de autenticación
3. Ejecutar requests

## 📁 Archivos Clave

```
backend/
├── src/
│   ├── controllers/facturacionElectronicaController.ts
│   ├── services/sunatService.ts
│   └── routes/facturacion.ts
└── prisma/
    └── schema.prisma (actualizado)

frontend/
├── src/
│   ├── services/facturacionService.ts
│   ├── components/modals/SunatModal.tsx
│   └── pages/Reports.tsx (actualizado)
└── types/
    └── index.ts (actualizado)

database-init.sql (actualizado)
README_FACTURACION.md (documentación completa)
EJEMPLO_XML_FACTURA.xml (ejemplo de XML)
```

## ✅ Checklist de Verificación

- [ ] Dependencias instaladas
- [ ] Base de datos migrada
- [ ] Servidor backend corriendo
- [ ] Frontend accesible
- [ ] Venta creada
- [ ] Comprobante enviado a SUNAT
- [ ] Estado mostrado correctamente
- [ ] XML descargable
- [ ] CDR descargable

## 🐛 Errores Comunes

| Error | Solución |
|-------|----------|
| "Venta no encontrada" | Verificar ID de venta correcto |
| "Ya existe un comprobante" | La venta ya fue procesada |
| "Máximo número de intentos" | Revisar datos de la venta |
| "Error de conexión" | Verificar servidor backend |
| "Token inválido" | Hacer login nuevamente |

## 📚 Documentación Completa

Ver `README_FACTURACION.md` para:
- Instalación detallada
- Estructura de XML
- Todos los endpoints
- Troubleshooting completo
- Próximas fases

## 🚀 Próximos Pasos

1. **Probar en BETA** ← Estás aquí
2. Obtener certificado digital real
3. Cambiar a producción
4. Implementar homologación SUNAT
5. Agregar más tipos de comprobantes

## 💡 Tips

- En BETA, las respuestas son simuladas
- Máximo 3 intentos de envío por comprobante
- Los datos se guardan en `comprobantes_electronicos`
- Revisar logs del servidor para errores
- Usar Postman para probar APIs

## 📞 Soporte

1. Revisar `README_FACTURACION.md`
2. Revisar logs del servidor
3. Verificar base de datos
4. Consultar documentación de SUNAT

---

**¡Listo para facturar! 🎉**
