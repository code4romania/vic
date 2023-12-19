import { Injectable, Logger } from '@nestjs/common';
import { IUseCaseService } from 'src/common/interfaces/use-case-service.interface';
import { UserExceptionMessages } from 'src/modules/user/exceptions/exceptions';
import { UserFacadeService } from 'src/modules/user/services/user-facade.service';
import { GetOneRegularUserProfileUseCase } from './get-regule-user-profile.usecase';
import { ExceptionsService } from 'src/infrastructure/exceptions/exceptions.service';
import { S3Service } from 'src/infrastructure/providers/s3/module/s3.service';
import { CognitoService } from 'src/infrastructure/providers/cognito/module/cognito.service';
import { PushNotificationsFacade } from 'src/modules/notifications/notifications.facade';
import { VolunteerFacade } from 'src/modules/volunteer/services/volunteer.facade';
import { IVolunteerModel } from 'src/modules/volunteer/model/volunteer.model';
import { ActivityLogFacade } from 'src/modules/activity-log/services/activity-log.facade';
import { AccessRequestFacade } from 'src/modules/access-request/services/access-request.facade';
import { EventFacade } from 'src/modules/event/services/event.facade';

@Injectable()
export class DeleteAccountRegularUserUsecase implements IUseCaseService<void> {
  private readonly logger = new Logger(DeleteAccountRegularUserUsecase.name);

  constructor(
    private readonly userService: UserFacadeService,
    private readonly getRegularUserProfileUsecase: GetOneRegularUserProfileUseCase,
    private readonly exceptionService: ExceptionsService,
    private readonly s3Service: S3Service,
    private readonly cognitoService: CognitoService,
    private readonly pushNotificationService: PushNotificationsFacade,
    private readonly volunteerFacade: VolunteerFacade,
    private readonly activityLogFacade: ActivityLogFacade,
    private readonly accessRequestFacade: AccessRequestFacade,
    private readonly eventFacade: EventFacade,
  ) {}

  async execute(userId: string): Promise<void> {
    // A1. check if user exists
    const user = await this.userService.findRegularUser({ id: userId });

    // A2. throw user not found exception
    if (!user) {
      this.exceptionService.notFoundException(UserExceptionMessages.USER_001);
    }

    // // 1. Delete cognito user
    await this.cognitoService.globalSignOut(user.cognitoId);
    await this.cognitoService.deleteUser(user.cognitoId);

    /* =======================================================  */
    /* =========FULL IMPLEMENTATION UNTESTED =================  */
    /* =======================================================  */

    // 2. Hard delete all "PushTokens"
    await this.pushNotificationService.deleteMany({ userId });
    // 3. Hard delete "UserPersonalData"
    if (user.userPersonalData?.id) {
      await this.userService.deleteUserPersonalData(user.userPersonalData.id);
    }

    // 4. Hard delete all Volunteers Records and the associated Profiles for the given UserId
    const deletedVolunteersAndProfiles =
      await this.volunteerFacade.softDeleteManyAndProfiles(userId);

    // Delete activity logs related to this user
    await this.activityLogFacade.deleteMany(
      deletedVolunteersAndProfiles.deletedVolunteers,
    );

    // Delete all access requests made by the user
    await this.accessRequestFacade.deleteAllForUser(userId);

    // Delete all RSVPs to events for the user
    await this.eventFacade.deleteAllRSVPsForUser(userId);

    // 4. "User" - Anonimize + Soft delete + Delete profile picture
    const deletedUser =
      await this.userService.softDeleteAndAnonimizeRegularUser(userId);
    if (deletedUser.profilePicture) {
      await this.s3Service.deleteFile(deletedUser.profilePicture);
    }

    return;
  }
}
