import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
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
import { ApiBearerAuth, ApiConsumes, ApiParam } from '@nestjs/swagger';
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

  @ApiParam({ name: 'id', type: 'string' })
  @Delete(':id')
  async delete(
    @Param('id', UuidValidationPipe) id: string,
    @ExtractUser() { organizationId }: IAdminUserModel,
  ): Promise<string> {
    return this.contractModelsUsecase.delete(organizationId, id);
  }
}
