import { Repository } from 'typeorm';
import { EventEntity } from '../entities/event.entity';
import { EventRepository } from './event.repository';

// The mobile segment badges (GET /mobile/event/counts) must be built with the very query of each
// list, so a badge never says something other than its list. This records every call made on the
// query builders and compares the list's to the count's.
type Call = { method: string; args: unknown[] };

const recordingBuilder = (calls: Call[]): unknown => {
  const builder: unknown = new Proxy(
    {},
    {
      get: (_target, method: string): unknown => {
        if (method === 'then') return undefined;
        if (method === 'getQuery') return (): string => '(subquery)';
        if (method === 'getCount') return async (): Promise<number> => 7;
        if (method === 'getManyAndCount')
          return async (): Promise<[unknown[], number]> => [[], 7];
        return (...args: unknown[]): unknown => {
          calls.push({ method, args });
          return builder;
        };
      },
    },
  );
  return builder;
};

describe('EventRepository mobile segments', () => {
  let calls: Call[][];
  const repository = new EventRepository({
    createQueryBuilder: () => {
      const own: Call[] = [];
      calls.push(own);
      return recordingBuilder(own);
    },
  } as unknown as Repository<EventEntity>);

  const filters = {
    userId: 'user-1',
    search: 'Mara',
    organizationId: 'org-1',
    startFrom: new Date('2030-05-01T00:00:00Z'),
    startTo: new Date('2030-05-31T00:00:00Z'),
  };

  // the conditions and their parameters, without the "now" that differs between two calls
  const conditions = (recorded: Call[]): unknown[] =>
    recorded
      .filter(({ method }) =>
        ['where', 'andWhere', 'from', 'select'].includes(method),
      )
      .map(({ method, args }) => [
        method,
        args.map((arg) =>
          arg && typeof arg === 'object' && 'currentDate' in arg
            ? { ...arg, currentDate: 'now' }
            : typeof arg === 'object' && arg?.constructor?.name === 'Brackets'
              ? 'brackets'
              : arg,
        ),
      ]);

  beforeEach(() => {
    calls = [];
  });

  it.each([
    ['open', 'findOpenEvents'],
    ['going', 'findGoingEvents'],
    ['organizations', 'findMyOrganizationsEvents'],
  ] as const)(
    'counts %s with the same conditions as its list',
    async (segment, finder) => {
      await repository[finder]({ ...filters, limit: 10, page: 1 });
      const listCalls = calls[0];

      calls = [];
      const counts = await repository.countMyEvents(filters);
      expect(counts).toEqual({ open: 7, going: 7, organizations: 7 });

      // countMyEvents builds open, going, organizations in this order
      const index = { open: 0, going: 1, organizations: 2 }[segment];
      expect(conditions(calls[index])).toEqual(conditions(listCalls));
      // the filters are part of it
      expect(JSON.stringify(conditions(calls[index]))).toContain(
        'filterOrganizationId',
      );
      // and a count takes no page
      expect(calls[index].map(({ method }) => method)).not.toContain('take');
    },
  );
});
