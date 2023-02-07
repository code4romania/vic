import { Controller, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { ExtractUser } from 'src/common/decorators/extract-user.decorator';
import { IRequestUser } from 'src/common/interfaces/request-user.interface';
import { WebJwtAuthGuard } from 'src/modules/auth/guards/jwt-web.guard';
import { GetUserProfileUseCaseService } from 'src/usecases/user/get-user-profile-use-case.service';
import { AdminUserPresenter } from './presenters/admin-user.presenter';

@UseGuards(WebJwtAuthGuard)
@Controller('auth')
export class AuthController {
  constructor(
    private readonly getUserProfileUseCase: GetUserProfileUseCaseService,
  ) {}

  @Post('login')
  async login(
    @ExtractUser() { username }: IRequestUser,
    @Req() req: Request,
  ): Promise<AdminUserPresenter> {
    const adminUser = await this.getUserProfileUseCase.execute(
      username,
      req.headers.authorization.split(' ')[1],
    );

    return new AdminUserPresenter(adminUser);
  }
}
