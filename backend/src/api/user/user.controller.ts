import { Controller, Get, UseGuards } from '@nestjs/common';
import { ExtractUser } from 'src/common/decorators/extract-user.decorator';
import { WebJwtAuthGuard } from 'src/modules/auth/guards/jwt-web.guard';

@UseGuards(WebJwtAuthGuard)
@Controller('user')
export class UserController {
  @Get()
  getProfile(@ExtractUser() user: unknown): Promise<unknown> {
    return Promise.resolve(user);
  }
}
