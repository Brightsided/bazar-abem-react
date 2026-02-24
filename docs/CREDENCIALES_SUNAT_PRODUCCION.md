# 🔐 Guía: Credenciales Reales de SUNAT para Producción

## 📋 Parte 1: Obtener Credenciales Reales de SUNAT

### Paso 1: Requisitos Previos

Antes de solicitar acceso a SUNAT, necesitas:

1. **RUC de tu empresa** (Número de Identificación Tributaria)
   - Obtener en: https://www.sunat.gob.pe/
   - Debe estar activo y habilitado

2. **Certificado Digital** (.pfx o .p12)
   - Obtener en: https://www.sunat.gob.pe/
   - Costo: Aproximadamente S/. 50-100
   - Validez: 1 año
   - Incluye: Clave privada + certificado público

3. **Datos de la empresa**
   - Razón social
   - Dirección fiscal
   - Teléfono
   - Email

### Paso 2: Solicitar Acceso a SUNAT

1. **Ir a Portal de SUNAT**
   - URL: https://www.sunat.gob.pe/
   - Sección: "Facturación Electrónica"

2. **Registrarse como Emisor**
   - Completar formulario de solicitud
   - Adjuntar documentos requeridos
   - Esperar aprobación (3-5 días hábiles)

3. **Obtener Credenciales**
   - Usuario: Tu RUC
   - Contraseña: Generada por SUNAT
   - Certificado digital: Descargado

### Paso 3: Obtener Certificado Digital

**Opciones:**
- **SUNAT**: https://www.sunat.gob.pe/
- **Autoridades Certificantes Autorizadas**:
  - Certisign
  - Verisign
  - Thawte
  - Otros

**Proceso:**
1. Solicitar certificado
2. Pagar arancel
3. Descargar archivo .pfx
4. Guardar contraseña del certificado

---

## 🔧 Parte 2: Integrar Credenciales Reales en el Sistema

### Paso 1: Actualizar Variables de Entorno

Editar `backend/.env`:

```env
# SUNAT - Ambiente PRODUCCIÓN
SUNAT_WSDL_URL="https://e-factura.sunat.gob.pe/ol-ti-itcpfegem/billService?wsdl"
SUNAT_USERNAME="tu_ruc_aqui"
SUNAT_PASSWORD="tu_password_sunat"
SUNAT_RUC_EMISOR="tu_ruc_aqui"
SUNAT_RAZON_SOCIAL="Tu Empresa S.A.C."
SUNAT_DIRECCION="Tu dirección fiscal"

# Certificado Digital
SUNAT_CERT_PATH="./certs/certificado.pfx"
SUNAT_CERT_PASSWORD="contraseña_del_certificado"

# Configuración
SUNAT_AMBIENTE="produccion"
```

### Paso 2: Guardar Certificado Digital

1. **Crear carpeta de certificados**
   ```bash
   mkdir backend/certs
   ```

2. **Copiar archivo .pfx**
   - Copiar tu certificado.pfx a `backend/certs/`
   - Renombrarlo a `certificado.pfx`

3. **Proteger la carpeta**
   ```bash
   # En .gitignore, agregar:
   backend/certs/
   ```

### Paso 3: Actualizar sunatService.ts

Reemplazar la configuración simulada con la real:

