import React, { useState } from 'react';
import i18n from '../common/config/i18n';
import Card from '../layouts/CardLayout';
import CardBody from './CardBody';
import CardHeader from './CardHeader';
import LineChart from './LineChart';
import Select, { SelectItem } from './Select';
import { LineChartOption, LINE_CHART_FILTER_OPTIONS } from '../common/constants/line-chart-options';
import { useVolunteerLineChartQuery } from '../services/volunteer/volunteer.service';
import EmptyContent from './EmptyContent';
import LoadingContent from './LoadingContent';

const LineChartCard = () => {
  const [chartFilter, setChartFilter] = useState<SelectItem<LineChartOption>>(
    LINE_CHART_FILTER_OPTIONS[0],
  );

  const { data, isLoading } = useVolunteerLineChartQuery(chartFilter.key);

  return (
    <Card>
      <CardHeader>
        <h2>{i18n.t('dashboard:line_chart.title')}</h2>
        <Select
          options={LINE_CHART_FILTER_OPTIONS}
          onChange={setChartFilter}
          selected={chartFilter}
        />
      </CardHeader>
      <CardBody>
        {data && (
          <LineChart
            data={data}
            tooltipItemStyle={{
              fontStyle: 'normal',
              fontWeight: '500',
              fontSize: '14px',
              lineHeight: '17px',
            }}
            tooltipLabelStyle={{
              fontStyle: 'normal',
              fontWeight: '500',
              fontSize: '14px',
              lineHeight: '17px',
              color: '#9CA3AF',
            }}
          />
        )}
        {!data && !isLoading && (
          <div className="h-[500px] text-center py-6">
            <EmptyContent description={i18n.t('general:error.load_entries')} />
          </div>
        )}
        {isLoading && (
          <div className="h-[500px] text-center py-6">
            <LoadingContent />
          </div>
        )}
      </CardBody>
    </Card>
  );
};

export default LineChartCard;
