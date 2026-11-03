import { Injectable } from '@nestjs/common';
import { IUseCaseService } from 'src/common/interfaces/use-case-service.interface';
import { AuthRealm } from 'src/modules/auth/enums/auth.enums';
import {
  SessionService,
  SessionTokens,
} from 'src/modules/auth/services/session.service';

@Injectable()
export class RefreshSessionUseCase implements IUseCaseService<SessionTokens> {
  constructor(private readonly sessionService: SessionService) {}

  // AUTH_008 for an invalid, expired, revoked or replayed refresh token; the web controller then clears the cookie.
  async execute(realm: AuthRealm, secret: string): Promise<SessionTokens> {
    return this.sessionService.rotate(secret, realm);
  }
}
