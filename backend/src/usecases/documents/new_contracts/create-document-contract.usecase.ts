import { Injectable } from '@nestjs/common';
import { isSameYear } from 'date-fns';
import { isOver16FromCNP } from 'src/common/helpers/utils';
import { IUseCaseService } from 'src/common/interfaces/use-case-service.interface';
import { ExceptionsService } from 'src/infrastructure/exceptions/exceptions.service';
import { ActionsArchiveFacade } from 'src/modules/actions-archive/actions-archive.facade';
import { TrackedEventName } from 'src/modules/actions-archive/enums/action-resource-types.enum';
import { DocumentContractStatus } from 'src/modules/documents/enums/contract-status.enum';
import { ContractExceptionMessages } from 'src/modules/documents/exceptions/contract.exceptions';
import { CreateDocumentContractOptions } from 'src/modules/documents/models/document-contract.model';
import { IDocumentTemplateModel } from 'src/modules/documents/models/document-template.model';
import { DocumentContractFacade } from 'src/modules/documents/services/document-contract.facade';
import { DocumentTemplateFacade } from 'src/modules/documents/services/document-template.facade';
import { IAdminUserModel } from 'src/modules/user/models/admin-user.model';
import {
  IUserPersonalDataModel,
  LegalGuardianIdentityData,
} from 'src/modules/user/models/user-personal-data.model';
import { VolunteerStatus } from 'src/modules/volunteer/enums/volunteer-status.enum';
import { VolunteerExceptionMessages } from 'src/modules/volunteer/exceptions/volunteer.exceptions';
import { IVolunteerModel } from 'src/modules/volunteer/model/volunteer.model';
import { VolunteerFacade } from 'src/modules/volunteer/services/volunteer.facade';
import { GetOrganizationUseCaseService } from 'src/usecases/organization/get-organization.usecase';
import * as z from 'zod';

/*
Possible errors thrown:
1. CONTRACT_010: Invalid input data
2. CONTRACT_004: Contract number already exists
3. CONTRACT_005: Volunteer already has a contract for that period
4. CONTRACT_013: Missing volunteer personal data
5. CONTRACT_012: Invalid personal data
6. CONTRACT_008: Legal guardian data is required for under 16 volunteers
7. CONTRACT_011: Invalid legal guardian data
8. CONTRACT_009: Error while creating the contract in DB
*/

@Injectable()
export class CreateDocumentContractUsecase implements IUseCaseService<string> {
  constructor(
    private readonly documentContractFacade: DocumentContractFacade,
    private readonly documentTemplateFacade: DocumentTemplateFacade,
    private readonly getOrganizationUsecase: GetOrganizationUseCaseService,
    private readonly volunteerFacade: VolunteerFacade,
    private readonly exceptionsService: ExceptionsService,
    private readonly actionsArchiveFacade: ActionsArchiveFacade,
  ) {}

  public async execute(
    newContract: Omit<
      CreateDocumentContractOptions,
      'volunteerData' | 'volunteerTutorData' | 'status'
    >,
    admin: IAdminUserModel,
  ): Promise<string> {
    let volunteer: IVolunteerModel;
    let template: IDocumentTemplateModel;
    try {
      // 1. Check if the organization exists
      await this.getOrganizationUsecase.execute(newContract.organizationId);

      // 2. Check if the volunteer exists
      volunteer = await this.checkVolunteerExists(
        newContract.volunteerId,
        newContract.organizationId,
      );

      //3. Check if template exists
      template = await this.checkTemplateExists(
        newContract.documentTemplateId,
        newContract.organizationId,
      );
    } catch (error) {
      this.exceptionsService.badRequestException({
        ...ContractExceptionMessages.CONTRACT_010,
        details: error,
      });
    }

    // 4. Check if the contract number already exists
    const existingContract = await this.documentContractFacade.findOne({
      documentNumber: newContract.documentNumber,
      organizationId: newContract.organizationId,
    });

    if (
      existingContract &&
      isSameYear(existingContract.documentDate, newContract.documentDate)
    ) {
      this.exceptionsService.badRequestException(
        ContractExceptionMessages.CONTRACT_004,
      );
    }

    // 5. Check if the volunteer has already a contract in that period
    const existingContractInSamePeriod =
      await this.documentContractFacade.existsInSamePeriod({
        volunteerId: newContract.volunteerId,
        documentStartDate: newContract.documentStartDate,
        documentEndDate: newContract.documentEndDate,
      });

    if (existingContractInSamePeriod) {
      this.exceptionsService.badRequestException(
        ContractExceptionMessages.CONTRACT_005,
      );
    }

    // 6. Extract volunteerData and volunteerTutorData from the user
    const volunteerPersonalData = volunteer?.user?.userPersonalData;
    await this.validateVolunteerPersonalData(volunteerPersonalData);

    // 7. Create the contract input
    const newContractOptions: CreateDocumentContractOptions = {
      ...newContract,
      status: DocumentContractStatus.CREATED,
      volunteerData: {
        name: volunteer.user.name,
        ...volunteerPersonalData,
      },
    };

    // 7. Create the contract
    let contractId: string;
    try {
      contractId = await this.documentContractFacade.create(newContractOptions);
    } catch (error) {
      this.exceptionsService.internalServerErrorException({
        ...ContractExceptionMessages.CONTRACT_009,
        details: error,
      });
    }

    // 8. Build the HTML with handlebars and set it to lambda to Create the PDF

    // 9. Send notification to the volunteer to sign the contract if the status is PENDING_VOLUNTEER_SIGNATURE

    // 10. Track event
    this.actionsArchiveFacade.trackEvent(
      TrackedEventName.CREATE_DOCUMENT_CONTRACT,
      {
        organizationId: newContract.organizationId,
        volunteerId: volunteer.id,
        volunteerName: volunteer.user.name,
        documentContractId: contractId,
        documentContractNumber: newContract.documentNumber,
        documentTemplateId: newContract.documentTemplateId,
        documentTemplateName: template.name,
      },
      admin,
    );

    return contractId;
  }

