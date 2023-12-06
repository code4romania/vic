import i18n from '../config/i18n';

export enum PieChartOption {
  AGE = 'AGE',
  SEX = 'SEX',
}

export const PIE_CHART_COLORS = ['#FFD209', '#FEF3C7', '#F59E0B', '#000000'];
export const PIE_CHART_LEGEND_COLORS = [
  'bg-[#FFD209]',
  'bg-[#FEF3C7]',
  'bg-[#F59E0B]',
  'bg-[#000000]',
];

export const PIE_CHART_FILTER_OPTIONS = [
  {
    value: i18n.t('general:age'),
    key: PieChartOption.AGE,
  },
  {
    value: i18n.t('general:sex', { sex_type: '' }),
    key: PieChartOption.SEX,
  },
];
