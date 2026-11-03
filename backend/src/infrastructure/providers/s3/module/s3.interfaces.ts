export interface S3ModuleOptions {
  accessKeyId: string;
  secretAccessKey: string;
  region: string;
  defaultBucket?: string;
  // Local only: an S3-compatible emulator (path-style addressing). Unset in staging and production.
  endpoint?: string;
  // The public bucket (NGO logos) and the base URL its objects are served from.
  publicBucket?: string;
  publicBaseUrl?: string;
}
