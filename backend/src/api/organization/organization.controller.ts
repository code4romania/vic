import { Body, Controller, Get, Param, Patch } from '@nestjs/common';
import { ApiBody, ApiParam } from '@nestjs/swagger';
import { GetOrganizationUseCaseService } from 'src/usecases/organization/get-organization-use-case.service';
import { UpdateOrganizationDescriptionUseCaseService } from 'src/usecases/organization/update-organization-description-use-case.service';
import { UpdateOrganizationDescriptionDto } from './dto/update-organization-description.dto';
import { IOrganizationPresenter } from './presenters/organization-presenter.interface';

// @Roles(Role.ADMIN)
// @UseGuards(WebJwtAuthGuard)
// @UsePipes(new UuidValidationPipe())
@Controller('organization')
export class OrganizationController {
  constructor(
    private readonly getOrganizationUseCase: GetOrganizationUseCaseService,
    private readonly updateOrganizationDescriptionUseCase: UpdateOrganizationDescriptionUseCaseService,
  ) {}

  // TODO: the organization id will be retrieved from the user once it is implemented
  @ApiParam({ name: 'id', type: 'string' })
  @Get(':id')
  getOrganization(
    @Param('id') organizationid: string,
  ): Promise<IOrganizationPresenter> {
    return this.getOrganizationUseCase.execute(organizationid);
  }

  // TODO: the organization id will be retrieved from the user once it is implemented
  @ApiParam({ name: 'id', type: 'string' })
  @ApiBody({ type: UpdateOrganizationDescriptionDto })
  @Patch(':id')
  patchOrganization(
    @Param('id') organizationid: string,
    @Body() { description }: UpdateOrganizationDescriptionDto,
  ): Promise<IOrganizationPresenter> {
    return this.updateOrganizationDescriptionUseCase.execute(
      organizationid,
      description,
    );
  }
}
