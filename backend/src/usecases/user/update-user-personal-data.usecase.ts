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

    let userIdentityData = user.userPersonalData;
    // 3. check if the user has personal data
    if (!user.userPersonalData) {
      // 3.1 if not create new personal data entity for the user
      const userPersonalData = await this.userService.createUserPersonalData(
        personalData,
      );

      // asign the new value to the user
      userIdentityData = userPersonalData;
    } else {
      // 3.2 update personal data details with the new data
      userIdentityData = { ...userIdentityData, ...personalData };
    }

    // 4. save the user
    await this.userService.updateUserPersonalData(id, userIdentityData);

    // 5. return user
    return this.userService.findRegularUser({ id });
  }
}
