import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from './store/authStore';
import { useThemeStore } from './store/themeStore';
import { queryClient } from './config/queryClient';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import RegisterSale from './pages/RegisterSale';
import Almacenamiento from './pages/Almacenamiento';
import Reports from './pages/Reports';
import RUC from './pages/RUC';

// Layout
import Layout from './components/layout/Layout';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
}

function App() {
  const initialize = useAuthStore((state) => state.initialize);
  const isDark = useThemeStore((state) => state.isDark);

  useEffect(() => {
    // Inicializar autenticación desde localStorage
    initialize();
  }, []);

  useEffect(() => {
    // Aplicar tema oscuro
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Layout />
              </PrivateRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="registrar-venta" element={<RegisterSale />} />
            <Route path="almacenamiento" element={<Almacenamiento />} />
            <Route path="reportes" element={<Reports />} />
            <Route path="ruc" element={<RUC />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