```typescript
// backend/src/services/sunatService.ts

import fs from 'fs';
import path from 'path';
import forge from 'node-forge';

// Configuración SUNAT PRODUCCIÓN
const SUNAT_CONFIG = {
  wsdlUrl: process.env.SUNAT_WSDL_URL || 'https://e-factura.sunat.gob.pe/ol-ti-itcpfegem/billService?wsdl',
  usuario: process.env.SUNAT_USERNAME || '',
  password: process.env.SUNAT_PASSWORD || '',
  rucEmisor: process.env.SUNAT_RUC_EMISOR || '',
  razonSocialEmisor: process.env.SUNAT_RAZON_SOCIAL || '',
  direccionEmisor: process.env.SUNAT_DIRECCION || '',
  certPath: process.env.SUNAT_CERT_PATH || '',
  certPassword: process.env.SUNAT_CERT_PASSWORD || '',
  ambiente: process.env.SUNAT_AMBIENTE || 'beta',
};

/**
 * Cargar certificado digital
 */
export const cargarCertificado = () => {
  try {
    if (!SUNAT_CONFIG.certPath) {
      throw new Error('Ruta del certificado no configurada');
    }

    const certPath = path.resolve(SUNAT_CONFIG.certPath);
    const certData = fs.readFileSync(certPath);
    
    // Convertir a formato PEM
    const p12 = forge.asn1.fromDer(certData.toString('binary'));
    const pkcs12 = forge.pkcs12.pkcs12FromAsn1(p12, SUNAT_CONFIG.certPassword);
    
    return pkcs12;
  } catch (error) {
    console.error('Error cargando certificado:', error);
    throw error;
  }
};

/**
 * Firmar XML con certificado digital real
 */
export const firmarXmlReal = async (xmlContent: string): Promise<string> => {
  try {
    const pkcs12 = cargarCertificado();
    
    // Obtener clave privada y certificado
    const keyBags = pkcs12.getBags({ bagType: forge.pki.oids.pkcs8ShroudedKeyBag });
    const certBags = pkcs12.getBags({ bagType: forge.pki.oids.certBag });
    
    const privateKey = keyBags[forge.pki.oids.pkcs8ShroudedKeyBag][0].key;
    const certificate = certBags[forge.pki.oids.certBag][0].cert;
    
    // Crear firma
    const md = forge.md.sha256.create();
    md.update(xmlContent, 'utf8');
    
    const signature = privateKey.sign(md);
    const signatureBase64 = forge.util.encode64(signature);
    
    // Agregar firma al XML
    const xmlFirmado = xmlContent.replace(
      '</Invoice>',
      `<cac:Signature>
        <cbc:ID>1</cbc:ID>
        <cbc:SignatureMethod>urn:digicert:signature:rsa-sha256</cbc:SignatureMethod>
        <cbc:SignatureValue>${signatureBase64}</cbc:SignatureValue>
        <cac:SignatoryParty>
          <cac:PartyIdentification>
            <cbc:ID>${SUNAT_CONFIG.rucEmisor}</cbc:ID>
          </cac:PartyIdentification>
        </cac:SignatoryParty>
      </cac:Signature>
    </Invoice>`
    );
    
    return xmlFirmado;
  } catch (error) {
    console.error('Error firmando XML:', error);
    throw error;
  }
};

/**
 * Enviar a SUNAT PRODUCCIÓN
 */
export const enviarASunatProduccion = async (
  ventaId: number,
  xmlFirmado: string
): Promise<{ success: boolean; codigoSunat?: string; mensajeSunat?: string; cdrXml?: string }> => {
  try {
    // Aquí iría la llamada real al WSDL de SUNAT
    // Usando librería 'soap'
    
    const soap = require('soap');
    
    const client = await soap.createClientAsync(SUNAT_CONFIG.wsdlUrl);
    
    // Llamar al servicio de SUNAT
    const resultado = await client.sendBillAsync({
      fileName: `${SUNAT_CONFIG.rucEmisor}-01-${ventaId}`,
      contentFile: Buffer.from(xmlFirmado).toString('base64'),
      userName: SUNAT_CONFIG.usuario,
      password: SUNAT_CONFIG.password,
    });
    
    // Procesar respuesta
    const respuesta = resultado[0];
    
    if (respuesta.statusCode === '0') {
      // Éxito
      return {
        success: true,
        codigoSunat: respuesta.statusCode,
        mensajeSunat: respuesta.statusMessage,
        cdrXml: respuesta.cdrFile,
      };
    } else {
      // Error
      return {
        success: false,
        codigoSunat: respuesta.statusCode,
        mensajeSunat: respuesta.statusMessage,
      };
    }
  } catch (error) {
    console.error('Error enviando a SUNAT:', error);
    return {
      success: false,
      mensajeSunat: String(error),
    };
  }
};
```

### Paso 4: Actualizar Controlador

