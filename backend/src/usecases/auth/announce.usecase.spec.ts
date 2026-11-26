import { DataSource } from 'typeorm';
import { AuthMailerService } from 'src/modules/auth/services/auth-mailer.service';
import { TransitionMailService } from 'src/modules/auth/services/transition-mail.service';
import { PushNotificationsFacade } from 'src/modules/notifications/notifications.facade';
import { AnnounceUseCase, renderEmailText } from './announce.usecase';

describe('AnnounceUseCase', () => {
  let query: jest.Mock;
  let mailer: { send: jest.Mock };
  let push: { send: jest.Mock };
  let transition: { release: jest.Mock };
  let useCase: AnnounceUseCase;

  beforeEach(() => {
    query = jest.fn(async (sql: string) =>
      sql.includes('push_tokens')
        ? [{ user_id: 'u1' }, { user_id: 'u2' }]
        : [{ email: 'a@x.ro' }, { email: 'b@x.ro' }, { email: 'c@x.ro' }],
    );
    mailer = { send: jest.fn() };
    push = { send: jest.fn() };
    transition = { release: jest.fn().mockResolvedValue(42) };
    useCase = new AnnounceUseCase(
      { query } as unknown as DataSource,
      mailer as unknown as AuthMailerService,
      transition as unknown as TransitionMailService,
      push as unknown as PushNotificationsFacade,
    );
  });

  it('back --dry-run counts identities and devices, renders the first email and sends nothing', async () => {
    const report = await useCase.execute({ template: 'back', dryRun: true });

    expect(report).toMatchObject({
      recipients: 3,
      pushUsers: 2,
      emailsQueued: 0,
    });
    expect(query.mock.calls[0][0]).toContain('FROM auth_identity');
    const text = renderEmailText(report.sample.to, report.sample.email);
    expect(text).toContain('To: a@x.ro');
    expect(text).toContain('VIC is back');
    expect(mailer.send).not.toHaveBeenCalled();
    expect(push.send).not.toHaveBeenCalled();
  });

  it('back emails every recipient and pushes to every device', async () => {
    const report = await useCase.execute({ template: 'back' });

    expect(report.emailsQueued).toBe(3);
    expect(mailer.send).toHaveBeenCalledTimes(3);
    expect(push.send).toHaveBeenCalledWith(
      expect.objectContaining({
        userIds: ['u1', 'u2'],
        // each phone in its user's language
        title: { ro: 'VIC funcționează din nou', en: 'VIC is back' },
      }),
    );
  });

  it('announce reads the user table, needs a date and never pushes', async () => {
    await expect(useCase.execute({ template: 'announce' })).rejects.toThrow(
      '--date',
    );

    const report = await useCase.execute({
      template: 'announce',
      date: '2026-12-12',
      dryRun: true,
    });

    expect(query.mock.calls.at(-1)[0]).toContain('FROM "user"');
    // each language writes the date its own way, once
    expect(report.sample.email.copy.ro.subject).toBe(
      'Sâmbătă, 12 decembrie, VIC are un nou sistem de autentificare',
    );
    expect(report.sample.email.copy.en.subject).toBe(
      'On Saturday 12 December VIC gets a new login',
    );
    expect(report.pushUsers).toBe(0);
  });

  it('refuses a date that is not a real YYYY-MM-DD day', async () => {
    for (const date of ['12 decembrie', '2026-02-30', '2026-12-1']) {
      await expect(
        useCase.execute({ template: 'reminder', date, dryRun: true }),
      ).rejects.toThrow('YYYY-MM-DD');
    }
  });

  it('back tells admins about the web link and volunteers about the app code; the push only about the app', async () => {
    await useCase.execute({ template: 'back' });

    const email = mailer.send.mock.calls[0][1];
    expect(email.copy.ro.subtitle).toContain('vic.ngohub.ro');
    expect(email.copy.ro.subtitle).toContain('link');
    expect(email.copy.en.subtitle).toContain('code');
    const { body } = push.send.mock.calls[0][0];
    expect(body.ro).not.toContain('vic.ngohub.ro');
    expect(body.en).toContain('app');
  });

  it('app emails only the volunteers (mobile identities) and pushes to every device', async () => {
    const report = await useCase.execute({ template: 'app' });

    expect(query.mock.calls[0][0]).toContain('realm = $2');
    expect(query.mock.calls[0][1]).toEqual(['disabled', 'mobile']);
    expect(report).toMatchObject({ emailsQueued: 3, pushUsers: 2 });
    expect(push.send).toHaveBeenCalledWith(
      expect.objectContaining({
        title: {
          ro: 'Aplicația VIC nouă e în magazine',
          en: 'The new VIC app is in the stores',
        },
      }),
    );
  });

  it('release-transition resumes the held queue', async () => {
    await expect(useCase.releaseTransition()).resolves.toBe(42);
  });
});
