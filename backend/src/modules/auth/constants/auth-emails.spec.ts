import { readFileSync, readdirSync } from 'fs';
import * as Handlebars from 'handlebars';
import { join } from 'path';
import { AuthEmail, AUTH_EMAILS } from './auth-emails';

const TEMPLATES = join(__dirname, '../../mail/templates');
const URL = 'https://vic.test/set-password?token=secret';

// Renders mail-template.hbs the way MailService and the Handlebars adapter do: strict mode, the
// asset_url helper, the partials, and contactEmail added to every context.
function render(email: AuthEmail): string {
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

  return template({ ...email.context, contactEmail: 'contact@vic.test' });
}

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
  ['announce', AUTH_EMAILS.announce('15 decembrie 2026'), null],
  ['reminder', AUTH_EMAILS.reminder('15 decembrie 2026'), null],
  ['back', AUTH_EMAILS.back(), null],
];

describe('AUTH_EMAILS', () => {
  it.each(builders)(
    '%s has a subject, both languages, cta and code keys, and renders under strict mode',
    (_, email, link) => {
      expect(email.subject).toBeTruthy();
      expect(email.context.title).toBeTruthy();
      expect(email.context.subtitle).toBeTruthy();
      expect(email.context.english.title).toBeTruthy();
      expect(email.context.english.subtitle).toBeTruthy();
      expect(email.context).toHaveProperty('cta');
      expect(email.context).toHaveProperty('code');
      expect(email.context.cta?.link ?? null).toBe(link);

      // Handlebars escapes values (= becomes &#x3D;); browsers decode them again inside href.
      const html = render(email);
      expect(html).toContain(
        Handlebars.escapeExpression(email.context.english.title),
      );
      expect(html).toContain('contact@vic.test');
      if (link) expect(html).toContain(Handlebars.escapeExpression(link));
    },
  );

  it('the login code email shows the code, leading zero included, and has no button', () => {
    const email = AUTH_EMAILS.loginCode('012345');

    expect(email.context.cta).toBeNull();
    const html = render(email);
    expect(html).toMatch(/class="code"[^>]*>012345<\/td>/);
    expect(html).not.toContain('class="cta"');
  });

  it('the admin transition email asks to review the Team page', () => {
    const { context } = AUTH_EMAILS.transitionLinkAdmin(URL);

    expect(context.subtitle).toContain('pagina Echipă');
    expect(context.english.subtitle).toContain('Team page');
  });

  it('the volunteer transition email explains the email code and offers social sign-in, without a link', () => {
    const { context } = AUTH_EMAILS.transitionLinkVolunteer();

    expect(context.cta).toBeNull();
    expect(context.english.subtitle).toContain('No more passwords');
    expect(context.english.subtitle).toContain('Google or Apple');
    expect(context.subtitle).toContain('Google sau Apple');
  });

  it('no email talks about choosing or changing a password (VIC 2.0, #514)', () => {
    for (const [, email] of builders) {
      expect(email.context.english.subtitle).not.toMatch(
        /set (a|your|a new) password|choose a (new )?password/i,
      );
    }
  });

  // #710: an email is kept and forwarded; the details stay on the validation page, behind the login
  it('the new-NGO email names the NGO and its CUI, and nothing else', () => {
    const { context } = AUTH_EMAILS.organizationRegistered(
      organization,
      'https://vic.test/admin/validation',
    );
    const text = `${context.subtitle} ${context.english.subtitle}`;

    expect(context.title).toContain('Asociatia Test');
    expect(context.subtitle).toContain('CUI RO123');
    expect(context.cta.link).toBe('https://vic.test/admin/validation');
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

  it('an existing email without cta, code or english still renders', () => {
    const html = render({
      subject: 's',
      context: { title: 'Titlu', subtitle: 'Text' } as AuthEmail['context'],
    });

    expect(html).toContain('Titlu');
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
