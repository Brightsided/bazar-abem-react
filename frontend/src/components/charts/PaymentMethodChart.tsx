import { useMemo } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts';
import { useThemeStore } from '@/store/themeStore';

interface PaymentMethodChartProps {
  data: Record<string, number>;
}

export const PaymentMethodChart = ({ data }: PaymentMethodChartProps) => {
  const { isDark } = useThemeStore();

  const chartData = useMemo(() => {
    return Object.entries(data).map(([metodo, total]) => ({
      name: metodo,
      value: total,
    }));
  }, [data]);

  const COLORS: Record<string, string> = {
    'Efectivo': '#22c55e',
    'Yape': '#a855f7',
    'Tarjeta De Credito/Debito': '#3b82f6',
  };

  const getColor = (name: string) => COLORS[name] || '#6366f1';

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, value }) => `${name}: S/ ${value.toFixed(2)}`}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={getColor(entry.name)} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: isDark ? '#1f2937' : '#ffffff',
            border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
            borderRadius: '8px',
            color: isDark ? '#d1d5db' : '#4b5563',
          }}
          formatter={(value: number) => `S/ ${value.toFixed(2)}`}
        />
        <Legend wrapperStyle={{ color: isDark ? '#d1d5db' : '#4b5563' }} />
      </PieChart>
    </ResponsiveContainer>
  );
};
