import {
  Body,
  Delete,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Controller } from '@nestjs/common';
import { ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { UuidValidationPipe } from 'src/infrastructure/pipes/uuid.pipe';
import { CreateEventRSVPUseCase } from 'src/usecases/event/RSVP/create-rsvp.usecase';
import { DeleteEventRSVPUseCase } from 'src/usecases/event/RSVP/delete-rsvp.usecase';
import { EventRSVPDto } from './dto/create-rsvp.dto';
import { MobileJwtAuthGuard } from 'src/modules/auth/guards/jwt-mobile.guard';
import {
  ApiPaginatedResponse,
  PaginatedPresenter,
} from 'src/infrastructure/presenters/generic-paginated.presenter';
import { ExtractUser } from 'src/common/decorators/extract-user.decorator';
import { IRegularUserModel } from 'src/modules/user/models/regular-user.model';
import { EventListItemPresenter } from 'src/api/event/presenters/event-list-item.presenter';
import { GetMyEventsDto } from './dto/get-my-events.dto';
import { GetMyEventsUsecase } from 'src/usecases/event/get-my-events.usecase';
import { MobileEventListItemPresenter } from './presenters/mobile-event-list-item.presenter';
import { GetOneEventWithVolunteerStatusUsecase } from 'src/usecases/event/get-one-event-with-volunteer-status.usecase';
import { MobileEventPresenter } from './presenters/mobile-event.presenter';

@ApiBearerAuth()
@UseGuards(MobileJwtAuthGuard) // VolunteerGuard
@Controller('mobile/event')
export class MobileEventController {
  constructor(
    private readonly createEventRSVPUseCase: CreateEventRSVPUseCase,
    private readonly deleteEventRSVPUseCase: DeleteEventRSVPUseCase,
    private readonly getMyEventsUsecase: GetMyEventsUsecase,
    private readonly getOneEventWithVolunteerStatus: GetOneEventWithVolunteerStatusUsecase,
  ) {}

  @Get()
  @ApiPaginatedResponse(EventListItemPresenter)
  async getMany(
    @Query() filters: GetMyEventsDto,
    @ExtractUser() { id }: IRegularUserModel,
  ): Promise<PaginatedPresenter<MobileEventListItemPresenter>> {
    const events = await this.getMyEventsUsecase.execute({
      ...filters,
      userId: id,
    });

    return new PaginatedPresenter({
      ...events,
      items: events.items.map(
        (event) => new MobileEventListItemPresenter(event),
      ),
    });
  }

  @Get(':id')
  async getOne(
    @Param('id', UuidValidationPipe) eventId: string,
    @ExtractUser() { id }: IRegularUserModel,
  ): Promise<MobileEventPresenter> {
    const event = await this.getOneEventWithVolunteerStatus.execute({
      id: eventId,
      userId: id,
    });

    return new MobileEventPresenter(event);
  }

  @ApiBody({ type: EventRSVPDto })
  @Patch(':id/rsvp')
  async createRSVP(
    @Param('id', UuidValidationPipe) eventId: string,
    @Body() rsvpDTO: EventRSVPDto,
    @ExtractUser() { id }: IRegularUserModel,
  ): Promise<void> {
    await this.createEventRSVPUseCase.execute({
      eventId,
      userId: id,
      going: rsvpDTO.going,
      mention: rsvpDTO.mention,
    });
  }

  @Delete(':id/rsvp')
  async cancelRSVP(
    @Param('id', UuidValidationPipe) eventId: string,
    @ExtractUser() { id }: IRegularUserModel,
  ): Promise<string> {
    return this.deleteEventRSVPUseCase.execute(eventId, id);
  }
}
