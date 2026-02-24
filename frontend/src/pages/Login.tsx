import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '@/store/authStore';
import { authService } from '@/services/authService';
import { showError } from '@/utils/alerts';
import logo from '@/assets/images/Logo.svg';

const loginSchema = z.object({
  username: z.string().min(1, 'El usuario es requerido'),
  password: z.string().min(1, 'La contraseña es requerida'),
});

type LoginForm = z.infer<typeof loginSchema>;

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const setUser = useAuthStore((state) => state.setUser);
  const setToken = useAuthStore((state) => state.setToken);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setLoading(true);
    try {
      const response = await authService.login(data);
      setUser(response.user);
      setToken(response.token);
      navigate('/');
    } catch (error: any) {
      showError(error.response?.data?.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-950 p-4 relative overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-mint-500/5 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-mint-500/3 rounded-full blur-[100px] pointer-events-none"></div>

      {/* Main Container */}
      <div className="w-full max-w-md relative z-10 animate-fade-in">
        {/* Card */}
        <div className="bg-surface-900 border border-surface-800 rounded-2xl p-8 md:p-10">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="flex justify-center mb-6">
              <div className="w-14 h-14 rounded-xl bg-mint-500 flex items-center justify-center shadow-glow-mint">
                <img src={logo} alt="Bazar Abem" className="w-8 h-8 object-contain filter brightness-0 invert" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-surface-50 mb-1">
              Bazar Abem
            </h1>
            <p className="text-sm text-surface-500 font-medium">
              Sistema de Gestión de Ventas
            </p>
            <div className="mt-4 h-px w-12 bg-mint-500/40 mx-auto"></div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Username */}
            <div>
              <label className="block text-xs font-semibold text-surface-400 mb-2 uppercase tracking-wider">
                Usuario
              </label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-500">
                  <i className="fas fa-user text-xs"></i>
                </div>
                <input
                  type="text"
                  {...register('username')}
                  className="w-full pl-10 pr-4 py-3 bg-surface-800 border border-surface-700 rounded-lg text-surface-50 placeholder-surface-600 focus:outline-none focus:border-mint-500 focus:ring-1 focus:ring-mint-500/20 transition-all text-sm"
                  placeholder="Ingresa tu usuario"
                  disabled={loading}
                />
              </div>
              {errors.username && (
                <p className="text-red-400 text-xs mt-2 flex items-center gap-1">
                  <i className="fas fa-exclamation-circle text-[10px]"></i>
                  {errors.username.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-surface-400 mb-2 uppercase tracking-wider">
                Contraseña
              </label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-500">
                  <i className="fas fa-lock text-xs"></i>
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  {...register('password')}
                  className="w-full pl-10 pr-12 py-3 bg-surface-800 border border-surface-700 rounded-lg text-surface-50 placeholder-surface-600 focus:outline-none focus:border-mint-500 focus:ring-1 focus:ring-mint-500/20 transition-all text-sm"
                  placeholder="Ingresa tu contraseña"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-surface-500 hover:text-surface-300 transition-colors"
                  disabled={loading}
                >
                  <i className={`fas fa-${showPassword ? 'eye-slash' : 'eye'} text-sm`}></i>
                </button>
              </div>
              {errors.password && (
                <p className="text-red-400 text-xs mt-2 flex items-center gap-1">
                  <i className="fas fa-exclamation-circle text-[10px]"></i>
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 py-3 px-4 bg-mint-500 hover:bg-mint-600 text-white font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm shadow-glow-mint hover:shadow-glow-mint-lg active:scale-[0.98]"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <i className="fas fa-spinner fa-spin"></i>
                  Iniciando sesión...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <i className="fas fa-arrow-right"></i>
                  Iniciar Sesión
                </span>
              )}
            </button>
          </form>

          {/* Info */}
          <div className="mt-8 pt-6 border-t border-surface-800">
            <p className="text-xs text-surface-500 text-center flex items-center justify-center gap-2">
              <i className="fas fa-info-circle text-mint-500/60"></i>
              Contacta al administrador si olvidaste tus credenciales
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-surface-600 text-[11px] font-medium">
            © 2025 Bazar Abem · Todos los derechos reservados
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
