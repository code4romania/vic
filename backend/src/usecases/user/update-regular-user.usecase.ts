import { Injectable, Logger } from '@nestjs/common';
import { IUseCaseService } from 'src/common/interfaces/use-case-service.interface';
import { UserFacadeService } from 'src/modules/user/services/user-facade.service';
import {
  IRegularUserModel,
  UpdateRegularUserOptions,
} from 'src/modules/user/models/regular-user.model';
import { ExceptionsService } from 'src/infrastructure/exceptions/exceptions.service';
import { UserExceptionMessages } from 'src/modules/user/exceptions/exceptions';
import { S3Service } from 'src/infrastructure/providers/s3/module/s3.service';
import { S3_FILE_PATHS } from 'src/common/constants/constants';
import { JSONStringifyError } from 'src/common/helpers/utils';

@Injectable()
export class UpdateRegularUserUsecase
  implements IUseCaseService<IRegularUserModel>
{
  private readonly logger = new Logger(UpdateRegularUserUsecase.name);

  constructor(
    private readonly userService: UserFacadeService,
    private readonly exceptionService: ExceptionsService,
    private readonly s3Service: S3Service,
  ) {}

  async execute(
    id: string,
    userUpdates: UpdateRegularUserOptions,
    profilePicture?: Express.Multer.File[],
  ): Promise<IRegularUserModel> {
    // 1. check if user exists
    const user = await this.userService.findRegularUser({ id });

    // 2. throw user not found exception
    if (!user) {
      this.exceptionService.notFoundException(UserExceptionMessages.USER_001);
    }

    // 3. check if new profilePicture is provided
    if (profilePicture) {
      try {
        // 3.1 upload File and get path
        const path = await this.s3Service.uploadFile(
          `${S3_FILE_PATHS.PROFILE}/${user.id}`,
          profilePicture[0],
        );

        // 3.2 delete old file if exists
        if (user.profilePicture) {
          await this.s3Service.deleteFile(user.profilePicture);
        }

        // 3.3 set path in updates
        userUpdates.profilePicture = path;
      } catch (error) {
        // log error
        this.logger.error({
          ...UserExceptionMessages.USER_006,
          error: JSONStringifyError(error),
        });
        // error while uploading file to s3
        this.exceptionService.badRequestException(
          UserExceptionMessages.USER_006,
        );
      }
    }

    // 4 update db structure
    const updatedUser = await this.userService.updateRegularUser(
      id,
      userUpdates,
    );

    // 5. return user profile with presigned url
    return {
      ...updatedUser,
      ...(updatedUser.profilePicture
        ? {
            profilePicture: await this.s3Service.generatePresignedURL(
              updatedUser.profilePicture,
            ),
          }
        : {}),
    };
  }
}
