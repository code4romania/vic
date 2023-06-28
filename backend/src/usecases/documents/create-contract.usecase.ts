import { Injectable } from '@nestjs/common';
import { IUseCaseService } from 'src/common/interfaces/use-case-service.interface';
import { ExceptionsService } from 'src/infrastructure/exceptions/exceptions.service';
import {
  CreateContractOptions,
  IContractModel,
} from 'src/modules/documents/models/contract.model';
import { ContractFacade } from 'src/modules/documents/services/contract.facade';
import { VolunteerStatus } from 'src/modules/volunteer/enums/volunteer-status.enum';
import { VolunteerExceptionMessages } from 'src/modules/volunteer/exceptions/volunteer.exceptions';
import { VolunteerFacade } from 'src/modules/volunteer/services/volunteer.facade';
import { GetOrganizationUseCaseService } from '../organization/get-organization.usecase';
import { GetOneTemplateUseCase } from './get-one-template.usecase';
import { ContractExceptionMessages } from 'src/modules/documents/exceptions/contract.exceptions';
import { ActionsArchiveFacade } from 'src/modules/actions-archive/actions-archive.facade';
import { TrackedEventName } from 'src/modules/actions-archive/enums/action-resource-types.enum';
import { IAdminUserModel } from 'src/modules/user/models/admin-user.model';

@Injectable()
export class CreateContractUsecase implements IUseCaseService<IContractModel> {
  constructor(
    private readonly contractFacade: ContractFacade,
    private readonly getOrganizationUsecase: GetOrganizationUseCaseService,
    private readonly volunteerFacade: VolunteerFacade,
    private readonly getOneTemplateUsecase: GetOneTemplateUseCase,
    private readonly exceptionsService: ExceptionsService,
    private readonly actionsArchiveFacade: ActionsArchiveFacade,
  ) {}

  public async execute(
    newContract: Omit<CreateContractOptions, 'path'>,
    admin: IAdminUserModel,
  ): Promise<IContractModel> {
    // 1. check if the organization exists
    const organization = await this.getOrganizationUsecase.execute(
      newContract.organizationId,
    );

    // 2. check if the volunteer exists
    const volunteer = await this.volunteerFacade.find({
      id: newContract.volunteerId,
      organizationId: newContract.organizationId,
      status: VolunteerStatus.ACTIVE,
    });

    if (!volunteer) {
      this.exceptionsService.notFoundException(
        VolunteerExceptionMessages.VOLUNTEER_001,
      );
    }

    // 3. check if template exists
    const template = await this.getOneTemplateUsecase.execute({
      id: newContract.templateId,
      organizationId: newContract.organizationId,
    });

    // 4. check if the contract number already exists
    const foundContract = await this.contractFacade.findOne({
      contractNumber: newContract.contractNumber,
      organizationId: newContract.organizationId,
    });

    // throw error with unique contract number for organization
    if (foundContract) {
      this.exceptionsService.badRequestException(
        ContractExceptionMessages.CONTRACT_004,
      );
    }

    // 5. check if the volunteer has already an contract in that period
    const foundActiveContract = await this.contractFacade.findOne({
      volunteerId: newContract.volunteerId,
      organizationId: newContract.organizationId,
      startDate: newContract.startDate,
    });

    // throw error with unique contract number for organization
    if (foundActiveContract) {
      this.exceptionsService.badRequestException(
        ContractExceptionMessages.CONTRACT_005,
      );
    }

    // 6. generate contract
    const contract = await this.contractFacade.create({
      ...newContract,
      path: template.path,
    });

    // Track event
    this.actionsArchiveFacade.trackEvent(
      TrackedEventName.CREATE_CONTRACT,
      {
        organizationId: organization.id,
        organizationName: organization.name,
        contractId: contract.id,
        volunteerId: volunteer.id,
        volunteerName: volunteer.user.name,
      },
      admin,
    );

    return contract;
  }
}
