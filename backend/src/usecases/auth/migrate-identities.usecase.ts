import { ISendMailOptions } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { AUTH_TOKEN_TTL_MS } from 'src/modules/auth/auth.constants';
import { AUTH_EMAILS, AuthEmail } from 'src/modules/auth/constants/auth-emails';
import {
  AuthIdentityStatus,
  AuthProvider,
  AuthRealm,
  AuthTokenForm,
  AuthTokenType,
} from 'src/modules/auth/enums/auth.enums';
import { AuthIdentityTransformer } from 'src/modules/auth/models/auth-identity.model';
import { AuthIdentityFacade } from 'src/modules/auth/services/auth-identity.facade';
import { AuthMailerService } from 'src/modules/auth/services/auth-mailer.service';
import { OneTimeTokenService } from 'src/modules/auth/services/one-time-token.service';
import { TransitionMailService } from 'src/modules/auth/services/transition-mail.service';
import { UserType } from 'src/modules/user/enums/user.enum';
import { DataSource, EntityManager } from 'typeorm';

export interface MigrateIdentitiesOptions {
  dryRun?: boolean;
  batchSize?: number;
}

export interface MigrationDuplicate {
  realm: AuthRealm;
  email: string;
  keptUserId: string;
  otherUserIds: string[];
}

export interface MigrateIdentitiesReport {
  dryRun: boolean;
  users: number; // user rows read (deleted_on IS NULL)
  admins: number; // web identities created
  volunteers: number; // mobile identities created
  providerLinks: number; // social links built from the Cognito username (R35)
  unchanged: number; // an identity with that realm and email already existed
  skippedDeleted: number; // user rows with deleted_on set
  skippedNoEmail: number;
  duplicates: MigrationDuplicate[]; // same lowercased email twice in one realm: newest kept
  emailsQueued: number; // held transition emails (would be, on a dry run)
}

interface LegacyUserRow {
  id: string;
  type: UserType;
  email: string;
  cognito_id: string;
  created_on: Date;
}

// Cognito usernames of federated users: <provider>_<subject>.
const COGNITO_PROVIDER_PREFIXES: Record<string, AuthProvider> = {
  google: AuthProvider.GOOGLE,
  facebook: AuthProvider.FACEBOOK,
  signinwithapple: AuthProvider.APPLE,
};

export function providerFromCognitoUsername(
  cognitoUsername: string,
): { provider: AuthProvider; subject: string } | null {
  const separator = cognitoUsername?.indexOf('_') ?? -1;
  if (separator <= 0) return null;
  const provider =
    COGNITO_PROVIDER_PREFIXES[
      cognitoUsername.slice(0, separator).toLowerCase()
    ];
  const subject = cognitoUsername.slice(separator + 1);
  return provider && subject ? { provider, subject } : null;
}

class DryRunRollback extends Error {}

// auth:migrate (Layer 9). Every user row not deleted becomes an identity in pending: admins in
// the web realm, volunteers in the mobile realm (already verified: Cognito had confirmed them). Each new
// identity gets a 30-day transition link (an invite nobody sent, R16) and a held transition email.
// Upsert on (realm, email): a second run creates nothing and queues nothing. Nobody is imported disabled.
@Injectable()
export class MigrateIdentitiesUseCase {
  constructor(
    private readonly dataSource: DataSource,
    private readonly authIdentityFacade: AuthIdentityFacade,
    private readonly oneTimeTokenService: OneTimeTokenService,
    private readonly authMailer: AuthMailerService,
    private readonly transitionMail: TransitionMailService,
  ) {}

