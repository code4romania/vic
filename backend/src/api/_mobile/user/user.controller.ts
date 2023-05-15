import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { CreateRegularUsereUseCaseService } from 'src/usecases/user/create-regular-user.usecase';
import { CreateRegularUserDto } from './dto/create-regular-user.dto';
import { MobileJwtAuthGuard } from 'src/modules/auth/guards/jwt-mobile.guard';
import { ExtractUser } from 'src/common/decorators/extract-user.decorator';
import { UserPresenter } from './presenters/user.presenter';
import { IRegularUserModel } from 'src/modules/user/models/regular-user.model';

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
    @ExtractUser() data: IRegularUserModel,
  ): Promise<UserPresenter> {
    const user = await this.createRegularUsereUseCaseService.execute({
      ...newUser,
      cognitoId: data.cognitoId,
    });

    return new UserPresenter(user);
  }

  @Get('profile')
  async getProfile(
    @ExtractUser() user: IRegularUserModel,
  ): Promise<UserPresenter> {
    return new UserPresenter(user);
  }
}
