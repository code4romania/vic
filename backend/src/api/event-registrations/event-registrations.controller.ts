import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
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
import { EventRegistrationStatus } from 'src/modules/event/enums/event-registration-status.enum';
import { IAdminUserModel } from 'src/modules/user/models/admin-user.model';
import { DecideEventRegistrationUseCase } from 'src/usecases/event/RSVP/decide-event-registration.usecase';
import { GetManyEventRegistrationsUseCase } from 'src/usecases/event/RSVP/get-many-event-registrations.usecase';
import { EventRSVPPresenter } from '../event/presenters/event-rsvp.presenter';
import { GetEventRegistrationsDto } from './dto/get-event-registrations.dto';
import { RejectEventRegistrationDto } from './dto/reject-event-registration.dto';
import { EventRegistrationPresenter } from './presenters/event-registration.presenter';

// VIC 2.0 (#501): the NGO approves or rejects volunteers' registrations to its events
@ApiBearerAuth()
@UseGuards(WebJwtAuthGuard)
@Controller('event-registrations')
export class EventRegistrationsController {
  constructor(
    private readonly getManyEventRegistrationsUseCase: GetManyEventRegistrationsUseCase,
    private readonly decideEventRegistrationUseCase: DecideEventRegistrationUseCase,
  ) {}

  @Get()
  @ApiPaginatedResponse(EventRegistrationPresenter)
  async getMany(
    @Query() { status, eventId, search, limit, page }: GetEventRegistrationsDto,
    @ExtractUser() { organizationId }: IAdminUserModel,
  ): Promise<PaginatedPresenter<EventRegistrationPresenter>> {
    const { items, meta } = await this.getManyEventRegistrationsUseCase.execute(
      {
        organizationId,
        status: status ?? EventRegistrationStatus.PENDING,
        eventId,
        search,
        limit,
        page,
      },
    );
    return new PaginatedPresenter({
      items: items.map((item) => new EventRegistrationPresenter(item)),
      meta,
    });
  }

  @Patch(':id/approve')
  @ApiParam({ name: 'id', type: 'string' })
  async approve(
    @Param('id', UuidValidationPipe) id: string,
    @ExtractUser() { organizationId, id: adminId }: IAdminUserModel,
  ): Promise<EventRSVPPresenter> {
    const rsvp = await this.decideEventRegistrationUseCase.execute({
      id,
      organizationId,
      adminId,
      status: EventRegistrationStatus.APPROVED,
    });
    return new EventRSVPPresenter(rsvp);
  }

  @Patch(':id/reject')
  @ApiParam({ name: 'id', type: 'string' })
  @ApiBody({ type: RejectEventRegistrationDto })
  async reject(
    @Param('id', UuidValidationPipe) id: string,
    @Body() { reason }: RejectEventRegistrationDto,
    @ExtractUser() { organizationId, id: adminId }: IAdminUserModel,
  ): Promise<EventRSVPPresenter> {
    const rsvp = await this.decideEventRegistrationUseCase.execute({
      id,
      organizationId,
      adminId,
      status: EventRegistrationStatus.REJECTED,
      reason,
    });
    return new EventRSVPPresenter(rsvp);
  }
}
