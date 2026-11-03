import { Injectable } from '@nestjs/common';
import { IUseCaseService } from 'src/common/interfaces/use-case-service.interface';
import { SessionService } from 'src/modules/auth/services/session.service';

// Revokes the presented session; an unknown or missing token is not an error.
@Injectable()
export class LogoutUseCase implements IUseCaseService<void> {
  constructor(private readonly sessionService: SessionService) {}

  async execute(secret: string): Promise<void> {
    await this.sessionService.revokeByRefreshToken(secret);
  }
}
