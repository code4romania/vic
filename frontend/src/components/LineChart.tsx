import React, { ReactElement } from 'react';
import {
  LineChart as LineChartRechart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { LINE_CHART_OPTIONS } from '../common/constants/line-chart-options';
import EmptyContent from './EmptyContent';
import i18n from '../common/config/i18n';

export interface InitialDataSet {
  name: string;
  active: string;
  archived: string;
}

export interface DataSet {
  name: string;
  active: number;
  archived: number;
}

interface MarginProps {
  top?: number;
  right?: number;
  left?: number;
  bottom?: number;
}

interface LineChartProps {
  data: DataSet[];
  xAxisTicx: ReactElement;
  margin?: MarginProps;
  tooltipLabelStyle?: React.CSSProperties;
  tooltipItemStyle?: React.CSSProperties;
}

const LineChart = ({
  data,
  xAxisTicx,
  margin,
  tooltipLabelStyle,
  tooltipItemStyle,
}: LineChartProps) => {
  return (
    <div className="py-7 w-full min-w-fit h-[550px]">
      {data && data.length > 0 ? (
        <ResponsiveContainer width="99%" height="99%">
          <LineChartRechart
            data={data}
            margin={{
              top: margin?.top,
              right: margin?.right,
              left: margin?.left,
              bottom: margin?.bottom,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey={LINE_CHART_OPTIONS.DATA_KEYS.NAME}
              interval="preserveStartEnd"
              tick={xAxisTicx}
            />
            <YAxis orientation="right" tickLine={false} axisLine={false} allowDecimals={false} />
            <Tooltip separator=" " labelStyle={tooltipLabelStyle} itemStyle={tooltipItemStyle} />
            <Legend iconType="circle" />
            <Line
              name={LINE_CHART_OPTIONS.LABELS.ACTIVE}
              dot={false}
              type="monotone"
              dataKey={LINE_CHART_OPTIONS.DATA_KEYS.ACTIVE}
              stroke={LINE_CHART_OPTIONS.COLOURS.ACTIVE}
              strokeWidth={3}
            />
            <Line
              name={LINE_CHART_OPTIONS.LABELS.ARCHIVED}
              dot={false}
              type="monotone"
              dataKey={LINE_CHART_OPTIONS.DATA_KEYS.ARCHIVED}
              stroke={LINE_CHART_OPTIONS.COLOURS.ARCHIVED}
              strokeWidth={3}
            />
          </LineChartRechart>
        </ResponsiveContainer>
      ) : (
        <div className="max-xs:h-[350px] max-sm:h-[400px] h-[600px] text-center py-6">
          <EmptyContent description={i18n.t('general:empty_table')} />
        </div>
      )}
    </div>
  );
};

export default LineChart;
