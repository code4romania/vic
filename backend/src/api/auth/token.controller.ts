import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { ApiExtraModels, ApiOkResponse, getSchemaPath } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Request, Response } from 'express';
import { AuthConfigService } from 'src/infrastructure/config/auth.config';
import { AuthRealm } from 'src/modules/auth/enums/auth.enums';
import { LinkResult } from 'src/usecases/auth/auth-results';
import { ConfirmEmailUseCase } from 'src/usecases/auth/confirm-email.usecase';
import { GetTokenInfoUseCase } from 'src/usecases/auth/get-token-info.usecase';
import { ResendTokenUseCase } from 'src/usecases/auth/resend-token.usecase';
import { SetPasswordUseCase } from 'src/usecases/auth/set-password.usecase';
import { setRefreshCookie } from './cookies';
import { ConfirmEmailDto } from './dto/confirm-email.dto';
import { SetPasswordDto } from './dto/set-password.dto';
import { AdminProfilePresenter } from './presenters/admin-profile.presenter';
import { MobileRealmResultPresenter } from './presenters/mobile-realm-result.presenter';
import { SessionPresenter } from './presenters/session.presenter';
import { TokenInfoPresenter } from './presenters/token-info.presenter';
import { requestClient } from './request-client';

const AUTH_THROTTLE = { default: { limit: 10, ttl: 60000 } };

const LINK_RESULT_SCHEMA = {
  schema: {
    oneOf: [
      { $ref: getSchemaPath(SessionPresenter) },
      { $ref: getSchemaPath(MobileRealmResultPresenter) },
    ],
  },
  description:
    'Web login: a session and the vic_refresh cookie. Mobile login: { realm: "mobile", email } and no session.',
};

// The pages behind emailed links (/set-password, /confirm-email), for both realms. All public.
@ApiExtraModels(SessionPresenter, MobileRealmResultPresenter)
@Controller('auth')
export class TokenController {
  constructor(
    private readonly getTokenInfoUseCase: GetTokenInfoUseCase,
    private readonly resendTokenUseCase: ResendTokenUseCase,
    private readonly setPasswordUseCase: SetPasswordUseCase,
    private readonly confirmEmailUseCase: ConfirmEmailUseCase,
    private readonly authConfig: AuthConfigService,
  ) {}

  @Throttle(AUTH_THROTTLE)
  @ApiOkResponse({ type: TokenInfoPresenter })
  @Get('token/:secret')
  async tokenInfo(
    @Param('secret') secret: string,
  ): Promise<TokenInfoPresenter> {
    return new TokenInfoPresenter(
      await this.getTokenInfoUseCase.execute(secret),
    );
  }

  // Same answer whether or not anything was sent.
  @Throttle(AUTH_THROTTLE)
  @HttpCode(HttpStatus.OK)
  @Post('token/:secret/resend')
  async resend(@Param('secret') secret: string): Promise<void> {
    await this.resendTokenUseCase.execute(secret);
  }

  @Throttle(AUTH_THROTTLE)
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse(LINK_RESULT_SCHEMA)
  @Post('set-password')
  async setPassword(
    @Body() { token, password }: SetPasswordDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<SessionPresenter | MobileRealmResultPresenter> {
    return this.present(
      await this.setPasswordUseCase.execute(
        token,
        password,
        requestClient(req),
      ),
      res,
    );
  }

  @Throttle(AUTH_THROTTLE)
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse(LINK_RESULT_SCHEMA)
  @Post('confirm-email')
  async confirmEmail(
    @Body() { token }: ConfirmEmailDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<SessionPresenter | MobileRealmResultPresenter> {
    return this.present(
      await this.confirmEmailUseCase.execute(token, requestClient(req)),
      res,
    );
  }

  private present(
    result: LinkResult,
    res: Response,
  ): SessionPresenter | MobileRealmResultPresenter {
    if (result.realm === AuthRealm.MOBILE) {
      return new MobileRealmResultPresenter(result.email);
    }

    setRefreshCookie(res, result.tokens.refreshToken, this.authConfig);
    return new SessionPresenter(result.tokens, {
      includeRefreshToken: false,
      user: new AdminProfilePresenter(result.admin),
    });
  }
}
