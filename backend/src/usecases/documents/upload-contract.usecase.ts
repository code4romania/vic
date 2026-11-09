import { Injectable, Logger } from '@nestjs/common';
import { compareAsc } from 'date-fns';
import { S3_FILE_PATHS } from 'src/common/constants/constants';
import { JSONStringifyError } from 'src/common/helpers/utils';
import { ExceptionsService } from 'src/infrastructure/exceptions/exceptions.service';
import { S3Service } from 'src/infrastructure/providers/s3/module/s3.service';
import { ActionsArchiveFacade } from 'src/modules/actions-archive/actions-archive.facade';
import { TrackedEventName } from 'src/modules/actions-archive/enums/action-resource-types.enum';
import { ContractStatus } from 'src/modules/documents/enums/contract-status.enum';
import { ContractExceptionMessages } from 'src/modules/documents/exceptions/contract.exceptions';
import { IContractModel } from 'src/modules/documents/models/contract.model';
import { ContractFacade } from 'src/modules/documents/services/contract.facade';
import { IAdminUserModel } from 'src/modules/user/models/admin-user.model';
import { VolunteerExceptionMessages } from 'src/modules/volunteer/exceptions/volunteer.exceptions';
import { VolunteerFacade } from 'src/modules/volunteer/services/volunteer.facade';
import { assertVolunteerEditable } from 'src/modules/volunteer/volunteer-status.rules';
import { GetOrganizationUseCaseService } from '../organization/get-organization.usecase';

export interface UploadContractOptions {
  volunteerId: string;
  startDate: Date;
  endDate?: Date | null;
  contractNumber?: string | null;
}

const isPdf = (file: Express.Multer.File): boolean =>
  file?.mimetype === 'application/pdf' &&
  file.buffer?.subarray(0, 5).toString('latin1') === '%PDF-';

// VIC 2.0, #486: the NGO uploads a contract the volunteer already signed outside VIC, with its validity
// period. It is active from the start: VIC no longer generates contracts or collects signatures.
@Injectable()
export class UploadContractUsecase {
  private readonly logger = new Logger(UploadContractUsecase.name);

  constructor(
    private readonly contractFacade: ContractFacade,
    private readonly volunteerFacade: VolunteerFacade,
    private readonly getOrganizationUsecase: GetOrganizationUseCaseService,
    private readonly s3Service: S3Service,
    private readonly exceptionsService: ExceptionsService,
    private readonly actionsArchiveFacade: ActionsArchiveFacade,
  ) {}

  public async execute(
    options: UploadContractOptions,
    file: Express.Multer.File | undefined,
    admin: IAdminUserModel,
  ): Promise<IContractModel> {
    // 1. A real PDF
    if (!file || !isPdf(file)) {
      this.exceptionsService.badRequestException(
        ContractExceptionMessages.CONTRACT_008,
      );
    }

    // 2. A period that makes sense; no end date means it never expires
    if (options.endDate && compareAsc(options.endDate, options.startDate) < 0) {
      this.exceptionsService.badRequestException(
        ContractExceptionMessages.CONTRACT_009,
      );
    }

    // 3. The volunteer is the NGO's own, and editable
    const volunteer = await this.volunteerFacade.find({
      id: options.volunteerId,
      organizationId: admin.organizationId,
    });
    if (!volunteer) {
      this.exceptionsService.notFoundException(
        VolunteerExceptionMessages.VOLUNTEER_001,
      );
    }
    assertVolunteerEditable(volunteer);

    // 4. The contract number, when given, stays unique within the NGO
    const contractNumber = options.contractNumber?.trim() || null;
    if (
      contractNumber &&
      (await this.contractFacade.findOne({
        contractNumber,
        organizationId: admin.organizationId,
      }))
    ) {
      this.exceptionsService.badRequestException(
        ContractExceptionMessages.CONTRACT_004,
      );
    }

    let path: string;
    try {
      path = await this.s3Service.uploadFile(
        `${S3_FILE_PATHS.CONTRACTS}/${admin.organizationId}`,
        file,
      );
    } catch (error) {
      this.logger.error({
        ...ContractExceptionMessages.CONTRACT_001,
        error: JSONStringifyError(error),
      });
      this.exceptionsService.badRequestException(
        ContractExceptionMessages.CONTRACT_001,
      );
    }

    const contract = await this.contractFacade.create({
      contractNumber,
      organizationId: admin.organizationId,
      volunteerId: volunteer.id,
      startDate: options.startDate,
      endDate: options.endDate ?? null,
      path,
      templateId: null,
      createdByAdminId: admin.id,
      status: ContractStatus.ACTIVE,
    });

    const organization = await this.getOrganizationUsecase.execute(
      admin.organizationId,
    );
    this.actionsArchiveFacade.trackEvent(
      TrackedEventName.CREATE_CONTRACT,
      {
        organizationId: organization.id,
        organizationName: organization.name,
        contractId: contract.id,
        volunteerId: volunteer.id,
        volunteerName: volunteer.user.name,
        contractNumber: contract.contractNumber,
      },
      admin,
    );

    return contract;
  }
}
