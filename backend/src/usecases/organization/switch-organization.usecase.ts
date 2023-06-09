import { Injectable } from '@nestjs/common';
import { IUseCaseService } from 'src/common/interfaces/use-case-service.interface';
import { ExceptionsService } from 'src/infrastructure/exceptions/exceptions.service';
import { OrganizationExceptionMessages } from 'src/modules/organization/exceptions/exceptions';
import { IOrganizationWithEventsModel } from 'src/modules/organization/models/organization-with-events.model';
import { OrganizationFacadeService } from 'src/modules/organization/services/organization.facade';
import { UserExceptionMessages } from 'src/modules/user/exceptions/exceptions';
import { UserFacadeService } from 'src/modules/user/services/user-facade.service';
import { VolunteerExceptionMessages } from 'src/modules/volunteer/exceptions/volunteer.exceptions';
import { VolunteerFacade } from 'src/modules/volunteer/services/volunteer.facade';
import { GetOrganizationWithEventsUseCase } from './get-organization-with-events.usecase';

@Injectable()
export class SwitchOrganizationUsecase
  implements IUseCaseService<IOrganizationWithEventsModel>
{
  constructor(
    private readonly userService: UserFacadeService,
    private readonly exceptionService: ExceptionsService,
    private readonly organizationService: OrganizationFacadeService,
    private readonly volunteerFacade: VolunteerFacade,
    private readonly getOrganizationWithEventsUsecase: GetOrganizationWithEventsUseCase,
  ) {}

  public async execute(
    organizationId: string,
    userId: string,
  ): Promise<IOrganizationWithEventsModel> {
    // 1. validate if user exists
    const user = await this.userService.findRegularUser({ id: userId });

    if (!user) {
      this.exceptionService.notFoundException(UserExceptionMessages.USER_001);
    }

    // 2. validate if organization exists
    const organization = await this.organizationService.findOrganization({
      id: organizationId,
    });

    if (!organization) {
      this.exceptionService.notFoundException(
        OrganizationExceptionMessages.ORG_001,
      );
    }

    // 3. check if the user have a volunteer profile for this organization
    const volunteer = await this.volunteerFacade.find({
      userId,
      organizationId,
    });

    if (!volunteer) {
      this.exceptionService.badRequestException(
        VolunteerExceptionMessages.VOLUNTEER_005,
      );
    }

    // 4. update active organization for the user
    await this.userService.updateRegularUser(userId, {
      activeOrganizationId: organizationId,
    });

    // 5. return new user with updated data
    return this.getOrganizationWithEventsUsecase.execute(
      organizationId,
      userId,
    );
  }
}
