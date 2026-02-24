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
    <header className="bg-white/80 dark:bg-surface-900/80 backdrop-blur-xl border-b border-surface-200 dark:border-surface-800 px-6 py-3 sticky top-0 z-30">
      <div className="flex items-center justify-between">
        {/* Left */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-lg text-surface-500 dark:text-surface-400 hover:text-surface-700 dark:hover:text-surface-200 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
          >
            <i className="fas fa-bars text-lg"></i>
          </button>
          <div className="hidden md:block">
            <p className="text-xs text-surface-400 dark:text-surface-500 font-medium">
              Bienvenido al sistema
            </p>
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-2">
          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-surface-500 dark:text-surface-400 hover:text-surface-700 dark:hover:text-surface-200 hover:bg-surface-100 dark:hover:bg-surface-800 transition-all duration-200"
            title={isDark ? 'Modo claro' : 'Modo oscuro'}
          >
            {isDark ? (
              <i className="fas fa-sun text-amber-400"></i>
            ) : (
              <i className="fas fa-moon text-surface-500"></i>
            )}
          </button>

          <div className="h-5 w-px bg-surface-200 dark:bg-surface-800 mx-1"></div>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-3 px-2 py-1.5 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
            >
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-surface-900 dark:text-surface-50 leading-tight">
                  {user?.nombre}
                </p>
                <p className="text-[11px] text-surface-400 dark:text-surface-500">
                  {user?.rol}
                </p>
              </div>
              <div className="w-9 h-9 rounded-lg bg-mint-500 flex items-center justify-center text-white text-sm font-bold">
                {user?.nombre.charAt(0).toUpperCase()}
              </div>
            </button>

            {showUserMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)}></div>
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-surface-800 rounded-xl shadow-lg border border-surface-200 dark:border-surface-700 overflow-hidden z-50 animate-fade-in">
                  <div className="px-4 py-3 border-b border-surface-100 dark:border-surface-700">
                    <p className="text-sm font-semibold text-surface-900 dark:text-surface-50">
                      {user?.nombre}
                    </p>
                    <p className="text-[11px] text-surface-400 dark:text-surface-500 mt-0.5">
                      {user?.rol}
                    </p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-3 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors flex items-center gap-2"
                  >
                    <i className="fas fa-sign-out-alt text-xs"></i>
                    <span>Cerrar sesión</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
