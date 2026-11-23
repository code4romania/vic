import { Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { JSONStringifyError } from 'src/common/helpers/utils';
import { S3Service } from 'src/infrastructure/providers/s3/module/s3.service';
import { eraseRegularUser } from './personal-data-erasure';

export interface IOldAccountDeletion {
  userId: string;
  // volunteer records still there (each one listed an NGO's volunteer as "Activ")
  volunteers: number;
  // why it counts as an unfinished deletion
  reason: 'anonymized_user' | 'anonymized_profile';
}

// #687: before the deletion became one transaction (aa406742, 10.11.2026) an account deletion could
// stop half way: the volunteer profile got an account-deleted@… email, but the person kept their
// name and an active volunteer record, so NGOs still listed them. The old code wrote that address
// only when deleting an account, so it marks a person who asked to be deleted. This finishes those
// deletions with today's erasure (personal-data-erasure.ts). People erased by today's code
// (deleted-…@deleted.invalid) are not touched.
@Injectable()
export class FinishOldAccountDeletionsUseCase {
  private readonly logger = new Logger(FinishOldAccountDeletionsUseCase.name);

  constructor(
    private readonly dataSource: DataSource,
    private readonly s3Service: S3Service,
  ) {}

  async findUnfinished(): Promise<IOldAccountDeletion[]> {
    const found: {
      user_id: string;
      volunteers: number;
      anonymized_user: boolean;
    }[] = await this.dataSource.query(
      `SELECT u.id AS user_id,
              (SELECT count(*)::int FROM volunteer v WHERE v.user_id = u.id) AS volunteers,
              (u.email ILIKE 'account-deleted@%') AS anonymized_user
         FROM "user" u
        WHERE u.type = 'regular'
          AND u.email NOT ILIKE 'deleted-%@deleted.invalid'
          AND (
            u.email ILIKE 'account-deleted@%'
            OR EXISTS (
              SELECT 1 FROM volunteer v
                JOIN volunteer_profile p ON p.id = v.volunteer_profile_id
               WHERE v.user_id = u.id AND p.email ILIKE 'account-deleted@%'
            )
          )
        ORDER BY u.id`,
    );
    return found.map((row) => ({
      userId: row.user_id,
      volunteers: row.volunteers,
      reason: row.anonymized_user ? 'anonymized_user' : 'anonymized_profile',
    }));
  }

  // Without `apply` only lists them. Each person is erased in a transaction of their own, so one
  // failure leaves the others done; the S3 files go after each commit, best effort.
  // `onlyProfiles` keeps only the half-finished deletions (`anonymized_profile`, the #687 case) and
  // leaves the accounts the old code had already anonymized (`anonymized_user`) as they are: erasing
  // those removes their hours and contracts for good, so production chooses (runbook, issue 23).
  async execute(
    apply: boolean,
    { onlyProfiles = false }: { onlyProfiles?: boolean } = {},
  ): Promise<{
    found: IOldAccountDeletion[];
    erased: string[];
    failed: string[];
  }> {
    const found = (await this.findUnfinished()).filter(
      (item) => !onlyProfiles || item.reason === 'anonymized_profile',
    );
    const erased: string[] = [];
    const failed: string[] = [];
    if (!apply) return { found, erased, failed };

    for (const { userId } of found) {
      try {
        const { files } = await this.dataSource.transaction((manager) =>
          eraseRegularUser(manager, userId),
        );
        erased.push(userId);
        await Promise.all(
          files.map((path) =>
            this.s3Service
              .deleteFile(path)
              .catch((error) =>
                this.logger.error(
                  `Could not delete ${path} of a deleted account`,
                  JSONStringifyError(error),
                ),
              ),
          ),
        );
      } catch (error) {
        failed.push(userId);
        this.logger.error(
          `Could not finish the deletion of ${userId}`,
          JSONStringifyError(error),
        );
      }
    }
    return { found, erased, failed };
  }
}
