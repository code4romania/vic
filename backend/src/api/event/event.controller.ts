import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiParam } from '@nestjs/swagger';
import { ExtractUser } from 'src/common/decorators/extract-user.decorator';
import { UuidValidationPipe } from 'src/infrastructure/pipes/uuid.pipe';
import { WebJwtAuthGuard } from 'src/modules/auth/guards/jwt-web.guard';
import { IAdminUserModel } from 'src/modules/user/models/admin-user.model';
import { ArchiveEventUseCase } from 'src/usecases/event/archive-event.usecase';
import { CreateEventUseCase } from 'src/usecases/event/create-event.usecase';
import { DeleteEventUseCase } from 'src/usecases/event/delete-event.usecase';
import { GetOneEventUseCase } from 'src/usecases/event/get-one-event.usecase';
import { PublishEventUseCase } from 'src/usecases/event/publish-event.usecase';
import { UpdateEventUseCase } from 'src/usecases/event/update-event.usecase';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { EventGuard } from './guards/event.guard';
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
  ) {}

  @ApiBody({ type: CreateEventDto })
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
}
