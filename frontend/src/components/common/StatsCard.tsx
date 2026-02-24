interface StatsCardProps {
  title: string;
  value: string | number;
  icon: string;
  color: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
}

const colorMap = {
  primary: {
    icon: 'bg-mint-500/10 dark:bg-mint-500/15 text-mint-600 dark:text-mint-400',
    accent: 'bg-mint-500',
  },
  secondary: {
    icon: 'bg-violet-500/10 dark:bg-violet-500/15 text-violet-600 dark:text-violet-400',
    accent: 'bg-violet-500',
  },
  success: {
    icon: 'bg-emerald-500/10 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
    accent: 'bg-emerald-500',
  },
  warning: {
    icon: 'bg-amber-500/10 dark:bg-amber-500/15 text-amber-600 dark:text-amber-400',
    accent: 'bg-amber-500',
  },
  error: {
    icon: 'bg-red-500/10 dark:bg-red-500/15 text-red-600 dark:text-red-400',
    accent: 'bg-red-500',
  },
  info: {
    icon: 'bg-sky-500/10 dark:bg-sky-500/15 text-sky-600 dark:text-sky-400',
    accent: 'bg-sky-500',
  },
};

const StatsCard = ({ title, value, icon, color }: StatsCardProps) => {
  const colors = colorMap[color];

  return (
    <div className="group relative bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-xl p-5 hover:border-surface-300 dark:hover:border-surface-700 transition-all duration-200 hover:shadow-card dark:hover:shadow-card-dark">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-surface-400 dark:text-surface-500 uppercase tracking-wider mb-2">
            {title}
          </p>
          <p className="text-2xl font-bold text-surface-900 dark:text-surface-50 truncate">
            {value}
          </p>
        </div>
        <div className={`w-11 h-11 rounded-xl ${colors.icon} flex items-center justify-center flex-shrink-0 ml-3`}>
          <i className={`fas ${icon} text-lg`}></i>
        </div>
      </div>
      {/* Bottom accent */}
      <div className={`absolute bottom-0 left-4 right-4 h-0.5 ${colors.accent} rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200`}></div>
    </div>
  );
};

export default StatsCard;
