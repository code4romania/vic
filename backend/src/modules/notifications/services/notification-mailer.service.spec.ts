import { MailService } from 'src/modules/mail/services/mail.service';
import { Language, UserType } from 'src/modules/user/enums/user.enum';
import { UserLanguageService } from 'src/modules/user/services/user-language.service';
import { NotificationMailerService } from './notification-mailer.service';

// One email per person, in that person's language; both languages when VIC does not know it.
describe('NotificationMailerService', () => {
  let mail: { sendEmail: jest.Mock };
  let languages: { byEmails: jest.Mock };
  let service: NotificationMailerService;

  beforeEach(() => {
    mail = { sendEmail: jest.fn() };
    languages = {
      byEmails: jest.fn().mockResolvedValue(
        new Map<string, Language | null>([
          ['ro@example.ro', Language.RO],
          ['en@example.ro', Language.EN],
          ['none@example.ro', null],
        ]),
      ),
    };
    service = new NotificationMailerService(
      mail as unknown as MailService,
      languages as unknown as UserLanguageService,
    );
  });

  const sent = (to: string): { subject: string; context: never } =>
    mail.sendEmail.mock.calls.find(([email]) => email.to === to)[0];

  it('each recipient gets their own language; someone without one gets both', async () => {
    await service.send(
      // the address as typed: the lookup ignores case
      ['RO@example.ro', 'en@example.ro', 'none@example.ro', 'gone@example.ro'],
      UserType.REGULAR,
      (t) => ({
        subject: t.APPROVED_HOURS.EMAIL.subject('QA ONG'),
        body: t.APPROVED_HOURS.EMAIL.body(2, '18/11/2026'),
      }),
    );

    expect(languages.byEmails).toHaveBeenCalledWith(
      expect.any(Array),
      UserType.REGULAR,
    );
    expect(mail.sendEmail).toHaveBeenCalledTimes(4);

    expect(sent('RO@example.ro')).toMatchObject({
      subject: 'Orele tale de voluntariat la QA ONG au fost aprobate',
      context: {
        title: 'Orele tale de voluntariat la QA ONG au fost aprobate',
        subtitle:
          '2 ore de voluntariat din 18/11/2026 au fost aprobate. Le găsești în aplicația VIC.',
        isEnglish: false,
        english: null,
      },
    });
    expect(sent('en@example.ro')).toMatchObject({
      subject: 'Your volunteering hours at QA ONG were approved',
      context: {
        title: 'Your volunteering hours at QA ONG were approved',
        subtitle:
          '2 hours of volunteering on 18/11/2026 were approved. You can find them in the VIC app.',
        isEnglish: true,
        english: null,
      },
    });
    // no language yet, or no account with that address: both languages
    for (const to of ['none@example.ro', 'gone@example.ro']) {
      expect(sent(to)).toMatchObject({
        subject:
          'Orele tale de voluntariat la QA ONG au fost aprobate / Your volunteering hours at QA ONG were approved',
        context: {
          title: 'Orele tale de voluntariat la QA ONG au fost aprobate',
          isEnglish: false,
          english: {
            title: 'Your volunteering hours at QA ONG were approved',
            subtitle:
              '2 hours of volunteering on 18/11/2026 were approved. You can find them in the VIC app.',
          },
        },
      });
    }
  });

  it('admins are looked up as admins', async () => {
    await service.send(['admin@example.ro'], UserType.ADMIN, (t) => ({
      subject: t.VOLUNTEER_LEFT.EMAIL.subject('Ana'),
      body: t.VOLUNTEER_LEFT.EMAIL.body('Ana', 'QA ONG'),
    }));

    expect(languages.byEmails).toHaveBeenCalledWith(
      ['admin@example.ro'],
      UserType.ADMIN,
    );
  });

  it('sends nothing without recipients', async () => {
    await service.send([], UserType.REGULAR, (t) => ({
      subject: t.NEW_EVENT.EMAIL.subject('QA ONG'),
      body: t.NEW_EVENT.EMAIL.body,
    }));
    await service.send([undefined], UserType.REGULAR, (t) => ({
      subject: t.NEW_EVENT.EMAIL.subject('QA ONG'),
      body: t.NEW_EVENT.EMAIL.body,
    }));

    expect(mail.sendEmail).not.toHaveBeenCalled();
    expect(languages.byEmails).not.toHaveBeenCalled();
  });
});
