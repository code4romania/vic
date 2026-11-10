import { EventEmitter2 } from '@nestjs/event-emitter';
import { ExceptionsService } from 'src/infrastructure/exceptions/exceptions.service';
import { ActionsArchiveFacade } from 'src/modules/actions-archive/actions-archive.facade';
import { AnnouncementStatus } from 'src/modules/announcement/enums/announcement-status.enum';
import { AnnouncementType } from 'src/modules/announcement/enums/announcement-type.enum';
import { IAnnouncementModel } from 'src/modules/announcement/models/announcement.model';
import { AnnouncementFacade } from 'src/modules/announcement/services/announcement.facade';
import { IAdminUserModel } from 'src/modules/user/models/admin-user.model';
import { VolunteerFacade } from 'src/modules/volunteer/services/volunteer.facade';
import { OrganizationGateService } from '../organization/organization-gate.service';
import { GetOrganizationUseCaseService } from '../organization/get-organization.usecase';
import { GetVolunteersUserDataForNotificationsUsecase } from '../volunteer/get-volunteers-user-data-for-notifications.usecase';
import { ChangeAnnouncementStatusUseCase } from './change-announcement-status.usecase';
import { CreateAnnouncementUseCase } from './create-announcement.usecase';
import { GetOneAnnouncementUseCase } from './get-one-announcement.usecase';

const admin = { id: 'admin-id', organizationId: 'org-id' } as IAdminUserModel;

const announcement = (
  overrides: Partial<IAnnouncementModel> = {},
): IAnnouncementModel => ({
  id: 'a-id',
  name: 'Recrutăm',
  description: 'desc',
  status: AnnouncementStatus.INACTIVE,
  type: AnnouncementType.RECRUITMENT,
  displayStartDate: new Date('2026-11-01'),
  organizationId: 'org-id',
  publishedOn: null,
  createdOn: new Date(),
  updatedOn: new Date(),
  ...overrides,
});

type Setup = {
  facade: { update: jest.Mock; create: jest.Mock };
  emitter: { emit: jest.Mock };
  change: ChangeAnnouncementStatusUseCase;
};

const setup = (current: IAnnouncementModel): Setup => {
  const facade = {
    update: jest
      .fn()
      .mockImplementation((id, updates) =>
        Promise.resolve({ ...current, ...updates }),
      ),
    create: jest.fn().mockResolvedValue(current),
  };
  const emitter = { emit: jest.fn() };
  const change = new ChangeAnnouncementStatusUseCase(
    facade as unknown as AnnouncementFacade,
    {
      execute: jest.fn().mockResolvedValue(current),
    } as unknown as GetOneAnnouncementUseCase,
    new ExceptionsService(),
    { count: jest.fn().mockResolvedValue(7) } as unknown as VolunteerFacade,
    {
      execute: jest.fn().mockResolvedValue({ id: 'org-id', name: 'ONG' }),
    } as unknown as GetOrganizationUseCaseService,
    {
      execute: jest
        .fn()
        .mockResolvedValue({ userIds: ['u1'], userEmails: ['u1@x.ro'] }),
    } as unknown as GetVolunteersUserDataForNotificationsUsecase,
    emitter as unknown as EventEmitter2,
    { trackEvent: jest.fn() } as unknown as ActionsArchiveFacade,
  );
  return { facade, emitter, change };
};

describe('announcement status (#503)', () => {
  it('first activation sets publishedOn, counts volunteers and notifies', async () => {
    const { change, facade, emitter } = setup(announcement());
    await change.execute('a-id', AnnouncementStatus.ACTIVE, admin);

    expect(facade.update).toHaveBeenCalledWith(
      'a-id',
      expect.objectContaining({
        status: AnnouncementStatus.ACTIVE,
        publishedOn: expect.any(Date),
        targetedVolunteers: 7,
      }),
    );
    expect(emitter.emit).toHaveBeenCalledTimes(1);
  });

  it('re-activating does not notify again', async () => {
    const { change, emitter } = setup(
      announcement({ publishedOn: new Date('2026-11-02') }),
    );
    await change.execute('a-id', AnnouncementStatus.ACTIVE, admin);
    expect(emitter.emit).not.toHaveBeenCalled();
  });

  it('archived is final', async () => {
    const { change, facade } = setup(
      announcement({ status: AnnouncementStatus.ARCHIVED }),
    );
    await expect(
      change.execute('a-id', AnnouncementStatus.ACTIVE, admin),
    ).rejects.toMatchObject({ response: { code_error: 'ANNOUNCEMENT_002' } });
    expect(facade.update).not.toHaveBeenCalled();
  });

  it('archiving stores the date', async () => {
    const { change, facade } = setup(
      announcement({ status: AnnouncementStatus.ACTIVE }),
    );
    await change.execute('a-id', AnnouncementStatus.ARCHIVED, admin);
    expect(facade.update).toHaveBeenCalledWith('a-id', {
      status: AnnouncementStatus.ARCHIVED,
      archivedOn: expect.any(Date),
    });
  });
});

describe('CreateAnnouncementUseCase (#503)', () => {
  const build = (
    current: IAnnouncementModel,
  ): {
    useCase: CreateAnnouncementUseCase;
    facade: Setup['facade'];
    changeSpy: jest.SpyInstance;
  } => {
    const { facade, change } = setup(current);
    const changeSpy = jest.spyOn(change, 'execute');
    const useCase = new CreateAnnouncementUseCase(
      facade as unknown as AnnouncementFacade,
      new ExceptionsService(),
      { trackEvent: jest.fn() } as unknown as ActionsArchiveFacade,
      { execute: jest.fn() } as unknown as GetOrganizationUseCaseService,
      change,
      {
        assertValidated: jest.fn(),
      } as unknown as OrganizationGateService,
    );
    return { useCase, facade, changeSpy };
  };
  const input = {
    name: 'Recrutăm',
    description: 'desc',
    type: AnnouncementType.ACTIVITY,
    organizationId: 'org-id',
    displayStartDate: new Date('2026-11-10'),
  };

  it('is created inactive and activated when "publish now" is set', async () => {
    const { useCase, facade, changeSpy } = build(announcement());
    await useCase.execute({ ...input, publishNow: true }, admin);

    expect(facade.create).toHaveBeenCalledWith(
      expect.objectContaining({ status: AnnouncementStatus.INACTIVE }),
    );
    expect(changeSpy).toHaveBeenCalledWith(
      'a-id',
      AnnouncementStatus.ACTIVE,
      admin,
    );
  });

  it('rejects a display period that ends before it starts', async () => {
    const { useCase, facade } = build(announcement());
    await expect(
      useCase.execute(
        { ...input, displayEndDate: new Date('2026-11-01') },
        admin,
      ),
    ).rejects.toMatchObject({ response: { code_error: 'ANNOUNCEMENT_005' } });
    expect(facade.create).not.toHaveBeenCalled();
  });
});
