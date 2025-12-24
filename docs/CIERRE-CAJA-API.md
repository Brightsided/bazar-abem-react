# Cierre de Caja (Implementación en este proyecto)

Este documento describe cómo funciona el **Cierre de Caja** implementado en el backend, cómo se relaciona con el sistema actual (Ventas), y cómo integrarlo como opción visible en el sidebar del frontend.

> Estado actual: Implementación enfocada en **control y consolidación de ventas** por usuario y rango de caja (apertura → cierre).

---

## 1) ¿Qué problema resuelve?

El Cierre de Caja permite:

- **Abrir caja** con un monto inicial (efectivo en caja al iniciar turno).
- **Consolidar ventas** realizadas durante el turno (desde apertura hasta cierre) y **separarlas por método de pago**.
- **Cerrar caja** registrando el monto final contado (arqueo) y guardando un resumen histórico.

En este sistema, el cierre de caja se calcula a partir de la tabla `ventas` existente.

---

## 2) Modelo de datos

Se agregó el modelo Prisma `CierreCaja` y su tabla `cierres_caja`.

### Tabla: `cierres_caja`
Campos principales:

- `usuario_id`: el usuario dueño del turno/caja.
- `fecha_apertura`: fecha/hora cuando se abrió.
- `fecha_cierre`: fecha/hora cuando se cerró.
- `estado`: `ABIERTO` o `CERRADO`.

Montos:
- `monto_inicial`: efectivo inicial.
- `monto_final`: efectivo final contado al cierre (arqueo).

Consolidación de ventas:
- `total_ventas`: total vendido (todas las formas de pago).
- `total_efectivo`, `total_yape`, `total_plin`, `total_tarjeta`, `total_transferencia`, `total_otro`: totales por método.

Otros:
- `observaciones`: texto opcional.

Relación:
- `Usuario (1) -> (N) CierreCaja`

---

## 3) Lógica de cálculo (cómo se obtienen los totales)

La consolidación se calcula con las ventas existentes:

- Rango de ventas considerado:
  - Si hay caja `ABIERTO`: desde `fecha_apertura` hasta `now()`.
  - Si NO hay caja `ABIERTO`: se usa rango “hoy” (desde 00:00 hasta ahora) solo para **preview**.

- Filtro por usuario:
  - Por defecto, el cálculo y la lectura se realizan para el **usuario autenticado** (`req.user.id`).

- Normalización de método de pago:
  - `Efectivo` → `EFECTIVO`
  - `Yape` → `YAPE`
  - `Plin` → `PLIN`
  - `Tarjeta|Visa|Mastercard` → `TARJETA`
  - `Transferencia` → `TRANSFERENCIA`
  - cualquier otro → `OTRO`

> Nota: En `ventas.metodo_pago` actualmente se guardan strings. El cierre usa normalización para agrupar correctamente.

---

## 4) Endpoints disponibles (Backend)

Base path:

- `GET/POST /api/cierre-caja/*`

Todos requieren JWT (middleware `authenticate`).

### 4.1) Obtener estado actual de caja

**GET** `/api/cierre-caja/estado`

Devuelve si existe una caja abierta para el usuario autenticado.

Respuesta típica:
- `{ abierto: null }` si no hay caja abierta
- `{ abierto: {...} }` si hay

### 4.2) Previsualizar cierre (preview)

**GET** `/api/cierre-caja/preview`

Calcula totales para el usuario autenticado.

- Si hay caja abierta: calcula desde apertura → ahora.
- Si no hay caja abierta: calcula desde hoy 00:00 → ahora.

Devuelve:
- `rango.desde`, `rango.hasta`
- `totales` (total ventas y por método)
- `estimado_monto_final`: **monto_inicial + total_efectivo** (estimado de efectivo esperado en caja)

### 4.3) Abrir caja

**POST** `/api/cierre-caja/abrir`

Body:
```json
{
  "monto_inicial": 50,
  "observaciones": "Inicio de turno mañana"
}
```

Reglas:
- No permite abrir si ya existe una caja `ABIERTO` del usuario.

