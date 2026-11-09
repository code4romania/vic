import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { LOGO_MAX_BYTES } from 'src/usecases/organization/register-organization.usecase';

// The logo, as a multipart field. The use cases check the type; this caps the size.
export const OrganizationFilesInterceptor = (): ReturnType<
  typeof FileFieldsInterceptor
> =>
  FileFieldsInterceptor([{ name: 'logo', maxCount: 1 }], {
    limits: { fileSize: LOGO_MAX_BYTES },
  });

export interface OrganizationUploads {
  logo?: Express.Multer.File[];
}
