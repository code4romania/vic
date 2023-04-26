import i18n from '../config/i18n';

export const LINE_CHART_OPTIONS = {
  LABELS: {
    ACTIVE: i18n.t('volunteers:tabs.active'),
    ARCHIVED: i18n.t('volunteers:tabs.archived'),
  },
  COLOURS: {
    ACTIVE: '#0AA5A5',
    ARCHIVED: '#DC2626',
  },
  DATA_KEYS: {
    NAME: 'name',
    ACTIVE: 'active',
    ARCHIVED: 'archived',
  },
};

export enum LineChartOption {
  DAILY = 'daily',
  MONTHLY = 'monthly',
  YEARLY = 'yearly',
}

export const LINE_CHART_FILTER_OPTIONS = [
  {
    value: i18n.t('general:daily'),
    key: LineChartOption.DAILY,
  },
  {
    value: i18n.t('general:monthly'),
    key: LineChartOption.MONTHLY,
  },
  {
    value: i18n.t('general:yearly'),
    key: LineChartOption.YEARLY,
  },
];
