import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { ExtractUser } from 'src/common/decorators/extract-user.decorator';
import { WebJwtAuthGuard } from 'src/modules/auth/guards/jwt-web.guard';
import { CreateTemplateOptions } from 'src/modules/documents/models/template.model';
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

// TODO: guard for organization template
@ApiBearerAuth()
@UseGuards(WebJwtAuthGuard)
@Controller('template')
export class TemplateController {
  constructor(
    private readonly createTemplateUsecase: CreateTemplateUsecase,
    private readonly getTemplatesUsecase: GetTemplatesUsecase,
  ) {}

  @Get()
  @ApiPaginatedResponse(TemplateListItemPresenter)
  async getAll(
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
}
