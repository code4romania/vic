import { Repository } from 'typeorm';
import { OrderDirection } from 'src/common/enums/order-direction.enum';
import { ActivityLogEntity } from '../entities/activity-log.entity';
import { FindManyActivityLogsOptions } from '../models/activity-log.model';
import { ActivityLogRepositoryService } from './activity-log.repository';

describe('ActivityLogRepositoryService.findMany ordering', () => {
  it.each([
    {
      name: 'date descending',
      orderBy: 'date',
      orderDirection: OrderDirection.DESC,
      primary: 'activityLog.date',
      direction: OrderDirection.DESC,
      secondary: ['activityLog.createdOn', 'activityLog.id'],
    },
    {
      name: 'date ascending',
      orderBy: 'date',
      orderDirection: OrderDirection.ASC,
      primary: 'activityLog.date',
      direction: OrderDirection.ASC,
      secondary: ['activityLog.createdOn', 'activityLog.id'],
    },
    {
      name: 'default sort',
      orderBy: undefined,
      orderDirection: undefined,
      primary: 'activityLog.createdOn',
      direction: OrderDirection.ASC,
      secondary: ['activityLog.id'],
    },
    {
      name: 'explicit createdOn descending',
      orderBy: 'createdOn',
      orderDirection: OrderDirection.DESC,
      primary: 'activityLog.createdOn',
      direction: OrderDirection.DESC,
      secondary: ['activityLog.id'],
    },
    {
      name: 'prefixed createdOn descending',
      orderBy: 'activityLog.createdOn',
      orderDirection: OrderDirection.DESC,
      primary: 'activityLog.createdOn',
      direction: OrderDirection.DESC,
      secondary: ['activityLog.id'],
    },
    {
      name: 'relation column descending',
      orderBy: 'user.name',
      orderDirection: OrderDirection.DESC,
      primary: 'user.name',
      direction: OrderDirection.DESC,
      secondary: ['activityLog.createdOn', 'activityLog.id'],
    },
  ])(
    '$name',
    async ({ orderBy, orderDirection, primary, direction, secondary }) => {
      const query = {
        leftJoinAndMapOne: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        addOrderBy: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
      };
      const repository = new ActivityLogRepositoryService({
        createQueryBuilder: jest.fn().mockReturnValue(query),
      } as unknown as Repository<ActivityLogEntity>);
      const options: FindManyActivityLogsOptions = {
        organizationId: 'organization-id',
        limit: 10,
        page: 1,
        orderBy,
        orderDirection,
      };

      await repository.findMany(options);

      expect(query.orderBy.mock.calls).toEqual([[primary, direction]]);
      expect(query.addOrderBy.mock.calls).toEqual(
        secondary.map((column) => [column, direction]),
      );
      expect(query.orderBy.mock.invocationCallOrder[0]).toBeLessThan(
        query.addOrderBy.mock.invocationCallOrder[0],
      );
      expect(
        query.addOrderBy.mock.invocationCallOrder.slice(-1)[0],
      ).toBeLessThan(query.take.mock.invocationCallOrder[0]);
    },
  );
});
