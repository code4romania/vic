import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { MobileJwtAuthGuard } from 'src/modules/auth/guards/jwt-mobile.guard';
import { RegisterPushTokenDto } from './dto/register-device-push-token.dto';
import { RegisterDevicePushTokenUseCase } from 'src/usecases/push-notifications/register-device-push-token.usecase';
import { ExtractUser } from 'src/common/decorators/extract-user.decorator';
import { IRegularUserModel } from 'src/modules/user/models/regular-user.model';
import { IPushTokenModel } from 'src/modules/notifications/models/push-token.model';

@ApiBearerAuth()
@UseGuards(MobileJwtAuthGuard)
@Controller('/mobile/push-notifications')
export class MobilePushNotificationsController {
  constructor(
    private registerDevicePushTokenUseCase: RegisterDevicePushTokenUseCase,
  ) {}

  @ApiBody({ type: RegisterPushTokenDto })
  @Post()
  async create(
    @ExtractUser() user: IRegularUserModel,
    @Body() newToken: RegisterPushTokenDto,
  ): Promise<IPushTokenModel> {
    return this.registerDevicePushTokenUseCase.execute({
      ...newToken,
      userId: user.id,
    });
  }
}
