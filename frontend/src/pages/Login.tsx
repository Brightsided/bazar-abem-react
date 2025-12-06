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
      navigate('/');
    } catch (error: any) {
      showError(error.response?.data?.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Main Container */}
      <div className="w-full max-w-md relative z-10">
        {/* Card Container */}
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl shadow-2xl p-8 md:p-10 hover:border-white/30 transition-all duration-300">
          {/* Header Section */}
          <div className="text-center mb-10">
            {/* Logo */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur-lg opacity-75 group-hover:opacity-100 transition duration-300"></div>
                <div className="relative bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl p-4 shadow-lg">
                  <img src={logo} alt="Bazar Abem" className="w-16 h-16 object-contain filter brightness-0 invert" />
                </div>
              </div>
            </div>

            {/* Title */}
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
              Bazar Abem
            </h1>
            <p className="text-gray-300 text-sm font-medium tracking-wide">
              Sistema de Gestión de Ventas
            </p>
            <div className="mt-4 h-1 w-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mx-auto"></div>
          </div>

          {/* Form Section */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Username Field */}
            <div className="group">
              <label className="block text-sm font-semibold text-gray-200 mb-2 transition-colors group-focus-within:text-blue-400">
                <i className="fas fa-user mr-2 text-blue-400"></i>
                Usuario
              </label>
              <div className="relative">
                <input
                  type="text"
                  {...register('username')}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:bg-white/10 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 backdrop-blur-sm"
                  placeholder="Ingresa tu usuario"
                  disabled={loading}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-400 transition-colors">
                  <i className="fas fa-chevron-right text-xs"></i>
                </div>
              </div>
              {errors.username && (
                <p className="text-red-400 text-xs mt-2 flex items-center animate-pulse">
                  <i className="fas fa-exclamation-circle mr-1"></i>
                  {errors.username.message}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div className="group">
              <label className="block text-sm font-semibold text-gray-200 mb-2 transition-colors group-focus-within:text-purple-400">
                <i className="fas fa-lock mr-2 text-purple-400"></i>
                Contraseña
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  {...register('password')}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:bg-white/10 focus:ring-2 focus:ring-purple-500/20 transition-all duration-300 backdrop-blur-sm"
                  placeholder="Ingresa tu contraseña"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-purple-400 transition-colors"
                  disabled={loading}
                >
                  <i className={`fas fa-${showPassword ? 'eye-slash' : 'eye'}`}></i>
                </button>
              </div>
              {errors.password && (
                <p className="text-red-400 text-xs mt-2 flex items-center animate-pulse">
                  <i className="fas fa-exclamation-circle mr-1"></i>
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-8 py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold rounded-lg transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-lg hover:shadow-xl hover:shadow-purple-500/50 relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 transform -translate-x-full group-hover:translate-x-full transition-all duration-500"></div>
              <span className="relative flex items-center justify-center">
                {loading ? (
                  <>
                    <i className="fas fa-spinner fa-spin mr-2"></i>
                    Iniciando sesión...
                  </>
                ) : (
                  <>
                    <i className="fas fa-sign-in-alt mr-2"></i>
                    Iniciar Sesión
                  </>
                )}
              </span>
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-2 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-gray-400">
                Información de Acceso
              </span>
            </div>
          </div>

          {/* Info Section */}
          <div className="bg-white/5 border border-white/10 rounded-lg p-4 backdrop-blur-sm">
            <p className="text-xs text-gray-300 text-center">
              <i className="fas fa-info-circle text-blue-400 mr-2"></i>
              Contacta al administrador si olvidaste tus credenciales
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-gray-400 text-xs font-medium">
            © 2025 Bazar Abem
            <span className="mx-2 text-gray-600">•</span>
            Todos los derechos reservados
          </p>
        </div>
      </div>

      {/* Floating Elements */}
      <style>{`
        @keyframes blob {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }

        .animate-blob {
          animation: blob 7s infinite;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .animation-delay-4000 {
          animation-delay: 4s;
        }

        @keyframes shimmer {
          0% {
            background-position: -1000px 0;
          }
          100% {
            background-position: 1000px 0;
          }
        }

        .group:focus-within .group-focus-within\:text-blue-400 {
          color: rgb(96, 165, 250);
        }
      `}</style>
    </div>
  );
};

export default Login;
