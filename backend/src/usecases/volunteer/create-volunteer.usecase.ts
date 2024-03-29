import { Injectable } from '@nestjs/common';
import { IUseCaseService } from 'src/common/interfaces/use-case-service.interface';
import { ExceptionsService } from 'src/infrastructure/exceptions/exceptions.service';
import { VolunteerExceptionMessages } from 'src/modules/volunteer/exceptions/volunteer.exceptions';
import {
  CreateVolunteerOptions,
  IVolunteerModel,
} from 'src/modules/volunteer/model/volunteer.model';
import { VolunteerFacade } from 'src/modules/volunteer/services/volunteer.facade';
import { GetOrganizationUseCaseService } from '../organization/get-organization.usecase';
import { GetOneRegularUserUseCase } from '../user/get-one-regular-user.usecase';
import { UserFacadeService } from 'src/modules/user/services/user-facade.service';

@Injectable()
export class CreateVolunteerUseCase
  implements IUseCaseService<IVolunteerModel>
{
  constructor(
    private readonly volunteerFacade: VolunteerFacade,
    private readonly userFacade: UserFacadeService,
    private readonly getOneRegularUserUseCaseService: GetOneRegularUserUseCase,
    private readonly getOrganizationUseCaseService: GetOrganizationUseCaseService,
    private readonly exceptionService: ExceptionsService,
  ) {}

  public async execute(data: CreateVolunteerOptions): Promise<IVolunteerModel> {
    // 1. Check if the user and the organization exists
    await this.getOneRegularUserUseCaseService.execute({ id: data.userId });
    await this.getOrganizationUseCaseService.execute(data.organizationId);

    // 2. Check if the user is already a volunteer of the given organization
    const existingVolunteer = await this.volunteerFacade.find({
      userId: data.userId,
      organizationId: data.organizationId,
    });

    if (existingVolunteer) {
      this.exceptionService.badRequestException(
        VolunteerExceptionMessages.VOLUNTEER_002,
      );
    }

    // 3. create volunteer
    const volunteer = await this.volunteerFacade.create(data);

    // 4. set this as active organizations for the user
    await this.userFacade.updateRegularUser(data.userId, {
      activeOrganizationId: data.organizationId,
    });

    return volunteer;
  }
}
