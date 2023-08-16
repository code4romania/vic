import { Injectable } from '@nestjs/common';
import { IUseCaseService } from 'src/common/interfaces/use-case-service.interface';
import { IVolunteerMonthlyStatistics } from 'src/modules/dashboard/model/dashboard.model';
import { GetOneRegularUserUseCase } from '../user/get-one-regular-user.usecase';
import { EventFacade } from 'src/modules/event/services/event.facade';
import { VolunteerFacade } from 'src/modules/volunteer/services/volunteer.facade';
import { VolunteerStatus } from 'src/modules/volunteer/enums/volunteer-status.enum';
import { ActionsArchiveFacade } from 'src/modules/actions-archive/actions-archive.facade';

@Injectable()
export class GetVolunteerMonthlyNewsStatisticsUsecase
  implements IUseCaseService<IVolunteerMonthlyStatistics>
{
  constructor(
    private readonly getOneRegularUser: GetOneRegularUserUseCase,
    private readonly volunteerFacade: VolunteerFacade,
    private readonly actionsArchiveFacade: ActionsArchiveFacade,
    private readonly eventsFacade: EventFacade,
  ) {}

  public async execute(userId: string): Promise<IVolunteerMonthlyStatistics> {
    const user = await this.getOneRegularUser.execute({ id: userId });

    const statisticsResponse = {
      numberOfUpcomingEvents: 0,
      numberOfActivityLogUpdates: 0,
      numberOfDocumentUpdates: 0,
      numberOfOrganizationUpdates: 0,
    };

    // get number of upcoming events for the user
    statisticsResponse.numberOfUpcomingEvents =
      await this.eventsFacade.countUpcomingEventsByUserId(user.id);

    // get all volunteerIds
    const volunteersFound = await this.volunteerFacade.findAll({
      userId: user.id,
    });

    const volunteers = volunteersFound.filter(
      (vol) => vol.status !== VolunteerStatus.BLOCKED,
    );

    if (volunteers.length > 0) {
      const volunteerIds = volunteers.map((v) => v.id);
      // get number of activityLogUpdates
      statisticsResponse.numberOfActivityLogUpdates =
        await this.actionsArchiveFacade.countActivityLogBetweenDates(
          volunteerIds,
        );
      // get number of documents updates
      statisticsResponse.numberOfDocumentUpdates =
        await this.actionsArchiveFacade.countDocumentStatusUpdatesBetweenDates(
          volunteerIds,
        );
      // get number of organization access requests
      statisticsResponse.numberOfOrganizationUpdates =
        await this.actionsArchiveFacade.countActivityRequestsUpdatesBetweenDates(
          user.id,
        );
    }

    return statisticsResponse;
  }
}
