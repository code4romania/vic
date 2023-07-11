import { Injectable } from '@nestjs/common';
import { IUseCaseService } from 'src/common/interfaces/use-case-service.interface';
import { VolunteerFacade } from 'src/modules/volunteer/services/volunteer.facade';

@Injectable()
export class GetVolunteersUserDataForNotificationsUsecase
  implements IUseCaseService<{ userEmails: string[]; userIds: string[] }>
{
  constructor(private readonly volunteerFacade: VolunteerFacade) {}

  public async execute(
    organizationId: string,
    targetsIds?: string[],
  ): Promise<{ userEmails: string[]; userIds: string[] }> {
    // 6 send push notifications for all active users which are part of the organization or in case of department
    // 6.1. ALL ORGANIZATION
    //  Get all userIds from volunteer where organizationId

    // 6.2. Departments
    // Get all userIds from volunteer join volunteerProfile where volunteerProfile.departmentId in [...targets]
    const volunteers = await this.volunteerFacade.findAllActiveByDepartmentIds(
      organizationId,
      targetsIds,
    );

    // get al userIds for volunteers with push notifications settings set to on
    const userIdsForPushNotifications = volunteers
      .filter(
        (volunteer) =>
          volunteer.user.notificationsSettings?.notificationsViaPush === true,
      )
      .map((volunteer) => volunteer.user.id);

    // get al emails for volunteers with email notifications settings set to on
    const userEmailForEmailNotifications = volunteers
      .filter(
        (volunteer) =>
          volunteer.user.notificationsSettings?.notificationsViaEmail === true,
      )
      .map((volunteer) => volunteer.user.email);

    return {
      userEmails: userEmailForEmailNotifications,
      userIds: userIdsForPushNotifications,
    };
  }
}
