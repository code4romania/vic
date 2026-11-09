import {
  Body,
  Get,
  HttpCode,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Controller } from '@nestjs/common';
import { ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { UuidValidationPipe } from 'src/infrastructure/pipes/uuid.pipe';
import { RespondToAnnouncementUseCase } from 'src/usecases/announcement/respond-to-announcement.usecase';
import { RespondToAnouncementDto } from './dto/respond-to-anouncement.dto';

import { MobileJwtAuthGuard } from 'src/modules/auth/guards/jwt-mobile.guard';
import {
  ApiPaginatedResponse,
  PaginatedPresenter,
} from 'src/infrastructure/presenters/generic-paginated.presenter';
import { ExtractUser } from 'src/common/decorators/extract-user.decorator';
import { IRegularUserModel } from 'src/modules/user/models/regular-user.model';
import { GetManyAnouncementsDto } from './dto/get-many-anouncements.dto';
import { MobileAnouncementPresenter } from './presenters/mobile-anouncement.presenter';
import { GetManyAnouncementsByUserAsUsecase } from 'src/usecases/announcement/get-many-anouncements-by-user.usecase';

@ApiBearerAuth()
@UseGuards(MobileJwtAuthGuard)
@Controller('mobile/anouncement')
export class MobileAnouncementsController {
  constructor(
    private readonly getManyAnouncements: GetManyAnouncementsByUserAsUsecase,
    private readonly respondToAnnouncementUseCase: RespondToAnnouncementUseCase,
  ) {}

  @Get()
  @ApiPaginatedResponse(MobileAnouncementPresenter)
  async getMany(
    @Query() filters: GetManyAnouncementsDto,
    @ExtractUser() { id }: IRegularUserModel,
  ): Promise<PaginatedPresenter<MobileAnouncementPresenter>> {
    const anouncements = await this.getManyAnouncements.execute({
      ...filters,
      userId: id,
    });

    return new PaginatedPresenter({
      ...anouncements,
      items: anouncements.items.map(
        (anouncement) =>
          new MobileAnouncementPresenter(anouncement, anouncement.myResponse),
      ),
    });
  }

  // #504: answer an announcement with a comment, once
  @Post(':id/response')
  @HttpCode(201)
  @ApiBody({ type: RespondToAnouncementDto })
  async respond(
    @Param('id', UuidValidationPipe) announcementId: string,
    @Body() { comment }: RespondToAnouncementDto,
    @ExtractUser() { id }: IRegularUserModel,
  ): Promise<void> {
    await this.respondToAnnouncementUseCase.execute({
      announcementId,
      userId: id,
      comment,
    });
  }
}
