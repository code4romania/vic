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
import { ExtractUser } from 'src/common/decorators/extract-user.decorator';
import { IAdminUserModel } from 'src/modules/user/models/admin-user.model';
import { CreateDocumentTemplateDto } from './dto/create-document-template.dto';
import { ApiBearerAuth, ApiBody, ApiParam } from '@nestjs/swagger';
import { DocumentTemplatePresenter } from './presenters/document-template.presenter';
import { UuidValidationPipe } from 'src/infrastructure/pipes/uuid.pipe';
import { WebJwtAuthGuard } from 'src/modules/auth/guards/jwt-web.guard';
import { CreateDocumentTemplateUsecase } from 'src/usecases/documents/new_contracts/create-document-template.usecase';
import { GetOneDocumentTemplateUseCase } from 'src/usecases/documents/new_contracts/get-one-document-template.usecase';
import { GetManyDocumentTemplatesDto } from './dto/get-many-document-templates.dto';
import { DocumentTemplateListViewItemPresenter } from './presenters/document-template-list-view-item.presenter';
import { GetManyDocumentTemplatesUsecase } from 'src/usecases/documents/new_contracts/get-many-document-templates.usecase';
import {
  ApiPaginatedResponse,
  PaginatedPresenter,
} from 'src/infrastructure/presenters/generic-paginated.presenter';
import { DeleteDocumentTemplateUsecase } from 'src/usecases/documents/new_contracts/delete-document-template.usecase';
import { UpdateDocumentTemplateUsecase } from 'src/usecases/documents/new_contracts/update-document-template.usecase';

@ApiBearerAuth()
@UseGuards(WebJwtAuthGuard)
@Controller('documents/templates')
export class DocumentTemplateController {
  constructor(
    private readonly createDocumentTemplateUsecase: CreateDocumentTemplateUsecase,
    private readonly getOneDocumentTemplateUsecase: GetOneDocumentTemplateUseCase,
    private readonly getManyDocumentTemplatesUsecase: GetManyDocumentTemplatesUsecase,
    private readonly deleteDocumentTemplateUsecase: DeleteDocumentTemplateUsecase,
    private readonly updateDocumentTemplateUsecase: UpdateDocumentTemplateUsecase,
  ) {}

  @ApiBody({ type: CreateDocumentTemplateDto })
  @Post()
  async create(
    @Body() payload: CreateDocumentTemplateDto,
    @ExtractUser() { organizationId, id: adminId }: IAdminUserModel,
  ): Promise<DocumentTemplatePresenter> {
    const newDocumentTemplate =
      await this.createDocumentTemplateUsecase.execute({
        ...payload,
        createdByAdminId: adminId,
        organizationId,
      });
    return new DocumentTemplatePresenter(newDocumentTemplate);
  }

  @ApiParam({ name: 'id', type: 'string' })
  @Get(':id')
  async getOne(
    @Param('id', UuidValidationPipe) id: string,
    @ExtractUser() { organizationId }: IAdminUserModel,
  ): Promise<DocumentTemplatePresenter> {
    const documentTemplate = await this.getOneDocumentTemplateUsecase.execute(
      { id },
      organizationId,
    );

    return new DocumentTemplatePresenter(documentTemplate);
  }

  @ApiParam({ name: 'id', type: 'string' })
  @Patch(':id')
  async update(
    @Param('id', UuidValidationPipe) id: string,
    @Body() payload: CreateDocumentTemplateDto,
    @ExtractUser() { organizationId }: IAdminUserModel,
  ): Promise<void> {
    return this.updateDocumentTemplateUsecase.execute(
      { id, ...payload },
      organizationId,
    );
  }

  @ApiParam({ name: 'id', type: 'string' })
  @Delete(':id')
  async delete(
    @Param('id', UuidValidationPipe) id: string,
    @ExtractUser() { organizationId }: IAdminUserModel,
  ): Promise<string> {
    return this.deleteDocumentTemplateUsecase.execute(id, organizationId);
  }

  @Get()
  @ApiPaginatedResponse(DocumentTemplateListViewItemPresenter)
  async getMany(
    @Query() query: GetManyDocumentTemplatesDto,
    @ExtractUser() { organizationId }: IAdminUserModel,
  ): Promise<PaginatedPresenter<DocumentTemplateListViewItemPresenter>> {
    const documentTemplates =
      await this.getManyDocumentTemplatesUsecase.execute({
        ...query,
        organizationId,
      });

    return new PaginatedPresenter<DocumentTemplateListViewItemPresenter>({
      ...documentTemplates,
      items: documentTemplates.items.map(
        (documentTemplate) =>
          new DocumentTemplateListViewItemPresenter(documentTemplate),
      ),
    });
  }
}
