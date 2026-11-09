import { ExceptionsService } from 'src/infrastructure/exceptions/exceptions.service';
import { ActionsArchiveFacade } from 'src/modules/actions-archive/actions-archive.facade';
import { AuthIdentityFacade } from 'src/modules/auth/services/auth-identity.facade';
import { AuthRealm } from 'src/modules/auth/enums/auth.enums';
import { NotificationsSettingsFacade } from 'src/modules/notifications/notifications-settings.facade';
import { UserFacadeService } from 'src/modules/user/services/user-facade.service';
import { IAdminUserModel } from 'src/modules/user/models/admin-user.model';
import { IRegularUserModel } from 'src/modules/user/models/regular-user.model';
import { VolunteerStatus } from 'src/modules/volunteer/enums/volunteer-status.enum';
import { IVolunteerModel } from 'src/modules/volunteer/model/volunteer.model';
import { VolunteerFacade } from 'src/modules/volunteer/services/volunteer.facade';
import {
  assertVolunteerEditable,
  assertVolunteerNotBlocked,
} from 'src/modules/volunteer/volunteer-status.rules';
import { GetOrganizationWithEventsUseCase } from '../organization/get-organization-with-events.usecase';
import { CreateAccessRequestUseCase } from '../access-request/create-access-request.usecase';
import { SwitchOrganizationUsecase } from '../organization/switch-organization.usecase';
import { RejoinOrganizationUsecase } from '../organization/rejoin-organization.usecase';
import { CreateRegularUsereUseCaseService } from '../user/create-regular-user.usecase';
import { GetOneRegularUserProfileUseCase } from '../user/get-regule-user-profile.usecase';
import { SyncUserOrganizationsUsecase } from '../user/sync-user-organizations.usecase';
import { ActivateVolunteerUsecase } from './activate-volunteer.usecase';
import { BlockVolunteerUsecase } from './block-volunteer.usecase';
import { GetOneVolunteerUsecase } from './get-one-volunteer.usecase';

const volunteer = (overrides: Partial<IVolunteerModel> = {}): IVolunteerModel =>
  ({
    id: 'volunteer-id',
    status: VolunteerStatus.ACTIVE,
    source: null,
    isFavorite: false,
    archivedOn: null,
    archivedById: null,
    blockedOn: null,
    user: { id: 'user-id', name: 'Ana Pop' },
    organization: { id: 'org-id', name: 'ONG' },
    ...overrides,
  }) as IVolunteerModel;

const admin = { id: 'admin-id' } as IAdminUserModel;

const rejectsWith = (promise: Promise<unknown>, code: string): Promise<void> =>
  expect(promise).rejects.toMatchObject({ response: { code_error: code } });

describe('volunteer status rules (#472)', () => {
  it('only Active volunteers can change hours, documents and contracts', () => {
    expect(() =>
      assertVolunteerEditable({ status: VolunteerStatus.ACTIVE }),
    ).not.toThrow();
    for (const status of [
      VolunteerStatus.INACTIVE,
      VolunteerStatus.BLOCKED,
      VolunteerStatus.CANDIDATE,
    ]) {
      expect(() => assertVolunteerEditable({ status })).toThrow(
        expect.objectContaining({
          response: expect.objectContaining({ code_error: 'VOLUNTEER_007' }),
        }),
      );
    }
  });

  it('Blocked is permanent', () => {
    expect(() =>
      assertVolunteerNotBlocked({ status: VolunteerStatus.BLOCKED }),
    ).toThrow();
    expect(() =>
      assertVolunteerNotBlocked({ status: VolunteerStatus.INACTIVE }),
    ).not.toThrow();
  });
});

