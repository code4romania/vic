import { Get, UseGuards } from '@nestjs/common';
import { Controller } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { ExtractUser } from 'src/common/decorators/extract-user.decorator';
import { MobileJwtAuthGuard } from 'src/modules/auth/guards/jwt-mobile.guard';
import { IRegularUserModel } from 'src/modules/user/models/regular-user.model';
import { GetVolunteerMonthlyNewsStatisticsUsecase } from 'src/usecases/dashboard/get-volunteer-monthly-news.usecase';
import { MonthlyStatisticsPresenter } from './presenters/monthly-statistics.presenter';
import { GetVicStatisticsUsecase } from 'src/usecases/dashboard/get-vic-statistics.usecase';
import { VicStatisticsPresenter } from './presenters/vic-statistics.presenter';

@ApiBearerAuth()
@UseGuards(MobileJwtAuthGuard)
@Controller('mobile/statistics')
export class MobileStatisticsController {
  constructor(
    private readonly getVolunteerMonthlyNewsStatisticsUsecase: GetVolunteerMonthlyNewsStatisticsUsecase,
    private readonly getVicStatisticsUsecase: GetVicStatisticsUsecase,
  ) {}

  @Get('monthly')
  async getMonthlyStatistics(
    @ExtractUser() { id }: IRegularUserModel,
  ): Promise<MonthlyStatisticsPresenter> {
    const statistics =
      await this.getVolunteerMonthlyNewsStatisticsUsecase.execute(id);

    return new MonthlyStatisticsPresenter(statistics);
  }

  @Get('vic')
  async getVicStatistics(): Promise<VicStatisticsPresenter> {
    const statistics = await this.getVicStatisticsUsecase.execute();

    return new VicStatisticsPresenter(statistics);
  }
}
