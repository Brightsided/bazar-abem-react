import { Trophy, Medal, Award, Star } from 'lucide-react';
import { formatCurrency } from '@/utils/formatters';

interface Vendedor {
  id: number;
  nombre: string;
  username: string;
  rol: string;
  cantidad: number;
  total: number;
}

interface SellerRankingProps {
  ranking: Vendedor[];
}

export const SellerRanking = ({ ranking }: SellerRankingProps) => {
  const getMedalIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Trophy className="w-6 h-6 text-yellow-400" />;
      case 1:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 2:
        return <Award className="w-6 h-6 text-amber-600" />;
      default:
        return <Star className="w-6 h-6 text-blue-500" />;
    }
  };

  const getBackgroundColor = (index: number) => {
    switch (index) {
      case 0:
        return 'bg-gradient-to-br from-yellow-400 to-yellow-600 shadow-lg shadow-yellow-500/50';
      case 1:
        return 'bg-gradient-to-br from-gray-300 to-gray-500 shadow-lg shadow-gray-400/50';
      case 2:
        return 'bg-gradient-to-br from-amber-500 to-amber-700 shadow-lg shadow-amber-500/50';
      default:
        return 'bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg shadow-blue-500/50';
    }
  };

  return (
    <div className="space-y-3">
      {ranking.map((vendedor, index) => (
        <div
          key={vendedor.id}
          className="relative overflow-hidden rounded-lg backdrop-blur-sm bg-white/30 dark:bg-white/5 border border-white/20 dark:border-white/10 p-4 hover:border-white/40 dark:hover:border-white/20 transition-all duration-300 group"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-600/0 to-orange-600/0 group-hover:from-yellow-600/5 group-hover:to-orange-600/5 transition-all duration-300"></div>
          <div className="relative flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-white text-lg ${getBackgroundColor(
                  index
                )}`}
              >
                {getMedalIcon(index)}
              </div>
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {vendedor.nombre}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
                  <i className="fas fa-shopping-bag mr-1 text-blue-500"></i>
                  {vendedor.cantidad} ventas
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xl font-bold text-green-600 dark:text-green-400">
                {formatCurrency(vendedor.total)}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                <i className="fas fa-chart-line text-green-500 mr-1"></i>
                Ingresos
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
