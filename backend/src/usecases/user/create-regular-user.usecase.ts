import { Injectable } from '@nestjs/common';
import { IUseCaseService } from 'src/common/interfaces/use-case-service.interface';
import { UserFacadeService } from 'src/modules/user/services/user-facade.service';
import {
  CreateRegularUserOptions,
  IRegularUserModel,
  IRegularUserProfileModel,
} from 'src/modules/user/models/regular-user.model';
import { ExceptionsService } from 'src/infrastructure/exceptions/exceptions.service';
import { UserExceptionMessages } from 'src/modules/user/exceptions/exceptions';
import { NotificationsSettingsFacade } from 'src/modules/notifications/notifications-settings.facade';
import { GetOneRegularUserProfileUseCase } from './get-regule-user-profile.usecase';
import { AuthIdentityFacade } from 'src/modules/auth/services/auth-identity.facade';
import { AuthRealm } from 'src/modules/auth/enums/auth.enums';

@Injectable()
export class CreateRegularUsereUseCaseService
  implements IUseCaseService<IRegularUserProfileModel>
{
  constructor(
    private readonly userService: UserFacadeService,
    private exceptionService: ExceptionsService,
    private readonly notificationSettingsFacade: NotificationsSettingsFacade,
    private readonly getRegularUserProfileUsecase: GetOneRegularUserProfileUseCase,
    private readonly authIdentityFacade: AuthIdentityFacade,
  ) {}

  // The profile of the logged-in volunteer: one per mobile login, with the login's (confirmed) email.
  async execute(
    newUser: Omit<CreateRegularUserOptions, 'email'>,
    identityId: string,
  ): Promise<IRegularUserProfileModel> {
    // 1. the login must exist and not have a profile yet
    const identity = await this.authIdentityFacade.findIdentity({
      id: identityId,
    });
    if (!identity || identity.realm !== AuthRealm.MOBILE) {
      this.exceptionService.badRequestException(UserExceptionMessages.USER_005);
    }
    if (identity.userId) {
      this.exceptionService.badRequestException(UserExceptionMessages.USER_003);
    }

    // 2. An NGO may have added this person before they had an account (Candidate):
    // that placeholder row is claimed, so their organizations and history follow them.
    const placeholder = await this.userService.findRegularUser({
      email: identity.email,
      hasAccount: false,
    });
    if (placeholder) {
      return this.claimPlaceholder(placeholder, newUser, identity.id);
    }

    // 3. There is already an user with the same "phone"/"email", abort..
    // (phone is optional: an empty condition would match every user)
    const existingUser = await this.userService.findRegularUser([
      { email: identity.email },
      ...(newUser.phone ? [{ phone: newUser.phone, hasAccount: true }] : []),
    ]);
    if (existingUser) {
      this.exceptionService.badRequestException(UserExceptionMessages.USER_003);
    }

    const notificationsSettings =
      await this.notificationSettingsFacade.create();

    // 4. create new user and link it to the login
    const user = await this.userService.createRegularUser({
      ...newUser,
      email: identity.email,
      notificationsSettingsId: notificationsSettings.id,
    });
    await this.authIdentityFacade.updateIdentity(identity.id, {
      userId: user.id,
    });

    // 5. get user profile
    return this.getRegularUserProfileUsecase.execute({ id: user.id });
  }

  private async claimPlaceholder(
    placeholder: IRegularUserModel,
    profile: Omit<CreateRegularUserOptions, 'email'>,
    identityId: string,
  ): Promise<IRegularUserProfileModel> {
    // The phone (optional) must not belong to another real account.
    const phoneOwner = profile.phone
      ? await this.userService.findRegularUser({
          phone: profile.phone,
          hasAccount: true,
        })
      : null;
    if (phoneOwner) {
      this.exceptionService.badRequestException(UserExceptionMessages.USER_003);
    }

    const userId = placeholder.id;
    const notificationsSettingsId =
      placeholder.notificationsSettings?.id ??
      (await this.notificationSettingsFacade.create()).id;

    await this.userService.updateRegularUser(userId, {
      notificationsSettingsId,
      firstName: profile.firstName,
      lastName: profile.lastName,
      name: `${profile.firstName} ${profile.lastName}`,
      phone: profile.phone,
      birthday: profile.birthday,
      sex: profile.sex,
      locationId: profile.locationId,
      hasAccount: true,
    });
    await this.authIdentityFacade.updateIdentity(identityId, { userId });

    return this.getRegularUserProfileUsecase.execute({ id: userId });
  }
}
