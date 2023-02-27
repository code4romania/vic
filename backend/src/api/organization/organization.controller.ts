import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { ExtractUser } from 'src/common/decorators/extract-user.decorator';
import { WebJwtAuthGuard } from 'src/modules/auth/guards/jwt-web.guard';
import { IAdminUserModel } from 'src/modules/user/models/admin-user.model';
import { GetOrganizationUseCaseService } from 'src/usecases/organization/get-organization.usecase';
import { UpdateOrganizationDescriptionUseCaseService } from 'src/usecases/organization/update-organization-description.usecase';
import { UpdateOrganizationDescriptionDto } from './dto/update-organization-description.dto';
import { OrganizationPresenter } from './presenters/organization-presenter.interface';

// @Roles(Role.ADMIN)
@ApiBearerAuth()
@UseGuards(WebJwtAuthGuard)
@Controller('organization')
export class OrganizationController {
  constructor(
    private readonly getOrganizationUseCase: GetOrganizationUseCaseService,
    private readonly updateOrganizationDescriptionUseCase: UpdateOrganizationDescriptionUseCaseService,
  ) {}

  @Get()
  getOrganization(
    @ExtractUser() { organizationId }: IAdminUserModel,
  ): Promise<OrganizationPresenter> {
    return this.getOrganizationUseCase.execute(organizationId);
  }

  @ApiBody({ type: UpdateOrganizationDescriptionDto })
  @Patch()
  patchOrganization(
    @ExtractUser() { organizationId }: IAdminUserModel,
    @Body() { description }: UpdateOrganizationDescriptionDto,
  ): Promise<OrganizationPresenter> {
    return this.updateOrganizationDescriptionUseCase.execute(
      organizationId,
      description,
    );
  }
}
