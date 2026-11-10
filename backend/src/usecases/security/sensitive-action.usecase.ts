import { Injectable } from '@nestjs/common';
import { AUTH_EMAILS } from 'src/modules/auth/constants/auth-emails';
import {
  AuthTokenForm,
  AuthTokenType,
} from 'src/modules/auth/enums/auth.enums';
import { IWebRequestUser } from 'src/modules/auth/interfaces/request-user.interface';
import { AuthMailerService } from 'src/modules/auth/services/auth-mailer.service';
import { AuthRateLimitService } from 'src/modules/auth/services/auth-rate-limit.service';
import { OneTimeTokenService } from 'src/modules/auth/services/one-time-token.service';

export enum SensitiveAction {
  CHANGE_EMAIL = 'CHANGE_EMAIL',
  DELETE_ORGANIZATION = 'DELETE_ORGANIZATION',
  ADD_ADMIN = 'ADD_ADMIN',
  // #593: the organization's data leaves VIC as a file
  EXPORT_VOLUNTEERS = 'EXPORT_VOLUNTEERS',
  BACKUP = 'BACKUP',
}

// The header that carries the emailed code on a GET download (#593)
export const SENSITIVE_CODE_HEADER = 'x-sensitive-code';

const ACTION_TEXT: Record<SensitiveAction, { ro: string; en: string }> = {
  [SensitiveAction.CHANGE_EMAIL]: {
    ro: 'schimbi adresa de email a contului',
    en: 'change the email address of your account',
  },
  [SensitiveAction.DELETE_ORGANIZATION]: {
    ro: 'ștergi contul organizației și toate datele ei',
    en: "delete the organization's account and all its data",
  },
  [SensitiveAction.ADD_ADMIN]: {
    ro: 'adaugi un administrator nou în organizație',
    en: 'add a new administrator to the organization',
  },
  [SensitiveAction.EXPORT_VOLUNTEERS]: {
    ro: 'descarci lista voluntarilor organizației',
    en: "download the organization's volunteers list",
  },
  [SensitiveAction.BACKUP]: {
    ro: 'descarci backup-ul complet al datelor organizației',
    en: "download the full backup of the organization's data",
  },
};

// VIC 2.0, #508 (Andrew, 9 Nov 2026): no separate 2FA at login, since the magic link already is the
// email factor. A sensitive action asks for a 6-digit code sent to the admin's email: changing the
// email, deleting the NGO, adding an admin, and (#593) downloading the volunteers list or the full
// backup. Always on, it cannot be turned off.
@Injectable()
export class SensitiveActionUsecase {
  constructor(
    private readonly oneTimeTokenService: OneTimeTokenService,
    private readonly authMailer: AuthMailerService,
    private readonly rateLimit: AuthRateLimitService,
  ) {}

  // Emails a new code (and ends the previous one); returns the masked address it went to.
  public async requestCode(
    admin: IWebRequestUser,
    action: SensitiveAction,
  ): Promise<{ maskedEmail: string }> {
    await this.rateLimit.assertCanIssueSensitive(admin.identityId);
    const { secret } = await this.oneTimeTokenService.issue({
      identity: { id: admin.identityId, email: admin.email },
      type: AuthTokenType.SENSITIVE_ACTION,
      form: AuthTokenForm.CODE,
      // The code works only for the action it was asked for
      purpose: action,
    });
    await this.authMailer.send(
      admin.email,
      AUTH_EMAILS.sensitiveActionCode(secret, ACTION_TEXT[action]),
    );
    return { maskedEmail: this.oneTimeTokenService.maskEmail(admin.email) };
  }

  // AUTH_005 for a wrong or expired code, or one asked for another action (the fifth wrong one ends it,
  // AUTH_006). A good code is used up.
  public async verify(
    admin: IWebRequestUser,
    code: string,
    action: SensitiveAction,
  ): Promise<void> {
    const token = await this.oneTimeTokenService.verifyCode(
      { id: admin.identityId },
      AuthTokenType.SENSITIVE_ACTION,
      code,
      action,
    );
    await this.oneTimeTokenService.consume(token);
  }
}
