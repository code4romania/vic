import { readFileSync, readdirSync } from 'fs';
import * as Handlebars from 'handlebars';
import { join } from 'path';
import { MailMode, renderMail } from 'src/modules/mail/mail-copy';
import { Language } from 'src/modules/user/enums/user.enum';
import { AuthEmail, AUTH_EMAILS, cutoverDate } from './auth-emails';

const TEMPLATES = join(__dirname, '../../mail/templates');
const URL = 'https://vic.test/set-password?token=secret';

// Renders mail-template.hbs the way MailService and the Handlebars adapter do: strict mode, the
// asset_url helper, the partials, and contactEmail added to every context.
function renderContext(context: object): string {
  const handlebars = Handlebars.create();
  handlebars.registerHelper(
    'asset_url',
    (name: string) => `https://assets.test/${name}`,
  );
  for (const file of readdirSync(join(TEMPLATES, 'partials'))) {
    handlebars.registerPartial(
      file.replace(/\.hbs$/, ''),
      readFileSync(join(TEMPLATES, 'partials', file), 'utf8'),
    );
  }
  const template = handlebars.compile(
    readFileSync(join(TEMPLATES, 'mail-template.hbs'), 'utf8'),
    { strict: true },
  );

  return template({ ...context, contactEmail: 'contact@vic.test' });
}

const render = (email: AuthEmail, mode: MailMode = 'bilingual'): string =>
  renderContext(renderMail(email, mode).context);

const DIACRITICS = /[ăâîșțĂÂÎȘȚ]/;

const organization = {
  id: 'org-id',
  name: 'Asociatia Test',
  email: 'contact@test.ro',
  phone: '+40700000000',
  address: 'Str. Test 1',
  description: 'Descriere',
  website: 'https://test.ro',
  taxId: 'RO123',
};

const builders: Array<[string, AuthEmail, string | null]> = [
  ['transitionLinkAdmin', AUTH_EMAILS.transitionLinkAdmin(URL), URL],
  ['transitionLinkVolunteer', AUTH_EMAILS.transitionLinkVolunteer(), null],
  ['loginLink', AUTH_EMAILS.loginLink(URL), URL],
  ['loginCode', AUTH_EMAILS.loginCode('012345'), null],
  ['inviteLink', AUTH_EMAILS.inviteLink(URL, 'Asociatia Test', 'Ana'), URL],
  [
    'confirmOrganizationLink',
    AUTH_EMAILS.confirmOrganizationLink(URL, 'Asociatia Test'),
    URL,
  ],
  [
    'organizationRegistered',
    AUTH_EMAILS.organizationRegistered(
      organization,
      'https://vic.test/admin/validation',
    ),
    'https://vic.test/admin/validation',
  ],
  [
    'organizationValidated',
    AUTH_EMAILS.organizationValidated('Test', 'https://vic.test/login'),
    'https://vic.test/login',
  ],
  // The bulk messages around the cutover go to every user: render them too.
  ['announce', AUTH_EMAILS.announce(cutoverDate('2026-12-15')), null],
  ['reminder', AUTH_EMAILS.reminder(cutoverDate('2026-12-15')), null],
  ['back', AUTH_EMAILS.back(), null],
];

