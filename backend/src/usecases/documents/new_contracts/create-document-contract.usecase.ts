import { Injectable } from '@nestjs/common';
import { IUseCaseService } from 'src/common/interfaces/use-case-service.interface';
import { ExceptionsService } from 'src/infrastructure/exceptions/exceptions.service';
import { DocumentContractStatus } from 'src/modules/documents/enums/contract-status.enum';
import { CreateDocumentContractOptions } from 'src/modules/documents/models/document-contract.model';
import { DocumentContractFacade } from 'src/modules/documents/services/document-contract.facade';
import { DocumentTemplateFacade } from 'src/modules/documents/services/document-template.facade';
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

@Injectable()
export class CreateDocumentContractUsecase implements IUseCaseService<string> {
  constructor(
    private readonly documentContractFacade: DocumentContractFacade,
    private readonly documentTemplateFacade: DocumentTemplateFacade,
    private readonly getOrganizationUsecase: GetOrganizationUseCaseService,
    private readonly volunteerFacade: VolunteerFacade,
    private readonly exceptionsService: ExceptionsService,
  ) {
    // this.execute({
    //   documentDate: new Date(),
    //   documentStartDate: new Date(),
    //   documentEndDate: new Date(),
    //   volunteerId: '1a53406f-263b-41bc-b60c-cb30a1805f1e',
    //   organizationId: '7f005461-07c3-4693-a85d-40d31db43a4c',
    //   documentTemplateId: 'bc3b7d74-686e-47b4-850a-b1de69574e28',
    //   createdByAdminId: '4db075bd-4095-432e-98bd-dc68b4599337',
    //   status: DocumentContractStatus.CREATED,
    // });
  }

  public async execute(
    newContract: Omit<
      CreateDocumentContractOptions,
      'volunteerData' | 'volunteerTutorData' | 'status'
    >,
  ): Promise<string> {
    // 1. check if the organization exists
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const organization = await this.getOrganizationUsecase.execute(
      newContract.organizationId,
    );

    // 2. check if the volunteer exists
    const volunteer = await this.checkVolunteerExists(
      newContract.volunteerId,
      newContract.organizationId,
    );

    //3. check if template exists
    await this.checkTemplateExists(
      newContract.documentTemplateId,
      newContract.organizationId,
    );

    //TODO: 4. check if the contract number already exists

    //TODO: 5. check if the volunteer has already a contract in that period

    // 6. Extract volunteerData and volunteerTutorData from the user
    const volunteerPersonalData = volunteer.user.userPersonalData;

    // console.log(volunteerPersonalData);

    await this.validateVolunteerPersonalData(volunteerPersonalData);
    await this.validateLegalGuardianData(volunteerPersonalData.legalGuardian);

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
        message: 'Error creating contract',
        code_error: 'ERROR_CREATING_CONTRACT', // TODO: create a new error code for this
      });
    }

    // 8. Build the HTML with handlebars and set it to lambda to Create the PDF

    // 9. Send notification to the volunteer to sign the contract if the status is PENDING_VOLUNTEER_SIGNATURE

    // 10. Track event

    return contractId;
  }

  private async validateVolunteerPersonalData(
    volunteerPersonalData: IUserPersonalDataModel,
  ): Promise<void> {
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
          message: `Invalid personal data ${JSON.stringify(invalidFields)}`,
          code_error: 'INVALID_PERSONAL_DATA', // TODO: create a new error code for this
        });
      } else {
        throw error; // Re-throw unexpected errors
      }
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
          message: `Invalid legal guardian data ${JSON.stringify(invalidFields)}`,
          code_error: 'INVALID_LEGAL_GUARDIAN_DATA',
        });
      } else {
        throw error; // Re-throw unexpected errors
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
  ): Promise<void> {
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
  }
}
