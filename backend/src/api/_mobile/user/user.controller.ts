import { Body, Controller, Get, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { CreateRegularUsereUseCaseService } from 'src/usecases/user/create-regular-user.usecase';
import { CreateRegularUserDto } from './dto/create-regular-user.dto';
import { MobileJwtAuthGuard } from 'src/modules/auth/guards/jwt-mobile.guard';
import { ExtractUser } from 'src/common/decorators/extract-user.decorator';
import { UserPresenter } from './presenters/user.presenter';
import { IRegularUserModel } from 'src/modules/user/models/regular-user.model';
import { GetOneRegularUserUseCase } from 'src/usecases/user/get-one-regular-user.usecase';
import { UpdateUserPersonalDataDto } from './dto/update-user-personal-data.dto';
import { UpdateUserPersonalDataUsecase } from 'src/usecases/user/update-user-personal-data.usecase';

@ApiBearerAuth()
@UseGuards(MobileJwtAuthGuard)
@Controller('/mobile/user')
export class MobileRegularUserController {
  constructor(
    private createRegularUsereUseCaseService: CreateRegularUsereUseCaseService,
    private getOneRegularUserUseCase: GetOneRegularUserUseCase,
    private updateUserPersonalData: UpdateUserPersonalDataUsecase,
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
    const regularUser = await this.getOneRegularUserUseCase.execute({
      cognitoId: user.cognitoId,
      volunteer: {
        userId: user.id,
      },
    });
    return new UserPresenter(regularUser);
  }

  @ApiBody({ type: UpdateUserPersonalDataDto })
  @Patch('personal-data')
  async updatePerosnalData(
    @Body() userPersonalData: UpdateUserPersonalDataDto,
    @ExtractUser() regularUser: IRegularUserModel,
  ): Promise<UserPresenter> {
    const updatedUser = await this.updateUserPersonalData.execute(
      regularUser.id,
      userPersonalData,
    );
    return new UserPresenter(updatedUser);
  }
}
