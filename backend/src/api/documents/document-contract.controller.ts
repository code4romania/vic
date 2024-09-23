import {
  Body,
  Controller,
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
import { ApiBearerAuth } from '@nestjs/swagger';
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
import { ApproveDocumentContractByNgoUsecase } from 'src/usecases/documents/new_contracts/approve-document-contract-by-ngo.usecase';
import { SignDocumentContractByNgoUsecase } from 'src/usecases/documents/new_contracts/sign-document-contract-by-ngo.usecase';
import { RejectDocumentContractByNgoUsecase } from 'src/usecases/documents/new_contracts/reject-document-contract-by-ngo.usecase';
import { RejectDocumentContractByNgoDTO } from './dto/reject-document-contract.dto';

@ApiBearerAuth()
@UseGuards(WebJwtAuthGuard)
@Controller('documents/contracts')
export class DocumentContractController {
  constructor(
    private readonly createDocumentContractUsecase: CreateDocumentContractUsecase,
    private readonly getManyDocumentContractsUsecase: GetManyDocumentContractsUsecase,
    private readonly approveDocumentContractByNgoUsecase: ApproveDocumentContractByNgoUsecase,
    private readonly rejectDocumentContractByNgoUsecase: RejectDocumentContractByNgoUsecase,
    private readonly signDocumentContractByNGO: SignDocumentContractByNgoUsecase,
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

  @Patch(':id/approve')
  async approveDocumentContract(
    @Param('id', UuidValidationPipe) id: string,
    @ExtractUser() admin: IAdminUserModel,
  ): Promise<void> {
    await this.approveDocumentContractByNgoUsecase.execute(id, admin);
  }

  @Patch(':id/sign')
  async signDocumentContract(
    @Param('id', UuidValidationPipe) id: string,
    @ExtractUser() admin: IAdminUserModel,
  ): Promise<void> {
    await this.signDocumentContractByNGO.execute(id, admin);
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
}
