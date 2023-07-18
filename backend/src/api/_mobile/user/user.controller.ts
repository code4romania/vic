import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiConsumes } from '@nestjs/swagger';
import { CreateRegularUsereUseCaseService } from 'src/usecases/user/create-regular-user.usecase';
import { CreateRegularUserDto } from './dto/create-regular-user.dto';
import { MobileJwtAuthGuard } from 'src/modules/auth/guards/jwt-mobile.guard';
import { ExtractUser } from 'src/common/decorators/extract-user.decorator';
import { UserPresenter } from './presenters/user.presenter';
import { IRegularUserModel } from 'src/modules/user/models/regular-user.model';
import { UpdateUserPersonalDataDto } from './dto/update-user-personal-data.dto';
import { UpdateUserPersonalDataUsecase } from 'src/usecases/user/update-user-personal-data.usecase';
import { UpdateRegularUserDto } from './dto/update-regular-user.dto';
import { UpdateRegularUserUsecase } from 'src/usecases/user/update-regular-user.usecase';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { GetOneRegularUserProfileUseCase } from 'src/usecases/user/get-regule-user-profile.usecase';
import { UserProfilePresenter } from './presenters/user-profile.presenter';

@ApiBearerAuth()
@UseGuards(MobileJwtAuthGuard)
@Controller('/mobile/user')
export class MobileRegularUserController {
  constructor(
    private readonly createRegularUsereUseCaseService: CreateRegularUsereUseCaseService,
    private readonly getOneRegularUserProfileUseCase: GetOneRegularUserProfileUseCase,
    private readonly updateUserPersonalData: UpdateUserPersonalDataUsecase,
    private readonly updateRegularUserUsecase: UpdateRegularUserUsecase,
  ) {}

  @ApiBody({ type: CreateRegularUserDto })
  @Post()
  async create(
    @Body() newUser: CreateRegularUserDto,
    @ExtractUser() data: IRegularUserModel,
  ): Promise<UserProfilePresenter> {
    const user = await this.createRegularUsereUseCaseService.execute({
      ...newUser,
      cognitoId: data.cognitoId,
    });

    return new UserProfilePresenter(user);
  }

  @Get('profile')
  async getProfile(
    @ExtractUser() user: IRegularUserModel,
  ): Promise<UserProfilePresenter> {
    const regularUser = await this.getOneRegularUserProfileUseCase.execute({
      cognitoId: user.cognitoId,
    });
    return new UserProfilePresenter(regularUser);
  }

  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'profilePicture', maxCount: 1 }]),
  )
  @ApiBody({ type: UpdateRegularUserDto })
  @Patch('profile')
  async updateProfile(
    @ExtractUser() user: IRegularUserModel,
    @Body() regularUserData: UpdateRegularUserDto,
    @UploadedFiles()
    file: { profilePicture?: Express.Multer.File[] },
  ): Promise<UserProfilePresenter> {
    const regularUser = await this.updateRegularUserUsecase.execute(
      user.id,
      regularUserData,
      file?.profilePicture,
    );
    return new UserProfilePresenter(regularUser);
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
