import i18n from '../config/i18n';

export const LINE_CHART_OPTIONS = {
  LABELS: {
    get ACTIVE() {
      return i18n.t('volunteers:tabs.active');
    },
    get ARCHIVED() {
      return i18n.t('volunteers:tabs.inactive');
    },
  },
  COLOURS: {
    ACTIVE: '#0AA5A5',
    ARCHIVED: '#DC2626',
  },
  DATA_KEYS: {
    NAME: 'date',
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
    get value() {
      return i18n.t('general:daily');
    },
    key: LineChartOption.DAILY,
  },
  {
    get value() {
      return i18n.t('general:monthly');
    },
    key: LineChartOption.MONTHLY,
  },
  {
    get value() {
      return i18n.t('general:yearly');
    },
    key: LineChartOption.YEARLY,
  },
];
