import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Res,
  StreamableFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import {
  PDF_MAX_BYTES,
  PDF_MIMETYPES,
  singleFileUpload,
} from 'src/infrastructure/uploads/upload-options';
import { ContractExceptionMessages } from 'src/modules/documents/exceptions/contract.exceptions';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { Response } from 'express';
import { sendStoredFile } from 'src/common/helpers/file-response';
import { IsString, MaxLength, MinLength } from 'class-validator';
import { ExtractUser } from 'src/common/decorators/extract-user.decorator';
import { UuidValidationPipe } from 'src/infrastructure/pipes/uuid.pipe';
import { WebJwtAuthGuard } from 'src/modules/auth/guards/jwt-web.guard';
import { ITemplateModel } from 'src/modules/documents/models/template.model';
import { IAdminUserModel } from 'src/modules/user/models/admin-user.model';
import { ContractModelsUsecase } from 'src/usecases/documents/contract-models.usecase';

export class CreateContractModelDto {
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string;
}

type ContractModelPresenter = Pick<
  ITemplateModel,
  'id' | 'name' | 'createdOn'
> & {
  uri: string;
};

const present = ({
  id,
  name,
  createdOn,
  path,
}: ITemplateModel): ContractModelPresenter => ({
  id,
  name,
  createdOn,
  uri: path,
});

// "Template-uri": blank contract models the NGO uploads and admins download (#486: no generation).
@ApiBearerAuth()
@UseGuards(WebJwtAuthGuard)
@Controller('template')
export class TemplateController {
  constructor(private readonly contractModelsUsecase: ContractModelsUsecase) {}

  @Get()
  async list(
    @ExtractUser() { organizationId }: IAdminUserModel,
  ): Promise<ContractModelPresenter[]> {
    return (await this.contractModelsUsecase.list(organizationId)).map(present);
  }

  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileFieldsInterceptor(
      [{ name: 'template', maxCount: 1 }],
      singleFileUpload({
        maxBytes: PDF_MAX_BYTES,
        mimetypes: PDF_MIMETYPES,
        invalidType: ContractExceptionMessages.CONTRACT_008,
      }),
    ),
  )
  @Post()
  async create(
    @Body() { name }: CreateContractModelDto,
    @ExtractUser() { organizationId }: IAdminUserModel,
    @UploadedFiles() files: { template?: Express.Multer.File[] },
  ): Promise<ContractModelPresenter> {
    return present(
      await this.contractModelsUsecase.create(
        organizationId,
        name,
        files?.template?.[0],
      ),
    );
  }

  // #724: the model's file, for the in-app viewer (inline) and the Download button (?download=true)
  @ApiParam({ name: 'id', type: 'string' })
  @ApiQuery({ name: 'download', required: false, type: Boolean })
  @Get(':id/file')
  async file(
    @Param('id', UuidValidationPipe) id: string,
    @Query('download') download: string | undefined,
    @ExtractUser() { organizationId }: IAdminUserModel,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    const file = await this.contractModelsUsecase.file(organizationId, id);
    return sendStoredFile(res, file, download === 'true');
  }

  @ApiParam({ name: 'id', type: 'string' })
  @Delete(':id')
  async delete(
    @Param('id', UuidValidationPipe) id: string,
    @ExtractUser() { organizationId }: IAdminUserModel,
  ): Promise<string> {
    return this.contractModelsUsecase.delete(organizationId, id);
  }
}
