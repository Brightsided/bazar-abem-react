interface StatsCardProps {
  title: string;
  value: string | number;
  icon: string;
  color: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
}

const colorGradients = {
  primary: {
    bg: 'from-blue-600 to-blue-700',
    icon: 'from-blue-500 to-blue-600',
    text: 'text-blue-600 dark:text-blue-400',
    light: 'bg-blue-500/10 dark:bg-blue-500/20',
  },
  secondary: {
    bg: 'from-purple-600 to-purple-700',
    icon: 'from-purple-500 to-purple-600',
    text: 'text-purple-600 dark:text-purple-400',
    light: 'bg-purple-500/10 dark:bg-purple-500/20',
  },
  success: {
    bg: 'from-green-600 to-green-700',
    icon: 'from-green-500 to-green-600',
    text: 'text-green-600 dark:text-green-400',
    light: 'bg-green-500/10 dark:bg-green-500/20',
  },
  warning: {
    bg: 'from-yellow-600 to-yellow-700',
    icon: 'from-yellow-500 to-yellow-600',
    text: 'text-yellow-600 dark:text-yellow-400',
    light: 'bg-yellow-500/10 dark:bg-yellow-500/20',
  },
  error: {
    bg: 'from-red-600 to-red-700',
    icon: 'from-red-500 to-red-600',
    text: 'text-red-600 dark:text-red-400',
    light: 'bg-red-500/10 dark:bg-red-500/20',
  },
  info: {
    bg: 'from-cyan-600 to-cyan-700',
    icon: 'from-cyan-500 to-cyan-600',
    text: 'text-cyan-600 dark:text-cyan-400',
    light: 'bg-cyan-500/10 dark:bg-cyan-500/20',
  },
};

const StatsCard = ({ title, value, icon, color }: StatsCardProps) => {
  const colors = colorGradients[color];

  return (
    <div className="group relative overflow-hidden rounded-xl backdrop-blur-xl bg-white/50 dark:bg-white/5 border border-white/20 dark:border-white/10 p-6 hover:border-white/40 dark:hover:border-white/20 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/10">
      {/* Background Gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br ${colors.bg} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>

      {/* Content */}
      <div className="relative flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2 uppercase tracking-wide">
            {title}
          </p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            {value}
          </p>
        </div>

        {/* Icon */}
        <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${colors.icon} flex items-center justify-center text-white shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300 ml-4`}>
          <i className={`fas ${icon} text-2xl`}></i>
        </div>
      </div>

      {/* Bottom accent line */}
      <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${colors.bg} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
    </div>
  );
};

export default StatsCard;
