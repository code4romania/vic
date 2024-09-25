import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CreateDocumentContractUsecase } from 'src/usecases/documents/new_contracts/create-document-contract.usecase';
import { CreateDocumentContractDto } from './dto/create-document-contract.dto';
import { IAdminUserModel } from 'src/modules/user/models/admin-user.model';
import { ExtractUser } from 'src/common/decorators/extract-user.decorator';
import { ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { WebJwtAuthGuard } from 'src/modules/auth/guards/jwt-web.guard';
import { Pagination } from 'src/infrastructure/base/repository-with-pagination.class';
import { GetManyDocumentContractsUsecase } from 'src/usecases/documents/new_contracts/get-many-document-contracts.usecase';
import { DocumentContractListViewItemPresenter } from './presenters/document-contract-list-view-item.presenter';
import {
  ApiPaginatedResponse,
  PaginatedPresenter,
} from 'src/infrastructure/presenters/generic-paginated.presenter';
import { GetManyDocumentContractsDto } from './dto/get-many-document-contracts.dto';
import { UuidValidationPipe } from 'src/infrastructure/pipes/uuid.pipe';
import { ValidateDocumentContractByNgoUsecase } from 'src/usecases/documents/new_contracts/validate-document-contract-by-ngo.usecase';
import { SignDocumentContractByNgoUsecase } from 'src/usecases/documents/new_contracts/sign-document-contract-by-ngo.usecase';
import { RejectDocumentContractByNgoUsecase } from 'src/usecases/documents/new_contracts/reject-document-contract-by-ngo.usecase';
import { RejectDocumentContractByNgoDTO } from './dto/reject-document-contract.dto';
import { DocumentContractWebItemPresenter } from './presenters/document-contract-web-item.presenter';
import { GetOneDocumentContractForNgoUsecase } from 'src/usecases/documents/new_contracts/get-one-document-contract-for-ngo.usecase';
import { DocumentContractStatisticsPresenter } from './presenters/document-contract-statistics.presenter';
import { GetDocumentContractStatisticsUsecase } from 'src/usecases/documents/new_contracts/get-document-contract-statistics.usecase';
import { SignDocumentContractByNgoDto } from './dto/sign-document-contract-by-ngo.dto';
import { DeleteDocumentContractUsecase } from 'src/usecases/documents/new_contracts/delete-document-contract.usecase';

@ApiBearerAuth()
@UseGuards(WebJwtAuthGuard)
@Controller('documents/contracts')
export class DocumentContractController {
  constructor(
    private readonly createDocumentContractUsecase: CreateDocumentContractUsecase,
    private readonly getManyDocumentContractsUsecase: GetManyDocumentContractsUsecase,
    private readonly validateDocumentContractByNgoUsecase: ValidateDocumentContractByNgoUsecase,
    private readonly rejectDocumentContractByNgoUsecase: RejectDocumentContractByNgoUsecase,
    private readonly signDocumentContractByNGO: SignDocumentContractByNgoUsecase,
    private readonly getOneDocumentContractForNgoUsecase: GetOneDocumentContractForNgoUsecase,
    private readonly getDocumentContractStatisticsUsecase: GetDocumentContractStatisticsUsecase,
    private readonly deleteDocumentContractUsecase: DeleteDocumentContractUsecase,
  ) {}

  @Post()
  async createDocumentContract(
    @Body() createDocumentContractDto: CreateDocumentContractDto,
    @ExtractUser() admin: IAdminUserModel,
  ): Promise<string> {
    const documentContract = await this.createDocumentContractUsecase.execute(
      {
        ...createDocumentContractDto,
        organizationId: admin.organizationId,
        createdByAdminId: admin.id,
      },
      admin,
    );

    return documentContract;
  }

  @Get('')
  @ApiPaginatedResponse(DocumentContractListViewItemPresenter)
  async getDocumentContracts(
    @Query() filters: GetManyDocumentContractsDto,
    @ExtractUser() { organizationId }: IAdminUserModel,
  ): Promise<Pagination<DocumentContractListViewItemPresenter>> {
    const contracts = await this.getManyDocumentContractsUsecase.execute({
      ...filters,
      organizationId,
    });

    return new PaginatedPresenter<DocumentContractListViewItemPresenter>({
      ...contracts,
      items: contracts.items.map(
        (contract) => new DocumentContractListViewItemPresenter(contract),
      ),
    });
  }

  @Get('statistics')
  @ApiResponse({
    type: DocumentContractStatisticsPresenter,
  })
  async getStatistics(
    @ExtractUser() { organizationId }: IAdminUserModel,
  ): Promise<DocumentContractStatisticsPresenter> {
    const statistics =
      await this.getDocumentContractStatisticsUsecase.execute(organizationId);
    return new DocumentContractStatisticsPresenter(statistics);
  }

  @Get(':id')
  @ApiResponse({
    type: DocumentContractWebItemPresenter,
  })
  async getDocumentContract(
    @Param('id', UuidValidationPipe) id: string,
    @ExtractUser() { organizationId }: IAdminUserModel,
  ): Promise<DocumentContractWebItemPresenter> {
    const documentContract =
      await this.getOneDocumentContractForNgoUsecase.execute({
        documentContractId: id,
        organizationId,
      });
    return new DocumentContractWebItemPresenter(documentContract);
  }

  @Patch(':id/approve')
  async approveDocumentContract(
    @Param('id', UuidValidationPipe) id: string,
    @ExtractUser() admin: IAdminUserModel,
  ): Promise<void> {
    await this.validateDocumentContractByNgoUsecase.execute(id, admin);
  }

  @Patch(':id/sign')
  async signDocumentContract(
    @Param('id', UuidValidationPipe) id: string,
    @ExtractUser() admin: IAdminUserModel,
    @Body()
    { legalRepresentativeSignatureBase64 }: SignDocumentContractByNgoDto,
  ): Promise<void> {
    await this.signDocumentContractByNGO.execute(
      id,
      legalRepresentativeSignatureBase64,
      admin,
    );
  }

  @Patch(':id/reject')
  async rejectDocumentContract(
    @Param('id', UuidValidationPipe) id: string,
    @ExtractUser() admin: IAdminUserModel,
    @Body() { rejectionReason }: RejectDocumentContractByNgoDTO,
  ): Promise<void> {
    await this.rejectDocumentContractByNgoUsecase.execute({
      documentContractId: id,
      organizationId: admin.organizationId,
      rejectionReason: rejectionReason,
      admin,
    });
  }

  @Delete(':id')
  async deleteDocumentContract(
    @Param('id', UuidValidationPipe) id: string,
    @ExtractUser() admin: IAdminUserModel,
  ): Promise<void> {
    await this.deleteDocumentContractUsecase.execute(id, admin);
  }
}
