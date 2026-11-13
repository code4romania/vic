import { ActionsArchiveFacade } from 'src/modules/actions-archive/actions-archive.facade';
import { TrackedEventName } from 'src/modules/actions-archive/enums/action-resource-types.enum';
import {
  ALL_NEWS_EVENTS,
  NewsType,
} from 'src/modules/actions-archive/enums/news-type.enum';
import { UserFacadeService } from 'src/modules/user/services/user-facade.service';
import { GetManyNewsUsecase } from './get-many-news.usecase';
import { GetUnreadNewsCountUsecase } from './get-unread-news-count.usecase';
import { MarkNewsSeenUsecase } from './mark-news-seen.usecase';

// The badge on the mobile Home bell: unread "Noutăți" across every tab, read when the screen opens.
describe('unread news', () => {
  it('counts the events of every Noutăți tab, for the user', async () => {
    const facade = { countUnreadNews: jest.fn().mockResolvedValue(4) };
    const useCase = new GetUnreadNewsCountUsecase(
      facade as unknown as ActionsArchiveFacade,
    );

    expect(await useCase.execute('u')).toBe(4);
    expect(facade.countUnreadNews).toHaveBeenCalledWith({
      userId: 'u',
      events: ALL_NEWS_EVENTS,
    });
    expect([...ALL_NEWS_EVENTS].sort()).toEqual(
      [
        TrackedEventName.APPROVE_ACCESS_REQUEST,
        TrackedEventName.REJECT_ACCESS_REQUEST,
        TrackedEventName.CREATE_CONTRACT,
        TrackedEventName.APPROVE_CONTRACT,
        TrackedEventName.REJECT_CONTRACT,
        TrackedEventName.CHANGE_ACTIVITY_LOG_STATUS,
      ].sort(),
    );
  });

  it('the list still asks for the events of the chosen tab only', async () => {
    const facade = { findNews: jest.fn().mockResolvedValue({ items: [] }) };
    const useCase = new GetManyNewsUsecase(
      facade as unknown as ActionsArchiveFacade,
    );

    await useCase.execute({
      userId: 'u',
      events: [],
      type: NewsType.LOGGED_HOURS,
    } as never);
    expect(facade.findNews).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'u',
        events: [TrackedEventName.CHANGE_ACTIVITY_LOG_STATUS],
      }),
    );
  });

  it('opening Noutăți marks the user’s news as seen', async () => {
    const users = { markNewsSeen: jest.fn().mockResolvedValue(undefined) };
    await new MarkNewsSeenUsecase(
      users as unknown as UserFacadeService,
    ).execute('u');
    expect(users.markNewsSeen).toHaveBeenCalledWith('u');
  });
});
