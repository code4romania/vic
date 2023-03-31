import { Injectable } from '@nestjs/common';
import { IUseCaseService } from 'src/common/interfaces/use-case-service.interface';
import { UserFacadeService } from 'src/modules/user/services/user-facade.service';
import {
  FindManyAdminUserOptions,
  IAdminUserModel,
} from 'src/modules/user/models/admin-user.model';
import { Pagination } from 'src/infrastructure/base/repository-with-pagination.class';

@Injectable()
export class GetManyAdminUsersUseCase
  implements IUseCaseService<Pagination<IAdminUserModel>>
{
  constructor(private readonly userService: UserFacadeService) {}

  async execute(
    findOptions: FindManyAdminUserOptions,
  ): Promise<Pagination<IAdminUserModel>> {
    return this.userService.findManyAdminUsers(findOptions);
  }
}
