import {
  Body,
  Controller,
  Delete,
  Get,
  Header,
  Param,
  Patch,
  Post,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiParam } from '@nestjs/swagger';
import { ExtractUser } from 'src/common/decorators/extract-user.decorator';
import { jsonToExcelBuffer } from 'src/common/helpers/utils';
import { UuidValidationPipe } from 'src/infrastructure/pipes/uuid.pipe';
import {
  ApiPaginatedResponse,
  PaginatedPresenter,
} from 'src/infrastructure/presenters/generic-paginated.presenter';
import { WebJwtAuthGuard } from 'src/modules/auth/guards/jwt-web.guard';
import { IEventDownload } from 'src/modules/event/interfaces/event-download.interface';
import { IAdminUserModel } from 'src/modules/user/models/admin-user.model';
import { ArchiveEventUseCase } from 'src/usecases/event/archive-event.usecase';
import { CreateEventUseCase } from 'src/usecases/event/create-event.usecase';
import { DeleteEventUseCase } from 'src/usecases/event/delete-event.usecase';
import { GetManyEventUseCase } from 'src/usecases/event/get-many-event.usecase';
import { GetOneEventUseCase } from 'src/usecases/event/get-one-event.usecase';
import { PublishEventUseCase } from 'src/usecases/event/publish-event.usecase';
import { GetManyEventRSVPUseCase } from 'src/usecases/event/RSVP/get-many-rsvp.usecase';
import { UpdateEventUseCase } from 'src/usecases/event/update-event.usecase';
import { CreateEventDto } from './dto/create-event.dto';
import { GetPaginatedEventRSVPsDto } from './dto/get-paginated-event-rsvp.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { EventGuard } from './guards/event.guard';
import { EventRSVPPresenter } from './presenters/event-rsvp.presenter';
import { GetManyEventDto } from './dto/get-many-event.dto';
import { EventListItemPresenter } from './presenters/event-list-item.presenter';
import { EventPresenter } from './presenters/event.presenter';
import { Response } from 'express';
import { GetManyForDownloadEventUseCase } from 'src/usecases/event/get-many-for-download-event.usecase';
import { GetManyForDownloadEventRSVPUseCase } from 'src/usecases/event/RSVP/get-many-for-download-rsvp.usecase';
import { IEventRSVPDownload } from 'src/modules/event/interfaces/event-rsvp-download.interface';
import { RSVPGoingEnum } from 'src/modules/event/enums/rsvp-going.enum';

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
    private readonly getManyEventRSVPUsecase: GetManyEventRSVPUseCase,
    private readonly getManyEventUseCase: GetManyEventUseCase,
    private readonly getManyForDownloadEventUseCase: GetManyForDownloadEventUseCase,
    private readonly getManyForDownloadEventRSVPUseCase: GetManyForDownloadEventRSVPUseCase,
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

  @Get('download')
  @Header(
    'Content-Type',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  )
  @Header('Content-Disposition', 'attachment; filename="Evenimente.xlsx"')
  async downloadEvents(
    @Res({ passthrough: true }) res: Response,
    @ExtractUser() user: IAdminUserModel,
    @Query() filters: GetManyEventDto,
  ): Promise<void> {
    const data = await this.getManyForDownloadEventUseCase.execute({
      ...filters,
      organizationId: user.organizationId,
    });

    res.end(jsonToExcelBuffer<IEventDownload>(data, 'Evenimente'));
  }

  @Post()
  async create(
    @Body() createEventDto: CreateEventDto,
    @ExtractUser() adminUser: IAdminUserModel,
  ): Promise<EventPresenter> {
    const event = await this.createEventUsecase.execute(
      {
        ...createEventDto,
        organizationId: adminUser.organizationId,
      },
      adminUser,
    );
    return new EventPresenter(event);
  }

  @ApiBody({ type: UpdateEventDto })
  @Patch(':id')
  async update(
    @Param('id', UuidValidationPipe) eventId: string,
    @Body() updatesDto: UpdateEventDto,
    @ExtractUser() adminUser: IAdminUserModel,
  ): Promise<EventPresenter> {
    const event = await this.updateEventUseCase.execute(
      eventId,
      updatesDto,
      adminUser,
    );
    return new EventPresenter(event);
  }

  @ApiParam({ name: 'id', type: 'string' })
  @Get(':id')
  async getOne(
    @Param('id', UuidValidationPipe) eventId: string,
  ): Promise<EventPresenter> {
    const event = await this.getOneEventUsecase.execute({ id: eventId });
    return new EventPresenter(event);
  }

  @ApiParam({ name: 'id', type: 'string' })
  @Patch(':id/archive')
  async archive(
    @Param('id', UuidValidationPipe) eventId: string,
    @ExtractUser() admin: IAdminUserModel,
  ): Promise<EventPresenter> {
    const event = await this.archiveEventUseCase.execute(eventId, admin);
    return new EventPresenter(event);
  }

  @ApiParam({ name: 'id', type: 'string' })
  @Patch(':id/publish')
  async publish(
    @Param('id', UuidValidationPipe) eventId: string,
    @ExtractUser() admin: IAdminUserModel,
  ): Promise<EventPresenter> {
    const event = await this.publishEventUseCase.execute(eventId, admin);
    return new EventPresenter(event);
  }

  @ApiParam({ name: 'id', type: 'string' })
  @Delete(':id')
  delete(
    @Param('id', UuidValidationPipe) eventId: string,
    @ExtractUser() admin: IAdminUserModel,
  ): Promise<string> {
    return this.deleteEventUseCase.execute(eventId, admin);
  }

  @Get(':id/rsvp')
  @ApiParam({ name: 'id', type: 'string' })
  @ApiPaginatedResponse(EventRSVPPresenter)
  async getManyRSVP(
    @Query() filters: GetPaginatedEventRSVPsDto,
    @Param('id', UuidValidationPipe) eventId: string,
  ): Promise<PaginatedPresenter<EventRSVPPresenter>> {
    const rsvps = await this.getManyEventRSVPUsecase.execute({
      ...filters,
      going: filters.going ? filters.going === RSVPGoingEnum.YES : undefined,
      eventId,
    });

    return new PaginatedPresenter({
      ...rsvps,
      items: rsvps.items.map((rsvp) => new EventRSVPPresenter(rsvp)),
    });
  }

  @ApiParam({ name: 'id', type: 'string' })
  @Get(':id/rsvp/download')
  @Header(
    'Content-Type',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  )
  @Header('Content-Disposition', 'attachment; filename="Lista raspunsuri.xlsx"')
  async downloadEventRSVPs(
    @Param('id', UuidValidationPipe) eventId: string,
    @Res({ passthrough: true }) res: Response,
    @Query() filters: GetPaginatedEventRSVPsDto,
  ): Promise<void> {
    const data = await this.getManyForDownloadEventRSVPUseCase.execute({
      ...filters,
      going: filters.going ? filters.going === RSVPGoingEnum.YES : undefined,
      eventId,
    });

    res.end(jsonToExcelBuffer<IEventRSVPDownload>(data, 'Lista raspunsuri'));
  }
}
