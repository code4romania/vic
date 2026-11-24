// The few words the „Îndrăzneț” components say on their own (a placeholder, „Azi”, „Închide”, the
// accessibility hints). The design folder knows nothing about translations: the app hands it the
// texts for the current language through `setDesignLabels` (see common/config/design-labels.ts),
// and every component that reads them through `useDesignLabels` redraws when they change.
// Without that call the components speak Romanian, the language they were designed in.
import { useSyncExternalStore } from 'react';

export type DesignLanguage = 'ro' | 'en';

export interface DesignLabels {
  /** names in the calendar */
  language: DesignLanguage;
  /** beside the label of a field that may stay empty: "Telefon opțional" */
  optional: string;
  /** the round close button of a sheet */
  close: string;
  selectPlaceholder: string;
  /** accessibility hints of a select */
  selectOpenList: string;
  selectOpenMenu: string;
  datePlaceholder: string;
  /** read after the label of a date field with no date */
  dateEmpty: string;
  dateOpenCalendar: string;
  today: string;
  yesterday: string;
  /** "Vin, 13 nov 2026" */
  formatDate: (date: Date) => string;
  /** the − and + buttons of a stepper */
  decrease: string;
  increase: string;
  /** what a screen reader says for the impact hexagon */
  impactHexagon: (approved: number, pending: number, rejected: number) => string;
}

const DAYS = ['Dum', 'Lun', 'Mar', 'Mie', 'Joi', 'Vin', 'Sâm'];
const MONTHS = ['ian', 'feb', 'mar', 'apr', 'mai', 'iun', 'iul', 'aug', 'sep', 'oct', 'nov', 'dec'];

/** "Vin, 13 nov 2026" */
export const formatDateRo = (date: Date) =>
  `${DAYS[date.getDay()]}, ${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`;

/** Romanian count: „1 oră”, „5 ore”, „42 de ore” (20+ and round hundreds take „de”). */
const roHours = (n: number) => {
  if (n === 1) {
    return '1 oră';
  }
  const rest = Math.abs(n) % 100;
  return `${n} ${n !== 0 && (rest === 0 || rest >= 20) ? 'de ' : ''}ore`;
};

export const impactHexagonLabelRo = (approved: number, pending: number, rejected = 0) => {
  const parts = [`${roHours(approved)} ${approved === 1 ? 'aprobată' : 'aprobate'}`];
  if (pending > 0) {
    parts.push(`${roHours(pending)} în așteptare`);
  }
  if (rejected > 0) {
    parts.push(`${roHours(rejected)} ${rejected === 1 ? 'respinsă' : 'respinse'}`);
  }
  return parts.join(', ');
};

export const DEFAULT_DESIGN_LABELS: DesignLabels = {
  language: 'ro',
  optional: 'opțional',
  close: 'Închide',
  selectPlaceholder: 'Alege',
  selectOpenList: 'Deschide lista de opțiuni',
  selectOpenMenu: 'Deschide meniul',
  datePlaceholder: 'Alege data',
  dateEmpty: 'nicio dată aleasă',
  dateOpenCalendar: 'Deschide calendarul',
  today: 'Azi',
  yesterday: 'Ieri',
  formatDate: formatDateRo,
  decrease: 'Scade',
  increase: 'Crește',
  impactHexagon: impactHexagonLabelRo,
};

let labels: DesignLabels = DEFAULT_DESIGN_LABELS;
const listeners = new Set<() => void>();

export const getDesignLabels = (): DesignLabels => labels;

/** Replaces the given texts (the rest keep their value) and redraws the components that show them. */
export const setDesignLabels = (next: Partial<DesignLabels>): void => {
  labels = { ...labels, ...next };
  listeners.forEach((listener) => listener());
};

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

export const useDesignLabels = (): DesignLabels =>
  useSyncExternalStore(subscribe, getDesignLabels, getDesignLabels);
