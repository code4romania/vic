import { Injectable } from '@nestjs/common';
import { IUseCaseService } from 'src/common/interfaces/use-case-service.interface';
import { UserFacadeService } from 'src/modules/user/services/user-facade.service';
import {
  FindOneRegularUserOptions,
  IRegularUserModel,
} from 'src/modules/user/models/regular-user.model';
import { ExceptionsService } from 'src/infrastructure/exceptions/exceptions.service';
import { UserExceptionMessages } from 'src/modules/user/exceptions/exceptions';
import { S3Service } from 'src/infrastructure/providers/s3/module/s3.service';

@Injectable()
export class GetOneRegularUserUseCase
  implements IUseCaseService<IRegularUserModel>
{
  constructor(
    private readonly userService: UserFacadeService,
    private readonly exceptionService: ExceptionsService,
    private readonly s3Service: S3Service,
  ) {}

  async execute(
    options: FindOneRegularUserOptions,
  ): Promise<IRegularUserModel> {
    const user = await this.userService.findRegularUser(options);

    if (!user) {
      this.exceptionService.notFoundException(UserExceptionMessages.USER_001);
    }

    return {
      ...user,
      ...(user.profilePicture
        ? {
            profilePicture: await this.s3Service.generatePresignedURL(
              user.profilePicture,
            ),
          }
        : {}),
    };
  }
}