describe('AUTH_EMAILS', () => {
  it.each(builders)(
    '%s has both languages and renders bilingual under strict mode',
    (_, email, link) => {
      for (const language of [Language.RO, Language.EN]) {
        expect(email.copy[language].subject).toBeTruthy();
        expect(email.copy[language].title).toBeTruthy();
        expect(email.copy[language].subtitle).toBeTruthy();
        // a button has a label in each language
        expect(!!email.copy[language].ctaLabel).toBe(!!link);
      }
      expect(email.ctaLink ?? null).toBe(link);

      const { subject, context } = renderMail(email, 'bilingual');
      expect(subject).toBe(
        `${email.copy.ro.subject} / ${email.copy.en.subject}`,
      );
      expect(context).toHaveProperty('cta');
      expect(context).toHaveProperty('code');
      expect(context.english).toEqual({
        title: email.copy.en.title,
        subtitle: email.copy.en.subtitle,
      });

      // Handlebars escapes values (= becomes &#x3D;); browsers decode them again inside href.
      const html = render(email);
      expect(html).toContain('<html lang="ro">');
      expect(html).toContain(Handlebars.escapeExpression(email.copy.ro.title));
      expect(html).toContain(Handlebars.escapeExpression(email.copy.en.title));
      expect(html).toContain('contact@vic.test');
      // the footer in both languages
      expect(html).toContain('Întrebări?');
      expect(html).toContain('Questions?');
      if (link) {
        expect(html).toContain(Handlebars.escapeExpression(link));
        // the button and the line under it in both languages
        expect(html).toContain(
          Handlebars.escapeExpression(
            `${email.copy.ro.ctaLabel} / ${email.copy.en.ctaLabel}`,
          ),
        );
        expect(html).toContain('Dacă butonul nu merge');
        expect(html).toContain('If the button does not work');
      }
    },
  );

  it.each(builders)('%s in English has no Romanian text', (_, email, link) => {
    const { subject, context } = renderMail(email, Language.EN);
    expect(subject).toBe(email.copy.en.subject);
    expect(context.english).toBeNull();

    const html = render(email, Language.EN);
    expect(html).toContain('<html lang="en">');
    expect(html).toContain(Handlebars.escapeExpression(email.copy.en.title));
    expect(html).not.toContain('class="divider"');
    expect(html).toContain('Questions?');
    for (const romanian of [
      'Întrebări?',
      'este dezvoltat',
      'Dacă butonul nu merge',
    ]) {
      expect(html).not.toContain(romanian);
    }
    if (link) {
      expect(html).toContain(
        `>${Handlebars.escapeExpression(email.copy.en.ctaLabel)}</a>`,
      );
      expect(html).toContain('If the button does not work');
    }
  });

  it.each(builders)('%s in Romanian has no English text', (_, email, link) => {
    const { subject, context } = renderMail(email, Language.RO);
    expect(subject).toBe(email.copy.ro.subject);
    expect(context.english).toBeNull();

    const html = render(email, Language.RO);
    expect(html).toContain('<html lang="ro">');
    expect(html).toContain(Handlebars.escapeExpression(email.copy.ro.title));
    expect(html).not.toContain('class="divider"');
    expect(html).toContain('Întrebări?');
    for (const english of ['Questions?', 'If the button does not work']) {
      expect(html).not.toContain(english);
    }
    if (link) {
      expect(html).toContain(
        `>${Handlebars.escapeExpression(email.copy.ro.ctaLabel)}</a>`,
      );
    }
  });

  it('the English texts have no Romanian letters', () => {
    const fixed = [
      ...builders.map(([, email]) => email),
      AUTH_EMAILS.volunteerInvitation('Test', true),
      AUTH_EMAILS.volunteerInvitation('Test', false),
      AUTH_EMAILS.sensitiveActionCode('123456', { ro: 'x', en: 'x' }),
      AUTH_EMAILS.changeEmailCode('123456'),
      AUTH_EMAILS.emailChanged('ana@example.ro'),
      AUTH_EMAILS.organizationDeleted(
        { name: 'Test', taxId: null },
        { name: 'Ana', email: 'ana@example.ro' },
      ),
    ];
    for (const { copy } of fixed) {
      expect(Object.values(copy.en).join(' ')).not.toMatch(DIACRITICS);
    }
  });

  it('the login code email shows the code, leading zero included, and has no button', () => {
    const email = AUTH_EMAILS.loginCode('012345');

    expect(renderMail(email, 'bilingual').context.cta).toBeNull();
    for (const mode of ['bilingual', Language.RO, Language.EN] as MailMode[]) {
      const html = render(email, mode);
      expect(html).toMatch(/class="code"[^>]*>012345<\/td>/);
      expect(html).not.toContain('class="cta"');
    }
  });

  it('the admin transition email asks to review the Team page', () => {
    const { copy } = AUTH_EMAILS.transitionLinkAdmin(URL);

    expect(copy.ro.subtitle).toContain('pagina Echipă');
    expect(copy.en.subtitle).toContain('Team page');
  });

  it('the volunteer transition email explains the email code and offers social sign-in, without a link', () => {
    const email = AUTH_EMAILS.transitionLinkVolunteer();

    expect(email.ctaLink).toBeUndefined();
    expect(email.copy.en.subtitle).toContain('No more passwords');
    expect(email.copy.en.subtitle).toContain('Google or Apple');
    expect(email.copy.ro.subtitle).toContain('Google sau Apple');
  });

  it('no email talks about choosing or changing a password (VIC 2.0, #514)', () => {
    for (const [, email] of builders) {
      expect(email.copy.en.subtitle).not.toMatch(
        /set (a|your|a new) password|choose a (new )?password/i,
      );
    }
  });

  // #710: an email is kept and forwarded; the details stay on the validation page, behind the login
  it('the new-NGO email names the NGO and its CUI, and nothing else', () => {
    const email = AUTH_EMAILS.organizationRegistered(
      organization,
      'https://vic.test/admin/validation',
    );
    const text = `${email.copy.ro.subtitle} ${email.copy.en.subtitle}`;

    expect(email.copy.ro.title).toContain('Asociatia Test');
    expect(email.copy.ro.subtitle).toContain('CUI RO123');
    expect(email.copy.en.subtitle).toContain('CUI RO123');
    expect(email.ctaLink).toBe('https://vic.test/admin/validation');
    for (const hidden of [
      'contact@test.ro',
      'Str. Test 1',
      'org-id',
      'org:suspend',
      'npm run',
    ]) {
      expect(text).not.toContain(hidden);
    }
  });

  // An email queued before the languages existed has only these keys: it must still render, in Romanian.
  it('an existing email without cta, code, english or isEnglish still renders', () => {
    const html = renderContext({ title: 'Titlu', subtitle: 'Text' });

    expect(html).toContain('Titlu');
    expect(html).toContain('<html lang="ro">');
    expect(html).toContain('Întrebări?');
    expect(html).not.toContain('Questions?');
    expect(html).not.toContain('class="code"');
    expect(html).not.toContain('class="divider"');
    expect(html).not.toContain('class="cta"');
  });

  it('shows the logo as an inline attachment, with no remote images', () => {
    const html = render(AUTH_EMAILS.loginCode('012345'));
    expect(html).toContain('src="cid:vic-logo"');
    expect(html).not.toMatch(/src="https?:/);
  });
});
