import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ExceptionsService } from 'src/infrastructure/exceptions/exceptions.service';
import { S3Service } from 'src/infrastructure/providers/s3/module/s3.service';
import { AUTH_EMAILS } from 'src/modules/auth/constants/auth-emails';
import { IWebRequestUser } from 'src/modules/auth/interfaces/request-user.interface';
import { AuthIdentityFacade } from 'src/modules/auth/services/auth-identity.facade';
import { AuthMailerService } from 'src/modules/auth/services/auth-mailer.service';
import { OrganizationExceptionMessages } from 'src/modules/organization/exceptions/exceptions';
import { GetOrganizationUseCaseService } from '../organization/get-organization.usecase';
import {
  SensitiveAction,
  SensitiveActionUsecase,
} from './sensitive-action.usecase';

// The confirmation must be the organization's name, typed exactly (spaces and case aside).
const sameName = (a: string, b: string): boolean =>
  a.trim().replace(/\s+/g, ' ').toLocaleLowerCase('ro') ===
  b.trim().replace(/\s+/g, ' ').toLocaleLowerCase('ro');

// VIC 2.0, #508, "Danger zone": the NGO deletes its account. After the typed name and the emailed
// code, the organization and everything in it is deleted for good: volunteers' data in the NGO,
// events, hours, documents, announcements, structure, access codes, the change history and the
// admins with their logins. Volunteers keep their VIC accounts and their other NGOs. The VIC team
// (the super admins) gets an email.
@Injectable()
export class DeleteOrganizationUsecase {
  private readonly logger = new Logger(DeleteOrganizationUsecase.name);

  constructor(
    private readonly sensitiveAction: SensitiveActionUsecase,
    private readonly getOrganizationUsecase: GetOrganizationUseCaseService,
    private readonly authIdentityFacade: AuthIdentityFacade,
    private readonly authMailer: AuthMailerService,
    private readonly s3Service: S3Service,
    private readonly exceptionsService: ExceptionsService,
    private readonly dataSource: DataSource,
  ) {}

  public async execute(
    admin: IWebRequestUser,
    confirmation: string,
    code: string,
  ): Promise<void> {
    const organization = await this.getOrganizationUsecase.execute(
      admin.organizationId,
    );
    if (!sameName(confirmation ?? '', organization.name)) {
      this.exceptionsService.badRequestException(
        OrganizationExceptionMessages.ORG_011,
      );
    }
    await this.sensitiveAction.verify(
      admin,
      code,
      SensitiveAction.DELETE_ORGANIZATION,
    );

    const id = organization.id;
    const paths = await this.dataSource.transaction(async (m) => {
      const run = (sql: string): Promise<unknown> => m.query(sql, [id]);
      const files: { path: string }[] = await m.query(
        `SELECT path FROM contract WHERE organization_id = $1
         UNION ALL SELECT path FROM template WHERE organization_id = $1`,
        [id],
      );
      const admins = `(SELECT id FROM "user" WHERE type = 'admin' AND organization_id = $1)`;
      const events = `(SELECT id FROM event WHERE organization_id = $1)`;
      const volunteers = `(SELECT id FROM volunteer WHERE organization_id = $1)`;

      await run(`DELETE FROM actions_archive WHERE author_id IN ${admins}`);
      await run(`DELETE FROM activity_log WHERE organization_id = $1`);
      await run(`DELETE FROM contract WHERE organization_id = $1`);
      await run(`DELETE FROM template WHERE organization_id = $1`);
      await run(
        `DELETE FROM announcement_response WHERE announcement_id IN (SELECT id FROM announcement WHERE organization_id = $1)
            OR volunteer_id IN ${volunteers}`,
      );
      await run(`DELETE FROM announcement WHERE organization_id = $1`);
      await run(
        `DELETE FROM event_targets_organization_structure WHERE "eventId" IN ${events}`,
      );
      await run(`DELETE FROM event_rsvp WHERE event_id IN ${events}`);
      await run(`DELETE FROM event WHERE organization_id = $1`);
      await run(`DELETE FROM access_request WHERE organization_id = $1`);
      await run(`DELETE FROM access_code WHERE organization_id = $1`);
      await run(`DELETE FROM volunteer_history WHERE organization_id = $1`);
      const profiles: { volunteer_profile_id: string }[] = await m.query(
        `SELECT volunteer_profile_id FROM volunteer
          WHERE organization_id = $1 AND volunteer_profile_id IS NOT NULL`,
        [id],
      );
      await run(`DELETE FROM volunteer WHERE organization_id = $1`);
      if (profiles.length) {
        await m.query(`DELETE FROM volunteer_profile WHERE id = ANY($1)`, [
          profiles.map((p) => p.volunteer_profile_id),
        ]);
      }
      await run(`DELETE FROM activity_type WHERE organization_id = $1`);
      await run(
        `DELETE FROM organization_structure WHERE organization_id = $1`,
      );

      // volunteers who had it open move to another NGO of theirs, or to none
      await run(
        `UPDATE "user" u SET active_organization_id = (
           SELECT v.organization_id FROM volunteer v
            WHERE v.user_id = u.id AND v.status = 'active' AND v.deleted_on IS NULL
            ORDER BY v.created_on LIMIT 1)
         WHERE u.active_organization_id = $1`,
      );

      // the admins and their logins (tokens and sessions go with the identity)
      await run(
        `UPDATE event_rsvp SET decided_by = NULL WHERE decided_by IN ${admins}`,
      );
      await run(
        `UPDATE auth_token SET sent_by = NULL WHERE sent_by IN ${admins}`,
      );
      await run(`DELETE FROM auth_identity WHERE user_id IN ${admins}`);
      await run(
        `DELETE FROM "user" WHERE type = 'admin' AND organization_id = $1`,
      );
      await run(`DELETE FROM organization WHERE id = $1`);
      return files.map((f) => f.path).filter(Boolean);
    });

    // files are best effort: a leftover is only logged
    await Promise.all([
      ...paths.map((path) =>
        this.s3Service
          .deleteFile(path)
          .catch((error) =>
            this.logger.error(`Could not delete ${path}`, error),
          ),
      ),
      ...(organization.logo
        ? [
            this.s3Service
              .deletePublicFile(organization.logo)
              .catch((error) =>
                this.logger.error('Could not delete the logo', error),
              ),
          ]
        : []),
    ]);

    const superAdmins = await this.authIdentityFacade.findSuperAdmins();
    if (superAdmins.length) {
      await this.authMailer
        .send(
          superAdmins.map((identity) => identity.email),
          AUTH_EMAILS.organizationDeleted(
            { name: organization.name, taxId: organization.taxId ?? null },
            { name: admin.name, email: admin.email },
          ),
        )
        .catch((error) =>
          this.logger.error('Could not notify the VIC team', error),
        );
    }
    this.logger.log(
      `Organization ${id} deleted by admin ${admin.id}`,
      HttpStatus.OK,
    );
  }
}
