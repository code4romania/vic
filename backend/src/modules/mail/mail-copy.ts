import { Language } from 'src/modules/user/enums/user.enum';

// The language an email is written in. 'bilingual' = Romanian with the English text below, for a
// recipient whose language VIC does not know (no account yet, or never chose one).
export type MailMode = Language | 'bilingual';

export interface MailCopy {
  subject: string;
  title: string;
  subtitle: string;
  ctaLabel?: string;
}

// One email in every language, plus what does not depend on the language.
export interface LocalizedMail {
  copy: Record<Language, MailCopy>;
  ctaLink?: string;
  code?: string;
}

// Context for mail-template.hbs. The template runs with Handlebars strict mode, so title, subtitle,
// cta and code are always passed (null when absent). isEnglish and english are only read by
// {{#if}}, which accepts a missing key: an email queued before the languages existed still renders.
// contactEmail is added by MailService.
export interface MailContext {
  title: string;
  subtitle: string;
  cta: { link: string; label: string } | null;
  code: string | null;
  isEnglish: boolean;
  english: { title: string; subtitle: string } | null;
}

export interface RenderedMail {
  subject: string;
  context: MailContext;
}

export const mailModeFor = (language?: Language | null): MailMode =>
  language === Language.RO || language === Language.EN ? language : 'bilingual';

const both = (ro: string, en: string): string =>
  ro === en ? ro : `${ro} / ${en}`;

export function renderMail(mail: LocalizedMail, mode: MailMode): RenderedMail {
  const ro = mail.copy[Language.RO];
  const en = mail.copy[Language.EN];
  const bilingual = mode === 'bilingual';
  const main = mode === Language.EN ? en : ro;

  const ctaLabel = bilingual
    ? both(ro.ctaLabel ?? '', en.ctaLabel ?? '')
    : main.ctaLabel ?? '';

  return {
    subject: bilingual ? both(ro.subject, en.subject) : main.subject,
    context: {
      title: main.title,
      subtitle: main.subtitle,
      cta: mail.ctaLink ? { link: mail.ctaLink, label: ctaLabel } : null,
      code: mail.code ?? null,
      isEnglish: mode === Language.EN,
      english: bilingual ? { title: en.title, subtitle: en.subtitle } : null,
    },
  };
}
