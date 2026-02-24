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
  const medals = ['🥇', '🥈', '🥉'];

  return (
    <div className="space-y-2">
      {ranking.map((vendedor, index) => (
        <div
          key={vendedor.id}
          className="bg-surface-50 dark:bg-surface-800/50 border border-surface-200 dark:border-surface-800 rounded-lg p-3 hover:border-surface-300 dark:hover:border-surface-700 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-surface-200 dark:bg-surface-700 flex items-center justify-center font-bold text-sm flex-shrink-0">
              {medals[index] || `#${index + 1}`}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-surface-900 dark:text-surface-50 truncate">{vendedor.nombre}</p>
                  <p className="text-[11px] text-surface-400 dark:text-surface-500">{vendedor.cantidad} ventas</p>
                </div>
                <p className="text-sm font-bold text-mint-600 dark:text-mint-400 flex-shrink-0 ml-2">
                  {formatCurrency(vendedor.total)}
                </p>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
