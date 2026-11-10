import {
  Controller,
  Delete,
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
import { SwitchOrganizationUsecase } from 'src/usecases/organization/switch-organization.usecase';
import { LeaveOrganizationUsecase } from 'src/usecases/organization/leave-organization.usecase';
import { RejoinOrganizationUsecase } from 'src/usecases/organization/rejoin-organization.usecase';
import { MobileProfileGuard } from '../common/guards/mobile-profile.guard';
import { VolunteerMobileGuard } from '../volunteer/guards/volunteer-mobile.guard';

@ApiBearerAuth()
@UseGuards(MobileJwtAuthGuard)
@Controller('/mobile/organization')
export class MobileOrganizationController {
  constructor(
    private readonly getOrganizationsUseCase: GetOrganizationsUseCase,
    private readonly getOrganizationWithEvents: GetOrganizationWithEventsUseCase,
    private readonly switchOrganizationUsecase: SwitchOrganizationUsecase,
    private readonly leaveOrganizationUsecase: LeaveOrganizationUsecase,
    private readonly rejonOrganizationUsecase: RejoinOrganizationUsecase,
  ) {}

  @Get()
  @ApiPaginatedResponse(OrganizationWithVolunteersPresenter)
  async getAll(
    @Query() filters: GetManyOrganizationsDto,
    @ExtractUser() { id }: IRegularUserModel,
  ): Promise<PaginatedPresenter<OrganizationWithVolunteersPresenter>> {
    const organizations = await this.getOrganizationsUseCase.execute({
      ...filters,
      userId: id,
    });

    return new PaginatedPresenter<OrganizationWithVolunteersPresenter>({
      ...organizations,
      items: organizations.items.map(
        (organization) => new OrganizationWithVolunteersPresenter(organization),
      ),
    });
  }

  // Browsing the list works before the profile exists; the rest acts on the user's own data
  @UseGuards(MobileProfileGuard)
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

  // The volunteer leaving must be the user's own (audit B4); others answer 404
  @UseGuards(VolunteerMobileGuard)
  @ApiParam({ name: 'volunteerId', type: 'string' })
  @Delete(':volunteerId')
  async leave(
    @Param('volunteerId', UuidValidationPipe) volunteerId: string,
    @ExtractUser() user: IRegularUserModel,
  ): Promise<OrganizationWithEventsPresenter> {
    const organization = await this.leaveOrganizationUsecase.execute(
      volunteerId,
      user,
    );

    return new OrganizationWithEventsPresenter(organization);
  }

  @UseGuards(VolunteerMobileGuard)
  @ApiParam({ name: 'volunteerId', type: 'string' })
  @Patch(':volunteerId/rejoin')
  async rejoin(
    @Param('volunteerId', UuidValidationPipe) volunteerId: string,
    @ExtractUser() user: IRegularUserModel,
  ): Promise<OrganizationWithEventsPresenter> {
    const organization = await this.rejonOrganizationUsecase.execute(
      volunteerId,
      user,
    );

    return new OrganizationWithEventsPresenter(organization);
  }

  @UseGuards(MobileProfileGuard)
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
