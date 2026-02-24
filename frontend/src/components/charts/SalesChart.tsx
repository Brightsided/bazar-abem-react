import { useMemo } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { useThemeStore } from '@/store/themeStore';

interface SalesChartProps {
  data: Record<string, number>;
}

export const SalesChart = ({ data }: SalesChartProps) => {
  const { isDark } = useThemeStore();

  const chartData = useMemo(() => {
    return Object.entries(data).map(([fecha, total]) => ({ fecha, total }));
  }, [data]);

  const colors = {
    text: isDark ? '#a1a1aa' : '#71717a',
    grid: isDark ? '#27272a' : '#e4e4e7',
    stroke: '#10b981',
    fill: '#10b981',
  };

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="colorTotalMint" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={colors.fill} stopOpacity={0.3} />
            <stop offset="95%" stopColor={colors.fill} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} />
        <XAxis dataKey="fecha" stroke={colors.text} style={{ fontSize: '11px' }} />
        <YAxis stroke={colors.text} style={{ fontSize: '11px' }} />
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
        <Area
          type="monotone"
          dataKey="total"
          stroke={colors.stroke}
          strokeWidth={2}
          fillOpacity={1}
          fill="url(#colorTotalMint)"
          name="Total Ventas"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};
