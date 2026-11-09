import {
  Body,
  Controller,
  Get,
  Patch,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiExtraModels,
  ApiOkResponse,
} from '@nestjs/swagger';
import { ExtractUser } from 'src/common/decorators/extract-user.decorator';
import { WebJwtAuthGuard } from 'src/modules/auth/guards/jwt-web.guard';
import { IAdminUserModel } from 'src/modules/user/models/admin-user.model';
import { GetOrganizationUseCaseService } from 'src/usecases/organization/get-organization.usecase';
import { UpdateOrganizationUseCase } from 'src/usecases/organization/update-organization.usecase';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import {
  OrganizationFilesInterceptor,
  OrganizationUploads,
} from './organization-files';
import { OrganizationPresenter } from './presenters/organization-presenter.interface';

// @Roles(Role.ADMIN)
@ApiExtraModels(UpdateOrganizationDto)
@ApiBearerAuth()
@UseGuards(WebJwtAuthGuard)
@Controller('organization')
export class OrganizationController {
  constructor(
    private readonly getOrganizationUseCase: GetOrganizationUseCaseService,
    private readonly updateOrganizationUseCase: UpdateOrganizationUseCase,
  ) {}

  @ApiOkResponse({ type: OrganizationPresenter })
  @Get()
  async getOrganization(
    @ExtractUser() { organizationId }: IAdminUserModel,
  ): Promise<OrganizationPresenter> {
    const organization =
      await this.getOrganizationUseCase.execute(organizationId);
    return new OrganizationPresenter(organization);
  }

  // Every field, and optionally a new logo (multipart, like PATCH /mobile/user/profile).
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      allOf: [
        { $ref: '#/components/schemas/UpdateOrganizationDto' },
        {
          type: 'object',
          properties: {
            logo: {
              type: 'string',
              format: 'binary',
              description: 'Image, at most 5 MB',
            },
          },
        },
      ],
    },
  })
  @ApiOkResponse({ type: OrganizationPresenter })
  @UseInterceptors(OrganizationFilesInterceptor())
  @Patch()
  async patchOrganization(
    @ExtractUser() admin: IAdminUserModel,
    @Body() changes: UpdateOrganizationDto,
    @UploadedFiles() files: OrganizationUploads,
  ): Promise<OrganizationPresenter> {
    const organization = await this.updateOrganizationUseCase.execute(
      changes,
      admin,
      { logo: files?.logo?.[0] },
    );
    return new OrganizationPresenter(organization);
  }
}
