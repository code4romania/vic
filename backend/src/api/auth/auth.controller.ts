import { Controller, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { ExtractUser } from 'src/common/decorators/extract-user.decorator';
import { WebJwtAuthGuard } from 'src/modules/auth/guards/jwt-web.guard';
import { IAdminUserModel } from 'src/modules/user/models/admin-user.model';
import { GetUserProfileUseCaseService } from 'src/usecases/user/get-user-profile.usecase';
import { AdminUserPresenter } from './presenters/admin-user.presenter';

@UseGuards(WebJwtAuthGuard)
@Controller('auth')
export class AuthController {
  constructor(
    private readonly getUserProfileUseCase: GetUserProfileUseCaseService,
  ) {}

  @Post('login')
  async login(
    @ExtractUser() { cognitoId }: IAdminUserModel,
    @Req() req: Request,
  ): Promise<AdminUserPresenter> {
    const adminUser = await this.getUserProfileUseCase.execute(
      cognitoId,
      req.headers.authorization.split(' ')[1],
    );

    return new AdminUserPresenter(adminUser);
  }
}
