import { Injectable } from '@nestjs/common';
import { IUseCaseService } from 'src/common/interfaces/use-case-service.interface';
import { ExceptionsService } from 'src/infrastructure/exceptions/exceptions.service';
import { ActionsArchiveFacade } from 'src/modules/actions-archive/actions-archive.facade';
import { TrackedEventName } from 'src/modules/actions-archive/enums/action-resource-types.enum';
import { AnnouncementStatus } from 'src/modules/announcement/enums/announcement-status.enum';
import { AnnouncementExceptionMessages } from 'src/modules/announcement/exceptions/announcement.exceptions';
import {
  CreateAnnouncementOptions,
  IAnnouncementModel,
} from 'src/modules/announcement/models/announcement.model';
import { AnnouncementFacade } from 'src/modules/announcement/services/announcement.facade';
import { IAdminUserModel } from 'src/modules/user/models/admin-user.model';
import { GetOrganizationUseCaseService } from '../organization/get-organization.usecase';
import { OrganizationGateService } from '../organization/organization-gate.service';
import { ChangeAnnouncementStatusUseCase } from './change-announcement-status.usecase';

export type CreateAnnouncementInput = Omit<
  CreateAnnouncementOptions,
  'status' | 'targetedVolunteers'
> & { publishNow?: boolean };

export function assertDisplayPeriod(
  start: Date | undefined,
  end: Date | undefined | null,
  exceptions: ExceptionsService,
): void {
  if (start && end && new Date(end).getTime() < new Date(start).getTime()) {
    exceptions.badRequestException(
      AnnouncementExceptionMessages.ANNOUNCEMENT_005,
    );
  }
}

// VIC 2.0 (#503): announcements go to the whole organization (no target) and have a
// type, the number of volunteers needed and a display period. "Publish now" activates it.
@Injectable()
export class CreateAnnouncementUseCase
  implements IUseCaseService<IAnnouncementModel>
{
  constructor(
    private readonly announcementFacade: AnnouncementFacade,
    private readonly exceptionsService: ExceptionsService,
    private readonly actionsArchiveFacade: ActionsArchiveFacade,
    private readonly getOrganizationUsecase: GetOrganizationUseCaseService,
    private readonly changeAnnouncementStatusUseCase: ChangeAnnouncementStatusUseCase,
    private readonly organizationGate: OrganizationGateService,
  ) {}

  public async execute(
    { publishNow, ...announcement }: CreateAnnouncementInput,
    admin: IAdminUserModel,
  ): Promise<IAnnouncementModel> {
    await this.getOrganizationUsecase.execute(announcement.organizationId);
    // Decision 1: an NGO a super admin has not validated does not notify volunteers in VIC's name (403 ORG_005)
    await this.organizationGate.assertValidated(announcement.organizationId);

    assertDisplayPeriod(
      announcement.displayStartDate,
      announcement.displayEndDate,
      this.exceptionsService,
    );

    // 1. Created inactive; activation (and its notifications) goes through one place
    const created = await this.announcementFacade.create({
      ...announcement,
      status: AnnouncementStatus.INACTIVE,
      targetedVolunteers: 0,
    });

    this.actionsArchiveFacade.trackEvent(
      TrackedEventName.CREATE_ANNOUNCEMENT,
      {
        announcementId: created.id,
        announcementTitle: created.name,
        status: publishNow ? AnnouncementStatus.ACTIVE : created.status,
      },
      admin,
    );

    // 2. "Activează imediat după creare"
    if (publishNow) {
      return this.changeAnnouncementStatusUseCase.execute(
        created.id,
        AnnouncementStatus.ACTIVE,
        admin,
      );
    }

    return created;
  }
}
