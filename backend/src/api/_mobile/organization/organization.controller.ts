import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { MobileJwtAuthGuard } from 'src/modules/auth/guards/jwt-mobile.guard';
import { GetOrganizationsUseCase } from 'src/usecases/organization/get-organizations.usecase';
import {
  ApiPaginatedResponse,
  PaginatedPresenter,
} from 'src/infrastructure/presenters/generic-paginated.presenter';
import { GetManyOrganizationsDto } from './dto/get-many-organizations.dto';
import { OrganizationWithVolunteersPresenter } from './presenters/organization-with-volunteers.presenter';

@ApiBearerAuth()
@UseGuards(MobileJwtAuthGuard)
@Controller('/mobile/organization')
export class MobileOrganizationController {
  constructor(
    private readonly getOrganizationsUseCase: GetOrganizationsUseCase,
  ) {}

  @Get()
  @ApiPaginatedResponse(OrganizationWithVolunteersPresenter)
  async getAll(
    @Query() filters: GetManyOrganizationsDto,
  ): Promise<PaginatedPresenter<OrganizationWithVolunteersPresenter>> {
    const organizations = await this.getOrganizationsUseCase.execute({
      ...filters,
    });

    return new PaginatedPresenter<OrganizationWithVolunteersPresenter>({
      ...organizations,
      items: organizations.items.map(
        (organization) => new OrganizationWithVolunteersPresenter(organization),
      ),
    });
  }
}