describe('status change usecases (#472)', () => {
  let getOne: { execute: jest.Mock };
  let facade: { activate: jest.Mock; block: jest.Mock };

  beforeEach(() => {
    getOne = { execute: jest.fn() };
    facade = { activate: jest.fn(), block: jest.fn() };
  });

  it('refuses to activate a blocked volunteer', async () => {
    getOne.execute.mockResolvedValue(
      volunteer({ status: VolunteerStatus.BLOCKED }),
    );
    const useCase = new ActivateVolunteerUsecase(
      facade as unknown as VolunteerFacade,
      getOne as unknown as GetOneVolunteerUsecase,
      new ExceptionsService(),
      { trackEvent: jest.fn() } as unknown as ActionsArchiveFacade,
      { execute: jest.fn() } as unknown as SwitchOrganizationUsecase,
    );

    await rejectsWith(useCase.execute('volunteer-id', admin), 'VOLUNTEER_006');
    expect(facade.activate).not.toHaveBeenCalled();
  });

  it('refuses to block an already blocked volunteer', async () => {
    getOne.execute.mockResolvedValue(
      volunteer({ status: VolunteerStatus.BLOCKED }),
    );
    const useCase = new BlockVolunteerUsecase(
      facade as unknown as VolunteerFacade,
      getOne as unknown as GetOneVolunteerUsecase,
      { trackEvent: jest.fn() } as unknown as ActionsArchiveFacade,
      { execute: jest.fn() } as unknown as SyncUserOrganizationsUsecase,
    );

    await rejectsWith(useCase.execute('volunteer-id', admin), 'VOLUNTEER_006');
    expect(facade.block).not.toHaveBeenCalled();
  });
});

describe('RejoinOrganizationUsecase (#500)', () => {
  const user = { id: 'user-id' } as IRegularUserModel;

  const build = (
    current: IVolunteerModel,
  ): {
    useCase: RejoinOrganizationUsecase;
    request: { execute: jest.Mock };
  } => {
    const request = { execute: jest.fn() };
    const useCase = new RejoinOrganizationUsecase(
      request as unknown as CreateAccessRequestUseCase,
      { execute: jest.fn() } as unknown as GetOrganizationWithEventsUseCase,
      {
        execute: jest.fn().mockResolvedValue(current),
      } as unknown as GetOneVolunteerUsecase,
      new ExceptionsService(),
    );
    return { useCase, request };
  };

  it('sends a request to the organization when the volunteer left by themselves', async () => {
    const { useCase, request } = build(
      volunteer({ status: VolunteerStatus.INACTIVE, archivedById: 'user-id' }),
    );
    await useCase.execute('volunteer-id', user);
    expect(request.execute).toHaveBeenCalledWith({
      organizationId: 'org-id',
      requestedById: 'user-id',
      answers: [],
    });
  });

  it('refuses when the organization made the volunteer inactive', async () => {
    const { useCase, request } = build(
      volunteer({ status: VolunteerStatus.INACTIVE, archivedById: 'admin-id' }),
    );
    await rejectsWith(useCase.execute('volunteer-id', user), 'VOLUNTEER_008');
    expect(request.execute).not.toHaveBeenCalled();
  });
});

describe('CreateRegularUsereUseCaseService claims a Candidate (#472)', () => {
  it('reuses the placeholder user with the same email instead of failing', async () => {
    const users = {
      findRegularUser: jest
        .fn()
        // placeholder lookup
        .mockResolvedValueOnce({
          id: 'placeholder-id',
          email: 'ana@example.ro',
          hasAccount: false,
          notificationsSettings: null,
        })
        // phone owned by a real account?
        .mockResolvedValueOnce(null),
      updateRegularUser: jest.fn(),
      createRegularUser: jest.fn(),
    };
    const identities = {
      findIdentity: jest.fn().mockResolvedValue({
        id: 'identity-id',
        realm: AuthRealm.MOBILE,
        email: 'ana@example.ro',
        userId: null,
      }),
      updateIdentity: jest.fn(),
    };
    const settings = { create: jest.fn().mockResolvedValue({ id: 'ns-id' }) };
    const profile = {
      execute: jest.fn().mockResolvedValue({ id: 'placeholder-id' }),
    };

    const useCase = new CreateRegularUsereUseCaseService(
      users as unknown as UserFacadeService,
      new ExceptionsService(),
      settings as unknown as NotificationsSettingsFacade,
      profile as unknown as GetOneRegularUserProfileUseCase,
      identities as unknown as AuthIdentityFacade,
    );

    await useCase.execute(
      {
        firstName: 'Ana',
        lastName: 'Pop',
        phone: '+40700000000',
        locationId: 1,
        birthday: new Date('2000-01-01'),
      } as never,
      'identity-id',
    );

    expect(users.createRegularUser).not.toHaveBeenCalled();
    expect(users.updateRegularUser).toHaveBeenCalledWith(
      'placeholder-id',
      expect.objectContaining({
        hasAccount: true,
        name: 'Ana Pop',
        notificationsSettingsId: 'ns-id',
      }),
    );
    expect(identities.updateIdentity).toHaveBeenCalledWith('identity-id', {
      userId: 'placeholder-id',
    });
  });
});
