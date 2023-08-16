import i18n from '../config/i18n';

export enum PieChartOption {
  AGE = 'AGE',
  SEX = 'SEX',
}

export const PIE_CHART_COLORS = ['#06B5C0', '#C4FBFF', '#246F6F', '#000000'];
export const PIE_CHART_LEGEND_COLORS = [
  'bg-[#06B5C0]',
  'bg-[#C4FBFF]',
  'bg-[#246F6F]',
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
