import { useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { useThemeStore } from '@/store/themeStore';

interface SalesChartProps {
  data: Record<string, number>;
}

export const SalesChart = ({ data }: SalesChartProps) => {
  const { isDark } = useThemeStore();

  const chartData = useMemo(() => {
    return Object.entries(data).map(([fecha, total]) => ({
      fecha,
      total,
    }));
  }, [data]);

  const colors = {
    text: isDark ? '#d1d5db' : '#4b5563',
    grid: isDark ? '#374151' : '#e5e7eb',
    stroke: isDark ? '#6366f1' : '#4f46e5',
    fill: isDark ? '#6366f1' : '#4f46e5',
  };

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={colors.fill} stopOpacity={0.8} />
            <stop offset="95%" stopColor={colors.fill} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} />
        <XAxis
          dataKey="fecha"
          stroke={colors.text}
          style={{ fontSize: '12px' }}
        />
        <YAxis
          stroke={colors.text}
          style={{ fontSize: '12px' }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: isDark ? '#1f2937' : '#ffffff',
            border: `1px solid ${colors.grid}`,
            borderRadius: '8px',
            color: colors.text,
          }}
          formatter={(value: number) => `S/ ${value.toFixed(2)}`}
        />
        <Legend wrapperStyle={{ color: colors.text }} />
        <Area
          type="monotone"
          dataKey="total"
          stroke={colors.stroke}
          fillOpacity={1}
          fill="url(#colorTotal)"
          name="Total Ventas"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};
