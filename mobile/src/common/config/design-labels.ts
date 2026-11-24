import type { i18n as I18n } from 'i18next';
import { format } from 'date-fns';
import { enGB } from 'date-fns/locale';
import { formatDateRo, setDesignLabels } from '../../design/labels';
import { romanianNeedsDe } from '../utils/plural';

/**
 * The design components do not know about translations: this hands them their few built-in texts
 * (placeholders, „Azi” / „Ieri”, accessibility hints) in the app's language, now and again every
 * time the language changes.
 */
export const bindDesignLabels = (i18n: I18n): void => {
  const apply = () => {
    const english = i18n.language === 'en';
    setDesignLabels({
      language: english ? 'en' : 'ro',
      optional: i18n.t('fields:optional'),
      close: i18n.t('general:close'),
      selectPlaceholder: i18n.t('fields:select.placeholder'),
      selectOpenList: i18n.t('fields:select.open_list'),
      selectOpenMenu: i18n.t('fields:select.open_menu'),
      datePlaceholder: i18n.t('fields:date.placeholder'),
      dateEmpty: i18n.t('fields:date.empty'),
      dateOpenCalendar: i18n.t('fields:date.open_calendar'),
      today: i18n.t('general:today'),
      yesterday: i18n.t('general:yesterday'),
      formatDate: english
        ? (date: Date) => format(date, 'EEE, d MMM yyyy', { locale: enGB })
        : formatDateRo,
      decrease: i18n.t('fields:stepper.decrease'),
      increase: i18n.t('fields:stepper.increase'),
      // the same words as the impact card on Acasă
      impactHexagon: (approved: number, pending: number, rejected: number) =>
        [
          approved === 1
            ? i18n.t('home:impact.a11y_approved_singular')
            : i18n.t(
                romanianNeedsDe(approved)
                  ? 'home:impact.a11y_approved_de'
                  : 'home:impact.a11y_approved',
                { n: approved },
              ),
          pending > 0 ? i18n.t('home:impact.a11y_pending', { n: pending }) : null,
          rejected > 0
            ? i18n.t(
                rejected === 1 ? 'home:impact.a11y_rejected_singular' : 'home:impact.a11y_rejected',
                { n: rejected },
              )
            : null,
        ]
          .filter(Boolean)
          .join(', '),
    });
  };
  apply();
  i18n.on('languageChanged', apply);
};
