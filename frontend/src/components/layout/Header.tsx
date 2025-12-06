import { useAuthStore } from '@/store/authStore';
import { useThemeStore } from '@/store/themeStore';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

interface HeaderProps {
  toggleSidebar: () => void;
}

const Header = ({ toggleSidebar }: HeaderProps) => {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const { isDark, toggleTheme } = useThemeStore();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-white/80 dark:bg-slate-900/80 light:bg-white/90 backdrop-blur-xl border-b border-gray-200/50 dark:border-white/10 light:border-gray-300 px-6 py-4 sticky top-0 z-30 shadow-sm">
      <div className="flex items-center justify-between">
        {/* Left side */}
        <div className="flex items-center space-x-4">
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-lg text-gray-600 dark:text-gray-300 light:text-gray-700 hover:bg-gray-100 dark:hover:bg-white/10 light:hover:bg-gray-200 transition-all duration-200"
            title="Alternar menú"
          >
            <i className="fas fa-bars text-xl"></i>
          </button>
          
          {/* Breadcrumb or Title */}
          <div className="hidden md:block">
            <p className="text-sm text-gray-500 dark:text-gray-400 light:text-gray-600">
              <i className="fas fa-home mr-2"></i>
              Bienvenido al Sistema
            </p>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-3">
          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-gray-600 dark:text-gray-300 light:text-gray-700 hover:bg-gray-100 dark:hover:bg-white/10 light:hover:bg-gray-200 transition-all duration-200 group"
            title={isDark ? 'Modo claro' : 'Modo oscuro'}
          >
            <i className={`fas ${isDark ? 'fa-sun text-yellow-400' : 'fa-moon text-blue-400'} text-lg transition-transform group-hover:rotate-180 duration-500`}></i>
          </button>

          {/* Divider */}
          <div className="h-6 w-px bg-gray-200 dark:bg-white/10 light:bg-gray-300"></div>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 light:hover:bg-gray-200 transition-all duration-200 group"
            >
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-gray-900 dark:text-white light:text-gray-900">
                  {user?.nombre}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 light:text-gray-600">
                  {user?.rol}
                </p>
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg group-hover:shadow-purple-500/50 transition-all">
                {user?.nombre.charAt(0).toUpperCase()}
              </div>
            </button>

            {/* Dropdown Menu */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 light:bg-white rounded-lg shadow-xl border border-gray-200 dark:border-white/10 light:border-gray-300 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="px-4 py-3 border-b border-gray-200 dark:border-white/10 light:border-gray-300">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white light:text-gray-900">
                    {user?.nombre}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 light:text-gray-600 mt-1">
                    {user?.rol}
                  </p>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-3 text-left text-sm text-red-600 dark:text-red-400 light:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 light:hover:bg-red-50 transition-colors flex items-center space-x-2"
                >
                  <i className="fas fa-sign-out-alt"></i>
                  <span>Cerrar sesión</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
