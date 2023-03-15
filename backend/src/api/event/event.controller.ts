import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiParam } from '@nestjs/swagger';
import { ExtractUser } from 'src/common/decorators/extract-user.decorator';
import { UuidValidationPipe } from 'src/infrastructure/pipes/uuid.pipe';
import {
  ApiPaginatedResponse,
  PaginatedPresenter,
} from 'src/infrastructure/presenters/generic-paginated.presenter';
import { WebJwtAuthGuard } from 'src/modules/auth/guards/jwt-web.guard';
import { IAdminUserModel } from 'src/modules/user/models/admin-user.model';
import { ArchiveEventUseCase } from 'src/usecases/event/archive-event.usecase';
import { CreateEventUseCase } from 'src/usecases/event/create-event.usecase';
import { DeleteEventUseCase } from 'src/usecases/event/delete-event.usecase';
import { GetManyEventUseCase } from 'src/usecases/event/get-many-event.usecase';
import { GetOneEventUseCase } from 'src/usecases/event/get-one-event.usecase';
import { PublishEventUseCase } from 'src/usecases/event/publish-event.usecase';
import { UpdateEventUseCase } from 'src/usecases/event/update-event.usecase';
import { CreateEventDto } from './dto/create-event.dto';
import { GetManyEventDto } from './dto/get-many-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { EventGuard } from './guards/event.guard';
import { EventListItemPresenter } from './presenters/event-list-item.presenter';
import { EventPresenter } from './presenters/event.presenter';

// @Roles(Role.ADMIN)
@ApiBearerAuth()
@UseGuards(WebJwtAuthGuard, EventGuard)
@Controller('event')
export class EventController {
  constructor(
    private readonly createEventUsecase: CreateEventUseCase,
    private readonly updateEventUseCase: UpdateEventUseCase,
    private readonly getOneEventUsecase: GetOneEventUseCase,
    private readonly deleteEventUseCase: DeleteEventUseCase,
    private readonly archiveEventUseCase: ArchiveEventUseCase,
    private readonly publishEventUseCase: PublishEventUseCase,
    private readonly getManyEventUseCase: GetManyEventUseCase,
  ) {}

  @Get()
  @ApiPaginatedResponse(EventListItemPresenter)
  async getMany(
    @Query() filters: GetManyEventDto,
    @ExtractUser() { organizationId }: IAdminUserModel,
  ): Promise<PaginatedPresenter<EventListItemPresenter>> {
    const events = await this.getManyEventUseCase.execute({
      ...filters,
      organizationId,
    });

    return new PaginatedPresenter({
      ...events,
      items: events.items.map((event) => new EventListItemPresenter(event)),
    });
  }

  @Post()
  async create(
    @Body() createEventDto: CreateEventDto,
    @ExtractUser() adminUser: IAdminUserModel,
  ): Promise<EventPresenter> {
    const event = await this.createEventUsecase.execute({
      ...createEventDto,
      organizationId: adminUser.organizationId,
    });
    return new EventPresenter(event);
  }

  @ApiBody({ type: UpdateEventDto })
  @Patch(':id')
  async update(
    @Param('id', UuidValidationPipe) eventId: string,
    @Body() updatesDto: UpdateEventDto,
  ): Promise<EventPresenter> {
    const event = await this.updateEventUseCase.execute(eventId, updatesDto);
    return new EventPresenter(event);
  }

  @ApiParam({ name: 'id', type: 'string' })
  @Get(':id')
  async getOne(
    @Param('id', UuidValidationPipe) eventId: string,
  ): Promise<EventPresenter> {
    const event = await this.getOneEventUsecase.execute(eventId);
    return new EventPresenter(event);
  }

  @ApiParam({ name: 'id', type: 'string' })
  @Patch(':id/archive')
  async archive(
    @Param('id', UuidValidationPipe) eventId: string,
  ): Promise<EventPresenter> {
    const event = await this.archiveEventUseCase.execute(eventId);
    return new EventPresenter(event);
  }

  @ApiParam({ name: 'id', type: 'string' })
  @Patch(':id/publish')
  async publish(
    @Param('id', UuidValidationPipe) eventId: string,
  ): Promise<EventPresenter> {
    const event = await this.publishEventUseCase.execute(eventId);
    return new EventPresenter(event);
  }

  @ApiParam({ name: 'id', type: 'string' })
  @Delete(':id')
  delete(@Param('id', UuidValidationPipe) eventId: string): Promise<string> {
    return this.deleteEventUseCase.execute(eventId);
  }

  // TODO: @birloiflorian get all RSVP for event
  // @GET(':id/rsvp') + filters
}
