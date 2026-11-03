import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Request } from 'express';
import { ChangePasswordDto } from 'src/api/auth/dto/change-password.dto';
import { ForgotPasswordDto } from 'src/api/auth/dto/forgot-password.dto';
import { LoginDto } from 'src/api/auth/dto/login.dto';
import { ResendVerificationDto } from 'src/api/auth/dto/resend-verification.dto';
import { SessionPresenter } from 'src/api/auth/presenters/session.presenter';
import { requestClient } from 'src/api/auth/request-client';
import { ExtractUser } from 'src/common/decorators/extract-user.decorator';
import { Public } from 'src/common/decorators/public.decorator';
import { AuthRealm } from 'src/modules/auth/enums/auth.enums';
import { MobileJwtAuthGuard } from 'src/modules/auth/guards/jwt-mobile.guard';
import { IMobileRequestUser } from 'src/modules/auth/interfaces/request-user.interface';
import { ChangePasswordUseCase } from 'src/usecases/auth/change-password.usecase';
import { ForgotPasswordUseCase } from 'src/usecases/auth/forgot-password.usecase';
import { LoginUseCase } from 'src/usecases/auth/login.usecase';
import { LogoutUseCase } from 'src/usecases/auth/logout.usecase';
import { RefreshSessionUseCase } from 'src/usecases/auth/refresh-session.usecase';
import { RegisterMobileUseCase } from 'src/usecases/auth/register-mobile.usecase';
import { ResendVerificationUseCase } from 'src/usecases/auth/resend-verification.usecase';
import { ResetPasswordWithCodeUseCase } from 'src/usecases/auth/reset-password-with-code.usecase';
import { SocialLoginUseCase } from 'src/usecases/auth/social-login.usecase';
import { LogoutDto } from './dto/logout.dto';
import { RefreshDto } from './dto/refresh.dto';
import { RegisterDto } from './dto/register.dto';
import { ResetPasswordWithCodeDto } from './dto/reset-password-with-code.dto';
import { SocialLoginDto } from './dto/social-login.dto';
import { RegisterResultPresenter } from './presenters/register-result.presenter';

const AUTH_THROTTLE = { default: { limit: 10, ttl: 60000 } };

// Volunteers in the app. Tokens travel in the body; the app keeps them in secure storage.
@ApiBearerAuth()
@UseGuards(MobileJwtAuthGuard)
@Controller('mobile/auth')
export class MobileAuthController {
  constructor(
    private readonly registerMobileUseCase: RegisterMobileUseCase,
    private readonly resendVerificationUseCase: ResendVerificationUseCase,
    private readonly loginUseCase: LoginUseCase,
    private readonly socialLoginUseCase: SocialLoginUseCase,
    private readonly refreshSessionUseCase: RefreshSessionUseCase,
    private readonly logoutUseCase: LogoutUseCase,
    private readonly forgotPasswordUseCase: ForgotPasswordUseCase,
    private readonly resetPasswordWithCodeUseCase: ResetPasswordWithCodeUseCase,
    private readonly changePasswordUseCase: ChangePasswordUseCase,
  ) {}

  @Public()
  @Throttle(AUTH_THROTTLE)
  @ApiCreatedResponse({ type: RegisterResultPresenter })
  @Post('register')
  async register(
    @Body() { email, password, phone }: RegisterDto,
  ): Promise<RegisterResultPresenter> {
    return new RegisterResultPresenter(
      await this.registerMobileUseCase.execute(email, password, phone),
    );
  }

  @Public()
  @Throttle(AUTH_THROTTLE)
  @HttpCode(HttpStatus.OK)
  @Post('resend-verification')
  async resendVerification(
    @Body() { email }: ResendVerificationDto,
  ): Promise<void> {
    await this.resendVerificationUseCase.execute(AuthRealm.MOBILE, email);
  }

  @Public()
  @Throttle(AUTH_THROTTLE)
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: SessionPresenter })
  @Post('login')
  async login(
    @Body() { email, password }: LoginDto,
    @Req() req: Request,
  ): Promise<SessionPresenter> {
    const { tokens } = await this.loginUseCase.execute(
      AuthRealm.MOBILE,
      email,
      password,
      requestClient(req),
    );
    return new SessionPresenter(tokens, { includeRefreshToken: true });
  }

  @Public()
  @Throttle(AUTH_THROTTLE)
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: SessionPresenter })
  @Post('social')
  async social(
    @Body() { provider, token }: SocialLoginDto,
    @Req() req: Request,
  ): Promise<SessionPresenter> {
    const tokens = await this.socialLoginUseCase.execute(
      provider,
      token,
      requestClient(req),
    );
    return new SessionPresenter(tokens, { includeRefreshToken: true });
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: SessionPresenter })
  @Post('refresh')
  async refresh(
    @Body() { refreshToken }: RefreshDto,
  ): Promise<SessionPresenter> {
    const tokens = await this.refreshSessionUseCase.execute(
      AuthRealm.MOBILE,
      refreshToken,
    );
    return new SessionPresenter(tokens, { includeRefreshToken: true });
  }

  @Public()
  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('logout')
  async logout(@Body() { refreshToken }: LogoutDto): Promise<void> {
    await this.logoutUseCase.execute(refreshToken);
  }

  // Sends a 6-digit code. Same answer for any email.
  @Public()
  @Throttle(AUTH_THROTTLE)
  @HttpCode(HttpStatus.OK)
  @Post('forgot-password')
  async forgotPassword(@Body() { email }: ForgotPasswordDto): Promise<void> {
    await this.forgotPasswordUseCase.execute(AuthRealm.MOBILE, email);
  }

  @Public()
  @Throttle(AUTH_THROTTLE)
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: SessionPresenter })
  @Post('reset-password')
  async resetPassword(
    @Body() { email, code, password }: ResetPasswordWithCodeDto,
    @Req() req: Request,
  ): Promise<SessionPresenter> {
    const tokens = await this.resetPasswordWithCodeUseCase.execute(
      email,
      code,
      password,
      requestClient(req),
    );
    return new SessionPresenter(tokens, { includeRefreshToken: true });
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Patch('change-password')
  async changePassword(
    @ExtractUser() user: IMobileRequestUser,
    @Body() { currentPassword, newPassword }: ChangePasswordDto,
  ): Promise<void> {
    await this.changePasswordUseCase.execute(
      user.identityId,
      currentPassword,
      newPassword,
      user.sessionId,
    );
  }
}