### 4.4) Cerrar caja

**POST** `/api/cierre-caja/cerrar`

Body:
```json
{
  "monto_final": 120.50,
  "observaciones": "Arqueo OK"
}
```

Acción:
- Busca la caja abierta del usuario.
- Calcula totales desde `fecha_apertura` hasta ahora.
- Actualiza el registro:
  - `estado = CERRADO`
  - `fecha_cierre = now()`
  - setea totales por método
  - guarda `monto_final`

### 4.5) Listar cierres

**GET** `/api/cierre-caja`

Query opcional:
- `desde=YYYY-MM-DD`
- `hasta=YYYY-MM-DD`
- `usuario_id=123` (útil para admin)

Comportamiento:
- Si no envías `usuario_id`, lista los cierres del usuario autenticado.

---

## 5) Flujo recomendado de uso en el sistema actual

1. **El usuario inicia sesión** (obtiene JWT).
2. Va a “Cierre de Caja” (pantalla nueva en frontend).
3. El frontend consulta `/api/cierre-caja/estado`.
4. Si no hay caja abierta:
   - muestra botón “Abrir caja” y solicita `monto_inicial`.
5. Si hay caja abierta:
   - muestra “Caja abierta” + botón “Preview” y “Cerrar caja”.
6. En “Preview” se consulta `/api/cierre-caja/preview`.
7. Al cerrar:
   - el usuario ingresa el `monto_final` contado (arqueo real)
   - se llama `/api/cierre-caja/cerrar`
   - se guarda el resumen histórico.

---

## 6) ¿Se puede ver como opción en el sidebar?

Sí. El backend ya tiene los endpoints y la persistencia.

### Qué falta para verlo en el sidebar

Frontend (React) necesita:

1) Un **ítem de navegación** en el sidebar/menu (por ejemplo en `frontend/src/components/layout/...`).
2) Una **página** nueva (ej: `frontend/src/pages/CierreCaja.tsx`).
3) Un **service** para consumir el API (ej: `frontend/src/services/cierreCajaService.ts`).

### Recomendación de permisos

- Mostrar a `Administrador` y `Vendedor`.
- Para admin: permitir listar cierres de todos (usando query `usuario_id`).

---

## 7) Ejemplos con curl

> Reemplaza `TOKEN` por tu JWT.

### Estado
```bash
curl -H "Authorization: Bearer TOKEN" http://localhost:3000/api/cierre-caja/estado
```

### Abrir caja
```bash
curl -X POST \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"monto_inicial\": 50, \"observaciones\": \"Inicio\"}" \
  http://localhost:3000/api/cierre-caja/abrir
```

### Preview
```bash
curl -H "Authorization: Bearer TOKEN" http://localhost:3000/api/cierre-caja/preview
```

### Cerrar caja
```bash
curl -X POST \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"monto_final\": 120.50, \"observaciones\": \"Arqueo OK\"}" \
  http://localhost:3000/api/cierre-caja/cerrar
```

---

## 8) Seed / datos de prueba

El seed crea una caja abierta de ejemplo:

- Usuario: `admin`
- `monto_inicial`: 50
- `estado`: `ABIERTO`

Para resetear y cargar todo de nuevo:

```bash
cd backend
npx prisma migrate reset
npx prisma db seed
```

---

## 9) Limitaciones actuales (y mejoras sugeridas)

1) **No hay tabla de movimientos de caja** (ingresos/egresos no-venta). Si quieres registrar gastos, retiros, ingresos extras, se recomienda crear:
   - `movimientos_caja` con `tipo: INGRESO|EGRESO`, `monto`, `motivo`, `usuario_id`, `cierre_caja_id`.

2) **Ventas anuladas / descuentos**:
   - En el schema actual `ventas` no tiene flags de anulación ni descuentos, por eso `total_anulaciones` y `total_descuentos` quedan en 0. Para soportarlo de verdad habría que extender `Venta`.

3) Concurrencia:
   - Se controla “1 caja abierta por usuario”, pero no “1 caja global”. Si tu negocio usa una única caja para todos, se debe cambiar la regla.
