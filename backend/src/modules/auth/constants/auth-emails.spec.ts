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
  activityArea: 'Social',
  description: 'Descriere',
  website: 'https://test.ro',
  taxId: 'RO123',
};

const builders: Array<[string, AuthEmail, string | null]> = [
  ['transitionLinkAdmin', AUTH_EMAILS.transitionLinkAdmin(URL), URL],
  ['transitionLinkVolunteer', AUTH_EMAILS.transitionLinkVolunteer(URL), URL],
  ['resetLink', AUTH_EMAILS.resetLink(URL), URL],
  ['resetCode', AUTH_EMAILS.resetCode('012345'), null],
  ['inviteLink', AUTH_EMAILS.inviteLink(URL, 'Asociatia Test', 'Ana'), URL],
  ['verifyEmailLink', AUTH_EMAILS.verifyEmailLink(URL), URL],
  [
    'confirmOrganizationLink',
    AUTH_EMAILS.confirmOrganizationLink(URL, 'Asociatia Test'),
    URL,
  ],
  [
    'organizationRegistered',
    AUTH_EMAILS.organizationRegistered(
      organization,
      { name: 'Ana', email: 'ana@test.ro', phone: '+40711111111' },
      'https://vic.test/admin/validation',
    ),
    'https://vic.test/admin/validation',
  ],
  [
    'organizationValidated',
    AUTH_EMAILS.organizationValidated('Test', 'https://vic.test/login'),
    'https://vic.test/login',
  ],
  ['passwordChanged', AUTH_EMAILS.passwordChanged(), null],
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

  it('the reset code email shows the code, leading zero included, and has no button', () => {
    const email = AUTH_EMAILS.resetCode('012345');

    expect(email.context.cta).toBeNull();
    expect(render(email)).toContain('<p class="code">012345</p>');
  });

  it('the admin transition email asks to review the Team page', () => {
    const { context } = AUTH_EMAILS.transitionLinkAdmin(URL);

    expect(context.subtitle).toContain('pagina Echipă');
    expect(context.english.subtitle).toContain('Team page');
  });

  it('the volunteer transition email offers social sign-in (decisions R36)', () => {
    const { context } = AUTH_EMAILS.transitionLinkVolunteer(URL);

    expect(context.english.subtitle).toContain(
      'Set a password with this link, or sign in with Google, Facebook or Apple in the app as before.',
    );
    expect(context.subtitle).toContain('Google, Facebook sau Apple');
  });

  it('the new-NGO email gives every field and the ready suspend command', () => {
    const { context } = AUTH_EMAILS.organizationRegistered(
      organization,
      { name: 'Ana', email: 'ana@test.ro', phone: '+40711111111' },
      'https://vic.test/admin/validation',
    );

    for (const value of [
      'Asociatia Test',
      'RO123',
      'contact@test.ro',
      'Str. Test 1',
      'ana@test.ro',
    ]) {
      expect(context.subtitle).toContain(value);
    }
    expect(context.subtitle).toContain('npm run org:suspend -- org-id');
  });

  it('an existing email without cta, code or english still renders', () => {
    const html = render({
      subject: 's',
      context: { title: 'Titlu', subtitle: 'Text' } as AuthEmail['context'],
    });

    expect(html).toContain('Titlu');
    expect(html).not.toContain('class="code"');
    expect(html).not.toContain('class="divider"');
  });
});
