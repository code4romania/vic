import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { CreateRegularUsereUseCaseService } from 'src/usecases/user/create-regular-user.usecase';
import { CreateRegularUserDto } from './dto/create-regular-user.dto';
import { MobileJwtAuthGuard } from 'src/modules/auth/guards/jwt-mobile.guard';
import { ExtractUser } from 'src/common/decorators/extract-user.decorator';
import { UserPresenter } from './presenters/user.presenter';

@ApiBearerAuth()
@UseGuards(MobileJwtAuthGuard)
@Controller('/mobile/user')
export class MobileRegularUserController {
  constructor(
    private createRegularUsereUseCaseService: CreateRegularUsereUseCaseService,
  ) {}

  @ApiBody({ type: CreateRegularUserDto })
  @Post()
  async create(
    @Body() newUser: CreateRegularUserDto,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    @ExtractUser() data: any,
  ): Promise<UserPresenter> {
    const user = await this.createRegularUsereUseCaseService.execute({
      ...newUser,
      cognitoId: data.token.username,
    });

    return new UserPresenter(user);
  }

  @Get()
  async getTestValue(): Promise<string> {
    return 'It works';
  }
}
