import { Body, Controller, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { MobileJwtAuthGuard } from 'src/modules/auth/guards/jwt-mobile.guard';
import { RegisterPushTokenDto } from './dto/register-push-token.dto';
import { RegisterDevicePushTokenUseCase } from 'src/usecases/push-notifications/register-device-push-token.usecase';
import { ExtractUser } from 'src/common/decorators/extract-user.decorator';
import { IRegularUserModel } from 'src/modules/user/models/regular-user.model';
import { IPushTokenModel } from 'src/modules/notifications/models/push-token.model';
import { UnregisterDevicePushTokenUseCase } from 'src/usecases/push-notifications/unregister-device-push-token.usecase';
import { MobileProfileGuard } from '../common/guards/mobile-profile.guard';
import { UnregisterPushTokenDto } from './dto/unregister-push-token.dto';

@ApiBearerAuth()
@UseGuards(MobileJwtAuthGuard, MobileProfileGuard)
@Controller('/mobile/push-notifications')
export class MobilePushNotificationsController {
  constructor(
    private readonly registerDevicePushTokenUseCase: RegisterDevicePushTokenUseCase,
    private readonly unregisterDevicePushTokenUseCase: UnregisterDevicePushTokenUseCase,
  ) {}

  @ApiBody({ type: RegisterPushTokenDto })
  @Post('register')
  async create(
    @ExtractUser() user: IRegularUserModel,
    @Body() newToken: RegisterPushTokenDto,
  ): Promise<IPushTokenModel> {
    return this.registerDevicePushTokenUseCase.execute({
      ...newToken,
      userId: user.id,
    });
  }

  @ApiBody({ type: UnregisterPushTokenDto })
  @Patch('unregister')
  async delete(
    @ExtractUser() user: IRegularUserModel,
    @Body() { token }: UnregisterPushTokenDto,
  ): Promise<void> {
    // Only a token registered by this user; another user's token is left alone
    return this.unregisterDevicePushTokenUseCase.execute(token, user.id);
  }
}
