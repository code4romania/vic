import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
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
import {
  LoginWithCodeDto,
  RequestLoginDto,
} from 'src/api/auth/dto/request-login.dto';
import { SessionPresenter } from 'src/api/auth/presenters/session.presenter';
import { requestClient } from 'src/api/auth/request-client';
import { Public } from 'src/common/decorators/public.decorator';
import { AuthRealm } from 'src/modules/auth/enums/auth.enums';
import { MobileJwtAuthGuard } from 'src/modules/auth/guards/jwt-mobile.guard';
import { LoginWithCodeUseCase } from 'src/usecases/auth/login-with-code.usecase';
import { LogoutUseCase } from 'src/usecases/auth/logout.usecase';
import { RefreshSessionUseCase } from 'src/usecases/auth/refresh-session.usecase';
import { RequestLoginUseCase } from 'src/usecases/auth/request-login.usecase';
import { SocialLoginUseCase } from 'src/usecases/auth/social-login.usecase';
import { LogoutDto } from './dto/logout.dto';
import { RefreshDto } from './dto/refresh.dto';
import { SocialLoginDto } from './dto/social-login.dto';
import { RequestLoginResultPresenter } from './presenters/request-login-result.presenter';

const AUTH_THROTTLE = { default: { limit: 10, ttl: 60000 } };

// Volunteers in the app. Tokens travel in the body; the app keeps them in secure storage.
// VIC 2.0 (#514): no passwords. Email -> 6-digit code -> session; or Google / Apple.
@ApiBearerAuth()
@UseGuards(MobileJwtAuthGuard)
@Controller('mobile/auth')
export class MobileAuthController {
  constructor(
    private readonly requestLoginUseCase: RequestLoginUseCase,
    private readonly loginWithCodeUseCase: LoginWithCodeUseCase,
    private readonly socialLoginUseCase: SocialLoginUseCase,
    private readonly refreshSessionUseCase: RefreshSessionUseCase,
    private readonly logoutUseCase: LogoutUseCase,
  ) {}

  // Sends the login code; an unknown email gets a login (sign-up and login are one step).
  @Public()
  @Throttle(AUTH_THROTTLE)
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: RequestLoginResultPresenter })
  @Post('login/request')
  async requestLogin(
    @Body() { email }: RequestLoginDto,
    @Req() req: Request,
  ): Promise<RequestLoginResultPresenter> {
    return new RequestLoginResultPresenter(
      await this.requestLoginUseCase.execute(
        AuthRealm.MOBILE,
        email,
        requestClient(req).ip,
      ),
    );
  }

  @Public()
  @Throttle(AUTH_THROTTLE)
  @HttpCode(HttpStatus.OK)
  @ApiCreatedResponse({ type: SessionPresenter })
  @Post('login/code')
  async loginWithCode(
    @Body() { email, code }: LoginWithCodeDto,
    @Req() req: Request,
  ): Promise<SessionPresenter> {
    const tokens = await this.loginWithCodeUseCase.execute(
      email,
      code,
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
  async logout(@Body() { refreshToken, pushToken }: LogoutDto): Promise<void> {
    await this.logoutUseCase.execute(refreshToken, pushToken);
  }
}
