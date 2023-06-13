import { Injectable } from '@nestjs/common';
import { IUseCaseService } from 'src/common/interfaces/use-case-service.interface';
import { ExceptionsService } from 'src/infrastructure/exceptions/exceptions.service';
import { TemplateExceptionMessages } from 'src/modules/documents/exceptions/template.exceptions';
import {
  CreateContractOptions,
  IContractModel,
} from 'src/modules/documents/models/contract.model';
import { ContractFacade } from 'src/modules/documents/services/contract.facade';
import { TemplateFacade } from 'src/modules/documents/services/template.facade';
import { OrganizationExceptionMessages } from 'src/modules/organization/exceptions/exceptions';
import { OrganizationFacadeService } from 'src/modules/organization/services/organization.facade';
import { VolunteerExceptionMessages } from 'src/modules/volunteer/exceptions/volunteer.exceptions';
import { VolunteerFacade } from 'src/modules/volunteer/services/volunteer.facade';

@Injectable()
export class CreateContractUsecase implements IUseCaseService<IContractModel> {
  constructor(
    private readonly contractFacade: ContractFacade,
    private readonly organizationFacade: OrganizationFacadeService,
    private readonly volunteerFacade: VolunteerFacade,
    private readonly templateFacade: TemplateFacade,
    private readonly exceptionsService: ExceptionsService,
  ) {}

  public async execute(
    newContract: Omit<CreateContractOptions, 'path'>,
  ): Promise<IContractModel> {
    // 1. check if the organization exists
    const organization = await this.organizationFacade.findOrganization({
      id: newContract.organizationId,
    });

    if (!organization) {
      this.exceptionsService.notFoundException(
        OrganizationExceptionMessages.ORG_001,
      );
    }
    // 2. check if the volunteer exists
    const volunteer = await this.volunteerFacade.find({
      id: newContract.volunteerId,
      organizationId: newContract.organizationId,
    });

    if (!volunteer) {
      this.exceptionsService.notFoundException(
        VolunteerExceptionMessages.VOLUNTEER_001,
      );
    }

    // 3. check if template exists
    const template = await this.templateFacade.findOne({
      id: newContract.templateId,
      organizationId: newContract.organizationId,
    });

    if (!template) {
      this.exceptionsService.notFoundException(
        TemplateExceptionMessages.TEMPLATE_002,
      );
    }

    // 4. generate contract
    const contract = await this.contractFacade.create({
      ...newContract,
      path: template.path,
    });

    return contract;
  }
}
