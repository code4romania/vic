import { Get, Param, Query, UseGuards } from '@nestjs/common';
import { Controller } from '@nestjs/common';
import { ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import {
  ApiPaginatedResponse,
  PaginatedPresenter,
} from 'src/infrastructure/presenters/generic-paginated.presenter';
import { MobileContractListItemPresenter } from './presenters/mobile-contract-list-item.presenter';
import { GetVolunteerContractsDto } from './dto/get-volunteer-contracts.dto';
import { GetManyContractsUsecase } from 'src/usecases/documents/get-many-contracts.usecase';
import { MobileJwtAuthGuard } from 'src/modules/auth/guards/jwt-mobile.guard';
import { ContractVolunteerGuard } from './guards/contract-volunteer.guard';
import { ExtractUser } from 'src/common/decorators/extract-user.decorator';
import { IRegularUserModel } from 'src/modules/user/models/regular-user.model';
import { UuidValidationPipe } from 'src/infrastructure/pipes/uuid.pipe';
import { GetOneContractUsecase } from 'src/usecases/documents/get-one-contract.usecase';
import { MobileContractPresenter } from './presenters/mobile-contract.presenter';

@UseGuards(MobileJwtAuthGuard, ContractVolunteerGuard)
@ApiBearerAuth()
@Controller('mobile/contract')
export class MobileContractController {
  constructor(
    private readonly getManyContractsUsecase: GetManyContractsUsecase,
    private readonly getOneContractUsecase: GetOneContractUsecase,
  ) {}

  @Get()
  @ApiPaginatedResponse(MobileContractListItemPresenter)
  async getMany(
    @Query() filters: GetVolunteerContractsDto,
    @ExtractUser() { activeOrganization }: IRegularUserModel,
  ): Promise<PaginatedPresenter<MobileContractListItemPresenter>> {
    const contracts = await this.getManyContractsUsecase.execute({
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
}
