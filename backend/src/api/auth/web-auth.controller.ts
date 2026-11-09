import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
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
import { RequestLoginUseCase } from 'src/usecases/auth/request-login.usecase';
import { LogoutUseCase } from 'src/usecases/auth/logout.usecase';
import { RefreshSessionUseCase } from 'src/usecases/auth/refresh-session.usecase';
import { ResendVerificationUseCase } from 'src/usecases/auth/resend-verification.usecase';
import {
  clearRefreshCookie,
  REFRESH_COOKIE,
  setRefreshCookie,
} from './cookies';
import { RequestLoginDto } from './dto/request-login.dto';
import { ResendVerificationDto } from './dto/resend-verification.dto';
import { AdminProfilePresenter } from './presenters/admin-profile.presenter';
import { SessionPresenter } from './presenters/session.presenter';

const AUTH_THROTTLE = { default: { limit: 10, ttl: 60000 } };

// Admins on the web. The refresh token travels only as the httpOnly vic_refresh cookie (path /auth/web).
@ApiBearerAuth()
@UseGuards(WebJwtAuthGuard)
@Controller('auth/web')
export class WebAuthController {
  constructor(
    private readonly requestLoginUseCase: RequestLoginUseCase,
    private readonly refreshSessionUseCase: RefreshSessionUseCase,
    private readonly logoutUseCase: LogoutUseCase,
    private readonly resendVerificationUseCase: ResendVerificationUseCase,
    private readonly authConfig: AuthConfigService,
  ) {}

  // VIC 2.0 (#514): emails a magic link (15 minutes) to an existing admin login. Same answer for any
  // email, except a volunteer's (AUTH_012, use the app). The link opens /login/link in the web app,
  // which calls POST /auth/login-link.
  @Public()
  @Throttle(AUTH_THROTTLE)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('login/request')
  async requestLogin(@Body() { email }: RequestLoginDto): Promise<void> {
    await this.requestLoginUseCase.execute(AuthRealm.WEB, email);
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

  // The web app's bootstrap call after a refresh; replaces the old POST /auth/login.
  @ApiOkResponse({ type: AdminProfilePresenter })
  @Get('me')
  me(@ExtractUser() user: IWebRequestUser): AdminProfilePresenter {
    return new AdminProfilePresenter(user);
  }
}
