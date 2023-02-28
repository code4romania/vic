import { Injectable } from '@nestjs/common';
import { IUseCaseService } from 'src/common/interfaces/use-case-service.interface';
import { ExceptionsService } from 'src/infrastructure/exceptions/exceptions.service';
import { OrganizationStructureType } from 'src/modules/organization/enums/organization-structure-type.enum';
import { VolunteerExceptionMessages } from 'src/modules/volunteer/exceptions/volunteer.exceptions';
import {
  CreateVolunteerProfileOptions,
  IVolunteerProfileModel,
} from 'src/modules/volunteer/model/volunteer-profile.model';
import { VolunteerFacade } from 'src/modules/volunteer/services/volunteer.facade';
import { GetOneOrganizationStructureUseCase } from '../organization/organization-structure/get-one-organization-structure.usecase';
import { GetOneVolunteerUsecase } from './get-one-volunteer.usecase';

@Injectable()
export class CreateVolunteerProfileUseCase
  implements IUseCaseService<IVolunteerProfileModel>
{
  constructor(
    private readonly volunteerFacade: VolunteerFacade,
    private readonly getOneVolunteerUsecase: GetOneVolunteerUsecase,
    private readonly getOneOrganizationStructureUseCase: GetOneOrganizationStructureUseCase,
    private readonly exceptionService: ExceptionsService,
  ) {}

  public async execute(
    data: CreateVolunteerProfileOptions,
  ): Promise<IVolunteerProfileModel> {
    // 1. Check if the volunteer exists
    const volunteer = await this.getOneVolunteerUsecase.execute(
      data.volunteerId,
    );

    // 2. Check if the profile already exists
    if (volunteer.volunteerProfile) {
      this.exceptionService.badRequestException(
        VolunteerExceptionMessages.VOLUNTEER_PROFILE_001,
      );
    }

    // 3. Check if the branch/department/role exist and are part of the given organization
    try {
      if (data.branchId)
        await this.getOneOrganizationStructureUseCase.execute({
          id: data.branchId,
          organizationId: volunteer.organization.id,
          type: OrganizationStructureType.BRANCH,
        });
      if (data.departmentId)
        await this.getOneOrganizationStructureUseCase.execute({
          id: data.departmentId,
          organizationId: volunteer.organization.id,
          type: OrganizationStructureType.DEPARTMENT,
        });
      if (data.roleId)
        await this.getOneOrganizationStructureUseCase.execute({
          id: data.roleId,
          organizationId: volunteer.organization.id,
          type: OrganizationStructureType.ROLE,
        });
    } catch (error) {
      this.exceptionService.badRequestException(
        VolunteerExceptionMessages.VOLUNTEER_PROFILE_002,
      );
    }

    return this.volunteerFacade.createProfile(data);
  }
}
