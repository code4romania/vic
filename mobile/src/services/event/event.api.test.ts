import API from '../api';
import { getEvents } from './event.api';
import { OrderDirection } from '../../common/enums/order-direction.enum';
import { EventType } from '../../common/enums/event-type.enum';

jest.mock('../api', () => ({ __esModule: true, default: { get: jest.fn() } }));

describe('getEvents', () => {
  it('sends the Organizație / Când filters with the search', async () => {
    (API.get as jest.Mock).mockResolvedValue({ data: { items: [], meta: {} } });

    await getEvents({
      pageParam: 2,
      orderDirection: OrderDirection.ASC,
      search: 'mar',
      eventFilter: Object.values(EventType)[0],
      organizationId: 'org-1',
      startFrom: '2026-11-20',
      startTo: '2026-11-22',
    });

    expect(API.get).toHaveBeenCalledWith('/mobile/event', {
      params: expect.objectContaining({
        page: 2,
        search: 'mar',
        organizationId: 'org-1',
        startFrom: '2026-11-20',
        startTo: '2026-11-22',
      }),
    });
  });
});
