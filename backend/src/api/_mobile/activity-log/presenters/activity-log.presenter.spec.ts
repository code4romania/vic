import { IActivityLogModel } from 'src/modules/activity-log/models/activity-log.model';
import { ActivityLogStatus } from 'src/modules/activity-log/enums/activity-log-status.enum';
import { MobileActivityLogPresenter } from './activity-log.presenter';

// #707: the app shows the day of the decision as it was in Romania, whatever the server's time zone.
describe('MobileActivityLogPresenter approval dates', () => {
  const log = (over: Partial<IActivityLogModel>): IActivityLogModel =>
    ({
      id: 'log-1',
      date: new Date('2026-11-17'),
      hours: 3,
      status: ActivityLogStatus.APPROVED,
      createdOn: new Date('2026-11-17T08:00:00Z'),
      ...over,
    }) as IActivityLogModel;

  it('approved at 01:30 in Bucharest (23:30 UTC the day before) shows the Bucharest day', () => {
    const presenter = new MobileActivityLogPresenter(
      log({ approvedOn: new Date('2026-11-17T23:30:00Z') }),
    );
    expect(presenter.approvedOn).toBe('18/11/2026');
    expect(presenter.rejectedOn).toBe('');
  });

  it('rejected at 02:30 in summer (23:30 UTC, UTC+3) shows the Bucharest day', () => {
    const presenter = new MobileActivityLogPresenter(
      log({
        status: ActivityLogStatus.REJECTED,
        rejectedOn: new Date('2026-07-09T23:30:00Z'),
      }),
    );
    expect(presenter.rejectedOn).toBe('10/07/2026');
  });

  it('a decision during the day keeps its day', () => {
    const presenter = new MobileActivityLogPresenter(
      log({ approvedOn: new Date('2026-11-18T10:00:00Z') }),
    );
    expect(presenter.approvedOn).toBe('18/11/2026');
  });
});
