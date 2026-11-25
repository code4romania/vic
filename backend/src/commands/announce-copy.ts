// The T-7 and T-1 announcements of the VIC 2.0 login (decisions R3), sent by production 1.x before the
// cutover. Same words as the 2.0 templates (develop, auth-emails.ts), plus the 30-day transition for the
// old store app (decided 25 Nov 2026). Push texts are Romanian only: 1.x does not know a user's language.

export type AnnounceTemplate = 'announce' | 'reminder';

export interface CutoverDate {
  ro: string;
  en: string;
}

export interface AnnounceCopy {
  email: {
    subject: string;
    title: string;
    subtitle: string;
    english: { title: string; subtitle: string };
  };
  push: { title: string; body: string };
}

const RO_DAYS = [
  'duminică',
  'luni',
  'marți',
  'miercuri',
  'joi',
  'vineri',
  'sâmbătă',
];
const RO_MONTHS = [
  'ianuarie',
  'februarie',
  'martie',
  'aprilie',
  'mai',
  'iunie',
  'iulie',
  'august',
  'septembrie',
  'octombrie',
  'noiembrie',
  'decembrie',
];
const EN_DAYS = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];
const EN_MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const capitalize = (text: string): string =>
  text.charAt(0).toUpperCase() + text.slice(1);

// `--date 2026-12-12` → the date in both languages, spelled out here so it does not depend on ICU data.
export function cutoverDate(iso: string): CutoverDate {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso ?? '');
  const date = match
    ? new Date(Date.UTC(+match[1], +match[2] - 1, +match[3]))
    : null;
  if (
    !date ||
    date.getUTCDate() !== +match[3] ||
    date.getUTCMonth() !== +match[2] - 1
  ) {
    throw new Error(`--date must be a day as YYYY-MM-DD, got "${iso}"`);
  }
  const day = date.getUTCDate();
  return {
    ro: `${RO_DAYS[date.getUTCDay()]}, ${day} ${RO_MONTHS[date.getUTCMonth()]}`,
    en: `${EN_DAYS[date.getUTCDay()]} ${day} ${EN_MONTHS[date.getUTCMonth()]}`,
  };
}

const RO_AFTER =
  'După aceea intri cu adresa de email: primești un link sau un cod, fără parolă. Actualizează aplicația din magazin; versiunea veche mai merge 30 de zile.';
const EN_AFTER =
  'Afterwards you log in with your email address: you get a link or a code, no password. Update the app from the store; the old version keeps working for 30 days.';

export function announceCopy(
  template: AnnounceTemplate,
  date: CutoverDate,
): AnnounceCopy {
  switch (template) {
    case 'announce':
      return {
        email: {
          subject: `${capitalize(date.ro)}, VIC are un nou sistem de autentificare`,
          title: `${capitalize(date.ro)}, VIC are un nou sistem de autentificare`,
          subtitle: `În acea zi, VIC va fi indisponibil câteva ore. ${RO_AFTER}`,
          english: {
            title: `On ${date.en} VIC gets a new login`,
            subtitle: `VIC will be unavailable for a few hours that day. ${EN_AFTER}`,
          },
        },
        push: {
          title: 'VIC are un nou sistem de autentificare',
          body: `Din ${date.ro} intri cu adresa de email, fără parolă. Detalii pe email.`,
        },
      };
    case 'reminder':
      return {
        email: {
          subject: `Mâine, ${date.ro}: noul sistem de autentificare VIC`,
          title: `Mâine, ${date.ro}, VIC are un nou sistem de autentificare`,
          subtitle: `VIC va fi indisponibil câteva ore. ${RO_AFTER}`,
          english: {
            title: `Tomorrow, ${date.en}, VIC gets a new login`,
            subtitle: `VIC will be unavailable for a few hours. ${EN_AFTER}`,
          },
        },
        push: {
          title: 'Mâine VIC trece la noul sistem de autentificare',
          body: 'VIC va fi indisponibil câteva ore. Apoi intri cu adresa de email și primești un cod, fără parolă.',
        },
      };
    default:
      throw new Error(
        `--template must be announce or reminder, got "${template}"`,
      );
  }
}
