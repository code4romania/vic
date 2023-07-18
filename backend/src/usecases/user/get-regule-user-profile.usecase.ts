import { Injectable } from '@nestjs/common';
import { IUseCaseService } from 'src/common/interfaces/use-case-service.interface';
import { UserFacadeService } from 'src/modules/user/services/user-facade.service';
import {
  FindOneRegularUserOptions,
  IRegularUserProfileModel,
} from 'src/modules/user/models/regular-user.model';
import { ExceptionsService } from 'src/infrastructure/exceptions/exceptions.service';
import { UserExceptionMessages } from 'src/modules/user/exceptions/exceptions';
import { S3Service } from 'src/infrastructure/providers/s3/module/s3.service';
import { OrganizationFacadeService } from 'src/modules/organization/services/organization.facade';

@Injectable()
export class GetOneRegularUserProfileUseCase
  implements IUseCaseService<IRegularUserProfileModel>
{
  constructor(
    private readonly userService: UserFacadeService,
    private readonly exceptionService: ExceptionsService,
    private readonly organizationFacade: OrganizationFacadeService,
    private readonly s3Service: S3Service,
  ) {}

  async execute(
    options: FindOneRegularUserOptions,
  ): Promise<IRegularUserProfileModel> {
    // 1. get user data
    const user = await this.userService.findRegularUser(options);

    if (!user) {
      this.exceptionService.notFoundException(UserExceptionMessages.USER_001);
    }

    // 2. get my organizations data
    const myOrganizations = await this.organizationFacade.findMyOrganizations(
      user.id,
    );

    return {
      ...user,
      ...(user.profilePicture
        ? {
            profilePicture: await this.s3Service.generatePresignedURL(
              user.profilePicture,
            ),
          }
        : {}),
      myOrganizations,
    };
  }
}
