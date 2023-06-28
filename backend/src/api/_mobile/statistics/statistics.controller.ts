import { Get, UseGuards } from '@nestjs/common';
import { Controller } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { ExtractUser } from 'src/common/decorators/extract-user.decorator';
import { MobileJwtAuthGuard } from 'src/modules/auth/guards/jwt-mobile.guard';
import { IRegularUserModel } from 'src/modules/user/models/regular-user.model';
import { GetVolunteerMonthlyNewsStatisticsUsecase } from 'src/usecases/dashboard/get-volunteer-monthly-news.usecase';
import { MonthlyStatisticsPresenter } from './presenters/monthly-statistics.presenter';
import { GetTeoStatisticsUsecase } from 'src/usecases/dashboard/get-teo-statistics.usecase';
import { TeoStatisticsPresenter } from './presenters/teo-statistics.presenter';

@ApiBearerAuth()
@UseGuards(MobileJwtAuthGuard)
@Controller('mobile/statistics')
export class MobileStatisticsController {
  constructor(
    private readonly getVolunteerMonthlyNewsStatisticsUsecase: GetVolunteerMonthlyNewsStatisticsUsecase,
    private readonly getTeoStatisticsUsecase: GetTeoStatisticsUsecase,
  ) {}

  @Get('monthly')
  async getMonthlyStatistics(
    @ExtractUser() { id }: IRegularUserModel,
  ): Promise<MonthlyStatisticsPresenter> {
    const statistics =
      await this.getVolunteerMonthlyNewsStatisticsUsecase.execute(id);

    return new MonthlyStatisticsPresenter(statistics);
  }

  @Get('teo')
  async getTeoStatistics(): Promise<TeoStatisticsPresenter> {
    const statistics = await this.getTeoStatisticsUsecase.execute();

    return new TeoStatisticsPresenter(statistics);
  }
}
