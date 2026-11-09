import {
  Body,
  Controller,
  Delete,
  Get,
  Header,
  Param,
  Post,
  Query,
  Res,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiParam } from '@nestjs/swagger';
import { ExtractUser } from 'src/common/decorators/extract-user.decorator';
import { WebJwtAuthGuard } from 'src/modules/auth/guards/jwt-web.guard';
import { UploadContractUsecase } from 'src/usecases/documents/upload-contract.usecase';
import { UploadContractDto } from './dto/upload-contract.dto';
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
import { GetContractsForDownloadUsecase } from 'src/usecases/documents/get-contracts-for-download.usecase';
import { jsonToExcelBuffer } from 'src/common/helpers/utils';
import { IContractDownloadModel } from 'src/modules/documents/models/contract.model';
import { Response } from 'express';
import { DeleteContractUsecase } from 'src/usecases/documents/delete-contract.usecase';

@ApiBearerAuth()
@UseGuards(WebJwtAuthGuard)
@Controller('contract')
export class ContractController {
  constructor(
    private readonly uploadContractUsecase: UploadContractUsecase,
    private readonly getManyContractsUsecase: GetManyContractsUsecase,
    private readonly countPendingContractsUsecase: CountPendingContractsUsecase,
    private readonly getOneContractUsecase: GetOneContractUsecase,
    private readonly getContractsForDownloadUsecase: GetContractsForDownloadUsecase,
    private readonly deleteContractUsecase: DeleteContractUsecase,
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

  @Get('download')
  @Header(
    'Content-Type',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  )
  @Header('Content-Disposition', 'attachment; filename="Voluntari.xlsx"')
  async downloadAll(
    @Res({ passthrough: true }) res: Response,
    @ExtractUser() user: IAdminUserModel,
    @Query() filters: GetManyContractsDto,
  ): Promise<void> {
    const data = await this.getContractsForDownloadUsecase.execute({
      ...filters,
      organizationId: user.organizationId,
    });

    res.end(jsonToExcelBuffer<IContractDownloadModel>(data, 'Contracts'));
  }

  @Get('active')
  async getActivContractsCount(
    @ExtractUser() { organizationId }: IAdminUserModel,
  ): Promise<number> {
    return this.countPendingContractsUsecase.execute({
      organizationId,
    });
  }

  // TODO: guard for contractId
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

  // #486: the NGO uploads a contract already signed, with its validity period
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UploadContractDto })
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'contract', maxCount: 1 }], {
      limits: { fileSize: 10 * 1024 * 1024 },
    }),
  )
  @Post()
  async upload(
    @Body() dto: UploadContractDto,
    @UploadedFiles() files: { contract?: Express.Multer.File[] },
    @ExtractUser() admin: IAdminUserModel,
  ): Promise<ContractPresenter> {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { contract: _file, ...options } = dto;
    const contract = await this.uploadContractUsecase.execute(
      options,
      files?.contract?.[0],
      admin,
    );
    return new ContractPresenter(contract);
  }

  // TODO: guard for contractId
  @ApiParam({ name: 'id', type: 'string' })
  @Delete(':id')
  async delete(
    @Param('id', UuidValidationPipe) id: string,
    @ExtractUser() { organizationId }: IAdminUserModel,
  ): Promise<string> {
    return this.deleteContractUsecase.execute(id, organizationId);
  }
}
