import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ExceptionsService } from 'src/infrastructure/exceptions/exceptions.service';
import { VolunteerExceptionMessages } from 'src/modules/volunteer/exceptions/volunteer.exceptions';
import { VolunteerFacade } from 'src/modules/volunteer/services/volunteer.facade';
import { IVolunteerModel } from 'src/modules/volunteer/model/volunteer.model';
import { renderCertificate } from 'src/modules/documents/services/certificate.pdf';
import { GetOrganizationUseCaseService } from '../organization/get-organization.usecase';
import { IAdminUserModel } from 'src/modules/user/models/admin-user.model';

export interface ICertificatePrefill {
  volunteerId: string;
  volunteerName: string;
  hours: number;
  since: Date | null;
}

export interface GenerateCertificateOptions {
  volunteerId: string;
  hours: number;
  purpose: string;
  registrationNumber: string;
  issueDate?: Date;
}

// "Ana Ștefănescu" -> "Adeverinta-Ana-Stefanescu.pdf", safe in a Content-Disposition header
export const certificateFileName = (name: string): string =>
  `Adeverinta-${
    name
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^A-Za-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') || 'voluntar'
  }.pdf`;

// VIC 2.0, #490: "Generează adeverință". The form opens with the volunteer's approved hours, which the
// NGO may change; the PDF follows the standard template and is signed outside VIC.
@Injectable()
export class CertificateUsecase {
  constructor(
    private readonly volunteerFacade: VolunteerFacade,
    private readonly getOrganizationUsecase: GetOrganizationUseCaseService,
    private readonly exceptionsService: ExceptionsService,
    private readonly dataSource: DataSource,
  ) {}

  private async findVolunteer(
    volunteerId: string,
    organizationId: string,
  ): Promise<IVolunteerModel> {
    const volunteer = await this.volunteerFacade.find({
      id: volunteerId,
      organizationId,
    });
    if (!volunteer) {
      this.exceptionsService.notFoundException(
        VolunteerExceptionMessages.VOLUNTEER_001,
      );
    }
    return volunteer;
  }

  public async prefill(
    volunteerId: string,
    admin: IAdminUserModel,
  ): Promise<ICertificatePrefill> {
    const volunteer = await this.findVolunteer(
      volunteerId,
      admin.organizationId,
    );
    const [{ hours, first }] = await this.dataSource.query(
      `SELECT COALESCE(SUM(hours), 0)::float AS hours, MIN(date) AS first
         FROM activity_log
        WHERE volunteer_id = $1 AND status = 'approved' AND deleted_on IS NULL`,
      [volunteer.id],
    );
    return {
      volunteerId: volunteer.id,
      volunteerName: volunteer.user.name,
      hours: +hours,
      since:
        volunteer.volunteerProfile?.activeSince ??
        (first ? new Date(first) : null),
    };
  }

  public async generate(
    options: GenerateCertificateOptions,
    admin: IAdminUserModel,
  ): Promise<{ fileName: string; pdf: Buffer }> {
    const prefill = await this.prefill(options.volunteerId, admin);
    const organization = await this.getOrganizationUsecase.execute(
      admin.organizationId,
    );
    const issueDate = options.issueDate ?? new Date();
    const pdf = await renderCertificate({
      organization: {
        name: organization.name,
        taxId: organization.taxId ?? null,
        address: organization.address ?? null,
        email: organization.email ?? null,
        phone: organization.phone ?? null,
      },
      registrationNumber: options.registrationNumber.trim(),
      issueDate,
      volunteerName: prefill.volunteerName,
      since: prefill.since,
      until: issueDate,
      hours: options.hours,
      purpose: options.purpose.trim().replace(/\.$/, ''),
    });
    return { fileName: certificateFileName(prefill.volunteerName), pdf };
  }
}
