import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { ApiBody } from '@nestjs/swagger';
import { ExtractUser } from 'src/common/decorators/extract-user.decorator';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from 'src/common/enums/role.enum';
import { IRequestUser } from 'src/common/interfaces/request-user.interface';
import { WebJwtAuthGuard } from 'src/modules/auth/guards/jwt-web.guard';
import { GetOrganizationUseCaseService } from 'src/usecases/organization/get-organization.usecase';
import { UpdateOrganizationDescriptionUseCaseService } from 'src/usecases/organization/update-organization-description.usecase';
import { UpdateOrganizationDescriptionDto } from './dto/update-organization-description.dto';
import { IOrganizationPresenter } from './presenters/organization-presenter.interface';

@Roles(Role.ADMIN)
@UseGuards(WebJwtAuthGuard)
@Controller('organization')
export class OrganizationController {
  constructor(
    private readonly getOrganizationUseCase: GetOrganizationUseCaseService,
    private readonly updateOrganizationDescriptionUseCase: UpdateOrganizationDescriptionUseCaseService,
  ) {}

  @Get()
  getOrganization(
    @ExtractUser() { organizationId }: IRequestUser,
  ): Promise<IOrganizationPresenter> {
    return this.getOrganizationUseCase.execute(organizationId);
  }

  @ApiBody({ type: UpdateOrganizationDescriptionDto })
  @Patch()
  patchOrganization(
    @ExtractUser() { organizationId }: IRequestUser,
    @Body() { description }: UpdateOrganizationDescriptionDto,
  ): Promise<IOrganizationPresenter> {
    return this.updateOrganizationDescriptionUseCase.execute(
      organizationId,
      description,
    );
  }
}
