import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { GetMyEventsCountsDto } from 'src/api/_mobile/event/dto/get-my-events-counts.dto';
import { EventFacade } from 'src/modules/event/services/event.facade';
import { GetMyEventsCountsUsecase } from './get-my-events-counts.usecase';

describe('GetMyEventsCountsUsecase', () => {
  it('answers the three segment totals for the filters', async () => {
    const facade = {
      countMyEvents: jest
        .fn()
        .mockResolvedValue({ open: 4, going: 2, organizations: 3 }),
    };
    const usecase = new GetMyEventsCountsUsecase(
      facade as unknown as EventFacade,
    );
    const options = { userId: 'user-1', search: 'Mara', organizationId: 'o' };

    await expect(usecase.execute(options)).resolves.toEqual({
      open: 4,
      going: 2,
      organizations: 3,
    });
    expect(facade.countMyEvents).toHaveBeenCalledWith(options);
  });
});

describe('GetMyEventsCountsDto', () => {
  const dto = (query: Record<string, string>): GetMyEventsCountsDto =>
    plainToInstance(GetMyEventsCountsDto, query);

  it('takes the list filters, a day with no time as the whole day in Romania', async () => {
    const filters = dto({
      search: 'Mara',
      organizationId: '3f1c2d4e-5a6b-4c7d-8e9f-0a1b2c3d4e5f',
      startFrom: '2030-05-20',
      startTo: '2030-05-20',
    });
    expect(await validate(filters)).toEqual([]);
    expect(filters.startFrom.toISOString()).toBe('2030-05-19T21:00:00.000Z');
    expect(filters.startTo.toISOString()).toBe('2030-05-20T20:59:59.999Z');
  });

  it('refuses a malformed organization or date', async () => {
    const errors = await validate(
      dto({ organizationId: 'nope', startFrom: 'not-a-date' }),
    );
    expect(errors.map((error) => error.property).sort()).toEqual([
      'organizationId',
      'startFrom',
    ]);
  });
});
