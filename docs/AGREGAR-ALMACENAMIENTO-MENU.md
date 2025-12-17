# 📌 Agregar Almacenamiento al Menú

## Ubicación del Menú

El menú se encuentra en: `frontend/src/components/layout/Sidebar.tsx`

## Pasos para Agregar

### 1. Abrir el archivo Sidebar.tsx

```bash
cd frontend/src/components/layout
# Abrir Sidebar.tsx en tu editor
```

### 2. Buscar la sección de rutas

Busca donde están definidas las opciones del menú (generalmente en un array o condicionales).

### 3. Agregar la nueva ruta

Busca la línea donde está "Reportes" o "RUC" y agrega:

```jsx
// Para React Router v6
<Link to="/almacenamiento" className="...">
  <i className="fas fa-warehouse"></i>
  Almacenamiento
</Link>

// O si usas un array de rutas:
{
  path: '/almacenamiento',
  label: 'Almacenamiento',
  icon: 'fas fa-warehouse',
  requiredRole: 'Administrador' // Opcional
}
```

### 4. Actualizar el App.tsx

Abre `frontend/src/App.tsx` y agrega la ruta:

```jsx
import Almacenamiento from './pages/Almacenamiento';

// En el router:
<Route path="/almacenamiento" element={<Almacenamiento />} />
```

## Ejemplo Completo

### En Sidebar.tsx

```jsx
import { Link } from 'react-router-dom';

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <nav>
        <Link to="/dashboard">
          <i className="fas fa-chart-line"></i>
          Dashboard
        </Link>
        
        <Link to="/register-sale">
          <i className="fas fa-cash-register"></i>
          Registrar Venta
        </Link>
        
        <Link to="/almacenamiento">
          <i className="fas fa-warehouse"></i>
          Almacenamiento
        </Link>
        
        <Link to="/reports">
          <i className="fas fa-file-chart-line"></i>
          Reportes
        </Link>
        
        <Link to="/ruc">
          <i className="fas fa-receipt"></i>
          RUC
        </Link>
      </nav>
    </aside>
  );
}
```

### En App.tsx

```jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import RegisterSale from './pages/RegisterSale';
import Almacenamiento from './pages/Almacenamiento';
import Reports from './pages/Reports';
import RUC from './pages/RUC';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/register-sale" element={<RegisterSale />} />
        <Route path="/almacenamiento" element={<Almacenamiento />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/ruc" element={<RUC />} />
      </Routes>
    </Router>
  );
}

export default App;
```

## Iconos Disponibles

Puedes usar cualquiera de estos iconos de Font Awesome:

- `fas fa-warehouse` - Almacén (recomendado)
- `fas fa-boxes` - Cajas
- `fas fa-cubes` - Cubos
- `fas fa-package` - Paquete
- `fas fa-inventory` - Inventario
- `fas fa-store` - Tienda

## Estilos CSS

Si necesitas agregar estilos específicos:

```css
.sidebar a[href="/almacenamiento"] {
  /* Estilos personalizados */
}

.sidebar a[href="/almacenamiento"] i {
  color: #3b82f6; /* Azul */
}
```

## Verificación

Después de agregar:

1. Reinicia el servidor frontend: `npm run dev`
2. Abre la aplicación en el navegador
3. Verifica que aparece "Almacenamiento" en el menú
4. Haz clic y verifica que carga la página

## Agregar Widget de Alertas al Dashboard

Si quieres mostrar alertas en el dashboard:

### 1. Abrir Dashboard.tsx

```bash
cd frontend/src/pages
# Abrir Dashboard.tsx
```

### 2. Importar el widget

```jsx
import StockAlertsWidget from '@/components/common/StockAlertsWidget';
```

### 3. Agregar el widget

```jsx
export default function Dashboard() {
  return (
    <div className="dashboard-grid">
      {/* Otros widgets */}
      
      <div className="widget-section">
        <StockAlertsWidget />
      </div>
    </div>
  );
}
```

## Permisos (Opcional)

Si quieres restringir el acceso solo a administradores:

```jsx
import { useAuth } from '@/store/authStore';

export default function Sidebar() {
  const { user } = useAuth();
  
  return (
    <aside className="sidebar">
      <nav>
        {/* Otras rutas */}
        
        {user?.rol === 'Administrador' && (
          <Link to="/almacenamiento">
            <i className="fas fa-warehouse"></i>
            Almacenamiento
          </Link>
        )}
      </nav>
    </aside>
  );
}
```

## Troubleshooting

### El menú no aparece
- Verifica que importaste correctamente el componente
- Verifica que la ruta está registrada en App.tsx
- Reinicia el servidor

### La página no carga
- Verifica que el archivo Almacenamiento.tsx existe
- Verifica que no hay errores en la consola (F12)
- Verifica que el backend está corriendo

### Los datos no se cargan
- Verifica que el backend está en puerto 3000
- Verifica que la API responde: `http://localhost:3000/api/almacenamiento`
- Verifica que hay datos en la base de datos

## Próximos Pasos

1. ✅ Agregar ruta al menú
2. ✅ Agregar ruta en App.tsx
3. ✅ Verificar que funciona
4. ✅ Agregar widget al dashboard (opcional)
5. ✅ Configurar permisos (opcional)

---

**Menú Actualizado - Almacenamiento Agregado ✓**
