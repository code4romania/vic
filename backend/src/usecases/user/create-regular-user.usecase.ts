import { Injectable, Logger } from '@nestjs/common';
import { IUseCaseService } from 'src/common/interfaces/use-case-service.interface';
import { UserFacadeService } from 'src/modules/user/services/user-facade.service';
import {
  CreateRegularUserOptions,
  IRegularUserModel,
} from 'src/modules/user/models/regular-user.model';
import { ExceptionsService } from 'src/infrastructure/exceptions/exceptions.service';
import { UserExceptionMessages } from 'src/modules/user/exceptions/exceptions';
import { NotificationsSettingsFacade } from 'src/modules/notifications/notifications-settings.facade';

@Injectable()
export class CreateRegularUsereUseCaseService
  implements IUseCaseService<IRegularUserModel>
{
  private readonly logger = new Logger(CreateRegularUsereUseCaseService.name);

  constructor(
    private readonly userService: UserFacadeService,
    private exceptionService: ExceptionsService,
    private readonly notificationSettingsFacade: NotificationsSettingsFacade,
  ) {}

  async execute(newUser: CreateRegularUserOptions): Promise<IRegularUserModel> {
    const existingUser = await this.userService.findRegularUser([
      { cognitoId: newUser.cognitoId },
      { email: newUser.email },
      { phone: newUser.phone },
    ]);

    // There is already an user with the same "phone"/"email"/"cognitoId", abort..
    if (existingUser) {
      this.exceptionService.badRequestException(UserExceptionMessages.USER_003);
    }

    const notificationsSettings =
      await this.notificationSettingsFacade.create();

    const user = await this.userService.createRegularUser({
      ...newUser,
      notificationsSettingsId: notificationsSettings.id,
    });

    return this.userService.findRegularUser({ id: user.id });
  }
}
