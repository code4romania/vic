import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiParam } from '@nestjs/swagger';
import { ExtractUser } from 'src/common/decorators/extract-user.decorator';
import { WebJwtAuthGuard } from 'src/modules/auth/guards/jwt-web.guard';
import {
  CreateTemplateOptions,
  ITemplateModel,
} from 'src/modules/documents/models/template.model';
import { IAdminUserModel } from 'src/modules/user/models/admin-user.model';
import { CreateTemplateUsecase } from 'src/usecases/documents/create-template.usecase';
import { CreateTemplateDto } from './dto/create-template.dto';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import {
  ApiPaginatedResponse,
  PaginatedPresenter,
} from 'src/infrastructure/presenters/generic-paginated.presenter';
import { TemplatePresenter } from './presenters/template.presenter';
import { TemplateListItemPresenter } from './presenters/template-list-item.presenter';
import { GetTemplatesDto } from './dto/get-templates.dto';
import { GetTemplatesUsecase } from 'src/usecases/documents/get-templates.usecase';
import { GetOneTemplateUseCase } from 'src/usecases/documents/get-one-template.usecase';
import { EditTemplateDto } from './dto/edit-template.dto';
import { UuidValidationPipe } from 'src/infrastructure/pipes/uuid.pipe';
import { UpdateTemplateUsecase } from 'src/usecases/documents/update-template.usecase';
import { DeleteTemplateUseCase } from 'src/usecases/documents/delete-template.usecase';
import { GetAllTemplatesUsecase } from 'src/usecases/documents/get-all-templates.usecase';
import { IdAndNamePresenter } from 'src/infrastructure/presenters/id-name.presenter';
import { GetAllTemplatesDto } from './dto/get-all-templates.dto';

// TODO: guard for organization template
@ApiBearerAuth()
@UseGuards(WebJwtAuthGuard)
@Controller('template')
export class TemplateController {
  constructor(
    private readonly createTemplateUsecase: CreateTemplateUsecase,
    private readonly getTemplatesUsecase: GetTemplatesUsecase,
    private readonly getOneTemplateUsecase: GetOneTemplateUseCase,
    private readonly updateTemplateUsecase: UpdateTemplateUsecase,
    private readonly deleteTemplateUsecase: DeleteTemplateUseCase,
    private readonly getAllTemplatesUsecase: GetAllTemplatesUsecase,
  ) {}

  @Get()
  @ApiPaginatedResponse(TemplateListItemPresenter)
  async getManyPaginated(
    @Query() filters: GetTemplatesDto,
    @ExtractUser() { organizationId }: IAdminUserModel,
  ): Promise<PaginatedPresenter<TemplateListItemPresenter>> {
    const templates = await this.getTemplatesUsecase.execute({
      ...filters,
      organizationId,
    });

    return new PaginatedPresenter<TemplateListItemPresenter>({
      ...templates,
      items: templates.items.map(
        (template) => new TemplateListItemPresenter(template),
      ),
    });
  }

  @Get('all')
  async getAll(
    @Query() filters: GetAllTemplatesDto,
    @ExtractUser() { organizationId }: IAdminUserModel,
  ): Promise<IdAndNamePresenter<ITemplateModel>[]> {
    const templates = await this.getAllTemplatesUsecase.execute({
      organizationId,
      ...filters,
    });
    return templates.map((template) => new IdAndNamePresenter(template));
  }

  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileFieldsInterceptor([{ name: 'template', maxCount: 1 }]))
  @Post()
  async create(
    @Body() payload: CreateTemplateDto,
    @ExtractUser() { organizationId }: IAdminUserModel,
    @UploadedFiles() { template }: { template: Express.Multer.File[] },
  ): Promise<TemplatePresenter> {
    const newTemplate = await this.createTemplateUsecase.execute(
      {
        ...(payload as CreateTemplateOptions),
        organizationId,
      },
      template,
    );

    return new TemplatePresenter(newTemplate);
  }

  @ApiParam({ name: 'id', type: 'string' })
  @ApiBody({ type: EditTemplateDto })
  @Patch(':id')
  async update(
    @Param('id', UuidValidationPipe) id: string,
    @Body() updateTemplateDto: EditTemplateDto,
  ): Promise<TemplatePresenter> {
    const template = await this.updateTemplateUsecase.execute(
      id,
      updateTemplateDto,
    );

    return new TemplatePresenter(template);
  }

  @ApiParam({ name: 'id', type: 'string' })
  @Get(':id')
  async getOne(@Param('id') id: string): Promise<TemplatePresenter> {
    const template = await this.getOneTemplateUsecase.execute({ id });
    return new TemplatePresenter(template);
  }

  @ApiParam({ name: 'id', type: 'string' })
  @Delete(':id')
  async delete(@Param('id', UuidValidationPipe) id: string): Promise<string> {
    return this.deleteTemplateUsecase.execute(id);
  }
}
