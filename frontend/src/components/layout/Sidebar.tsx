import { NavLink } from 'react-router-dom';
import logo from '@/assets/images/Logo.svg';

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

const Sidebar = ({ isOpen, toggleSidebar }: SidebarProps) => {
  const menuItems = [
    { path: '/', icon: 'fa-home', label: 'Dashboard' },
    { path: '/registrar-venta', icon: 'fa-cash-register', label: 'Registrar Venta' },
    { path: '/cierre-caja', icon: 'fa-coins', label: 'Cierre de Caja' },
    { path: '/almacenamiento', icon: 'fa-warehouse', label: 'Almacenamiento' },
    { path: '/reportes', icon: 'fa-chart-line', label: 'Reportes' },
    { path: '/ruc', icon: 'fa-calculator', label: 'Calcular RUC' },
  ];

  return (
    <>
      <aside
        className={`${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } fixed left-0 top-0 h-screen w-64 bg-white dark:bg-surface-900 border-r border-surface-200 dark:border-surface-800 transition-transform duration-300 overflow-hidden z-50`}
      >
        <div className="h-full flex flex-col">
          {/* Logo */}
          <div className="px-5 py-5 border-b border-surface-200 dark:border-surface-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-lg bg-mint-500 flex items-center justify-center flex-shrink-0">
                  <img src={logo} alt="Bazar Abem" className="w-5 h-5 filter brightness-0 invert" />
                </div>
                <div className="min-w-0">
                  <h1 className="text-sm font-bold text-surface-900 dark:text-surface-50 truncate">
                    Bazar Abem
                  </h1>
                  <p className="text-[11px] text-surface-400 dark:text-surface-500">
                    Sistema de Ventas
                  </p>
                </div>
              </div>
              <button
                onClick={toggleSidebar}
                className="p-1.5 rounded-md text-surface-400 hover:text-surface-600 dark:text-surface-500 dark:hover:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors flex-shrink-0"
              >
                <i className="fas fa-times text-sm"></i>
              </button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            <p className="px-3 mb-2 text-[10px] font-semibold text-surface-400 dark:text-surface-600 uppercase tracking-widest">
              Menú
            </p>
            {menuItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-mint-500/10 dark:bg-mint-500/15 text-mint-700 dark:text-mint-400'
                      : 'text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-surface-200 hover:bg-surface-100 dark:hover:bg-surface-800'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <i className={`fas ${item.icon} w-4 text-center text-[13px] ${isActive ? 'text-mint-600 dark:text-mint-400' : ''}`}></i>
                    <span>{item.label}</span>
                    {isActive && (
                      <div className="ml-auto w-1.5 h-1.5 rounded-full bg-mint-500"></div>
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          {/* Footer */}
          <div className="px-4 py-4 border-t border-surface-200 dark:border-surface-800">
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-surface-100 dark:bg-surface-800">
              <div className="w-2 h-2 rounded-full bg-mint-500 animate-pulse-mint"></div>
              <p className="text-[11px] text-surface-500 dark:text-surface-400 font-medium">
                Versión 1.0.0
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 dark:bg-black/60 z-40 md:hidden backdrop-blur-sm"
          onClick={toggleSidebar}
        ></div>
      )}
    </>
  );
};

export default Sidebar;
