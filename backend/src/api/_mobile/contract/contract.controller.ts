import {
  Get,
  Param,
  Patch,
  Query,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { Controller } from '@nestjs/common';
import { ApiBearerAuth, ApiConsumes, ApiParam } from '@nestjs/swagger';
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
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { SignContractByVolunteer } from 'src/usecases/documents/sign-contract-by-volunteer.usecase';
import { GetVolunteerContractHistoryUsecase } from 'src/usecases/documents/get-volunteer-contract-history.usecase';
import { GetVolunteerPendingContractsUsecase } from 'src/usecases/documents/get-volunteer-pending-contracts.usecase';

@UseGuards(MobileJwtAuthGuard, ContractVolunteerGuard)
@ApiBearerAuth()
@Controller('mobile/contract')
export class MobileContractController {
  constructor(
    private readonly getVolunteerContractHistoryUsecase: GetVolunteerContractHistoryUsecase,
    private readonly getVolunteerPendingContractsUsecase: GetVolunteerPendingContractsUsecase,
    private readonly getOneContractUsecase: GetOneContractUsecase,
    private readonly signContractUsecase: SignContractByVolunteer,
  ) {}

  @Get('history')
  @ApiPaginatedResponse(MobileContractListItemPresenter)
  async getManyApproved(
    @Query() filters: GetVolunteerContractsDto,
    @ExtractUser() { activeOrganization }: IRegularUserModel,
  ): Promise<PaginatedPresenter<MobileContractListItemPresenter>> {
    const contracts = await this.getVolunteerContractHistoryUsecase.execute({
      ...filters,
      organizationId: activeOrganization.id,
    });

    return new PaginatedPresenter({
      ...contracts,
      items: contracts.items.map(
        (contract) => new MobileContractListItemPresenter(contract),
      ),
    });
  }

  @Get('pending')
  @ApiPaginatedResponse(MobileContractListItemPresenter)
  async getManyPending(
    @Query() filters: GetVolunteerContractsDto,
    @ExtractUser() { activeOrganization }: IRegularUserModel,
  ): Promise<PaginatedPresenter<MobileContractListItemPresenter>> {
    const contracts = await this.getVolunteerPendingContractsUsecase.execute({
      ...filters,
      organizationId: activeOrganization.id,
    });

    return new PaginatedPresenter({
      ...contracts,
      items: contracts.items.map(
        (contract) => new MobileContractListItemPresenter(contract),
      ),
    });
  }

  @ApiParam({ name: 'contractId', type: 'string' })
  @Get(':contractId')
  async getOne(
    @Param('contractId', UuidValidationPipe) contractId: string,
    @ExtractUser() { activeOrganization }: IRegularUserModel,
  ): Promise<MobileContractPresenter> {
    const contract = await this.getOneContractUsecase.execute({
      id: contractId,
      organizationId: activeOrganization.id,
    });

    return new MobileContractPresenter(contract);
  }

  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileFieldsInterceptor([{ name: 'contract', maxCount: 1 }]))
  @ApiParam({ name: 'contractId', type: 'string' })
  @Patch(':contractId/sign')
  async sign(
    @Param('contractId', UuidValidationPipe) contractId: string,
    @ExtractUser() { activeOrganization }: IRegularUserModel,
    @UploadedFiles() { contract }: { contract: Express.Multer.File[] },
  ): Promise<MobileContractPresenter> {
    const updateedContract = await this.signContractUsecase.execute(
      contractId,
      activeOrganization.id,
      contract,
    );

    return new MobileContractPresenter(updateedContract);
  }
}