  private async validateVolunteerPersonalData(
    volunteerPersonalData: IUserPersonalDataModel,
  ): Promise<void> {
    if (!volunteerPersonalData) {
      this.exceptionsService.badRequestException(
        ContractExceptionMessages.CONTRACT_013,
      );
    }

    const personalDataSchema = z.object({
      cnp: z.string().length(13, 'CNP must be 13 digits'),
      address: z.string().min(1, 'Address is required'),
      identityDocumentSeries: z
        .string()
        .min(2, 'Identity document series is required'),
      identityDocumentNumber: z
        .string()
        .min(1, 'Identity document number is required'),
      identityDocumentIssuedBy: z
        .string()
        .min(1, 'Identity document issuer is required'),
      identityDocumentIssueDate: z.coerce
        .date()
        .max(new Date(), 'Issue date cannot be in the future'),
    });

    try {
      personalDataSchema.parse(volunteerPersonalData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const invalidFields = error.issues.map((issue) => ({
          field: issue.path.join('.'),
          message: issue.message,
        }));

        this.exceptionsService.badRequestException({
          ...ContractExceptionMessages.CONTRACT_012,
          details: invalidFields,
        });
      } else {
        this.exceptionsService.badRequestException({
          ...ContractExceptionMessages.CONTRACT_012,
          details: error,
        });
      }
    }

    if (!isOver16FromCNP(volunteerPersonalData.cnp)) {
      if (!volunteerPersonalData.legalGuardian) {
        this.exceptionsService.badRequestException(
          ContractExceptionMessages.CONTRACT_008,
        );
      }

      await this.validateLegalGuardianData(volunteerPersonalData.legalGuardian);
    }
  }

  private async validateLegalGuardianData(
    legalGuardianData: LegalGuardianIdentityData,
  ): Promise<void> {
    const legalGuardianSchema = z.object({
      name: z.string().min(1, 'Name is required'),
      cnp: z.string().length(13, 'CNP must be 13 digits'),
      address: z.string().min(1, 'Address is required'),
      identityDocumentSeries: z
        .string()
        .min(2, 'Identity document series is required'),
      identityDocumentNumber: z
        .string()
        .min(1, 'Identity document number is required'),
      email: z.string().email('Invalid email address'),
      phone: z.string().min(1, 'Phone number is required'),
    });

    try {
      legalGuardianSchema.parse(legalGuardianData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const invalidFields = error.issues.map((issue) => ({
          field: issue.path.join('.'),
          message: issue.message,
        }));

        this.exceptionsService.badRequestException({
          ...ContractExceptionMessages.CONTRACT_011,
          details: invalidFields,
        });
      } else {
        this.exceptionsService.badRequestException({
          ...ContractExceptionMessages.CONTRACT_011,
          details: error,
        });
      }
    }
  }

  private async checkVolunteerExists(
    volunteerId: string,
    organizationId: string,
  ): Promise<IVolunteerModel> {
    const volunteer = await this.volunteerFacade.find({
      id: volunteerId,
      organizationId: organizationId,
      status: VolunteerStatus.ACTIVE,
    });

    if (!volunteer) {
      this.exceptionsService.notFoundException(
        VolunteerExceptionMessages.VOLUNTEER_001,
      );
    }

    return volunteer;
  }

  private async checkTemplateExists(
    documentTemplateId: string,
    organizationId: string,
  ): Promise<IDocumentTemplateModel> {
    const template = await this.documentTemplateFacade.findOne({
      id: documentTemplateId,
      organizationId: organizationId,
    });

    if (!template) {
      this.exceptionsService.notFoundException({
        // TODO update this exception
        message: 'Template not found',
        code_error: 'TEMPLATE_NOT_FOUND',
      });
    }

    return template;
  }
}
