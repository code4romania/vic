import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { MobileJwtAuthGuard } from 'src/modules/auth/guards/jwt-mobile.guard';
import { GetOrganizationsUseCase } from 'src/usecases/organization/get-organizations.usecase';
import {
  ApiPaginatedResponse,
  PaginatedPresenter,
} from 'src/infrastructure/presenters/generic-paginated.presenter';
import { GetManyOrganizationsDto } from './dto/get-many-organizations.dto';
import { OrganizationWithVolunteersPresenter } from './presenters/organization-with-volunteers.presenter';
import { UuidValidationPipe } from 'src/infrastructure/pipes/uuid.pipe';
import { OrganizationWithEventsPresenter } from './presenters/organization-with-events.presenter';
import { GetOrganizationWithEventsUseCase } from 'src/usecases/organization/get-organization-with-events.usecase';

@ApiBearerAuth()
@UseGuards(MobileJwtAuthGuard)
@Controller('/mobile/organization')
export class MobileOrganizationController {
  constructor(
    private readonly getOrganizationsUseCase: GetOrganizationsUseCase,
    private readonly getOrganizationWithEvents: GetOrganizationWithEventsUseCase,
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

  @ApiParam({ name: 'id', type: 'string' })
  @Get(':id')
  async get(
    @Param('id', UuidValidationPipe) organizationId: string,
  ): Promise<OrganizationWithEventsPresenter> {
    const organization = await this.getOrganizationWithEvents.execute(
      organizationId,
    );
    return new OrganizationWithEventsPresenter(organization);
  }
}
