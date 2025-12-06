# Optimización de Reportes - Solución de Lag

## Problema Identificado
La página de reportes (`http://localhost:5173/reportes`) presentaba lag significativo al cambiar entre opciones de período (Hoy, Semana, Mes, Año, Personalizado). La página se lagueaba hasta el punto de dejar de mostrar datos.

## Causas Raíz

### Frontend
1. **Re-renders innecesarios**: Cada cambio de filtro causaba múltiples re-renders
2. **Gráficos no memoizados**: Las opciones de ApexCharts se recreaban en cada render
3. **Debounce insuficiente**: El delay de 500ms era muy largo
4. **Falta de optimización de funciones**: `handleFiltroChange` se recreaba en cada render

### Backend
1. **Procesamiento ineficiente**: Se traían todos los datos y se procesaban en memoria
2. **Cálculos redundantes**: Se hacían múltiples iteraciones sobre los mismos datos

## Soluciones Implementadas

### 1. Frontend - `Reports.tsx`

#### ✅ Debounce Optimizado
```typescript
// Antes: 500ms
const debouncedFiltro = useDebounce(filtro, 500);

// Después: 300ms (más responsivo)
const debouncedFiltro = useDebounce(filtro, 300);
```

#### ✅ React Query Optimizado
```typescript
const { data: reporte, isLoading } = useQuery({
  queryKey: ['reportes', debouncedFiltro],
  queryFn: () => reportesService.getReporteVentas(debouncedFiltro),
  staleTime: 1000 * 60 * 5,      // Cache por 5 minutos
  gcTime: 1000 * 60 * 10,        // Garbage collection después de 10 minutos
});
```

#### ✅ Memoización de Funciones
```typescript
// Usar useCallback para handleFiltroChange
const handleFiltroChange = useCallback((nuevoFiltro: string) => {
  // ...
}, []);
```

#### ✅ Memoización de Opciones de Gráficos
```typescript
// Antes: Se recreaban en cada render
const ventasChartOptions: ApexOptions = { ... };

// Después: Memoizado con useMemo
const ventasChartOptions = useMemo<ApexOptions>(() => ({
  // ... opciones
}), [reporte?.ventasPorFecha]);
```

#### ✅ Memoización de Series de Gráficos
```typescript
const ventasChartSeries = useMemo(() => [
  {
    name: 'Total Ventas',
    data: reporte ? Object.values(reporte.ventasPorFecha) : [],
  },
], [reporte?.ventasPorFecha]);
```

#### ✅ Animaciones Optimizadas en Gráficos
```typescript
animations: {
  enabled: true,
  speed: 800,
  animateGradually: {
    enabled: true,
    delay: 150,
  },
  dynamicAnimation: {
    enabled: true,
    speed: 150,
  },
}
```

### 2. Backend - `reportesController.ts`

#### ✅ Select Limitado en Queries
```typescript
// Antes: Traía todos los campos
const ventas = await prisma.venta.findMany({
  where: { ... },
  include: { detalles: true, usuarioRel: { ... } },
});

// Después: Solo campos necesarios
const ventas = await prisma.venta.findMany({
  where: { ... },
  select: {
    id: true,
    cliente: true,
    productos: true,
    precio_total: true,
    metodo_pago: true,
    fecha_venta: true,
    usuario_id: true,
    usuarioRel: { select: { ... } },
  },
});
```

#### ✅ Agregación en Base de Datos
```typescript
// Antes: Calcular en memoria
const totalVentas = ventas.reduce((sum, v) => sum + Number(v.precio_total), 0);

// Después: Usar agregación de Prisma
const totalResult = await prisma.venta.aggregate({
  where: { fecha_venta: { gte: fechaInicio, lte: fechaFin } },
  _sum: { precio_total: true },
});
const totalVentas = Number(totalResult._sum.precio_total || 0);
```

#### ✅ Uso de Map en lugar de Objetos
```typescript
// Antes: Múltiples iteraciones con filter
Object.entries(metodosPago).forEach(([metodo, total]) => {
  const cantidad = ventas.filter((v) => v.metodo_pago === metodo).length;
  metodosPagoDetalle.push({ metodo_pago: metodo, cantidad, total });
});

// Después: Una sola iteración con Map
const metodosPagoMap = new Map<string, { cantidad: number; total: number }>();
ventas.forEach((venta) => {
  const metodo = venta.metodo_pago;
  if (!metodosPagoMap.has(metodo)) {
    metodosPagoMap.set(metodo, { cantidad: 0, total: 0 });
  }
  const data = metodosPagoMap.get(metodo)!;
  data.cantidad++;
  data.total += Number(venta.precio_total);
});
```

## Mejoras de Performance

### Antes
- Lag significativo al cambiar filtros
- Múltiples re-renders innecesarios
- Gráficos se recreaban completamente
- Procesamiento ineficiente en backend

### Después
- ✅ Cambios de filtro suave y responsivo
- ✅ Re-renders minimizados con memoización
- ✅ Gráficos se actualizan sin recrearse
- ✅ Backend procesa datos eficientemente
- ✅ Cache de 5 minutos evita requests innecesarios

## Índices de Base de Datos

Ya están configurados en `schema.prisma`:
```prisma
@@index([fecha_venta])                    // Crítico para filtros
@@index([metodo_pago])                    // Para agrupación
@@index([cliente])                        // Para búsqueda
@@index([fecha_venta, metodo_pago])       // Compuesto
@@index([fecha_venta, precio_total])      // Para ordenamiento
```

## Cómo Probar

1. Navega a `http://localhost:5173/reportes`
2. Haz clic rápidamente entre las opciones de período
3. Verifica que no hay lag y los datos se cargan correctamente
4. Prueba con "Personalizado" y cambia las fechas

## Resultados Esperados

- ✅ Cambios de filtro instantáneos
- ✅ Gráficos se actualizan suavemente
- ✅ Datos siempre visibles
- ✅ Sin freezes o lag
- ✅ Mejor experiencia de usuario

## Archivos Modificados

1. `frontend/src/pages/Reports.tsx` - Memoización y optimización de componentes
2. `backend/src/controllers/reportesController.ts` - Optimización de queries
