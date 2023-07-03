import {
  Body,
  Controller,
  Delete,
  Get,
  Header,
  Param,
  Patch,
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
import {
  CreateTemplateOptions,
  ITemplateDownloadModel,
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
import { GetTemplatesForDownloadUsecase } from 'src/usecases/documents/get-templates-for-download.usecase';
import { jsonToExcelBuffer } from 'src/common/helpers/utils';
import { Response } from 'express';

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
    private readonly getTemplatesForDownloadUsecase: GetTemplatesForDownloadUsecase,
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

  @Get('download')
  @Header(
    'Content-Type',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  )
  @Header('Content-Disposition', 'attachment; filename="Voluntari.xlsx"')
  async downloadAll(
    @Res({ passthrough: true }) res: Response,
    @ExtractUser() user: IAdminUserModel,
    @Query() filters: GetTemplatesDto,
  ): Promise<void> {
    const data = await this.getTemplatesForDownloadUsecase.execute({
      ...filters,
      organizationId: user.organizationId,
    });

    res.end(jsonToExcelBuffer<ITemplateDownloadModel>(data, 'Templates'));
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
    @ExtractUser() { organizationId }: IAdminUserModel,
  ): Promise<TemplatePresenter> {
    const template = await this.updateTemplateUsecase.execute(
      id,
      organizationId,
      updateTemplateDto,
    );

    return new TemplatePresenter(template);
  }

  @ApiParam({ name: 'id', type: 'string' })
  @Get(':id')
  async getOne(
    @Param('id') id: string,
    @ExtractUser() { organizationId }: IAdminUserModel,
  ): Promise<TemplatePresenter> {
    const template = await this.getOneTemplateUsecase.execute({
      id,
      organizationId,
    });
    return new TemplatePresenter(template);
  }

  @ApiParam({ name: 'id', type: 'string' })
  @Delete(':id')
  async delete(
    @Param('id', UuidValidationPipe) id: string,
    @ExtractUser() { organizationId }: IAdminUserModel,
  ): Promise<string> {
    return this.deleteTemplateUsecase.execute(id, organizationId);
  }
}
