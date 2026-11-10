import { Injectable } from '@nestjs/common';
import { IUseCaseService } from 'src/common/interfaces/use-case-service.interface';
import { AuthIdentityFacade } from 'src/modules/auth/services/auth-identity.facade';
import { SessionService } from 'src/modules/auth/services/session.service';
import { PushNotificationsFacade } from 'src/modules/notifications/notifications.facade';

// Revokes the presented session; an unknown or missing token is not an error.
// Mobile: the app also sends the device's push token, which is removed so the device stops
// receiving this user's notifications. Only when the refresh token proves whose session it is,
// and only that user's token: a token registered to someone else is left alone.
@Injectable()
export class LogoutUseCase implements IUseCaseService<void> {
  constructor(
    private readonly sessionService: SessionService,
    private readonly authIdentityFacade: AuthIdentityFacade,
    private readonly pushNotificationsFacade: PushNotificationsFacade,
  ) {}

  async execute(secret: string, pushToken?: string): Promise<void> {
    if (pushToken) {
      await this.removePushToken(secret, pushToken);
    }

    await this.sessionService.revokeByRefreshToken(secret);
  }

  private async removePushToken(
    secret: string,
    pushToken: string,
  ): Promise<void> {
    const session = await this.sessionService.findByRefreshToken(secret);
    if (!session) return;

    const identity = await this.authIdentityFacade.findIdentity({
      id: session.identityId,
    });
    if (!identity?.userId) return;

    await this.pushNotificationsFacade.delete({
      token: pushToken,
      userId: identity.userId,
    });
  }
}
