import { Body, Controller, Param, Patch, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { MobileJwtAuthGuard } from 'src/modules/auth/guards/jwt-mobile.guard';
import { ExtractUser } from 'src/common/decorators/extract-user.decorator';
import { IRegularUserModel } from 'src/modules/user/models/regular-user.model';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { UpdateSettingsUsecase } from 'src/usecases/notifications-settings/update-settings.usecase';
import { UuidValidationPipe } from 'src/infrastructure/pipes/uuid.pipe';
import { NotificationsSettinsPresenter } from '../user/presenters/notifications-settings.presenter';

@ApiBearerAuth()
@UseGuards(MobileJwtAuthGuard)
@Controller('/mobile/settings')
export class MobileSettingsController {
  constructor(private readonly updateSettings: UpdateSettingsUsecase) {}

  @ApiBody({ type: UpdateSettingsDto })
  @Patch(':id')
  async update(
    @ExtractUser() user: IRegularUserModel,
    @Body() settings: UpdateSettingsDto,
    @Param('id', UuidValidationPipe) id: string,
  ): Promise<NotificationsSettinsPresenter> {
    const newSettings = await this.updateSettings.execute(id, settings);

    return new NotificationsSettinsPresenter(newSettings);
  }
}
