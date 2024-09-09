import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ExtractUser } from 'src/common/decorators/extract-user.decorator';
import { IAdminUserModel } from 'src/modules/user/models/admin-user.model';
import { CreateDocumentTemplateDto } from './dto/create-document-template.dto';
import { ApiBearerAuth, ApiBody, ApiParam } from '@nestjs/swagger';
import { DocumentTemplatePresenter } from './presenters/document-template.presenter';
import { UuidValidationPipe } from 'src/infrastructure/pipes/uuid.pipe';
import { WebJwtAuthGuard } from 'src/modules/auth/guards/jwt-web.guard';
import { CreateDocumentTemplateUsecase } from 'src/usecases/documents/new_contracts/create-document-template.usecase';
import { GetOneDocumentTemplateUseCase } from 'src/usecases/documents/new_contracts/get-one-document-template.usecase';

@ApiBearerAuth()
@UseGuards(WebJwtAuthGuard)
@Controller('documents/templates')
export class DocumentTemplateController {
  constructor(
    private readonly createDocumentTemplateUsecase: CreateDocumentTemplateUsecase,
    private readonly getOneDocumentTemplateUsecase: GetOneDocumentTemplateUseCase,
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
}
