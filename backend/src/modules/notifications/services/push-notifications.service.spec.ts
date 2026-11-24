import { Queue } from 'bull';
import { ExpoPushNotificationsService } from 'src/infrastructure/providers/expo-push-notifications/module/expo-push-notifications.service';
import { Language } from 'src/modules/user/enums/user.enum';
import { PushTokensRepository } from '../repositories/push-tokens.repository';
import { PushNotificationsService } from './push-notifications.service';

// Each phone gets the notification in the language of its user.
describe('PushNotificationsService', () => {
  let devices: { token: string; language: Language | null }[];
  let expo: { send: jest.Mock };
  let queue: { add: jest.Mock };
  let service: PushNotificationsService;

  beforeEach(() => {
    devices = [];
    expo = {
      send: jest.fn(async (tokens: string[]) =>
        tokens.map((token) => ({ status: 'ok', id: `ticket-${token}` })),
      ),
    };
    queue = { add: jest.fn() };
    service = new PushNotificationsService(
      queue as unknown as Queue<never>,
      expo as unknown as ExpoPushNotificationsService,
      {
        findByUserIdsWithLanguage: jest.fn(async () => devices),
      } as unknown as PushTokensRepository,
    );
  });

  const body = { ro: 'Ai un mesaj nou', en: 'You have a new message' };

  it('sends one batch per language; a user with no language gets Romanian', async () => {
    devices = [
      { token: 'ro-1', language: Language.RO },
      { token: 'en-1', language: Language.EN },
      { token: 'none-1', language: null },
      { token: 'en-2', language: Language.EN },
    ];

    await service.send({
      userIds: ['a', 'b', 'c'],
      title: 'VIC',
      body,
      data: { key: 'k' },
    });

    expect(expo.send).toHaveBeenCalledTimes(2);
    expect(expo.send).toHaveBeenCalledWith(
      ['ro-1', 'none-1'],
      'VIC',
      'Ai un mesaj nou',
      { key: 'k' },
    );
    expect(expo.send).toHaveBeenCalledWith(
      ['en-1', 'en-2'],
      'VIC',
      'You have a new message',
      { key: 'k' },
    );
  });

  it('keeps each ticket with its own token for the receipt check', async () => {
    devices = [
      { token: 'en-1', language: Language.EN },
      { token: 'ro-1', language: Language.RO },
    ];

    await service.send({ userIds: ['a', 'b'], title: 'VIC', body });

    const [pairs] = queue.add.mock.calls[0];
    expect(pairs).toEqual(
      expect.arrayContaining([
        { token: 'ro-1', ticket: { status: 'ok', id: 'ticket-ro-1' } },
        { token: 'en-1', ticket: { status: 'ok', id: 'ticket-en-1' } },
      ]),
    );
    expect(pairs).toHaveLength(2);
  });

  it('a plain text goes to everyone as it is, and nobody is skipped when all share a language', async () => {
    devices = [
      { token: 'ro-1', language: Language.RO },
      { token: 'ro-2', language: null },
    ];

    await service.send({ userIds: ['a'], title: 'VIC', body: 'Salut' });

    expect(expo.send).toHaveBeenCalledTimes(1);
    expect(expo.send).toHaveBeenCalledWith(
      ['ro-1', 'ro-2'],
      'VIC',
      'Salut',
      undefined,
    );
  });

  it('sends nothing when nobody has a device', async () => {
    await service.send({ userIds: ['a'], title: 'VIC', body });

    expect(expo.send).not.toHaveBeenCalled();
  });
});
