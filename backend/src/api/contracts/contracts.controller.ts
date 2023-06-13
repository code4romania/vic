import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
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

// TODO: guard for organization contract
@ApiBearerAuth()
@UseGuards(WebJwtAuthGuard)
@Controller('contract')
export class ContractController {
  constructor(
    private readonly createContractUsecase: CreateContractUsecase,
    private readonly getManyContractsUsecase: GetManyContractsUsecase,
    private readonly countPendingContractsUsecase: CountPendingContractsUsecase,
  ) {}

  @Get()
  @ApiPaginatedResponse(ContractPresenter)
  async getManyPaginated(
    @Query() filters: GetManyContractsDto,
    @ExtractUser() { organizationId }: IAdminUserModel,
  ): Promise<PaginatedPresenter<ContractPresenter>> {
    const contracts = await this.getManyContractsUsecase.execute({
      ...filters,
      organizationId,
    });

    return new PaginatedPresenter<ContractPresenter>({
      ...contracts,
      items: contracts.items.map((contract) => new ContractPresenter(contract)),
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

  @Post()
  async create(
    @Body() contract: CreateContractDto,
    @ExtractUser() { organizationId }: IAdminUserModel,
  ): Promise<ContractPresenter> {
    const newContract = await this.createContractUsecase.execute({
      ...contract,
      organizationId,
    });

    return new ContractPresenter(newContract);
  }
}
