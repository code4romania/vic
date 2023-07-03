import { Get, Query, UseGuards } from '@nestjs/common';
import { Controller } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';

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
        (anouncement) => new MobileAnouncementPresenter(anouncement),
      ),
    });
  }
}
