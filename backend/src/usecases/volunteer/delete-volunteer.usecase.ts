import { Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ExceptionsService } from 'src/infrastructure/exceptions/exceptions.service';
import { S3Service } from 'src/infrastructure/providers/s3/module/s3.service';
import { ActionsArchiveFacade } from 'src/modules/actions-archive/actions-archive.facade';
import { TrackedEventName } from 'src/modules/actions-archive/enums/action-resource-types.enum';
import { IAdminUserModel } from 'src/modules/user/models/admin-user.model';
import { VolunteerExceptionMessages } from 'src/modules/volunteer/exceptions/volunteer.exceptions';
import { VolunteerFacade } from 'src/modules/volunteer/services/volunteer.facade';
import { SyncUserOrganizationsUsecase } from '../user/sync-user-organizations.usecase';
import { eraseUsersWithoutAccount } from '../user/personal-data-erasure';

export interface IDeletedVolunteerData {
  activityLogs: number;
  contracts: number;
  registrations: number;
  announcementResponses: number;
}

// VIC 2.0, #484: the NGO deletes a volunteer together with everything VIC keeps about them for that
// NGO: hours, event registrations, documents, announcement responses, access requests, profile and
// history. Allowed in any status and final; the user's VIC account and other NGOs stay untouched.
@Injectable()
export class DeleteVolunteerUsecase {
  private readonly logger = new Logger(DeleteVolunteerUsecase.name);

  constructor(
    private readonly volunteerFacade: VolunteerFacade,
    private readonly dataSource: DataSource,
    private readonly s3Service: S3Service,
    private readonly exceptionsService: ExceptionsService,
    private readonly actionsArchiveFacade: ActionsArchiveFacade,
    private readonly syncUserOrganizationsUsecase: SyncUserOrganizationsUsecase,
  ) {}

  public async execute(
    volunteerId: string,
    admin: IAdminUserModel,
  ): Promise<IDeletedVolunteerData> {
    const volunteer = await this.volunteerFacade.find({
      id: volunteerId,
      organizationId: admin.organizationId,
    });
    if (!volunteer) {
      this.exceptionsService.notFoundException(
        VolunteerExceptionMessages.VOLUNTEER_001,
      );
    }
    const userId = volunteer.user.id;
    const organizationId = admin.organizationId;

    const { deleted, contractPaths, erased } =
      await this.dataSource.transaction(async (manager) => {
        const count = async (sql: string, params: unknown[]): Promise<number> =>
          (await manager.query(sql, params))[1] ?? 0;

        const contracts: { path: string }[] = await manager.query(
          `SELECT path FROM contract WHERE volunteer_id = $1`,
          [volunteerId],
        );
        const result: IDeletedVolunteerData = {
          activityLogs: await count(
            `DELETE FROM activity_log WHERE volunteer_id = $1`,
            [volunteerId],
          ),
          contracts: await count(
            `DELETE FROM contract WHERE volunteer_id = $1`,
            [volunteerId],
          ),
          registrations: await count(
            `DELETE FROM event_rsvp r USING event e
              WHERE r.event_id = e.id AND r.user_id = $1 AND e.organization_id = $2`,
            [userId, organizationId],
          ),
          announcementResponses: await count(
            `DELETE FROM announcement_response WHERE volunteer_id = $1`,
            [volunteerId],
          ),
        };
        await manager.query(
          `DELETE FROM access_request WHERE requested_by = $1 AND organization_id = $2`,
          [userId, organizationId],
        );
        await manager.query(
          `DELETE FROM volunteer_history WHERE history_original_id = $1`,
          [volunteerId],
        );
        // a DELETE ... RETURNING comes back as [rows, count]
        const [[removed]]: [{ volunteer_profile_id: string | null }[]] =
          await manager.query(
            `DELETE FROM volunteer WHERE id = $1 RETURNING volunteer_profile_id`,
            [volunteerId],
          );
        if (removed?.volunteer_profile_id) {
          await manager.query(`DELETE FROM volunteer_profile WHERE id = $1`, [
            removed.volunteer_profile_id,
          ]);
        }
        // M8: a person the NGO added without a VIC account has nobody else keeping their data
        const { files, erasedUserIds } = await eraseUsersWithoutAccount(
          manager,
          [userId],
        );
        return {
          deleted: result,
          contractPaths: [
            ...contracts.map((c) => c.path).filter(Boolean),
            ...files,
          ],
          erased: erasedUserIds.length > 0,
        };
      });

    // The signed PDFs go too; a file left behind is only logged
    await Promise.all(
      contractPaths.map((path) =>
        this.s3Service
          .deleteFile(path)
          .catch((error) =>
            this.logger.error(`Could not delete ${path}`, error),
          ),
      ),
    );

    // The app moves the user to another NGO when this one was active (an erased person has no app)
    if (!erased) {
      await this.syncUserOrganizationsUsecase.execute(userId, organizationId);
    }

    this.actionsArchiveFacade.trackEvent(
      TrackedEventName.DELETE_VOLUNTEER,
      {
        volunteerId,
        volunteerName: volunteer.user.name,
        ...deleted,
      },
      admin,
    );

    return deleted;
  }
}
