import { InjectQueue, Process, Processor } from '@nestjs/bull';
import { Logger, OnModuleInit } from '@nestjs/common';
import { Queue } from 'bull';
import { QUEUES } from 'src/common/constants/constants';
import { S3Service } from 'src/infrastructure/providers/s3/module/s3.service';
import { OrganizationStatus } from 'src/modules/organization/enums/organization-status.enum';
import { DataSource } from 'typeorm';
import { AuthIdentityFacade } from '../services/auth-identity.facade';

const DAY_MS = 24 * 60 * 60 * 1000;

export const AUTH_CLEANUP = {
  JOB_ID: 'auth-cleanup',
  CRON: '30 3 * * *', // every day at 03:30
  SESSIONS_AFTER_DAYS: 7, // refresh tokens expired or revoked this long ago
  TOKENS_AFTER_DAYS: 90, // one-time tokens used, replaced or expired this long ago
  PENDING_ORGANIZATIONS_AFTER_DAYS: 7, // NGOs whose admin never confirmed the email
  UNVERIFIED_MOBILE_AFTER_DAYS: 7, // mobile sign-ups never confirmed
};

export interface AuthCleanupCounts {
  sessions: number;
  tokens: number;
  pendingOrganizations: number;
  unverifiedMobileIdentities: number;
}

// The daily auth cleanup (Layer 9, decisions R10). Each delete goes through the Layer 2 methods, except
// the pending organizations, which span organization, user, identity and S3.
@Processor(QUEUES.AUTH_MAINTENANCE)
export class AuthCleanupProcessor implements OnModuleInit {
  private readonly logger = new Logger(AuthCleanupProcessor.name);

  constructor(
    @InjectQueue(QUEUES.AUTH_MAINTENANCE)
    private readonly queue: Queue,
    private readonly authIdentityFacade: AuthIdentityFacade,
    private readonly s3Service: S3Service,
    private readonly dataSource: DataSource,
  ) {}

  // A repeatable job is keyed by its name, id and cron, so registering it on every boot keeps one schedule.
  async onModuleInit(): Promise<void> {
    if (process.env.NODE_ENV === 'test') return;
    await this.queue.add(
      {},
      {
        jobId: AUTH_CLEANUP.JOB_ID,
        repeat: { cron: AUTH_CLEANUP.CRON },
        removeOnComplete: 10,
        removeOnFail: 50,
      },
    );
  }

  @Process()
  public async process(): Promise<AuthCleanupCounts> {
    return this.run();
  }

  public async run(now = new Date()): Promise<AuthCleanupCounts> {
    const daysAgo = (days: number): Date =>
      new Date(now.getTime() - days * DAY_MS);

    const sessionsBefore = daysAgo(AUTH_CLEANUP.SESSIONS_AFTER_DAYS);
    const counts: AuthCleanupCounts = {
      sessions:
        await this.authIdentityFacade.deleteSessionsExpiredOrRevokedBefore(
          sessionsBefore,
          sessionsBefore,
        ),
      tokens: await this.authIdentityFacade.deleteTokensEndedBefore(
        daysAgo(AUTH_CLEANUP.TOKENS_AFTER_DAYS),
      ),
      pendingOrganizations: await this.deletePendingOrganizations(
        daysAgo(AUTH_CLEANUP.PENDING_ORGANIZATIONS_AFTER_DAYS),
      ),
      unverifiedMobileIdentities:
        await this.authIdentityFacade.deleteUnverifiedMobileBefore(
          daysAgo(AUTH_CLEANUP.UNVERIFIED_MOBILE_AFTER_DAYS),
        ),
    };

    this.logger.log(`Auth cleanup: ${JSON.stringify(counts)}`);
    return counts;
  }

  // A pending NGO never had its email confirmed, so nothing else can point at it yet: it goes with its
  // admin users, their identities (tokens and sessions cascade) and its logo.
  // One transaction per NGO; an NGO that cannot be deleted is logged and skipped.
  private async deletePendingOrganizations(before: Date): Promise<number> {
    const organizations: {
      id: string;
      logo: string;
    }[] = await this.dataSource.query(
      `SELECT id, logo FROM organization
        WHERE status = $1 AND created_on < $2 AND deleted_on IS NULL`,
      [OrganizationStatus.PENDING, before],
    );

    let deleted = 0;
    for (const organization of organizations) {
      try {
        await this.dataSource.transaction(async (manager) => {
          await manager.query(
            `DELETE FROM auth_identity
              WHERE user_id IN (SELECT id FROM "user" WHERE type = 'admin' AND organization_id = $1)`,
            [organization.id],
          );
          await manager.query(
            `DELETE FROM "user" WHERE type = 'admin' AND organization_id = $1`,
            [organization.id],
          );
          await manager.query(`DELETE FROM organization WHERE id = $1`, [
            organization.id,
          ]);
        });
        deleted++;
      } catch (error) {
        this.logger.error(
          `Auth cleanup: could not delete pending organization ${organization.id}`,
          error,
        );
        continue;
      }

      await this.deleteFiles(organization);
    }
    return deleted;
  }

  // After the commit, so a failed delete never leaves an NGO without its files. A failure here only logs.
  private async deleteFiles(organization: {
    id: string;
    logo: string;
  }): Promise<void> {
    try {
      if (organization.logo) {
        await this.s3Service.deletePublicFile(organization.logo);
      }
    } catch (error) {
      this.logger.warn(
        `Auth cleanup: files of organization ${organization.id} were not deleted`,
      );
    }
  }
}