  async execute(
    options: MigrateIdentitiesOptions = {},
  ): Promise<MigrateIdentitiesReport> {
    const dryRun = !!options.dryRun;
    const batchSize = options.batchSize ?? 500;

    const report: MigrateIdentitiesReport = {
      dryRun,
      users: 0,
      admins: 0,
      volunteers: 0,
      providerLinks: 0,
      unchanged: 0,
      skippedDeleted: 0,
      skippedNoEmail: 0,
      duplicates: [],
      emailsQueued: 0,
    };

    const [{ count }] = await this.dataSource.query(
      `SELECT count(*)::int AS count FROM "user" WHERE deleted_on IS NOT NULL`,
    );
    report.skippedDeleted = count;

    const rows: LegacyUserRow[] = await this.dataSource.query(
      `SELECT id, type, email, cognito_id, created_on FROM "user"
        WHERE deleted_on IS NULL
        ORDER BY created_on DESC, id`,
    );
    report.users = rows.length;

    const toImport = this.dedupe(rows, report);

    for (let start = 0; start < toImport.length; start += batchSize) {
      const batch = toImport.slice(start, start + batchSize);
      const emails: ISendMailOptions[] = [];
      const counts = {
        admins: 0,
        volunteers: 0,
        providerLinks: 0,
        unchanged: 0,
      };

      try {
        // One transaction per batch; identities, links and tokens are written through its manager (R9).
        await this.dataSource.transaction(async (manager) => {
          for (const row of batch) {
            await this.importUser(row, manager, counts, emails);
          }
          if (dryRun) throw new DryRunRollback();
        });
      } catch (error) {
        if (!(error instanceof DryRunRollback)) throw error;
      }

      report.admins += counts.admins;
      report.volunteers += counts.volunteers;
      report.providerLinks += counts.providerLinks;
      report.unchanged += counts.unchanged;
      report.emailsQueued += dryRun
        ? emails.length
        : // After the commit: a job never holds a link whose row was rolled back.
          await this.transitionMail.hold(emails);
    }

    return report;
  }

  // Rows come newest first, so the first one seen for a realm and email is the one kept.
  private dedupe(
    rows: LegacyUserRow[],
    report: MigrateIdentitiesReport,
  ): LegacyUserRow[] {
    const kept = new Map<string, LegacyUserRow>();
    const duplicates = new Map<string, MigrationDuplicate>();

    for (const row of rows) {
      const email = AuthIdentityTransformer.normalizeEmail(row.email);
      if (!email) {
        report.skippedNoEmail++;
        continue;
      }
      const realm = this.realmOf(row);
      const key = `${realm}:${email}`;
      const first = kept.get(key);
      if (!first) {
        kept.set(key, row);
        continue;
      }
      const duplicate = duplicates.get(key) ?? {
        realm,
        email,
        keptUserId: first.id,
        otherUserIds: [],
      };
      duplicate.otherUserIds.push(row.id);
      duplicates.set(key, duplicate);
    }

    report.duplicates = [...duplicates.values()];
    return [...kept.values()];
  }

  private async importUser(
    row: LegacyUserRow,
    manager: EntityManager,
    counts: {
      admins: number;
      volunteers: number;
      providerLinks: number;
      unchanged: number;
    },
    emails: ISendMailOptions[],
  ): Promise<void> {
    const realm = this.realmOf(row);
    const { identity, created } = await this.authIdentityFacade.upsertIdentity(
      {
        realm,
        email: row.email,
        status: AuthIdentityStatus.PENDING,
        legacyCognitoUsername: row.cognito_id,
        userId: row.id,
        emailVerifiedAt: realm === AuthRealm.MOBILE ? row.created_on : null,
      },
      manager,
    );

    if (!created) {
      counts.unchanged++;
      return;
    }

    if (realm === AuthRealm.WEB) {
      counts.admins++;
    } else {
      counts.volunteers++;
      const social = providerFromCognitoUsername(row.cognito_id);
      if (social) {
        await this.authIdentityFacade.linkProvider(
          { identityId: identity.id, ...social, emailAtLink: identity.email },
          manager,
        );
        counts.providerLinks++;
      }
    }

    // VIC 2.0 (#514): no passwords. Admins get a first login link valid 30 days (an invite nobody sent
    // is a transition link, R16); volunteers just log in with their email in the updated app.
    let email: AuthEmail;
    if (realm === AuthRealm.WEB) {
      const { secret } = await this.oneTimeTokenService.issue(
        {
          identity,
          type: AuthTokenType.INVITE,
          form: AuthTokenForm.LINK,
          ttlMs: AUTH_TOKEN_TTL_MS.TRANSITION_LINK,
        },
        manager,
      );
      email = AUTH_EMAILS.transitionLinkAdmin(
        this.authMailer.loginLinkUrl(secret),
      );
    } else {
      email = AUTH_EMAILS.transitionLinkVolunteer();
    }

    emails.push({
      to: identity.email,
      subject: email.subject,
      context: { ...email.context },
    });
  }

  private realmOf(row: LegacyUserRow): AuthRealm {
    return row.type === UserType.ADMIN ? AuthRealm.WEB : AuthRealm.MOBILE;
  }
}
