import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { Request } from 'express';
import { ExtractUser } from 'src/common/decorators/extract-user.decorator';
import { WebJwtAuthGuard } from 'src/modules/auth/guards/jwt-web.guard';
import { IAdminUserModel } from 'src/modules/user/models/admin-user.model';
import { GetOrganizationUseCaseService } from 'src/usecases/organization/get-organization.usecase';
import { UpdateOrganizationDescriptionUseCaseService } from 'src/usecases/organization/update-organization-description.usecase';
import { UpdateOrganizationDescriptionDto } from './dto/update-organization-description.dto';
import { OrganizationPresenter } from './presenters/organization-presenter.interface';
import { SyncWithOngHubUseCaseService } from 'src/usecases/organization/sync-with-ngohub.usecase';

// @Roles(Role.ADMIN)
@ApiBearerAuth()
@UseGuards(WebJwtAuthGuard)
@Controller('organization')
export class OrganizationController {
  constructor(
    private readonly getOrganizationUseCase: GetOrganizationUseCaseService,
    private readonly updateOrganizationDescriptionUseCase: UpdateOrganizationDescriptionUseCaseService,
    private readonly syncWithOngHubUseCase: SyncWithOngHubUseCaseService,
  ) {}

  @Get()
  async getOrganization(
    @ExtractUser() { organizationId }: IAdminUserModel,
  ): Promise<OrganizationPresenter> {
    const organization =
      await this.getOrganizationUseCase.execute(organizationId);
    return new OrganizationPresenter(organization);
  }

  @ApiBody({ type: UpdateOrganizationDescriptionDto })
  @Patch()
  async patchOrganization(
    @ExtractUser() admin: IAdminUserModel,
    @Body() { description }: UpdateOrganizationDescriptionDto,
  ): Promise<OrganizationPresenter> {
    const organization =
      await this.updateOrganizationDescriptionUseCase.execute(
        description,
        admin,
      );
    return new OrganizationPresenter(organization);
  }

  @Post('onghub/sync')
  async resyncWithOngHub(
    @ExtractUser() { organizationId }: IAdminUserModel,
    @Req() req: Request,
  ): Promise<OrganizationPresenter> {
    const organization = await this.syncWithOngHubUseCase.execute(
      organizationId,
      req.headers.authorization.split(' ')[1],
    );

    return new OrganizationPresenter(organization);
  }
}
