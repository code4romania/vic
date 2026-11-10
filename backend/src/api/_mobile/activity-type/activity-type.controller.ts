import { Get, Param, UseGuards } from '@nestjs/common';
import { Controller } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { MobileJwtAuthGuard } from 'src/modules/auth/guards/jwt-mobile.guard';
import { MobileProfileGuard } from '../common/guards/mobile-profile.guard';
import { MobileOwnershipService } from 'src/usecases/volunteer/mobile-ownership.service';
import { ExtractUser } from 'src/common/decorators/extract-user.decorator';
import { IRegularUserModel } from 'src/modules/user/models/regular-user.model';
import { IdAndNamePresenter } from 'src/infrastructure/presenters/id-name.presenter';
import { IActivityTypeModel } from 'src/modules/activity-type/models/activity-type.model';
import { UuidValidationPipe } from 'src/infrastructure/pipes/uuid.pipe';
import { GetManyActivityTypeUseCase } from 'src/usecases/activity-type/get-all-activity-type.usecase';
import { ActivityTypeStatus } from 'src/modules/activity-type/enums/activity-type-status.enum';

@ApiBearerAuth()
@UseGuards(MobileJwtAuthGuard, MobileProfileGuard)
@Controller('mobile/activity-type')
export class MobileActivityTypeController {
  constructor(
    private readonly getManyActivityTypesUsecase: GetManyActivityTypeUseCase,
    private readonly ownership: MobileOwnershipService,
  ) {}

  @Get(':organizationId')
  async getMany(
    @Param('organizationId', UuidValidationPipe) organizationId: string,
    @ExtractUser() { id }: IRegularUserModel,
  ): Promise<IdAndNamePresenter<IActivityTypeModel>[]> {
    // Only for the NGOs the user volunteers in (not blocked)
    if (!(await this.ownership.volunteerInOrganization(id, organizationId))) {
      return [];
    }

    const types = await this.getManyActivityTypesUsecase.execute({
      organizationId,
      status: ActivityTypeStatus.ACTIVE,
    });

    return types.map((type) => new IdAndNamePresenter(type));
  }
}
