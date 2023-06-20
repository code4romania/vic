import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiParam } from '@nestjs/swagger';
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
}
