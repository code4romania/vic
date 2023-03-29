import React from 'react';
import { PieChart as PieChartRechart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';
import { PIE_CHART_COLORS } from '../common/constants/pie-chart-options';

const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill={index === 1 ? '#246F6F' : 'white'}
      textAnchor={x > cx ? 'start' : 'end'}
      dominantBaseline="central"
      className="max-md:text-base text-xl font-bold"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

interface DataSet {
  name: string;
  value: number;
}

interface PieChartProps {
  data: DataSet[];
}

const PieChart = ({ data }: PieChartProps) => {
  return (
    <ResponsiveContainer width="99%" height="95%">
      <PieChartRechart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          dataKey="value"
          nameKey="name"
          labelLine={false}
          outerRadius="90%"
          label={renderCustomizedLabel}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={PIE_CHART_COLORS[index]} />
          ))}
          <Legend iconType="circle" />
        </Pie>
      </PieChartRechart>
    </ResponsiveContainer>
  );
};

export default PieChart;
