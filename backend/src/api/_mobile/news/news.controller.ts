import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { MobileJwtAuthGuard } from 'src/modules/auth/guards/jwt-mobile.guard';
import {
  ApiPaginatedResponse,
  PaginatedPresenter,
} from 'src/infrastructure/presenters/generic-paginated.presenter';
import { GetManyNewsUsecase } from 'src/usecases/actions-archive/get-many-news.usecase';
import { ExtractUser } from 'src/common/decorators/extract-user.decorator';
import { IRegularUserModel } from 'src/modules/user/models/regular-user.model';
import { NewsPresenter } from './presenters/news.presenter';
import { GetNewsDto } from './dto/get-news.dto';

@ApiBearerAuth()
@UseGuards(MobileJwtAuthGuard)
@Controller('/mobile/news')
export class MobileNewsController {
  constructor(private readonly getManyNewsUsecase: GetManyNewsUsecase) {}

  @Get()
  @ApiPaginatedResponse(NewsPresenter)
  async getAll(
    @Query() filters: GetNewsDto,
    @ExtractUser() user: IRegularUserModel,
  ): Promise<PaginatedPresenter<NewsPresenter>> {
    const news = await this.getManyNewsUsecase.execute({
      ...filters,
      userId: user.id,
      events: [],
    });

    return new PaginatedPresenter({
      ...news,
      items: news.items.map((item) => new NewsPresenter(item)),
    });
  }
}
