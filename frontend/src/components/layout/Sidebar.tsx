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
    { path: '/reportes', icon: 'fa-chart-line', label: 'Reportes' },
    { path: '/ruc', icon: 'fa-calculator', label: 'Calcular RUC' },
  ];

  return (
    <>
      {/* Sidebar */}
      <aside
        className={`${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } fixed left-0 top-0 h-screen w-64 bg-gradient-to-b from-white via-gray-50 to-white dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 border-r border-gray-200 dark:border-white/10 transition-transform duration-300 overflow-hidden z-50 shadow-2xl`}
      >
        <div className="h-full flex flex-col">
          {/* Logo Section with Close Button */}
          <div className="p-6 border-b border-white/10 dark:border-white/10 light:border-gray-200 backdrop-blur-sm bg-gradient-to-b from-slate-900/50 to-slate-800/50 dark:from-slate-900/50 dark:to-slate-800/50 light:from-white/50 light:to-gray-50/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 flex-1">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg flex-shrink-0">
                  <img src={logo} alt="Bazar Abem" className="w-6 h-6 filter brightness-0 invert" />
                </div>
                <div className="min-w-0">
                  <h1 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 light:from-blue-600 light:to-purple-600 bg-clip-text text-transparent truncate">
                    Bazar Abem
                  </h1>
                  <p className="text-xs text-gray-400 dark:text-gray-400 light:text-gray-600">Sistema de Ventas</p>
                </div>
              </div>
              
              {/* Close Button */}
              <button
                onClick={toggleSidebar}
                className="p-2 rounded-lg text-gray-400 dark:text-gray-400 light:text-gray-600 hover:text-white dark:hover:text-white light:hover:text-gray-900 hover:bg-white/10 dark:hover:bg-white/10 light:hover:bg-gray-200 transition-all duration-200 flex-shrink-0 ml-2"
                title="Cerrar menú"
              >
                <i className="fas fa-times text-lg"></i>
              </button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {menuItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                className={({ isActive }) =>
                  `flex items-center px-4 py-3 rounded-lg transition-all duration-200 group relative ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-purple-500/50'
                      : 'text-gray-300 dark:text-gray-300 light:text-gray-700 hover:text-white dark:hover:text-white light:hover:text-gray-900 hover:bg-white/5 dark:hover:bg-white/5 light:hover:bg-gray-200'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-r-lg transition-all duration-200 ${
                      isActive ? 'bg-gradient-to-b from-blue-400 to-purple-400' : 'bg-transparent'
                    }`}></div>
                    <i className={`fas ${item.icon} w-5 mr-3 text-lg`}></i>
                    <span className="font-medium text-sm">{item.label}</span>
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          {/* Divider */}
          <div className="px-4 py-4">
            <div className="h-px bg-gradient-to-r from-transparent via-white/10 dark:via-white/10 light:via-gray-300 to-transparent"></div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-white/10 dark:border-white/10 light:border-gray-200 backdrop-blur-sm bg-gradient-to-b from-slate-800/50 to-slate-900/50 dark:from-slate-800/50 dark:to-slate-900/50 light:from-gray-50/50 light:to-white/50">
            <div className="bg-white/5 dark:bg-white/5 light:bg-gray-200/50 rounded-lg p-3 border border-white/10 dark:border-white/10 light:border-gray-300">
              <p className="text-xs text-gray-400 dark:text-gray-400 light:text-gray-600 text-center">
                <i className="fas fa-shield-alt mr-1 text-green-400"></i>
                Versión 1.0.0
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Backdrop for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={toggleSidebar}
        ></div>
      )}
    </>
  );
};

export default Sidebar;
