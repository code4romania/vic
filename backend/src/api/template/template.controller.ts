import {
  Body,
  Controller,
  Post,
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

// TODO: guard for organization template
@ApiBearerAuth()
@UseGuards(WebJwtAuthGuard)
@Controller('template')
export class TemplateController {
  constructor(private readonly createTemplateUsecase: CreateTemplateUsecase) {}

  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileFieldsInterceptor([{ name: 'template', maxCount: 1 }]))
  @Post()
  async create(
    @Body() payload: CreateTemplateDto,
    @ExtractUser() { organizationId }: IAdminUserModel,
    @UploadedFiles() { template }: { template: Express.Multer.File[] },
  ): Promise<unknown> {
    return this.createTemplateUsecase.execute(
      {
        ...(payload as CreateTemplateOptions),
        organizationId,
      },
      template,
    );
  }
}
