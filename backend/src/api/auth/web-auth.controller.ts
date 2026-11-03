import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Request, Response } from 'express';
import { ExtractUser } from 'src/common/decorators/extract-user.decorator';
import { Public } from 'src/common/decorators/public.decorator';
import { AuthConfigService } from 'src/infrastructure/config/auth.config';
import { AuthRealm } from 'src/modules/auth/enums/auth.enums';
import {
  AuthException,
  AuthExceptionCodes,
} from 'src/modules/auth/exceptions/exceptions';
import { WebJwtAuthGuard } from 'src/modules/auth/guards/jwt-web.guard';
import { IWebRequestUser } from 'src/modules/auth/interfaces/request-user.interface';
import { ChangePasswordUseCase } from 'src/usecases/auth/change-password.usecase';
import { ForgotPasswordUseCase } from 'src/usecases/auth/forgot-password.usecase';
import { LoginUseCase } from 'src/usecases/auth/login.usecase';
import { LogoutUseCase } from 'src/usecases/auth/logout.usecase';
import { RefreshSessionUseCase } from 'src/usecases/auth/refresh-session.usecase';
import { ResendVerificationUseCase } from 'src/usecases/auth/resend-verification.usecase';
import {
  clearRefreshCookie,
  REFRESH_COOKIE,
  setRefreshCookie,
} from './cookies';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { LoginDto } from './dto/login.dto';
import { ResendVerificationDto } from './dto/resend-verification.dto';
import { AdminProfilePresenter } from './presenters/admin-profile.presenter';
import { SessionPresenter } from './presenters/session.presenter';
import { requestClient } from './request-client';

const AUTH_THROTTLE = { default: { limit: 10, ttl: 60000 } };

// Admins on the web. The refresh token travels only as the httpOnly vic_refresh cookie (path /auth/web).
@ApiBearerAuth()
@UseGuards(WebJwtAuthGuard)
@Controller('auth/web')
export class WebAuthController {
  constructor(
    private readonly loginUseCase: LoginUseCase,
    private readonly refreshSessionUseCase: RefreshSessionUseCase,
    private readonly logoutUseCase: LogoutUseCase,
    private readonly forgotPasswordUseCase: ForgotPasswordUseCase,
    private readonly resendVerificationUseCase: ResendVerificationUseCase,
    private readonly changePasswordUseCase: ChangePasswordUseCase,
    private readonly authConfig: AuthConfigService,
  ) {}

  @Public()
  @Throttle(AUTH_THROTTLE)
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: SessionPresenter })
  @Post('login')
  async login(
    @Body() { email, password }: LoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<SessionPresenter> {
    const { tokens, admin } = await this.loginUseCase.execute(
      AuthRealm.WEB,
      email,
      password,
      requestClient(req),
    );
    setRefreshCookie(res, tokens.refreshToken, this.authConfig);

    return new SessionPresenter(tokens, {
      includeRefreshToken: false,
      user: new AdminProfilePresenter(admin),
    });
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: SessionPresenter })
  @Post('refresh')
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<SessionPresenter> {
    try {
      const tokens = await this.refreshSessionUseCase.execute(
        AuthRealm.WEB,
        req.cookies?.[REFRESH_COOKIE],
      );
      // No refresh token after two tabs crossed: the browser already holds the new cookie.
      if (tokens.refreshToken) {
        setRefreshCookie(res, tokens.refreshToken, this.authConfig);
      }
      return new SessionPresenter(tokens, { includeRefreshToken: false });
    } catch (error) {
      if (
        error instanceof AuthException &&
        error.code === AuthExceptionCodes.AUTH_008
      ) {
        clearRefreshCookie(res);
      }
      throw error;
    }
  }

  @Public()
  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('logout')
  async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<void> {
    await this.logoutUseCase.execute(req.cookies?.[REFRESH_COOKIE]);
    clearRefreshCookie(res);
  }

  @Public()
  @Throttle(AUTH_THROTTLE)
  @HttpCode(HttpStatus.OK)
  @Post('forgot-password')
  async forgotPassword(@Body() { email }: ForgotPasswordDto): Promise<void> {
    await this.forgotPasswordUseCase.execute(AuthRealm.WEB, email);
  }

  // Resends the NGO confirmation link (decisions R15). Same answer for any email.
  @Public()
  @Throttle(AUTH_THROTTLE)
  @HttpCode(HttpStatus.OK)
  @Post('resend-verification')
  async resendVerification(
    @Body() { email }: ResendVerificationDto,
  ): Promise<void> {
    await this.resendVerificationUseCase.execute(AuthRealm.WEB, email);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Patch('change-password')
  async changePassword(
    @ExtractUser() user: IWebRequestUser,
    @Body() { currentPassword, newPassword }: ChangePasswordDto,
  ): Promise<void> {
    await this.changePasswordUseCase.execute(
      user.identityId,
      currentPassword,
      newPassword,
      user.sessionId,
    );
  }

  // The web app's bootstrap call after a refresh; replaces the old POST /auth/login.
  @ApiOkResponse({ type: AdminProfilePresenter })
  @Get('me')
  me(@ExtractUser() user: IWebRequestUser): AdminProfilePresenter {
    return new AdminProfilePresenter(user);
  }
}
