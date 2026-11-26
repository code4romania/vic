import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  Query,
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
import { WebSocialLoginUseCase } from 'src/usecases/auth/web-social-login.usecase';
import { SocialLoginDto } from 'src/api/_mobile/auth/dto/social-login.dto';
import {
  clearNgoHubFlowCookie,
  clearRefreshCookie,
  NGOHUB_FLOW_COOKIE,
  REFRESH_COOKIE,
  setNgoHubFlowCookie,
  setRefreshCookie,
} from './cookies';
import { NgoHubCallbackDto, NgoHubRevokeDto } from './dto/ngohub.dto';
import { NgoHubOidcService } from 'src/modules/auth/services/ngohub/ngohub-oidc.service';
import { NGOHUB_TICKET_TTL_SECONDS } from 'src/modules/auth/services/ngohub/ngohub-ticket.service';
import {
  NgoHubLoginUseCase,
  NgoHubRegistrationPrefill,
} from 'src/usecases/auth/ngohub-login.usecase';
import { RevokeNgoHubAdminUseCase } from 'src/usecases/auth/revoke-ngohub-admin.usecase';
import { RequestLoginDto } from './dto/request-login.dto';
import { ResendVerificationDto } from './dto/resend-verification.dto';
import { AdminProfilePresenter } from './presenters/admin-profile.presenter';
import { SessionPresenter } from './presenters/session.presenter';
import { requestClient, requestLanguage } from './request-client';
import { SetLanguageDto } from './dto/set-language.dto';
import { LanguagePresenter } from './presenters/language.presenter';
import { SetUserLanguageUseCase } from 'src/usecases/user/set-user-language.usecase';

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
    private readonly webSocialLoginUseCase: WebSocialLoginUseCase,
    private readonly setUserLanguageUseCase: SetUserLanguageUseCase,
    private readonly authConfig: AuthConfigService,
    private readonly ngohubOidc: NgoHubOidcService,
    private readonly ngohubLoginUseCase: NgoHubLoginUseCase,
    private readonly revokeNgoHubAdminUseCase: RevokeNgoHubAdminUseCase,
  ) {}

  // VIC 2.0 (#514): emails a magic link (15 minutes) to an existing admin login. Same answer for any
  // email, except a volunteer's (AUTH_012, use the app). The link opens /login/link in the web app,
  // which calls POST /auth/login-link.
  @Public()
  @Throttle(AUTH_THROTTLE)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('login/request')
  async requestLogin(
    @Body() { email }: RequestLoginDto,
    @Req() req: Request,
  ): Promise<void> {
    await this.requestLoginUseCase.execute(
      AuthRealm.WEB,
      email,
      undefined,
      requestLanguage(req),
    );
  }

  // Google or Apple (#512): an existing admin login only, by verified email. Same answer as a magic link:
  // the access token and the admin in the body, the refresh token in the vic_refresh cookie.
  @Public()
  @Throttle(AUTH_THROTTLE)
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: SessionPresenter })
  @Post('social')
  async social(
    @Body() { provider, token, authorizationCode }: SocialLoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<SessionPresenter> {
    const result = await this.webSocialLoginUseCase.execute(
      provider,
      token,
      requestClient(req),
      authorizationCode,
    );
    setRefreshCookie(res, result.tokens.refreshToken, this.authConfig);
    return new SessionPresenter(result.tokens, {
      includeRefreshToken: false,
      user: new AdminProfilePresenter(result.admin),
    });
  }

  // Login with NGO Hub: the button opens this URL (a top-level navigation). It sets the flow cookie and
  // redirects to NGO Hub; prompt=login asks NGO Hub for a fresh login (after a VIC logout). When the
  // feature is off or NGO Hub cannot be reached, back to the login page with the error code.
  @Public()
  @Throttle(AUTH_THROTTLE)
  @Get('ngohub/start')
  async ngohubStart(
    @Query('prompt') prompt: string,
    @Res() res: Response,
  ): Promise<void> {
    try {
      const { url, flowCookie, flowTtlSeconds } = await this.ngohubOidc.start({
        promptLogin: prompt === 'login',
      });
      setNgoHubFlowCookie(res, flowCookie, flowTtlSeconds);
      res.redirect(HttpStatus.FOUND, url);
    } catch (error) {
      const code =
        error instanceof AuthException
          ? error.code
          : AuthExceptionCodes.AUTH_020;
      res.redirect(
        HttpStatus.FOUND,
        `${this.authConfig.webAppUrl}/login?ngohub_error=${code}`,
      );
    }
  }

  // The web app's /login/ngohub/callback posts what NGO Hub sent. Either a session (like the other logins:
  // the access token and admin in the body, the refresh token in the cookie) or, for an NGO VIC does not
  // know yet, a registration ticket and the form's prefill (the flow cookie then lives as long as the ticket).
  @Public()
  @Throttle(AUTH_THROTTLE)
  @HttpCode(HttpStatus.OK)
  @Post('ngohub/callback')
  async ngohubCallback(
    @Body() body: NgoHubCallbackDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<
    | SessionPresenter
    | { registration: { ticket: string; prefill: NgoHubRegistrationPrefill } }
  > {
    const flowCookie = req.cookies?.[NGOHUB_FLOW_COOKIE];
    const result = await this.ngohubLoginUseCase.execute(
      { code: body.code, state: body.state, iss: body.iss, flowCookie },
      requestClient(req),
    );
    if (result.kind === 'register') {
      setNgoHubFlowCookie(res, flowCookie, NGOHUB_TICKET_TTL_SECONDS);
      return {
        registration: { ticket: result.ticket, prefill: result.prefill },
      };
    }
    clearNgoHubFlowCookie(res);
    setRefreshCookie(res, result.login.tokens.refreshToken, this.authConfig);
    return new SessionPresenter(result.login.tokens, {
      includeRefreshToken: false,
      user: new AdminProfilePresenter(result.login.admin),
    });
  }

  // "It was not us" from the email to the other admins: disables the admin who joined through NGO Hub.
  @Public()
  @Throttle(AUTH_THROTTLE)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('ngohub/not-us')
  async ngohubNotUs(@Body() { token }: NgoHubRevokeDto): Promise<void> {
    await this.revokeNgoHubAdminUseCase.execute(token);
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
    @Req() req: Request,
  ): Promise<void> {
    await this.resendVerificationUseCase.execute(
      AuthRealm.WEB,
      email,
      requestLanguage(req),
    );
  }

  // The web app's bootstrap call after a refresh; replaces the old POST /auth/login.
  @ApiOkResponse({ type: AdminProfilePresenter })
  @Get('me')
  me(@ExtractUser() user: IWebRequestUser): AdminProfilePresenter {
    return new AdminProfilePresenter(user);
  }

  // The admin's language: the web app, and the emails VIC sends them.
  @ApiOkResponse({ type: LanguagePresenter })
  @Patch('language')
  async setLanguage(
    @ExtractUser() user: IWebRequestUser,
    @Body() { language, explicit }: SetLanguageDto,
  ): Promise<LanguagePresenter> {
    return new LanguagePresenter(
      await this.setUserLanguageUseCase.execute(user.id, language, explicit),
    );
  }
}
