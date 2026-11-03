import { Injectable } from '@nestjs/common';
import { IUseCaseService } from 'src/common/interfaces/use-case-service.interface';
import { AUTH_EMAILS } from 'src/modules/auth/constants/auth-emails';
import {
  AuthException,
  AuthExceptionCodes,
} from 'src/modules/auth/exceptions/exceptions';
import { AuthIdentityFacade } from 'src/modules/auth/services/auth-identity.facade';
import { AuthMailerService } from 'src/modules/auth/services/auth-mailer.service';
import { PasswordService } from 'src/modules/auth/services/password.service';
import { SessionService } from 'src/modules/auth/services/session.service';
import { DataSource } from 'typeorm';

// Keeps the current session (the access token's sid, decisions R11) and ends every other one.
@Injectable()
export class ChangePasswordUseCase implements IUseCaseService<void> {
  constructor(
    private readonly authIdentityFacade: AuthIdentityFacade,
    private readonly passwordService: PasswordService,
    private readonly sessionService: SessionService,
    private readonly authMailer: AuthMailerService,
    private readonly dataSource: DataSource,
  ) {}

  async execute(
    identityId: string,
    currentPassword: string,
    newPassword: string,
    sessionId: string,
  ): Promise<void> {
    const identity = await this.authIdentityFacade.findIdentity({
      id: identityId,
    });
    if (
      !identity?.passwordHash ||
      !(await this.passwordService.verify(
        identity.passwordHash,
        currentPassword,
      ))
    ) {
      throw new AuthException(AuthExceptionCodes.AUTH_001);
    }
    if (!this.passwordService.meetsPolicy(newPassword)) {
      throw new AuthException(AuthExceptionCodes.AUTH_007);
    }

    const passwordHash = await this.passwordService.hash(newPassword);

    await this.dataSource.transaction(async (manager) => {
      await this.authIdentityFacade.updateIdentity(
        identity.id,
        { passwordHash, passwordSetAt: new Date() },
        manager,
      );
      await this.sessionService.revokeAll(identity.id, sessionId, manager);
    });

    await this.authMailer.send(identity.email, AUTH_EMAILS.passwordChanged());
  }
}