```typescript
// backend/src/controllers/facturacionElectronicaController.ts

import { firmarXmlReal, enviarASunatProduccion } from '../services/sunatService.js';

export const procesarComprobante = async (req: AuthRequest, res: Response) => {
  try {
    const { ventaId } = req.params;
    const { tipo = 'FACTURA' } = req.body;

    // Generar XML
    const xmlSinFirma = await generarXmlFactura(parseInt(ventaId));
    const hashCpe = generarHashCpe(xmlSinFirma);

    // Firmar XML (REAL en producción)
    const ambiente = process.env.SUNAT_AMBIENTE || 'beta';
    let xmlFirmado: string;
    
    if (ambiente === 'produccion') {
      xmlFirmado = await firmarXmlReal(xmlSinFirma);
    } else {
      xmlFirmado = await firmarXml(xmlSinFirma); // Simulado en BETA
    }

    // Enviar a SUNAT
    let resultado;
    if (ambiente === 'produccion') {
      resultado = await enviarASunatProduccion(parseInt(ventaId), xmlFirmado);
    } else {
      resultado = await enviarASunatBeta(parseInt(ventaId), xmlFirmado);
    }

    // ... resto del código
  } catch (error) {
    // ... manejo de errores
  }
};
```

---

## 🚀 Paso 3: Cambiar de BETA a PRODUCCIÓN

### Checklist de Migración

- [ ] Obtener certificado digital real
- [ ] Solicitar acceso a SUNAT producción
- [ ] Guardar certificado en `backend/certs/`
- [ ] Actualizar `.env` con credenciales reales
- [ ] Cambiar `SUNAT_AMBIENTE=produccion`
- [ ] Cambiar URL WSDL a producción
- [ ] Probar con una factura de prueba
- [ ] Verificar respuesta CDR
- [ ] Monitorear logs

### Comando para Cambiar Ambiente

```bash
# BETA (actual)
SUNAT_AMBIENTE=beta npm run dev

# PRODUCCIÓN
SUNAT_AMBIENTE=produccion npm run dev
```

---

## 📊 Comparación: BETA vs PRODUCCIÓN

| Aspecto | BETA | PRODUCCIÓN |
|---------|------|-----------|
| **URL WSDL** | e-beta.sunat.gob.pe | e-factura.sunat.gob.pe |
| **Usuario** | MODDATOS | Tu RUC |
| **Contraseña** | MODDATOS | Tu password SUNAT |
| **Certificado** | No requerido | Requerido (.pfx) |
| **Firma** | Simulada | Real (RSA-SHA256) |
| **Respuesta** | Simulada | Real de SUNAT |
| **Validez** | Solo pruebas | Válido legalmente |

---

## 🔍 Validación de Certificado

```bash
# Ver información del certificado
openssl pkcs12 -in certificado.pfx -info -noout

# Extraer clave privada
openssl pkcs12 -in certificado.pfx -nocerts -out private.key

# Extraer certificado
openssl pkcs12 -in certificado.pfx -nokeys -out certificate.crt
```

---

## 🆘 Troubleshooting

### Error: "Certificado no encontrado"
- Verificar ruta en `.env`
- Verificar permisos del archivo
- Verificar formato (.pfx)

### Error: "Contraseña del certificado incorrecta"
- Verificar contraseña en `.env`
- Probar con OpenSSL

### Error: "Usuario/Contraseña SUNAT inválidos"
- Verificar credenciales en SUNAT
- Verificar que la empresa esté habilitada
- Contactar a SUNAT

### Error: "Certificado expirado"
- Renovar certificado en autoridad certificante
- Actualizar archivo .pfx
- Actualizar contraseña si cambió

---

## 📞 Contacto SUNAT

- **Teléfono**: +51 1 311-5000
- **Email**: servicioalcliente@sunat.gob.pe
- **Portal**: https://www.sunat.gob.pe/
- **Soporte Facturación**: https://www.sunat.gob.pe/facturacionelectronica

---

## 📚 Referencias

- [SUNAT - Facturación Electrónica](https://www.sunat.gob.pe/facturacionelectronica)
- [Estándar UBL 2.1](https://docs.oasis-open.org/ubl/os-UBL-2.1/)
- [Catálogos SUNAT](https://www.sunat.gob.pe/orientacionaduanera/ruc/catalogos.html)
- [Documentación Técnica SUNAT](https://www.sunat.gob.pe/orientacionaduanera/ruc/facturacionelectronica.html)

---

**Versión**: 1.0
**Última actualización**: Enero 2024
**Estado**: Listo para producción
