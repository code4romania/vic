import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiNoContentResponse,
  ApiOkResponse,
} from '@nestjs/swagger';
import { MobileJwtAuthGuard } from 'src/modules/auth/guards/jwt-mobile.guard';
import { MobileProfileGuard } from '../common/guards/mobile-profile.guard';
import {
  ApiPaginatedResponse,
  PaginatedPresenter,
} from 'src/infrastructure/presenters/generic-paginated.presenter';
import { GetManyNewsUsecase } from 'src/usecases/actions-archive/get-many-news.usecase';
import { ExtractUser } from 'src/common/decorators/extract-user.decorator';
import { IRegularUserModel } from 'src/modules/user/models/regular-user.model';
import { NewsPresenter } from './presenters/news.presenter';
import { GetNewsDto } from './dto/get-news.dto';
import { UnreadNewsPresenter } from './presenters/unread-news.presenter';
import { GetUnreadNewsCountUsecase } from 'src/usecases/actions-archive/get-unread-news-count.usecase';
import { MarkNewsSeenUsecase } from 'src/usecases/actions-archive/mark-news-seen.usecase';

@ApiBearerAuth()
@UseGuards(MobileJwtAuthGuard, MobileProfileGuard)
@Controller('/mobile/news')
export class MobileNewsController {
  constructor(
    private readonly getManyNewsUsecase: GetManyNewsUsecase,
    private readonly getUnreadNewsCountUsecase: GetUnreadNewsCountUsecase,
    private readonly markNewsSeenUsecase: MarkNewsSeenUsecase,
  ) {}

  // The badge on the Home bell
  @Get('unread-count')
  @ApiOkResponse({ type: UnreadNewsPresenter })
  async getUnreadCount(
    @ExtractUser() user: IRegularUserModel,
  ): Promise<UnreadNewsPresenter> {
    return new UnreadNewsPresenter(
      await this.getUnreadNewsCountUsecase.execute(user.id),
    );
  }

  // Sent when the volunteer opens "Noutăți" (explicit, not a side effect of the paginated, per-tab GET)
  @Post('seen')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse()
  async markSeen(@ExtractUser() user: IRegularUserModel): Promise<void> {
    await this.markNewsSeenUsecase.execute(user.id);
  }

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
