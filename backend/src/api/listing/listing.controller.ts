import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { ExtractUser } from 'src/common/decorators/extract-user.decorator';
import { BasePaginationFilterDto } from 'src/infrastructure/base/base-pagination-filter.dto';
import {
  ApiPaginatedResponse,
  PaginatedPresenter,
} from 'src/infrastructure/presenters/generic-paginated.presenter';
import { IdAndNamePresenter } from 'src/infrastructure/presenters/id-name.presenter';
import { IActivityTypeModel } from 'src/modules/activity-type/models/activity-type.model';
import { WebJwtAuthGuard } from 'src/modules/auth/guards/jwt-web.guard';
import { IEventModel } from 'src/modules/event/models/event.model';
import { OrganizationStructureType } from 'src/modules/organization/enums/organization-structure-type.enum';
import { IAdminUserModel } from 'src/modules/user/models/admin-user.model';
import { IRegularUserModel } from 'src/modules/user/models/regular-user.model';
import { IVolunteerModel } from 'src/modules/volunteer/model/volunteer.model';
import { GetManyActivityTypeUseCase } from 'src/usecases/activity-type/get-all-activity-type.usecase';
import { GetManyEventUseCase } from 'src/usecases/event/get-many-event.usecase';
import { GetAllOrganizationStructureUseCase } from 'src/usecases/organization/organization-structure/get-all-organization-structure.usecase';
import { GetManyAdminUsersUseCase } from 'src/usecases/user/get-many-admin-users.usecase';
import { GetManyVolunteersUseCase } from 'src/usecases/volunteer/get-many-volunteers.usecase';
import { GetActivityTypesDto } from '../activity-type/dto/get-activity-types.dto';
import { GetManyEventDto } from '../event/dto/get-many-event.dto';
import { OrganizationStructureListItemPresenter } from '../organization/presenters/organization-structure-list-item.presenter';
import { GetVolunteersDto } from '../volunteer/dto/get-volunteers.dto';
import { EventStatus } from 'src/modules/event/enums/event-status.enum';

@ApiBearerAuth()
@UseGuards(WebJwtAuthGuard)
@Controller('listing')
export class ListingController {
  constructor(
    private readonly getManyEventUseCase: GetManyEventUseCase,
    private readonly getManyVolunteersUseCase: GetManyVolunteersUseCase,
    private readonly getManyActivityTypeUseCase: GetManyActivityTypeUseCase,
    private readonly getManyAdminUserUseCase: GetManyAdminUsersUseCase,
    private readonly getAllStructureUsecase: GetAllOrganizationStructureUseCase,
  ) {}

  @Get('events')
  @ApiPaginatedResponse(IdAndNamePresenter)
  async events(
    @Query() filters: GetManyEventDto,
    @ExtractUser() { organizationId }: IAdminUserModel,
  ): Promise<PaginatedPresenter<IdAndNamePresenter<IEventModel>>> {
    const events = await this.getManyEventUseCase.execute({
      ...filters,
      limit: 50,
      organizationId,
      status: EventStatus.PUBLISHED,
    });

    return new PaginatedPresenter({
      ...events,
      items: events.items.map((event) => new IdAndNamePresenter(event)),
    });
  }

  @Get('volunteers')
  @ApiPaginatedResponse(IdAndNamePresenter)
  async volunteers(
    @Query() filters: GetVolunteersDto,
    @ExtractUser() user: IAdminUserModel,
  ): Promise<
    PaginatedPresenter<IdAndNamePresenter<IVolunteerModel & IRegularUserModel>>
  > {
    const volunteers = await this.getManyVolunteersUseCase.execute({
      ...filters,
      organizationId: user.organizationId,
      limit: 50,
    });

    return new PaginatedPresenter({
      ...volunteers,
      items: volunteers.items.map(
        (volunteer) =>
          new IdAndNamePresenter({
            id: volunteer.id,
            name: volunteer.user?.name,
          }),
      ),
    });
  }

  @Get('activity-types')
  async activityTypes(
    @ExtractUser() user: IAdminUserModel,
    @Query() activityTypeFilters: GetActivityTypesDto,
  ): Promise<IdAndNamePresenter<IActivityTypeModel>[]> {
    const activityTypes = await this.getManyActivityTypeUseCase.execute({
      organizationId: user.organizationId,
      ...activityTypeFilters,
    });

    return activityTypes.map((activity) => new IdAndNamePresenter(activity));
  }

  @Get('admins')
  @ApiPaginatedResponse(IdAndNamePresenter)
  async admins(
    @Query() filters: BasePaginationFilterDto,
    @ExtractUser() { organizationId }: IAdminUserModel,
  ): Promise<PaginatedPresenter<IdAndNamePresenter<IAdminUserModel>>> {
    const admins = await this.getManyAdminUserUseCase.execute({
      ...filters,
      limit: 50,
      organizationId,
    });

    return new PaginatedPresenter({
      ...admins,
      items: admins.items.map((admin) => new IdAndNamePresenter(admin)),
    });
  }

  @ApiParam({ name: 'type', type: String, enum: OrganizationStructureType })
  @ApiPaginatedResponse(OrganizationStructureListItemPresenter)
  @Get('structures/:type')
  async getAllPaginated(
    @Param('type') type: OrganizationStructureType,
    @Query() filters: BasePaginationFilterDto,
    @ExtractUser() { organizationId }: IAdminUserModel,
  ): Promise<PaginatedPresenter<OrganizationStructureListItemPresenter>> {
    const structures = await this.getAllStructureUsecase.execute({
      ...filters,
      limit: 50,
      type,
      organizationId,
    });

    return new PaginatedPresenter({
      ...structures,
      items: structures.items.map(
        (structure) => new OrganizationStructureListItemPresenter(structure),
      ),
    });
  }
}
