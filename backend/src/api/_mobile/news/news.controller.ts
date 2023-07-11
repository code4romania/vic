import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { MobileJwtAuthGuard } from 'src/modules/auth/guards/jwt-mobile.guard';
import { PaginatedPresenter } from 'src/infrastructure/presenters/generic-paginated.presenter';
import { GetManyNewsUsecase } from 'src/usecases/actions-archive/get-many-news.usecase';
import { ExtractUser } from 'src/common/decorators/extract-user.decorator';
import { IRegularUserModel } from 'src/modules/user/models/regular-user.model';
import { BasePaginationFilterDto } from 'src/infrastructure/base/base-pagination-filter.dto';

@ApiBearerAuth()
@UseGuards(MobileJwtAuthGuard)
@Controller('/mobile/news')
export class MobileNewsController {
  constructor(private readonly getManyNewsUsecase: GetManyNewsUsecase) {}

  @Get()
  //   @ApiPaginatedResponse(OrganizationWithVolunteersPresenter)
  async getAll(
    @Query() filters: BasePaginationFilterDto,
    @ExtractUser() user: IRegularUserModel,
  ): Promise<PaginatedPresenter<unknown>> {
    const news = await this.getManyNewsUsecase.execute({
      ...filters,
      userId: user.id,
      events: [],
    });

    return news;
  }
}
