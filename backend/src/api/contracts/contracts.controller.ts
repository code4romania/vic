import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { ExtractUser } from 'src/common/decorators/extract-user.decorator';
import { WebJwtAuthGuard } from 'src/modules/auth/guards/jwt-web.guard';
import { CreateContractUsecase } from 'src/usecases/documents/create-contract.usecase';
import { CreateContractDto } from './dto/create-contract.dto';
import { IAdminUserModel } from 'src/modules/user/models/admin-user.model';
import { ContractPresenter } from './presenters/contract.presenter';

// TODO: guard for organization contract
@ApiBearerAuth()
@UseGuards(WebJwtAuthGuard)
@Controller('contract')
export class ContractController {
  constructor(private readonly createContractUsecase: CreateContractUsecase) {}

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
