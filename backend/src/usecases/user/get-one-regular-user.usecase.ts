import { Injectable } from '@nestjs/common';
import { IUseCaseService } from 'src/common/interfaces/use-case-service.interface';
import { UserFacadeService } from 'src/modules/user/services/user-facade.service';
import { IRegularUserModel } from 'src/modules/user/models/regular-user.model';
import { ExceptionsService } from 'src/infrastructure/exceptions/exceptions.service';
import { UserExceptionMessages } from 'src/modules/user/exceptions/exceptions';

@Injectable()
export class GetOneRegularUserUseCase
  implements IUseCaseService<IRegularUserModel>
{
  constructor(
    private readonly userService: UserFacadeService,
    private exceptionService: ExceptionsService,
  ) {}

  async execute(id: string): Promise<IRegularUserModel> {
    const user = await this.userService.findRegularUser({ id });

    if (!user) {
      this.exceptionService.notFoundException(UserExceptionMessages.USER_001);
    }

    return user;
  }
}
