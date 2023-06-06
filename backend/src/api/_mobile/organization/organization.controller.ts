import {
  Controller,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
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
import { ExtractUser } from 'src/common/decorators/extract-user.decorator';
import { IRegularUserModel } from 'src/modules/user/models/regular-user.model';
import { OrganizationProfilePresenter } from './presenters/organization-profile.presenter';
import { GetMyOrganizationsUsecase } from 'src/usecases/organization/get-my-organizations.usecase';
import { SwitchOrganizationUsecase } from 'src/usecases/organization/switch-organization.usecase';

@ApiBearerAuth()
@UseGuards(MobileJwtAuthGuard)
@Controller('/mobile/organization')
export class MobileOrganizationController {
  constructor(
    private readonly getOrganizationsUseCase: GetOrganizationsUseCase,
    private readonly getOrganizationWithEvents: GetOrganizationWithEventsUseCase,
    private readonly getMyOrganizationsUsecase: GetMyOrganizationsUsecase,
    private readonly switchOrganizationUsecase: SwitchOrganizationUsecase,
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

  @Get('profiles')
  async getMyOrganizations(
    @ExtractUser() { id }: IRegularUserModel,
  ): Promise<OrganizationProfilePresenter[]> {
    const organizations = await this.getMyOrganizationsUsecase.execute(id);

    return organizations.map(
      (organization) => new OrganizationProfilePresenter(organization),
    );
  }

  @ApiParam({ name: 'id', type: 'string' })
  @Get(':id')
  async get(
    @Param('id', UuidValidationPipe) organizationId: string,
    @ExtractUser() { id }: IRegularUserModel,
  ): Promise<OrganizationWithEventsPresenter> {
    const organization = await this.getOrganizationWithEvents.execute(
      organizationId,
      id,
    );
    return new OrganizationWithEventsPresenter(organization);
  }

  @ApiParam({ name: 'id', type: 'string' })
  @Patch(':id')
  async switchOrganization(
    @Param('id', UuidValidationPipe) organizationId: string,
    @ExtractUser() { id }: IRegularUserModel,
  ): Promise<OrganizationWithEventsPresenter> {
    const organization = await this.switchOrganizationUsecase.execute(
      organizationId,
      id,
    );
    return new OrganizationWithEventsPresenter(organization);
  }
}
