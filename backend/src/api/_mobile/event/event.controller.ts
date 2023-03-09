import { Body, Delete, Param, Patch } from '@nestjs/common';
import { Controller } from '@nestjs/common';
import { ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { UuidValidationPipe } from 'src/infrastructure/pipes/uuid.pipe';
import { CreateEventRSVPUseCase } from 'src/usecases/event/RSVP/create-rsvp.usecase';
import { DeleteEventRSVPUseCase } from 'src/usecases/event/RSVP/delete-rsvp.usecase';
import { EventCancelRSVPDto, EventRSVPDto } from './dto/create-rsvp.dto';

// TODO: add MobileJwtAuthGuard and VolunteerGuard
@ApiBearerAuth()
@Controller('mobile/event')
export class MobileEventController {
  constructor(
    private readonly createEventRSVPUseCase: CreateEventRSVPUseCase,
    private readonly deleteEventRSVPUseCase: DeleteEventRSVPUseCase,
  ) {}

  @ApiBody({ type: EventRSVPDto })
  @Patch(':id/rsvp')
  async createRSVP(
    // TODO: add ExtractUser to use the id - add guard to check if the userId is volunteer in the organization if the event is not public? or we do it in usecase?
    @Param('id', UuidValidationPipe) eventId: string,
    @Body() rsvpDTO: EventRSVPDto,
  ): Promise<unknown> {
    const rsvp = await this.createEventRSVPUseCase.execute({
      eventId,
      userId: rsvpDTO.userId, // TODO: replace with userId from token
      going: rsvpDTO.going,
      mention: rsvpDTO.mention,
    });

    return rsvp.id; // TODO: add presenter when we know what to return
  }

  @ApiBody({ type: EventCancelRSVPDto })
  @Delete(':id/rsvp')
  async cancelRSVP(
    @Param('id', UuidValidationPipe) eventId: string,
    @Body() rsvpDTO: EventCancelRSVPDto,
  ): Promise<string> {
    return this.deleteEventRSVPUseCase.execute(eventId, rsvpDTO.userId);
  }
}
