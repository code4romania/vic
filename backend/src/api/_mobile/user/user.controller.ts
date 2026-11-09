import {
  Body,
  Controller,
  Delete,
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
import { IRegularUserModel } from 'src/modules/user/models/regular-user.model';
import { UpdateRegularUserDto } from './dto/update-regular-user.dto';
import { UpdateRegularUserUsecase } from 'src/usecases/user/update-regular-user.usecase';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { GetOneRegularUserProfileUseCase } from 'src/usecases/user/get-regule-user-profile.usecase';
import { UserProfilePresenter } from './presenters/user-profile.presenter';
import { DeleteAccountRegularUserUsecase } from 'src/usecases/user/delete-account.usecase';
import { IMobileRequestUser } from 'src/modules/auth/interfaces/request-user.interface';

@ApiBearerAuth()
@UseGuards(MobileJwtAuthGuard)
@Controller('/mobile/user')
export class MobileRegularUserController {
  constructor(
    private readonly createRegularUsereUseCaseService: CreateRegularUsereUseCaseService,
    private readonly getOneRegularUserProfileUseCase: GetOneRegularUserProfileUseCase,
    private readonly updateRegularUserUsecase: UpdateRegularUserUsecase,
    private readonly deleteAccountRegularUserUsecase: DeleteAccountRegularUserUsecase,
  ) {}

  @ApiBody({ type: CreateRegularUserDto })
  @Post()
  async create(
    @Body() newUser: CreateRegularUserDto,
    @ExtractUser() data: IMobileRequestUser,
  ): Promise<UserProfilePresenter> {
    // The email comes from the login, not the body: it is the address that was confirmed.
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { email, ...profile } = newUser;
    const user = await this.createRegularUsereUseCaseService.execute(
      profile,
      data.identityId,
    );

    return new UserProfilePresenter(user);
  }

  @Get('profile')
  async getProfile(
    @ExtractUser() user: IRegularUserModel,
  ): Promise<UserProfilePresenter> {
    // 404 USER_001 while the volunteer has no profile: the app's signal to open CreateUser.
    const regularUser = await this.getOneRegularUserProfileUseCase.execute({
      id: user.id,
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

  @Delete()
  async deleteUserData(
    @ExtractUser() regularUser: IRegularUserModel,
  ): Promise<void> {
    return this.deleteAccountRegularUserUsecase.execute(regularUser.id);
  }
}
