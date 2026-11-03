import { Injectable } from '@nestjs/common';
import { S3Service } from 'src/infrastructure/providers/s3/module/s3.service';
import { IOrganizationModel } from 'src/modules/organization/models/organization.model';

// Statutes are private S3 keys; this turns the key into a link valid for a day, for the NGO's own admins
// and the super admins. Logos need nothing: they are full public URLs (new uploads and legacy NGO Hub ones).
@Injectable()
export class OrganizationFilesHelper {
  constructor(private readonly s3Service: S3Service) {}

  async withStatuteLink<T extends Pick<IOrganizationModel, 'statuteUrl'>>(
    organization: T,
  ): Promise<T> {
    if (
      !organization?.statuteUrl ||
      organization.statuteUrl.startsWith('http')
    ) {
      return organization;
    }
    return {
      ...organization,
      statuteUrl: await this.s3Service.generatePresignedURL(
        organization.statuteUrl,
      ),
    };
  }
}
