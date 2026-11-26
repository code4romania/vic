import {
  Controller,
  Get,
  GoneException,
  Param,
  Patch,
  Query,
  Res,
  StreamableFile,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { Response } from 'express';
import { sendStoredFile } from 'src/common/helpers/file-response';
import { GetContractFileUsecase } from 'src/usecases/documents/get-contract-file.usecase';
import {
  ApiPaginatedResponse,
  PaginatedPresenter,
} from 'src/infrastructure/presenters/generic-paginated.presenter';
import { MobileContractListItemPresenter } from './presenters/mobile-contract-list-item.presenter';
import { GetVolunteerContractsDto } from './dto/get-volunteer-contracts.dto';
import { MobileJwtAuthGuard } from 'src/modules/auth/guards/jwt-mobile.guard';
import { ContractVolunteerGuard } from './guards/contract-volunteer.guard';
import { ExtractUser } from 'src/common/decorators/extract-user.decorator';
import { IRegularUserModel } from 'src/modules/user/models/regular-user.model';
import { UuidValidationPipe } from 'src/infrastructure/pipes/uuid.pipe';
import { GetOneContractUsecase } from 'src/usecases/documents/get-one-contract.usecase';
import { MobileContractPresenter } from './presenters/mobile-contract.presenter';
import { emptyPagination } from 'src/infrastructure/base/repository-with-pagination.class';
import { GetVolunteerContractHistoryUsecase } from 'src/usecases/documents/get-volunteer-contract-history.usecase';

@UseGuards(MobileJwtAuthGuard, ContractVolunteerGuard)
@ApiBearerAuth()
@Controller('mobile/contract')
export class MobileContractController {
  constructor(
    private readonly getVolunteerContractHistoryUsecase: GetVolunteerContractHistoryUsecase,
    private readonly getOneContractUsecase: GetOneContractUsecase,
    private readonly getContractFileUsecase: GetContractFileUsecase,
  ) {}

  @Get('history')
  @ApiPaginatedResponse(MobileContractListItemPresenter)
  async getManyApproved(
    @Query() filters: GetVolunteerContractsDto,
    @ExtractUser() { id, activeOrganization }: IRegularUserModel,
  ): Promise<PaginatedPresenter<MobileContractListItemPresenter>> {
    // ?volunteerId was checked by ContractVolunteerGuard to be one of the user's; without it, the
    // user's volunteer in the active organization. None at all: an empty page (it used to be 500).
    const volunteerId = filters.volunteerId || activeOrganization?.volunteerId;
    if (!volunteerId) {
      return new PaginatedPresenter(emptyPagination(filters.limit));
    }

    const contracts = await this.getVolunteerContractHistoryUsecase.execute({
      ...filters,
      volunteerId,
      userId: id,
    });

    return new PaginatedPresenter({
      ...contracts,
      items: contracts.items.map(
        (contract) => new MobileContractListItemPresenter(contract),
      ),
    });
  }

  // LEGACY (old store app 1.0.x, until LEGACY_MOBILE_UNTIL): in-app signing is gone in 2.0 (#486), so
  // there is never a contract waiting for the volunteer. Declared before ':contractId' so it is not taken
  // for an id. Remove with the legacy strategy (issue 25).
  @Get('pending')
  @ApiPaginatedResponse(MobileContractListItemPresenter)
  async getManyPendingLegacy(
    @Query() filters: GetVolunteerContractsDto,
  ): Promise<PaginatedPresenter<MobileContractListItemPresenter>> {
    return new PaginatedPresenter(emptyPagination(filters.limit));
  }

  // LEGACY: the old app's sign / reject buttons. Contracts are uploaded already signed by the NGO (#486).
  @ApiParam({ name: 'contractId', type: 'string' })
  @Patch(':contractId/sign')
  signLegacy(): never {
    throw new GoneException(
      'Contracts are signed outside the app since VIC 2.0',
    );
  }

  @ApiParam({ name: 'contractId', type: 'string' })
  @Patch(':contractId/cancel')
  cancelLegacy(): never {
    throw new GoneException(
      'Contracts are signed outside the app since VIC 2.0',
    );
  }

  @ApiParam({ name: 'contractId', type: 'string' })
  @Get(':contractId')
  async getOne(
    @Param('contractId', UuidValidationPipe) contractId: string,
  ): Promise<MobileContractPresenter> {
    // ContractVolunteerGuard checked the contract is one of the user's own
    const contract = await this.getOneContractUsecase.execute({
      id: contractId,
    });

    return new MobileContractPresenter(contract);
  }

  // #724: the file itself, for the in-app viewer (inline) and Download / Share (?download=true).
  // ContractVolunteerGuard checked the contract is one of the user's own.
  @ApiParam({ name: 'contractId', type: 'string' })
  @ApiQuery({ name: 'download', required: false, type: Boolean })
  @Get(':contractId/file')
  async getFile(
    @Param('contractId', UuidValidationPipe) contractId: string,
    @Query('download') download: string | undefined,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    const file = await this.getContractFileUsecase.execute(
      { id: contractId },
      { requireOrganization: false },
    );
    return sendStoredFile(res, file, download === 'true');
  }
}
