import { ActionArchiveListItemPresenter } from 'src/api/actions-archive/presenters/action-history-list-item.presenter';
import { ActivityLogPresenter } from 'src/api/activity-log/presenters/activity-log.presenter';
import { ContractPresenter } from 'src/api/contracts/presenters/contract.presenter';
import { IAdminUserModel } from 'src/modules/user/models/admin-user.model';
import { AdminProfilePresenter } from './admin-profile.presenter';
import { AdminUserPresenter } from './admin-user.presenter';

// Responses that show *other* admins (who approved hours, who changed what, who created a contract) carry
// only their id and name. Their email and phone are personal data that only the admin themselves sees,
// through AdminProfilePresenter. Guards against someone growing AdminUserPresenter for the profile.
describe('admins shown to other users expose only id and name', () => {
  const admin = (n: number): IAdminUserModel => ({
    id: `admin-${n}`,
    name: `Admin ${n}`,
    email: `admin${n}@private.example`,
    phone: `+4070000000${n}`,
    cognitoId: `cognito-${n}`,
    organizationId: 'org-id',
  });

  const expectNoContactDetails = (
    presented: unknown,
    admins: IAdminUserModel[],
  ): void => {
    const json = JSON.stringify(presented);
    for (const a of admins) {
      expect(json).toContain(a.name);
      expect(json).not.toContain(a.email);
      expect(json).not.toContain(a.phone);
      expect(json).not.toContain(a.cognitoId);
    }
  };

  it('AdminUserPresenter is { id, name }', () => {
    expect(
      JSON.parse(JSON.stringify(new AdminUserPresenter(admin(1)))),
    ).toEqual({
      id: 'admin-1',
      name: 'Admin 1',
    });
  });

  it('the activity log: created by, approved by, rejected by', () => {
    const admins = [admin(1), admin(2), admin(3)];

    const presented = new ActivityLogPresenter({
      id: 'log-id',
      date: new Date(),
      hours: 2,
      createdByAdmin: admins[0],
      approvedBy: admins[1],
      rejectedBy: admins[2],
    } as never);

    expectNoContactDetails(presented, admins);
  });

  it('the action history: the author', () => {
    const admins = [admin(4)];

    const presented = new ActionArchiveListItemPresenter({
      id: 'action-id',
      author: admins[0],
      eventName: 'UPDATE_EVENT',
      eventData: {},
      createdOn: new Date(),
    } as never);

    expectNoContactDetails(presented, admins);
  });

  it('contracts: created by and rejected by', () => {
    const admins = [admin(5), admin(6)];

    const presented = new ContractPresenter({
      id: 'contract-id',
      volunteer: { id: 'volunteer-id', user: { name: 'Elena' } },
      createdByAdmin: admins[0],
      rejectedBy: admins[1],
    } as never);

    expectNoContactDetails(presented, admins);
  });

  it('only the admin themselves gets email and phone, through AdminProfilePresenter', () => {
    const presented = JSON.parse(
      JSON.stringify(
        new AdminProfilePresenter({ ...admin(7), superAdmin: true }),
      ),
    );

    expect(presented).toEqual({
      id: 'admin-7',
      name: 'Admin 7',
      email: 'admin7@private.example',
      phone: '+40700000007',
      organizationId: 'org-id',
      superAdmin: true,
    });
  });
});
