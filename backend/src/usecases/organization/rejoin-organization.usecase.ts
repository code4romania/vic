import { Injectable } from '@nestjs/common';
import { IUseCaseService } from 'src/common/interfaces/use-case-service.interface';
import { IOrganizationWithEventsModel } from 'src/modules/organization/models/organization-with-events.model';
import { IRegularUserModel } from 'src/modules/user/models/regular-user.model';
import { GetOneVolunteerUsecase } from '../volunteer/get-one-volunteer.usecase';
import { ExceptionsService } from 'src/infrastructure/exceptions/exceptions.service';
import { VolunteerExceptionMessages } from 'src/modules/volunteer/exceptions/volunteer.exceptions';
import { CreateAccessRequestUseCase } from '../access-request/create-access-request.usecase';
import { GetOrganizationWithEventsUseCase } from './get-organization-with-events.usecase';

// #500: a volunteer who left the organization asks to rejoin; the NGO approves the request
// (ApproveAccessRequestUseCase activates the same volunteer record again).
@Injectable()
export class RejoinOrganizationUsecase
  implements IUseCaseService<IOrganizationWithEventsModel>
{
  constructor(
    private readonly createAccessRequestUseCase: CreateAccessRequestUseCase,
    private readonly getOrganizationWithEventsUseCase: GetOrganizationWithEventsUseCase,
    private readonly getOneVolunteerUsecase: GetOneVolunteerUsecase,
    private readonly exceptionService: ExceptionsService,
  ) {}

  public async execute(
    volunteerId: string,
    user: IRegularUserModel,
  ): Promise<IOrganizationWithEventsModel> {
    // 1. Only a volunteer who left by themselves can ask to rejoin; one the NGO made
    // inactive waits for the NGO to activate them again.
    const current = await this.getOneVolunteerUsecase.execute(volunteerId);
    if (current.user?.id !== user.id || current.archivedById !== user.id) {
      this.exceptionService.badRequestException(
        VolunteerExceptionMessages.VOLUNTEER_008,
      );
    }

    // 2. A request for the NGO to approve
    await this.createAccessRequestUseCase.execute({
      organizationId: current.organization.id,
      requestedById: user.id,
      answers: [],
    });

    // 3. The organization, now with the request pending
    return this.getOrganizationWithEventsUseCase.execute(
      current.organization.id,
      user.id,
    );
  }
}
