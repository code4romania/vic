import { Body, Get, Param, Patch, Query, UseGuards } from '@nestjs/common';
import { Controller } from '@nestjs/common';
import { ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { MobileJwtAuthGuard } from 'src/modules/auth/guards/jwt-mobile.guard';
import { ExtractUser } from 'src/common/decorators/extract-user.decorator';
import { IRegularUserModel } from 'src/modules/user/models/regular-user.model';
import { UuidValidationPipe } from 'src/infrastructure/pipes/uuid.pipe';
import { SignDocumentContractByVolunteerUsecase } from 'src/usecases/documents/new_contracts/sign-document-contract-by-volunteer.usecase';
import { RejectDocumentContractByVolunteerUsecase } from 'src/usecases/documents/new_contracts/reject-document-contact-by-volunteer.usecase';
import { SignDocumentContractByVolunteerDto } from './dto/sign-document-contract-by-volunteer.dto';
import { RejectDocumentContractByVolunteerDto } from './dto/reject-document-contract-by-volunteer.dto';
import { Pagination } from 'src/infrastructure/base/repository-with-pagination.class';
import { GetManyDocumentContractsByVolunteerUsecase } from 'src/usecases/documents/new_contracts/get-many-document-contracts-by-volunteer.usecase';
import { GetManyContractsByVolunteerDto } from './dto/get-many-contracts-by-volunteer.dto';
import { DocumentContractListViewItemPresenter } from 'src/api/documents/presenters/document-contract-list-view-item.presenter';
import { PaginatedPresenter } from 'src/infrastructure/presenters/generic-paginated.presenter';
import { GetOneDocumentContractForVolunteerUsecase } from 'src/usecases/documents/new_contracts/get-one-document-contract-for-volunteer.usecase';
import { DocumentContractItemMobilePresenter } from './presenters/document-contract-item-mobile.presenter';

// @UseGuards(MobileJwtAuthGuard, ContractVolunteerGuard)
@UseGuards(MobileJwtAuthGuard)
@ApiBearerAuth()
@Controller('mobile/documents/contracts')
export class MobileDocumentsContractController {
  constructor(
    private readonly signDocumentContractByVolunteerUsecase: SignDocumentContractByVolunteerUsecase,
    private readonly rejectDocumentContractByVolunteerUsecase: RejectDocumentContractByVolunteerUsecase,
    private readonly getManyDocumentContractsByVolunteerUsecase: GetManyDocumentContractsByVolunteerUsecase,
    private readonly getOneDocumentContractForVolunteerUsecase: GetOneDocumentContractForVolunteerUsecase,
  ) {}

  // Get all contracts for a volunteer
  @Get()
  async findMany(
    @ExtractUser() { id: userId }: IRegularUserModel,
    @Query() query: GetManyContractsByVolunteerDto,
  ): Promise<Pagination<DocumentContractListViewItemPresenter>> {
    const contracts =
      await this.getManyDocumentContractsByVolunteerUsecase.execute({
        ...query,
        userId,
      });

    return new PaginatedPresenter<DocumentContractListViewItemPresenter>({
      ...contracts,
      items: contracts.items.map(
        (contract) => new DocumentContractListViewItemPresenter(contract),
      ),
    });
  }

  @Get(':contractId')
  async findOne(
    @ExtractUser() { id }: IRegularUserModel,
    @Param('contractId', UuidValidationPipe) contractId: string,
    @Query('organizationId', UuidValidationPipe) organizationId: string,
  ): Promise<DocumentContractItemMobilePresenter> {
    const contract =
      await this.getOneDocumentContractForVolunteerUsecase.execute({
        documentContractId: contractId,
        userId: id,
        organizationId,
      });

    return new DocumentContractItemMobilePresenter(contract);
  }

  @ApiParam({ name: 'contractId', type: 'string' })
  @Patch(':contractId/sign')
  async sign(
    @Body() body: SignDocumentContractByVolunteerDto,
    @ExtractUser() { id }: IRegularUserModel,
    @Param('contractId', UuidValidationPipe) contractId: string,
  ): Promise<void> {
    const contract = await this.signDocumentContractByVolunteerUsecase.execute({
      contractId,
      userId: id,
      organizationId: body.organizationId, // TODO: can use activeOrganization but is a bit danger if the mobile doesn't set it
      volunteerSignatureBase64: body.volunteerSignatureBase64,
      legalGuardianSignatureBase64: body.legalGuardianSignatureBase64,
    });

    return contract;
  }

  @ApiParam({ name: 'contractId', type: 'string' })
  @Patch(':contractId/reject')
  async reject(
    @Body() body: RejectDocumentContractByVolunteerDto,
    @ExtractUser() { id }: IRegularUserModel,
    @Param('contractId', UuidValidationPipe) contractId: string,
  ): Promise<void> {
    await this.rejectDocumentContractByVolunteerUsecase.execute({
      contractId,
      userId: id,
      organizationId: body.organizationId,
      rejectionReason: body.reason,
    });
  }
}
