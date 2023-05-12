import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { MobileJwtAuthGuard } from 'src/modules/auth/guards/jwt-mobile.guard';
import { RegisterDevicePushTokenDto } from './dto/register-device-push-token.dto';
import { RegisterDevicePushTokenUseCase } from 'src/usecases/push-notifications/register-device-push-token.usecase';
import { IPushTokenModel } from 'src/modules/notifications/models/push-token.model';

@ApiBearerAuth()
@UseGuards(MobileJwtAuthGuard)
@Controller('/mobile/push-notifications')
export class MobilePushNotificationsController {
  constructor(
    private registerDevicePushTokenUseCase: RegisterDevicePushTokenUseCase,
  ) {}

  @ApiBody({ type: RegisterDevicePushTokenDto })
  @Post()
  async create(@Body() newToken: RegisterDevicePushTokenDto): Promise<void> {
    return this.registerDevicePushTokenUseCase.execute(newToken);
  }
}
