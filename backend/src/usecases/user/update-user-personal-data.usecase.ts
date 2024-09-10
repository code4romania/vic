import { Injectable } from '@nestjs/common';
import { IUseCaseService } from 'src/common/interfaces/use-case-service.interface';
import { UserFacadeService } from 'src/modules/user/services/user-facade.service';
import { IRegularUserModel } from 'src/modules/user/models/regular-user.model';
import { ExceptionsService } from 'src/infrastructure/exceptions/exceptions.service';
import { UserExceptionMessages } from 'src/modules/user/exceptions/exceptions';
import { CreateUserPersonalDataOptions } from 'src/modules/user/models/user-personal-data.model';

@Injectable()
export class UpdateUserPersonalDataUsecase
  implements IUseCaseService<IRegularUserModel>
{
  constructor(
    private readonly userService: UserFacadeService,
    private readonly exceptionService: ExceptionsService,
  ) {}

  async execute(
    id: string,
    personalData: CreateUserPersonalDataOptions,
  ): Promise<IRegularUserModel> {
    // 1. check if user exists
    const user = await this.userService.findRegularUser({ id });

    // 2. throw user not found exception
    if (!user) {
      this.exceptionService.notFoundException(UserExceptionMessages.USER_001);
    }

    // 3. check if there is already a identity document number
    const userPersonalData = await this.userService.findUserPersonalData({
      identityDocumentNumber: personalData.identityDocumentNumber,
    });

    // 3.1 Throw unique error
    if (
      userPersonalData &&
      (!user.userPersonalData ||
        userPersonalData.id !== user.userPersonalData?.id)
    ) {
      this.exceptionService.badRequestException(UserExceptionMessages.USER_004);
    }

    let userIdentityData = user.userPersonalData;
    // 4. check if the user has personal data
    if (!user.userPersonalData) {
      // 4.1 if not create new personal data entity for the user
      userIdentityData =
        await this.userService.createUserPersonalData(personalData);

      // 4.2 save the data to the user
      await this.userService.updateRegularUser(id, {
        userPersonalData: userIdentityData,
      });
    } else {
      // 5. udpate personal data
      userIdentityData = await this.userService.updateUserPersonalData(
        user.userPersonalData.id,
        personalData,
      );
    }

    // 6. return user
    return this.userService.findRegularUser({ id });
  }
}
