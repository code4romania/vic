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
        title: 'VIC funcționează din nou',
      }),
    );
  });

  it('announce reads the user table, needs a date and never pushes', async () => {
    await expect(useCase.execute({ template: 'announce' })).rejects.toThrow(
      '--date',
    );

    const report = await useCase.execute({
      template: 'announce',
      date: '12 decembrie 2026',
      dryRun: true,
    });

    expect(query.mock.calls.at(-1)[0]).toContain('FROM "user"');
    expect(report.sample.email.subject).toContain('12 decembrie 2026');
    expect(report.pushUsers).toBe(0);
  });

  it('release-transition resumes the held queue', async () => {
    await expect(useCase.releaseTransition()).resolves.toBe(42);
  });
});
