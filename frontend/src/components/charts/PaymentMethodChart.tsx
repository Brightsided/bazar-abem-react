import { useMemo } from 'react';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip,
} from 'recharts';
import { useThemeStore } from '@/store/themeStore';

interface PaymentMethodChartProps {
  data: Record<string, number>;
}

export const PaymentMethodChart = ({ data }: PaymentMethodChartProps) => {
  const { isDark } = useThemeStore();

  const chartData = useMemo(() => {
    return Object.entries(data).map(([metodo, total]) => ({ name: metodo, value: total }));
  }, [data]);

  const COLORS: Record<string, string> = {
    'Efectivo': '#10b981',
    'Yape': '#8b5cf6',
    'Tarjeta De Credito/Debito': '#0ea5e9',
  };

  const getColor = (name: string) => COLORS[name] || '#34d399';

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
          innerRadius={40}
          fill="#10b981"
          dataKey="value"
          strokeWidth={2}
          stroke={isDark ? '#18181b' : '#ffffff'}
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={getColor(entry.name)} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: isDark ? '#18181b' : '#ffffff',
            border: `1px solid ${isDark ? '#27272a' : '#e4e4e7'}`,
            borderRadius: '8px',
            color: isDark ? '#fafafa' : '#18181b',
            fontSize: '12px',
          }}
          formatter={(value: number) => [`S/ ${value.toFixed(2)}`, 'Total']}
        />
        <Legend
          wrapperStyle={{ color: isDark ? '#a1a1aa' : '#71717a', fontSize: '12px' }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
};
