import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { STATUTE_MAX_BYTES } from 'src/usecases/organization/register-organization.usecase';

// The logo and the statute, as multipart fields. The use cases check the type; this caps the size.
export const OrganizationFilesInterceptor = (): ReturnType<
  typeof FileFieldsInterceptor
> =>
  FileFieldsInterceptor(
    [
      { name: 'logo', maxCount: 1 },
      { name: 'statute', maxCount: 1 },
    ],
    { limits: { fileSize: STATUTE_MAX_BYTES } },
  );

export interface OrganizationUploads {
  logo?: Express.Multer.File[];
  statute?: Express.Multer.File[];
}
