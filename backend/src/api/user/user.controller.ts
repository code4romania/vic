import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { ExtractUser } from 'src/common/decorators/extract-user.decorator';
import { WebJwtAuthGuard } from 'src/modules/auth/guards/jwt-web.guard';
import { GetUserProfileUseCaseService } from 'src/usecases/user/get-user-profile-use-case.service';

@UseGuards(WebJwtAuthGuard)
@Controller('user')
export class UserController {
  constructor(
    private readonly getUserProfileUseCase: GetUserProfileUseCaseService,
  ) {}

  @Get()
  getProfile(
    @ExtractUser() { token }: { token: { username: string } },
    @Req() req: Request,
  ): Promise<unknown> {
    return this.getUserProfileUseCase.execute(
      token.username,
      req.headers.authorization.split(' ')[1],
    );
  }
}
