import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiConsumes, ApiParam } from '@nestjs/swagger';
import { ExtractUser } from 'src/common/decorators/extract-user.decorator';
import { WebJwtAuthGuard } from 'src/modules/auth/guards/jwt-web.guard';
import { CreateContractUsecase } from 'src/usecases/documents/create-contract.usecase';
import { CreateContractDto } from './dto/create-contract.dto';
import { IAdminUserModel } from 'src/modules/user/models/admin-user.model';
import { ContractPresenter } from './presenters/contract.presenter';
import {
  ApiPaginatedResponse,
  PaginatedPresenter,
} from 'src/infrastructure/presenters/generic-paginated.presenter';
import { GetManyContractsDto } from './dto/get-many-contracts.dto';
import { GetManyContractsUsecase } from 'src/usecases/documents/get-many-contracts.usecase';
import { CountPendingContractsUsecase } from 'src/usecases/documents/count-pending-contracts.usecase';
import { UuidValidationPipe } from 'src/infrastructure/pipes/uuid.pipe';
import { ContractListItemPresenter } from './presenters/contract-list-item.presenter';
import { GetOneContractUsecase } from 'src/usecases/documents/get-one-contract.usecase';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { SignAndConfirmContractUsecase } from 'src/usecases/documents/sign-and-confirm-contract.usecase';
import { RejectContractUsecase } from 'src/usecases/documents/reject-contract.usecase';
import { RejectContractDto } from './dto/reject-contact.dto';

// TODO: guard for organization contract
@ApiBearerAuth()
@UseGuards(WebJwtAuthGuard)
@Controller('contract')
export class ContractController {
  constructor(
    private readonly createContractUsecase: CreateContractUsecase,
    private readonly getManyContractsUsecase: GetManyContractsUsecase,
    private readonly countPendingContractsUsecase: CountPendingContractsUsecase,
    private readonly getOneContractUsecase: GetOneContractUsecase,
    private readonly signAndConfirmContractUsecase: SignAndConfirmContractUsecase,
    private readonly rejectContractUsecase: RejectContractUsecase,
  ) {}

  @Get()
  @ApiPaginatedResponse(ContractListItemPresenter)
  async getManyPaginated(
    @Query() filters: GetManyContractsDto,
    @ExtractUser() { organizationId }: IAdminUserModel,
  ): Promise<PaginatedPresenter<ContractListItemPresenter>> {
    const contracts = await this.getManyContractsUsecase.execute({
      ...filters,
      organizationId,
    });

    return new PaginatedPresenter<ContractListItemPresenter>({
      ...contracts,
      items: contracts.items.map(
        (contract) => new ContractListItemPresenter(contract),
      ),
    });
  }

  @Get('active')
  async getActivContractsCount(
    @ExtractUser() { organizationId }: IAdminUserModel,
  ): Promise<number> {
    return this.countPendingContractsUsecase.execute({
      organizationId,
    });
  }

  @ApiParam({ name: 'contractId', type: 'string' })
  @Get(':contractId')
  async getContract(
    @Param('contractId', UuidValidationPipe) contractId: string,
    @ExtractUser() { organizationId }: IAdminUserModel,
  ): Promise<ContractPresenter> {
    const contract = await this.getOneContractUsecase.execute({
      id: contractId,
      organizationId,
    });

    return new ContractPresenter(contract);
  }

  @Post()
  async create(
    @Body() contract: CreateContractDto,
    @ExtractUser() { organizationId, id }: IAdminUserModel,
  ): Promise<ContractPresenter> {
    const newContract = await this.createContractUsecase.execute({
      ...contract,
      organizationId,
      createdByAdminId: id,
    });

    return new ContractPresenter(newContract);
  }

  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileFieldsInterceptor([{ name: 'contract', maxCount: 1 }]))
  @ApiParam({ name: 'contractId', type: 'string' })
  @Patch(':contractId/confirm')
  async sign(
    @Param('contractId', UuidValidationPipe) contractId: string,
    @ExtractUser() { organizationId, id }: IAdminUserModel,
    @UploadedFiles() { contract }: { contract: Express.Multer.File[] },
  ): Promise<ContractPresenter> {
    const newContract = await this.signAndConfirmContractUsecase.execute(
      contractId,
      organizationId,
      id,
      contract,
    );

    return new ContractPresenter(newContract);
  }

  @ApiParam({ name: 'contractId', type: 'string' })
  @Patch(':contractId/reject')
  async reject(
    @Param('contractId', UuidValidationPipe) contractId: string,
    @ExtractUser() { organizationId, id }: IAdminUserModel,
    @Body() { rejectionReason }: RejectContractDto,
  ): Promise<ContractPresenter> {
    const newContract = await this.rejectContractUsecase.execute(
      contractId,
      organizationId,
      id,
      rejectionReason,
    );

    return new ContractPresenter(newContract);
  }
}
