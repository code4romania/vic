import React, { useState } from 'react';
import i18n from '../common/config/i18n';
import Card from '../layouts/CardLayout';
import CardHeader from './CardHeader';
import Select, { SelectItem } from './Select';
import {
  PieChartOption,
  PIE_CHART_FILTER_OPTIONS,
  PIE_CHART_LEGEND_COLORS,
} from '../common/constants/pie-chart-options';
import { useVolunteerPieChartQuery } from '../services/volunteer/volunteer.service';
import EmptyContent from './EmptyContent';
import LoadingContent from './LoadingContent';
import PieChart from './PieChart';

const PieChartCard = () => {
  const [chartFilter, setChartFilter] = useState<SelectItem<PieChartOption>>(
    PIE_CHART_FILTER_OPTIONS[0],
  );

  const { data, isLoading } = useVolunteerPieChartQuery(chartFilter.key);

  return (
    <Card>
      <CardHeader>
        <h2>{i18n.t('pie_chart:title')}</h2>
        <Select
          options={PIE_CHART_FILTER_OPTIONS}
          onChange={setChartFilter}
          selected={chartFilter}
        />
      </CardHeader>
      <div className="max-xs:h-[350px] max-sm:h-[400px] h-[600px] w-full sm:px-8 px-4 py-8">
        {data && (
          <>
            <PieChart data={data} />
            <div className="flex max-xs:gap-1 gap-3 justify-center flex-wrap">
              {data.map((item, index) => (
                <div className="flex flex-row gap-1" key={index}>
                  <span
                    className={`h-3.5 w-3.5 border-solid ${PIE_CHART_LEGEND_COLORS[index]} rounded-full self-center`}
                  />
                  <small>
                    {chartFilter.key === PieChartOption.AGE
                      ? i18n.t('general:years_old', { age: item.name })
                      : i18n.t('general:sex', { sex_type: i18n.t(`general:${item.name}`) })}
                  </small>
                </div>
              ))}
            </div>
          </>
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
      </div>
    </Card>
  );
};

export default PieChartCard;
